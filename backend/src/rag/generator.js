import axios from 'axios';
import { config } from '../config/env.js';
import { getCollege } from '../config/colleges.js';

const getSystemPrompt = (college) => `You are CollegeGPT, the official, helpful, and precise AI-powered campus information assistant for ${college.name} (Affiliated to ${college.affiliation}, DTE Code: ${college.code}).

Instructions:
1. Answer the student's question strictly using ONLY the provided verified college knowledge-base context below.
2. If the required information is not present in the provided knowledge base, or if the context is insufficient or irrelevant, state clearly: "I couldn't find verified information about this in the ${college.name} knowledge base. Please contact the college administration or student section for official assistance."
3. Do NOT invent, assume, or extrapolate college policies, dates, fees, eligibility criteria, contacts, hostel rules, or any other factual information.
4. Keep your answer professional, clear, and well-structured (use bullet points where appropriate).
5. Always ground your answer in the provided documents and mention relevant document references where appropriate.
6. Do not refer to yourself as a generic LLM. You are CollegeGPT for ${college.shortName}.`;

/**
 * Builds context block for LLM prompt
 */
const buildContextText = (chunks, college) => {
  if (!chunks || chunks.length === 0) return 'No relevant context found.';
  return chunks
    .map(
      (c, idx) =>
        `[Context #${idx + 1} | College: ${college.name} | Document: ${c.documentName} | Page: ${c.pageNumber} | Category: ${c.category}]\n${c.text}`
    )
    .join('\n\n---\n\n');
};

/**
 * Generate answer using Google Gemini
 */
const generateWithGemini = async (question, contextText, history = [], college) => {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: getSystemPrompt(college),
  });

  const prompt = `Verified College Knowledge Base Context (${college.name}):
${contextText}

Conversation History:
${history.map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`).join('\n')}

Student Question:
${question}

Answer:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Generate answer using OpenRouter API
 */
const generateWithOpenRouter = async (question, contextText, history = [], college) => {
  const messages = [
    { role: 'system', content: getSystemPrompt(college) },
    ...history.slice(-4).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    {
      role: 'user',
      content: `Verified College Knowledge Base Context (${college.name}):\n${contextText}\n\nStudent Question:\n${question}`,
    },
  ];

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages,
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 25000,
    }
  );

  return response.data.choices[0].message.content;
};

const STOP_WORDS = new Set([
  'what', 'are', 'the', 'is', 'for', 'and', 'with', 'from', 'at', 'in', 'of', 'to', 'how',
  'which', 'who', 'does', 'can', 'tell', 'about', 'give', 'detail', 'details', 'college',
  'sinhgad', 'academy', 'engineering', 'pune', 'saoe', 'please', 'know', 'me', 'you', 'it'
]);

/**
 * Local deterministic synthesis fallback when no API key is supplied
 */
const generateLocalGroundedResponse = (question, chunks, college) => {
  if (!chunks || chunks.length === 0) {
    return `I couldn't find verified information about this in the ${college.name} knowledge base. Please contact the college administration or student section for official assistance.`;
  }

  // Extract relevant non-stopword query terms
  const allTerms = question.toLowerCase().match(/\b[a-z0-9_]{2,}\b/g) || [];
  const queryTerms = allTerms.filter((term) => !STOP_WORDS.has(term));

  // Extract lines and sentences from top chunks
  const candidateSentences = [];
  const seenTexts = new Set();

  for (const chunk of chunks) {
    // Split by newlines first to preserve structured bullet points and paragraphs
    const lines = chunk.text.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('DOCUMENT ') || line.startsWith('SINHGAD ACADEMY OF')) continue;

      const lower = line.toLowerCase();
      let matchScore = 0;
      for (const term of queryTerms) {
        if (lower.includes(term)) {
          matchScore += 2;
        }
      }

      // Also check general non-stop terms
      if (matchScore > 0 && !seenTexts.has(lower)) {
        seenTexts.add(lower);
        candidateSentences.push({
          text: line,
          score: matchScore,
          doc: chunk.documentName,
          page: chunk.pageNumber || 1,
        });
      }
    }
  }

  // If matched structured lines found
  if (candidateSentences.length > 0) {
    candidateSentences.sort((a, b) => b.score - a.score);
    const topLines = candidateSentences.slice(0, 5).map((s) => s.text);
    const primaryDoc = chunks[0];

    const formattedContent = topLines
      .map((line) => (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line) ? line : `• ${line}`))
      .join('\n');

    return `Based on official **${college.name}** documentation (**${primaryDoc.documentName}**, Page ${primaryDoc.pageNumber || 1}):\n\n${formattedContent}`;
  }

  // Fallback to top chunk snippet
  const primaryDoc = chunks[0];
  const cleanedSnippet = primaryDoc.text.replace(/^(SINHGAD ACADEMY OF[^\n]*\n|DOCUMENT \d+:[^\n]*\n)+/gi, '').trim();
  return `Based on official **${college.name}** documentation (**${primaryDoc.documentName}**, Page ${primaryDoc.pageNumber || 1}):\n\n${cleanedSnippet.slice(0, 450)}...`;
};

/**
 * Main RAG Generation entry point
 * @param {string} question
 * @param {Array<Object>} retrievedChunks
 * @param {Array<Object>} history - [{ role: 'user'|'assistant', content: string }]
 * @param {string} collegeId - Target college identifier
 * @returns {Promise<{ answer: string, sources: Array<Object>, found: boolean }>}
 */
export const generateRAGResponse = async (question, retrievedChunks, history = [], collegeId = 'saoe_pune') => {
  const college = getCollege(collegeId);

  // If no chunks were retrieved or highest score is very low
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      answer: `I couldn't find verified information about this in the ${college.name} knowledge base. Please contact the college administration or student section for official assistance.`,
      sources: [],
      found: false,
    };
  }

  const contextText = buildContextText(retrievedChunks, college);
  let answer = '';

  try {
    if (config.openRouterApiKey) {
      answer = await generateWithOpenRouter(question, contextText, history, college);
    } else if (config.geminiApiKey) {
      answer = await generateWithGemini(question, contextText, history, college);
    } else {
      // Local zero-config fallback
      answer = generateLocalGroundedResponse(question, retrievedChunks, college);
    }
  } catch (err) {
    console.warn('[Generator] External LLM call failed, using local grounded response:', err.message);
    answer = generateLocalGroundedResponse(question, retrievedChunks, college);
  }

  // Determine if answer indicates information not found
  const notFoundIndicators = [
    "couldn't find",
    "cannot find",
    "not found",
    "does not mention",
    "not provided in the context",
    "not present in the knowledge base",
    "no information",
    "unavailable in the college knowledge base",
    "could not find verified information",
  ];

  const lowerAnswer = answer.toLowerCase();
  const isNotFound = notFoundIndicators.some((phrase) => lowerAnswer.includes(phrase));

  const sources = isNotFound
    ? []
    : retrievedChunks.map((chunk) => ({
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        collegeId: chunk.collegeId || collegeId,
        page: chunk.pageNumber || 1,
        category: chunk.category,
        score: chunk.score,
        excerpt: chunk.text.length > 200 ? chunk.text.substring(0, 200) + '...' : chunk.text,
      }));

  return {
    answer: answer.trim(),
    sources,
    found: !isNotFound,
  };
};
