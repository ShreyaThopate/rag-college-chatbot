import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB, getDatabaseStatus } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development ports and standard client URLs
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads if needed
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'CollegeGPT API',
    version: '1.0.0',
    database: dbStatus,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes); // /api/chat, /api/conversations
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

import { User } from './models/User.js';
import { College } from './models/College.js';
import { Document } from './models/Document.js';
import { processDocumentPipeline } from './services/documentService.js';
import { vectorStore } from './rag/vectorStore.js';
import fs from 'fs';

// Auto-seed default accounts and knowledge-base if empty
const autoSeedIfEmpty = async () => {
  try {
    // 1. Seed College entry if collection is empty
    const collegeCount = await College.countDocuments();
    if (collegeCount === 0) {
      await College.create({
        collegeId: 'saoe_pune',
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
      console.log('[AutoSeed] Registered default institution (Sinhgad Academy of Engineering, Pune) in database.');
    }

    const userCount = await User.countDocuments();
    let adminUser = null;

    if (userCount === 0) {
      console.log('[AutoSeed] Initializing default demo accounts...');
      adminUser = await User.create({
        name: 'College Administrator',
        email: 'admin@college.edu',
        password: 'Admin@123',
        role: 'admin',
      });

      await User.create({
        name: 'Alex Johnson (Student)',
        email: 'student@college.edu',
        password: 'Student@123',
        role: 'student',
      });
      console.log('[AutoSeed] Created demo admin (admin@college.edu) and student (student@college.edu).');
    } else {
      adminUser = await User.findOne({ role: 'admin' });
    }

    const docCount = await Document.countDocuments();
    const sampleDocsDir = fs.existsSync(path.resolve(__dirname, '../sample_docs'))
      ? path.resolve(__dirname, '../sample_docs')
      : path.resolve('sample_docs');

    if (docCount === 0 && fs.existsSync(sampleDocsDir) && adminUser) {
      console.log('[AutoSeed] Ingesting verified Sinhgad Academy of Engineering documents into knowledge base...');
      const sampleFiles = [
        {
          fileName: '01_Admissions_Guidelines_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Official Admission Guidelines & Seat Allocation (2026-2027)',
          category: 'Admissions',
          collegeId: 'saoe_pune',
          description: 'B.E. admission eligibility, MHT-CET/JEE Main criteria, DTE Code 6187, CAP rounds, and verification documents.',
        },
        {
          fileName: '02_Courses_and_Academics_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Academic Programs, SPPU Curriculum & Regulations (2026-2027)',
          category: 'Courses & Academics',
          collegeId: 'saoe_pune',
          description: 'B.E. branches (Comp, IT, E&TC, Mech, Civil), SPPU CBCS credit system, and 75% attendance rule.',
        },
        {
          fileName: '03_Departments_and_Faculty_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Academic Departments, Specialized Labs & Faculty (2026-2027)',
          category: 'Departments & Faculty',
          collegeId: 'saoe_pune',
          description: 'HODs, AI/Cloud/IoT/VLSI/CAD-CAM specialized laboratories, and student associations.',
        },
        {
          fileName: '04_Fee_Structure_and_Payment_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Official FRA Approved Fee Structure & Payment Regulations (2026-2027)',
          category: 'Fees',
          collegeId: 'saoe_pune',
          description: 'Approved FRA tuition & development fees for Open, OBC, EBC, VJNT, SC/ST, and payment modes.',
        },
        {
          fileName: '05_Scholarships_and_Financial_Aid_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - MahaDBT Scholarships, Government Concessions & Aid (2026-2027)',
          category: 'Scholarships',
          collegeId: 'saoe_pune',
          description: 'MahaDBT EBC fee waiver, Dr. Panjabrao Deshmukh hostel allowance, and post-matric scholarships.',
        },
        {
          fileName: '06_Training_and_Placements_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Central Placement Cell (CPC) & Career Guidance (2026-2027)',
          category: 'Placements',
          collegeId: 'saoe_pune',
          description: 'Sinhgad Central Placement Cell (CPC), recruiters (TCS, Accenture, Infosys, Cognizant, Persistent), and packages.',
        },
        {
          fileName: '07_Campus_Facilities_and_Hostels_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Kondhwa Campus Infrastructure, Hostels & Facilities (2026-2027)',
          category: 'Campus Facilities',
          collegeId: 'saoe_pune',
          description: 'Sinhgad Kondhwa campus, central library, reading halls, boys & girls hostels, mess, and bus transport.',
        },
        {
          fileName: '08_Rules_and_Institutional_Policies_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Code of Conduct, Anti-Ragging & Institutional Policies (2026-2027)',
          category: 'Rules & Policies',
          collegeId: 'saoe_pune',
          description: 'Campus discipline, dress code, zero-tolerance anti-ragging policy, and SPPU exam rules.',
        },
        {
          fileName: '09_Notices_and_Announcements_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Official Circulars, Examination Notices & Announcements (2026-2027)',
          category: 'Notices & Announcements',
          collegeId: 'saoe_pune',
          description: 'SPPU exam form deadlines, In-Sem/End-Sem schedules, and Sinhgad Karandak festival notices.',
        },
        {
          fileName: '10_Important_Contacts_Directory_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Institutional Contact Directory & Helplines (2026-2027)',
          category: 'Important Contacts',
          collegeId: 'saoe_pune',
          description: 'Principal, Registrar, HODs, TPO, Student Section, Exam Cell, Hostel Wardens, and helplines.',
        },
        {
          fileName: '11_Student_Frequently_Asked_Questions_SAOE.txt',
          title: 'Sinhgad Academy of Engineering - Student Frequently Asked Questions (FAQs) (2026-2027)',
          category: 'Student FAQs',
          collegeId: 'saoe_pune',
          description: 'High-frequency FAQs on DTE codes, SPPU affiliation, bonafide certificates, bus routes, and attendance.',
        },
      ];

      for (const item of sampleFiles) {
        const filePath = path.join(sampleDocsDir, item.fileName);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const doc = await Document.create({
            title: item.title,
            fileName: item.fileName,
            collegeId: item.collegeId || 'saoe_pune',
            category: item.category,
            description: item.description,
            uploadedBy: adminUser._id,
            processingStatus: 'PROCESSING',
            fileSize: stats.size,
            filePath,
          });

          await processDocumentPipeline(doc._id, filePath, item.fileName, {
            title: item.title,
            collegeId: item.collegeId || 'saoe_pune',
            category: item.category,
          });
        }
      }
      console.log('[AutoSeed] Sinhgad Academy of Engineering knowledge base ingested successfully.');
    }
  } catch (err) {
    console.error('[AutoSeed] Error during auto-seed:', err.message);
  }
};

// Start server
export const startServer = async (port = config.port) => {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    const server = app.listen(port, () => {
      console.log(`[CollegeGPT] Backend server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`[CollegeGPT] Health check available at: http://localhost:${port}/api/health`);
    });
    return server;
  } catch (error) {
    console.error('[CollegeGPT] Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test' && (!process.argv[1] || process.argv[1].endsWith('server.js'))) {
  startServer();
}

export default app;
