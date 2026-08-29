import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadDocument } from '../rag/loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { chunkDocument } from '../rag/chunker.js';
import { generateEmbeddings } from '../rag/embeddings.js';
import { vectorStore } from '../rag/vectorStore.js';
import { DEFAULT_COLLEGE_ID, getCollege } from '../config/colleges.js';

const sampleDocs = [
  {
    fileName: '01_Admissions_Guidelines_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Official Admission Guidelines & Seat Allocation (2026-2027)',
    category: 'Admissions',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'B.E. admission eligibility, MHT-CET/JEE Main criteria, DTE Code 6187, CAP rounds, TFWS quota, and mandatory verification documents.',
    version: '1.0',
  },
  {
    fileName: '02_Courses_and_Academics_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Academic Programs, SPPU Curriculum & Regulations (2026-2027)',
    category: 'Courses & Academics',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'B.E. branches (Comp, IT, E&TC, Mech, Civil), SPPU CBCS credit system, In-Sem and End-Sem evaluation, 75% attendance rule, and ERP.',
    version: '1.0',
  },
  {
    fileName: '03_Departments_and_Faculty_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Academic Departments, Specialized Labs & Faculty (2026-2027)',
    category: 'Departments & Faculty',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'HODs, AI/Cloud/IoT/VLSI/CAD-CAM specialized laboratories, student associations (ACES, ITSA, ETSA, MESA, CESA), and research centers.',
    version: '1.0',
  },
  {
    fileName: '04_Fee_Structure_and_Payment_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Official FRA Approved Fee Structure & Payment Regulations (2026-2027)',
    category: 'Fees',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'Approved FRA tuition & development fees for Open, OBC, EBC, VJNT, SC/ST, hostel charges, payment modes, installments, and refund rules.',
    version: '1.0',
  },
  {
    fileName: '05_Scholarships_and_Financial_Aid_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - MahaDBT Scholarships, Government Concessions & Aid (2026-2027)',
    category: 'Scholarships',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'MahaDBT EBC fee waiver, Dr. Panjabrao Deshmukh hostel allowance, SC/ST/OBC post-matric scholarships, NSP, and STES welfare funds.',
    version: '1.0',
  },
  {
    fileName: '06_Training_and_Placements_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Central Placement Cell (CPC) & Career Guidance (2026-2027)',
    category: 'Placements',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'Sinhgad Central Placement Cell (CPC), recruiters (TCS, Accenture, Infosys, Cognizant, Persistent), average/highest packages, and VAP training.',
    version: '1.0',
  },
  {
    fileName: '07_Campus_Facilities_and_Hostels_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Kondhwa Campus Infrastructure, Hostels & Facilities (2026-2027)',
    category: 'Campus Facilities',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'Sinhgad Kondhwa campus, central library, reading halls, boys & girls hostels, dining mess timings, sports complex, gymnasium, and bus transport.',
    version: '1.0',
  },
  {
    fileName: '08_Rules_and_Institutional_Policies_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Code of Conduct, Anti-Ragging & Institutional Policies (2026-2027)',
    category: 'Rules & Policies',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'Campus discipline, dress code, zero-tolerance anti-ragging policy, SPPU exam rules, ICC POSH cell, and student grievance redressal.',
    version: '1.0',
  },
  {
    fileName: '09_Notices_and_Announcements_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Official Circulars, Examination Notices & Announcements (2026-2027)',
    category: 'Notices & Announcements',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'SPPU exam form deadlines, In-Sem/End-Sem schedules, term-work submission, Sinhgad Karandak festival, and alumni meet notices.',
    version: '1.0',
  },
  {
    fileName: '10_Important_Contacts_Directory_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Institutional Contact Directory & Helplines (2026-2027)',
    category: 'Important Contacts',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'Principal, Registrar, HODs, TPO, Student Section, Exam Cell, Hostel Wardens, campus security control, and medical emergency helplines.',
    version: '1.0',
  },
  {
    fileName: '11_Student_Frequently_Asked_Questions_SAOE.txt',
    title: 'Sinhgad Academy of Engineering - Student Frequently Asked Questions (FAQs) (2026-2027)',
    category: 'Student FAQs',
    collegeId: DEFAULT_COLLEGE_ID,
    description: 'High-frequency FAQs on DTE choice codes, SPPU affiliation, bonafide certificates, bus routes, attendance rules, lost ID cards, and mess timings.',
    version: '1.0',
  },
];

export const runDirectIngestion = async () => {
  console.log('================================================================');
  console.log('CollegeGPT Direct Knowledge Base Ingestion Pipeline');
  console.log(`Target: Sinhgad Academy of Engineering (SAOE), Pune (DTE: 6187)`);
  console.log('================================================================\n');

  const sampleDocsDir = fs.existsSync(path.resolve(__dirname, '../../sample_docs'))
    ? path.resolve(__dirname, '../../sample_docs')
    : path.resolve('sample_docs');
  if (!fs.existsSync(sampleDocsDir)) {
    console.error(`Sample docs directory not found at: ${sampleDocsDir}`);
    process.exit(1);
  }

  // Clear previous vector store chunks to ensure a clean index
  vectorStore.clear();
  console.log('[VectorStore] Reset vector store cache.');

  let totalChunksCount = 0;

  for (const docMeta of sampleDocs) {
    const filePath = path.join(sampleDocsDir, docMeta.fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Ingestion] File not found: ${filePath}`);
      continue;
    }

    console.log(`[Ingestion] Step 1: Extracting text from ${docMeta.fileName}...`);
    const pages = await loadDocument(filePath, docMeta.fileName);

    console.log(`[Ingestion] Step 2: Chunking ${pages.length} page(s)...`);
    const docId = `doc_${docMeta.fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const chunks = chunkDocument(pages, {
      documentId: docId,
      documentName: docMeta.fileName,
      collegeId: docMeta.collegeId,
      category: docMeta.category,
    });

    console.log(`[Ingestion] Step 3: Computing dense embeddings for ${chunks.length} chunks...`);
    const texts = chunks.map((c) => c.text);
    const embeddings = await generateEmbeddings(texts);

    const chunksWithEmbeddings = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx],
    }));

    console.log(`[Ingestion] Step 4: Storing in Vector DB...`);
    await vectorStore.addChunks(chunksWithEmbeddings);
    totalChunksCount += chunks.length;

    console.log(`✓ [${docMeta.category}] ${docMeta.fileName} indexed (${chunks.length} chunks)\n`);
  }

  const stats = vectorStore.getStats(DEFAULT_COLLEGE_ID);
  console.log('================================================================');
  console.log('Ingestion Completed Successfully!');
  console.log(`College: ${getCollege(DEFAULT_COLLEGE_ID).name}`);
  console.log(`Total Documents Ingested: ${stats.totalDocuments}`);
  console.log(`Total Chunks Indexed: ${stats.totalChunks}`);
  console.log(`Vector Store Path: data/vector_store.json`);
  console.log('================================================================\n');

  return stats;
};

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('ingest.js')) {
  runDirectIngestion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Ingestion failed:', err);
      process.exit(1);
    });
}
