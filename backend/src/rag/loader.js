import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Loads a document and extracts text with page awareness where possible.
 * @param {string} filePath - Absolute or relative file path
 * @param {string} originalFileName - Original name of the uploaded file
 * @returns {Promise<Array<{ pageNumber: number, text: string }>>}
 */
export const loadDocument = async (filePath, originalFileName) => {
  const ext = path.extname(originalFileName || filePath).toLowerCase();
  const fileBuffer = await fs.readFile(filePath);

  if (ext === '.pdf') {
    return await extractPdf(fileBuffer);
  } else if (ext === '.docx') {
    return await extractDocx(fileBuffer);
  } else if (ext === '.txt' || ext === '.md') {
    return await extractTxt(fileBuffer);
  } else {
    throw new Error(`Unsupported document extension: ${ext}`);
  }
};

/**
 * Extracts PDF text page by page
 */
const extractPdf = async (buffer) => {
  const pages = [];
  
  // Custom page render function for pdf-parse to separate pages
  let currentPage = 1;
  const renderPage = (pageData) => {
    return pageData.getTextContent().then((textContent) => {
      let lastY, text = '';
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      pages.push({
        pageNumber: currentPage++,
        text: cleanText(text),
      });
      return text;
    });
  };

  const options = {
    pagerender: renderPage,
  };

  try {
    await pdfParse(buffer, options);
  } catch (error) {
    // Fallback: parse entire buffer if custom pagerender fails
    const data = await pdfParse(buffer);
    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: cleanText(data.text),
      });
    }
  }

  // Filter out completely empty pages
  const validPages = pages.filter((p) => p.text.trim().length > 0);
  if (validPages.length === 0) {
    throw new Error('PDF appears to be empty or contains scanned images without selectable text.');
  }

  return validPages;
};

/**
 * Extracts text from DOCX
 */
const extractDocx = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  const text = cleanText(result.value);
  if (!text.trim()) {
    throw new Error('DOCX document has no readable text.');
  }
  return [{ pageNumber: 1, text }];
};

/**
 * Extracts text from plain text file
 */
const extractTxt = async (buffer) => {
  const text = cleanText(buffer.toString('utf-8'));
  if (!text.trim()) {
    throw new Error('Text document is empty.');
  }
  return [{ pageNumber: 1, text }];
};

/**
 * Cleans extracted text
 */
export const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
};
