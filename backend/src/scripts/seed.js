import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDocsDir = path.resolve(__dirname, '../../sample_docs');
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { Document } from '../models/Document.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { ChatHistory } from '../models/ChatHistory.js';
import { processDocumentPipeline } from '../services/documentService.js';
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

const seed = async () => {
  try {
    console.log('--- Starting CollegeGPT Database Seeding (Sinhgad Academy of Engineering, Pune) ---');
    await connectDB();

    // 1. Seed/Upsert default College entry
    console.log('Registering default institution in database...');
    let saoeCollege = await College.findOne({ collegeId: DEFAULT_COLLEGE_ID });
    if (!saoeCollege) {
      saoeCollege = await College.create({
        collegeId: DEFAULT_COLLEGE_ID,
        name: 'Sinhgad Academy of Engineering, Pune',
        shortName: 'SAOE Pune',
        code: '6187',
        dteCode: 'EN6187',
        affiliation: 'Savitribai Phule Pune University (SPPU)',
        approval: 'AICTE New Delhi, Govt. of Maharashtra',
        accreditation: 'NAAC Accredited',
        address: 'S. No. 40, Kondhwa-Saswad Road, Kondhwa (Bk), Pune - 411048',
        website: 'https://saoe.sinhgad.edu',
        description: 'Premier engineering college of Sinhgad Technical Education Society (STES), offering undergraduate and postgraduate degrees affiliated with SPPU.',
        isActive: true,
      });
      console.log('Created College record for Sinhgad Academy of Engineering (SAOE Pune).');
    } else {
      console.log('College record already exists.');
    }

    // 2. Clear existing users or create default demo accounts
    console.log('Checking existing users...');
    let admin = await User.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'College Administrator (SAOE)',
        email: 'admin@college.edu',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('Created default admin: admin@college.edu (Password: Admin@123)');
    } else {
      console.log('Admin user already exists.');
    }

    let student = await User.findOne({ email: 'student@college.edu' });
    if (!student) {
      student = await User.create({
        name: 'Rahul Sharma (Student - SAOE)',
        email: 'student@college.edu',
        password: 'Student@123',
        role: 'student',
      });
      console.log('Created default student: student@college.edu (Password: Student@123)');
    } else {
      console.log('Student user already exists.');
    }

    // 3. Clear previous vector store to ensure clean slate with SAOE data
    vectorStore.clear();

    // 3. Remove existing documents in MongoDB
    await Document.deleteMany({});
    console.log('Cleaned previous document records in database.');

    // 4. Ingest sample documents into RAG vector store
    console.log(`Ingesting verified SAOE Pune knowledge-base documents from ${sampleDocsDir}...`);

    for (const docMeta of sampleDocs) {
      const filePath = path.join(sampleDocsDir, docMeta.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      const fileStats = fs.statSync(filePath);

      const docRecord = await Document.create({
        title: docMeta.title,
        fileName: docMeta.fileName,
        collegeId: docMeta.collegeId || DEFAULT_COLLEGE_ID,
        category: docMeta.category,
        description: docMeta.description,
        version: docMeta.version,
        uploadedBy: admin._id,
        processingStatus: 'PROCESSING',
        fileSize: fileStats.size,
        filePath: filePath,
      });

      console.log(`Processing & vectorizing [${docMeta.category}]: ${docMeta.fileName}...`);
      await processDocumentPipeline(docRecord._id, filePath, docMeta.fileName, {
        title: docMeta.title,
        collegeId: docMeta.collegeId || DEFAULT_COLLEGE_ID,
        category: docMeta.category,
      });
    }

    const vectorStats = vectorStore.getStats();
    console.log('=====================================================');
    console.log('Sinhgad Academy of Engineering Knowledge Base Seeded!');
    console.log(`Target Institution: Sinhgad Academy of Engineering, Kondhwa, Pune (DTE: 6187)`);
    console.log(`Total Categories: ${sampleDocs.length}`);
    console.log(`Total Documents in Vector DB: ${vectorStats.totalDocuments}`);
    console.log(`Total Vector Chunks Indexed: ${vectorStats.totalChunks}`);
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@college.edu   / Admin@123');
    console.log('  Student: student@college.edu / Student@123');
    console.log('=====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
