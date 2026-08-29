# CollegeGPT — RAG-Based Campus Information Assistant

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![VectorDB](https://img.shields.io/badge/VectorDB-Dense%20384D%20Cosine-orange.svg)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
[![Institution](https://img.shields.io/badge/College-Sinhgad%20Academy%20of%20Engineering%20(SAOE)-indigo.svg)](https://saoe.sinhgad.edu)

**CollegeGPT** is a full-stack AI-powered campus information assistant built with a multi-college ready **Retrieval-Augmented Generation (RAG)** pipeline. The launch knowledge base is specifically engineered with authentic, verified institutional data for **Sinhgad Academy of Engineering (SAOE), Kondhwa, Pune** (Affiliated to Savitribai Phule Pune University - SPPU, DTE Choice Code: 6187).

Students receive answers strictly grounded in official college circulars, syllabus guidelines, FRA fee structures, MahaDBT scholarship policies, and CPC placement records with exact document and page references.

---

## 🏛️ Core RAG & Multi-College Architecture

CollegeGPT implements a genuine multi-stage Retrieval-Augmented Generation pipeline with complete college data isolation:

```text
       OFFICIAL COLLEGE DOCUMENTS (PDF, DOCX, TXT)
        [Sinhgad Academy of Engineering, Pune]
                          │
                          ▼
                 ┌─────────────────┐
                 │ Text Extraction │ (Page-Aware Extractor)
                 └────────┬────────┘
                          ▼
                   ┌─────────────┐
                   │  Chunking   │ (500-800 Token Recursive Chunks)
                   └──────┬──────┘
                          ▼
                   ┌─────────────┐
                   │ Embeddings  │ (SentenceTransformers all-MiniLM-L6-v2)
                   └──────┬──────┘
                          ▼
               ┌─────────────────────┐
               │    Vector Store     │ (Persistent Cosine Index)
               │   + collegeId Index │
               └──────────┬──────────┘
                          │
                          │ Top-K Cosine Similarity Search (Filtered by collegeId)
                          ▼
               ┌─────────────────────┐
               │  Retrieved Chunks   │
               │  (Verified Context) │
               └──────────┬──────────┘
                          │
Student Question ─────────┤
(collegeId: saoe_pune)    ▼
               ┌─────────────────────┐
               │ Grounded RAG Prompt │ (Strict No-Hallucination Directives)
               └──────────┬──────────┘
                          ▼
                     ┌─────────┐
                     │   LLM   │ (OpenRouter / Gemini / Grounded Synthesizer)
                     └────┬────┘
                          ▼
               ┌─────────────────────┐
               │   Grounded Answer   │
               │ + Source References │
               │ (Doc Name + Page #) │
               └─────────────────────┘
```

---

## 📚 Structured Knowledge Base Domains (11 Categories)

The knowledge base for Sinhgad Academy of Engineering (SAOE), Pune is structured into 11 verified domains:

1. **Admissions:** State CET Cell CAP rounds, B.E./M.E. eligibility, MHT-CET/JEE Main criteria, DSE lateral entry, DTE Choice Code: 6187, TFWS/EWS quotas, and required verification documents.
2. **Courses & Academics:** Undergraduate programs in Computer Engineering (180 seats), Information Technology (120 seats), E&TC (120 seats), Mechanical (120 seats), and Civil (60 seats); SPPU CBCS credit system (160 credits), In-Sem (30 marks) / End-Sem (70 marks) evaluation, and 75% attendance rule.
3. **Departments & Faculty:** Department profiles, HOD credentials, specialized research centers (AI/Deep Learning, AWS Cloud, IoT & Robotics, VLSI, CAD/CAM), and student clubs (ACES, ITSA, ETSA, MESA, CESA).
4. **Fees:** Fees Regulating Authority (FRA) approved fee structures for Open, OBC, EBC, VJNT, SC, and ST categories, hostel & mess charges, bank payment modes, installment guidelines, and DTE refund policies.
5. **Scholarships:** Maharashtra State MahaDBT schemes (Rajarshi Chhatrapati Shahu Maharaj EBC fee concession, Dr. Panjabrao Deshmukh hostel maintenance allowance, Post-Matric SC/ST/OBC scholarships), Central NSP, and STES welfare aid.
6. **Placements:** Central Placement Cell (CPC) pooled drives, recruiters (TCS, Accenture, Cognizant, Infosys, Persistent, Capgemini, Bosch), highest package (Rs. 32 LPA), average packages (Rs. 4.8 - 6.2 LPA), and VAP training.
7. **Campus Facilities:** Sinhgad Kondhwa campus infrastructure, Central Library & 24/7 exam reading hall, Sahyadri/Shivneri boys' hostels, Saraswati/Savitribai girls' hostels, dining mess timings, sports grounds, gymnasium, and STES bus routes across Pune.
8. **Rules & Policies:** RFID identity card mandate, laboratory dress code, SPPU 75% attendance ordinance (0.60), Zero-Tolerance Anti-Ragging statutory policy, POSH / Internal Complaints Committee (ICC), and Student Grievance Redressal.
9. **Notices & Announcements:** Online SPPU examination form deadlines, In-Sem/End-Sem theory schedules, term-work continuous assessment dates, Sinhgad Karandak techno-cultural fest, and MahaMeet alumni reunion.
10. **Important Contacts:** Principal, Vice-Principal, Registrar, Academic HODs, Training & Placement Officer (TPO), Student Section, Exam Cell, Hostel Wardens, campus security gate, and medical emergency helpline.
11. **Student FAQs:** High-frequency student questions regarding DTE choice codes, SPPU degree affiliation, bonafide certificate application, bus transport enrollment, attendance defaulter thresholds, lost ID replacement, and mess timings.

---

## ✨ Key Features

- **Strict Knowledge Grounding**: Answers are synthesized exclusively from verified college documentation.
- **Traceable Citations**: Every answer displays expandable **Source Cards** showing document name, page number, college ID, confidence match percentage, and exact extracted excerpt.
- **Zero Hallucination Guarantee**: If information is not in the knowledge base, CollegeGPT explicitly declares `found: false` ("*I couldn't find verified information about this in the Sinhgad Academy of Engineering knowledge base. Please contact the college administration or student section for official assistance.*").
- **Multi-College Extensibility**: Built with `collegeId` metadata across all database models, vector chunks, and API endpoints, allowing new colleges to be added effortlessly.
- **Admin Knowledge Base Manager**: Upload PDF, DOCX, or TXT documents, assign categories, monitor real-time vectorization status (`UPLOADED` ➔ `PROCESSING` ➔ `READY`), and delete outdated documents with automatic vector purging.
- **Admin Analytics Dashboard**: Live metrics tracking Total Documents, Ready Status, Questions Asked, and Registered Users.
- **Zero-Friction Local Execution**: Runs locally out-of-the-box with pure-Node Sentence Transformers and in-memory database fallback (no mandatory external API keys required).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Custom dark theme, glassmorphism, responsive)
- **Icons**: Lucide React
- **Markdown Rendering**: ReactMarkdown
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database**: MongoDB (Mongoose) with automatic in-memory fallback
- **Auth**: JWT (JSON Web Tokens) + bcrypt password hashing
- **File Ingestion**: Multer, `pdf-parse`, `mammoth` (DOCX), plain text loaders
- **Embeddings**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2` Sentence Transformers)
- **Vector Search**: Dense 384-dimensional cosine similarity index with `collegeId` filtering
- **LLM Integration**: Google Gemini API / OpenRouter API / Grounded Local Synthesizer

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher

---

### Step 1: Clone / Open Repository

Open terminal in the project root directory:

```bash
cd "c:/Users/SHREYA/OneDrive/Desktop/Projects/RAG-Based College Chatbot"
```

---

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### Step 3: Seed Database & Ingest SAOE Knowledge Base

Run the automated seeder to initialize demo accounts and vectorize the 11 verified Sinhgad Academy of Engineering knowledge base documents:

```bash
cd backend
npm run seed
```

*Expected output:*
```text
--- Starting CollegeGPT Database Seeding (Sinhgad Academy of Engineering, Pune) ---
[Database] Connected to In-Memory MongoDB...
Created default admin: admin@college.edu (Password: Admin@123)
Created default student: student@college.edu (Password: Student@123)
Ingesting verified SAOE Pune knowledge-base documents from sample_docs...
[Embeddings] Loading SentenceTransformer embedding model (all-MiniLM-L6-v2)...
Processing & vectorizing [Admissions]: 01_Admissions_Guidelines_SAOE.txt...
...
=====================================================
Sinhgad Academy of Engineering Knowledge Base Seeded!
Target Institution: Sinhgad Academy of Engineering, Kondhwa, Pune (DTE: 6187)
Total Categories: 11
Total Documents in Vector DB: 11
Total Vector Chunks Indexed: 11
Demo Credentials:
  Admin:   admin@college.edu   / Admin@123
  Student: student@college.edu / Student@123
=====================================================
```

---

### Step 4: Start Backend Server

From the `backend` directory:

```bash
npm start
```

The backend server will run on **`http://localhost:5000`** with health check at **`http://localhost:5000/api/health`**.

---

### Step 5: Start Frontend Application

Open a new terminal window in the `frontend` directory:

```bash
cd frontend
npm run dev
```

The frontend application will start on **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

For quick testing, pre-configured accounts are provided with **1-click login buttons** on the sign-in page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Student** | `student@college.edu` | `Student@123` | SAOE Student Chat, Conversation History, Source Citations |
| **Administrator** | `admin@college.edu` | `Admin@123` | Dashboard Analytics, Document Upload, Knowledge Base Management |

---

## 🧪 Evaluation & Demo Walkthrough

### 1. Test Grounded Student Questions
Log in as **Demo Student** and test the following verified queries:

1. **Admissions & Eligibility:**
   > *"What are the B.E. admission eligibility requirements and DTE Choice Code for Sinhgad Academy of Engineering?"*
   - **Result**: Cites `01_Admissions_Guidelines_SAOE.txt` (DTE Code: 6187, MHT-CET/JEE criteria, 45% aggregate in 10+2 PCM).

2. **Fee Structure & Concessions:**
   > *"What is the fee structure for Open and EBC categories at SAOE, and what are the payment modes?"*
   - **Result**: Cites `04_Fee_Structure_and_Payment_SAOE.txt` (Open category: Rs. 100,500/year; EBC 50% tuition waiver Rs. 58,324/year).

3. **Placements & Recruiters:**
   > *"Which companies visit Sinhgad Central Placement Cell (CPC) and what is the highest package?"*
   - **Result**: Cites `06_Training_and_Placements_SAOE.txt` (TCS, Accenture, Infosys, Cognizant, Persistent; Highest: Rs. 32 LPA).

4. **Academic Regulations:**
   > *"When is the examination form submission deadline and what is the minimum attendance required?"*
   - **Result**: Cites `09_Notices_and_Announcements_SAOE.txt` and `02_Courses_and_Academics_SAOE.txt` (75% attendance rule under SPPU Ordinance 0.60).

5. **Campus Facilities & Hostels:**
   > *"What are the hostel room facilities and mess timings at Sinhgad Kondhwa campus?"*
   - **Result**: Cites `07_Campus_Facilities_and_Hostels_SAOE.txt` (Sahyadri/Shivneri boys' hostels, Saraswati/Savitribai girls' hostels, 4 daily meals).

### 2. Test Unknown Question Handling (Strict Anti-Hallucination)
Ask a question about a topic not present in the college knowledge base:
> *"What is the college policy on deep-sea submarine archaeology research?"*

- **Expected Response**:
  ```text
  I couldn't find verified information about this in the Sinhgad Academy of Engineering, Pune knowledge base. Please contact the college administration or student section for official assistance.
  ```
- **Indicator**: Visual `Notice: This query could not be verified in the college knowledge base` banner, `found: false`, 0 hallucinated sources.

---

## 📡 API Specification

### Authentication
- `POST /api/auth/register` — Register new student user
- `POST /api/auth/login` — Login user (returns JWT)
- `GET  /api/auth/me` — Get authenticated user profile
- `POST /api/auth/logout` — Logout user

### Student Chat & RAG
- `POST /api/chat` — Submit query (`{ conversationId?, message, collegeId? }`) ➔ Returns `{ answer, sources, found, collegeId, conversationId }`
- `GET  /api/conversations?collegeId=saoe_pune` — Get user's conversation list
- `GET  /api/conversations/:id` — Get message thread
- `DELETE /api/conversations/:id` — Delete conversation

### Document Knowledge Base (Admin)
- `POST   /api/documents` — Upload & vectorize document (`multipart/form-data` with `collegeId` and `category`)
- `GET    /api/documents?collegeId=...&category=...&status=...` — Filter documents
- `GET    /api/documents/:id` — Get document metadata
- `PUT    /api/documents/:id` — Update document metadata
- `DELETE /api/documents/:id` — Delete document and purge vector embeddings

### Admin Analytics & Health
- `GET /api/admin/dashboard` — Live metrics (Documents, Ready status, Questions, Vectors)
- `GET /api/admin/documents` — Admin document list
- `GET /api/health` — System health check

---

## 📂 Project Structure

```text
RAG-Based College Chatbot/
├── backend/
│   ├── sample_docs/                          # Verified SAOE Pune Knowledge Documents
│   │   ├── 01_Admissions_Guidelines_SAOE.txt
│   │   ├── 02_Courses_and_Academics_SAOE.txt
│   │   ├── 03_Departments_and_Faculty_SAOE.txt
│   │   ├── 04_Fee_Structure_and_Payment_SAOE.txt
│   │   ├── 05_Scholarships_and_Financial_Aid_SAOE.txt
│   │   ├── 06_Training_and_Placements_SAOE.txt
│   │   ├── 07_Campus_Facilities_and_Hostels_SAOE.txt
│   │   ├── 08_Rules_and_Institutional_Policies_SAOE.txt
│   │   ├── 09_Notices_and_Announcements_SAOE.txt
│   │   ├── 10_Important_Contacts_Directory_SAOE.txt
│   │   └── 11_Student_Frequently_Asked_Questions_SAOE.txt
│   ├── src/
│   │   ├── config/                           # DB, Environment & College Registry
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── colleges.js                   # Multi-college configuration
│   │   ├── models/                           # User, Document, Conversation, Message
│   │   ├── middleware/                       # Auth, Admin, Multer, Error handler
│   │   ├── controllers/                      # Auth, Chat, Document, Admin
│   │   ├── services/                         # Business logic & RAG orchestration
│   │   ├── rag/                              # Loader, Chunker, Embeddings, VectorStore, Retriever, Generator
│   │   ├── scripts/                          # Database seeder (seed.js)
│   │   └── server.js                         # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/                       # Navbar, SourceCard, ProtectedRoute
│   │   ├── context/                          # AuthContext state manager
│   │   ├── pages/                            # Landing, Login, Register, Chat, Admin, Documents, Profile
│   │   ├── services/                         # Axios API client
│   │   ├── App.jsx                           # Router setup
│   │   ├── main.jsx                          # Entry point
│   │   └── index.css                         # Custom styling & Tailwind directives
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   └── spec.md                               # Software specification document (SDD)
├── .gitignore
├── package.json                              # Root workspace scripts
├── spec.md                                   # Root specification document
└── README.md                                 # Documentation & local setup instructions
```

---

## 📜 License & Institutional Notice

Built for **Sinhgad Academy of Engineering (SAOE), Pune**. Knowledge base data adheres to official DTE Maharashtra, Savitribai Phule Pune University (SPPU), and STES institutional guidelines.
