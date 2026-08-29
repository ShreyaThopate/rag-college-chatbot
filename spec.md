# CollegeGPT — RAG-Based Campus Information Assistant

## Software Specification Document (SDD)

**Version:** 2.0  
**Project Type:** Full-Stack AI / RAG Application  
**Primary Institutional Deployment:** Sinhgad Academy of Engineering (SAOE), Kondhwa (Bk), Pune  
**DTE Institute Code:** EN6187 | **Affiliation:** Savitribai Phule Pune University (SPPU)  
**Architecture:** Multi-College Ready with Strict Vector-Store Isolation  

---

# 1. Project Overview

## 1.1 Project Name

**CollegeGPT — AI-Powered Campus Information Assistant**

## 1.2 Purpose

Build a full-stack AI chatbot that allows students to ask questions about college-related information and receive answers grounded strictly in an approved, verified college knowledge base.

The initial knowledge base is specifically engineered for **Sinhgad Academy of Engineering (SAOE), Pune** (Kondhwa Bk campus, affiliated with Savitribai Phule Pune University, approved by AICTE, DTE Choice Code: 6187).

The system must retrieve relevant information from uploaded college documents before generating an answer. It must display the exact source document and page number used for the response, and clearly state when the requested information cannot be found in the knowledge base without hallucinating.

The application implements a genuine Retrieval-Augmented Generation pipeline:

**Verified Documents → Page-Aware Text Extraction → Recursive Chunking → Vector Embeddings → Persistent Vector Store (with College ID Indexing) → Semantic Search → Grounded Context → LLM Synthesis → Answer + Exact Sources**

A chatbot that only sends questions directly to an LLM without retrieval does **not** satisfy this specification.

## 1.3 Target Users

### Student
Students use the system to:
* Ask questions regarding DTE admissions, CAP rounds, and cutoff requirements
* Inquire about SPPU curriculum, credits, and academic calendar
* Review department details, laboratories, and HOD contacts
* Check approved FRA tuition fees, hostel charges, and payment modes
* Find government MahaDBT (EBC, SC, ST, OBC) and STES scholarships
* Explore Central Placement Cell (CPC) statistics, top recruiters, and training programs
* Inquire about Kondhwa campus hostel facilities, mess timings, library, and bus transport
* Review university exam regulations, 75% attendance rule, and anti-ragging policies
* Check official circulars, examination deadlines, and fest announcements (Sinhgad Karandak)
* Access emergency contacts and student FAQs
* View traceable sources supporting each answer

### Administrator
Administrators use the system to:
* Upload official college circulars, rulebooks, and notices (PDF, DOCX, TXT)
* Associate documents with specific college identifiers (`college_id`) and structured categories
* Monitor document vectorization progress (`UPLOADED` ➔ `PROCESSING` ➔ `READY` ➔ `FAILED`)
* Update document metadata or delete outdated documents with automatic vector store purging
* Track real-time analytics on document volume, indexed vectors, and student inquiries

---

# 2. Institutional Knowledge Base Specification

## 2.1 Primary Target Institution

* **Name:** Sinhgad Academy of Engineering (SAOE)
* **Campus:** S. No. 40, Kondhwa-Saswad Road, Kondhwa (Budruk), Near Khadi Machine Chowk, Pune - 411048, Maharashtra, India
* **Parent Society:** Sinhgad Technical Education Society (STES), founded by Prof. M. N. Navale
* **Approvals & Affiliation:** Approved by AICTE New Delhi, Recognized by Govt. of Maharashtra, Permanently Affiliated to Savitribai Phule Pune University (SPPU), NAAC Accredited
* **DTE Choice Code:** EN6187

## 2.2 Knowledge Base Categorization Structure

The knowledge base is organized into 11 structured domains:

1. **Admissions:** State CET Cell CAP rounds, B.E./M.E. eligibility, MHT-CET and JEE Main score criteria, DSE lateral entry, TFWS and EWS quotas, required verification certificates, and Facilitation Center (FC) contacts.
2. **Courses & Academics:** Undergraduate programs in Computer Engineering (180 seats), Information Technology (120 seats), E&TC (120 seats), Mechanical (120 seats), and Civil Engineering (60 seats); SPPU Choice Based Credit System (CBCS), 160 degree credits, In-Sem (30 marks) and End-Sem (70 marks) evaluation, and GEMS ERP attendance tracking.
3. **Departments & Faculty:** Department profiles, HOD credentials, specialized research centers (AI/Deep Learning, AWS Cloud, IoT & Robotics, VLSI, CAD/CAM, Total Station GIS), and student departmental clubs (ACES, ITSA, ETSA, MESA, CESA).
4. **Fees:** Fees Regulating Authority (FRA) approved fee structures for Open, OBC, EBC, VJNT, SC, and ST categories, hostel & mess charges, bank payment modes (DD, Net Banking, UPI), fee installment guidelines, and DTE refund policies.
5. **Scholarships:** Maharashtra State MahaDBT schemes (Rajarshi Chhatrapati Shahu Maharaj EBC concession, Dr. Panjabrao Deshmukh hostel maintenance allowance, Post-Matric SC/ST/OBC scholarships), Central NSP minority scholarships, AICTE Pragati/Saksham schemes, and STES welfare aid.
6. **Placements:** Central Placement Cell (CPC) pooled campus drives, recruiting partners (TCS, Accenture, Cognizant, Infosys, Persistent, Capgemini, Bosch, Atlas Copco), highest package (Rs. 32 LPA), average packages (Rs. 4.8 - 6.2 LPA), VAP training, and TPO contact.
7. **Campus Facilities:** Sinhgad Kondhwa campus infrastructure, Central Library & 24/7 exam reading hall, Sahyadri/Shivneri boys' hostels, Saraswati/Savitribai girls' hostels, dining mess timings, sports grounds, gymnasium, campus medical center, and STES bus routes across Pune.
8. **Rules & Policies:** RFID identity card mandate, laboratory dress code, SPPU 75% attendance ordinance (0.60), Zero-Tolerance Anti-Ragging statutory policy, POSH / Internal Complaints Committee (ICC), and Student Grievance Redressal.
9. **Notices & Announcements:** Online SPPU examination form deadlines, In-Sem/End-Sem theory schedules, term-work continuous assessment dates, Sinhgad Karandak techno-cultural fest, and MahaMeet alumni reunion.
10. **Important Contacts:** Principal, Vice-Principal, Registrar, Academic HODs, Training & Placement Officer (TPO), Student Section, Exam Cell, Hostel Wardens, campus security gate, and medical emergency helpline.
11. **Student FAQs:** High-frequency student questions regarding DTE choice codes, SPPU degree affiliation, bonafide certificate application, bus transport enrollment, attendance defaulter thresholds, lost ID replacement, and mess timings.

---

# 3. Multi-College Extensible Architecture

The architecture is multi-college ready from day one. Every database document, conversation thread, message record, and vector chunk is tagged with an indexed `college_id`.

```text
                  COLLEGE REGISTRY & CONFIGURATION
             (saoe_pune, coep_pune, pict_pune, vit_pune, ...)
                                │
          ┌─────────────────────┴─────────────────────┐
          ▼                                           ▼
┌──────────────────┐                         ┌──────────────────┐
│ MongoDB Database │                         │   Vector Store   │
│                  │                         │                  │
│ • Document       │ collegeId: 'saoe_pune'  │ • Chunk ID       │
│ • Conversation   │ collegeId: 'saoe_pune'  │ • collegeId      │
│ • Message Source │ collegeId: 'saoe_pune'  │ • Embedding      │
└──────────────────┘                         └──────────────────┘
          │                                           │
          └─────────────────────┬─────────────────────┘
                                ▼
                   STRICT RETRIEVAL ISOLATION
        filter: { collegeId: 'saoe_pune', category: '...' }
```

### Multi-College Extensibility Principles:
1. **Zero Architecture Changes for New Colleges:** New institutions can be added simply by registering their metadata in `colleges.js` and uploading their documents under their assigned `college_id`.
2. **Strict Vector Isolation:** Semantic similarity search strictly enforces `collegeId` matching. Queries for College A will never retrieve chunks from College B.
3. **Default Launch College:** All system defaults resolve to `saoe_pune` (Sinhgad Academy of Engineering, Pune).

---

# 4. Core RAG Pipeline

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
                     │  Chunking   │ (500–800 Tokens, 50–100 Token Overlap)
                     └──────┬──────┘
                            ▼
                     ┌─────────────┐
                     │ Embeddings  │ (SentenceTransformers all-MiniLM-L6-v2)
                     └──────┬──────┘
                            ▼
                 ┌─────────────────────┐
                 │    Vector Store     │
                 │   + collegeId Index │
                 └──────────┬──────────┘
                            │
                            │ Cosine Similarity Search (Filtered by collegeId)
                            ▼
                 ┌─────────────────────┐
                 │  Retrieved Chunks   │
                 │  (Top-5 SAOE Docs)  │
                 └──────────┬──────────┘
                            │
Student Question ───────────┤
(collegeId: saoe_pune)      ▼
                 ┌─────────────────────┐
                 │ Grounded RAG Prompt │ (Strict No-Hallucination Directive)
                 └──────────┬──────────┘
                            ▼
                       ┌─────────┐
                       │   LLM   │ (OpenRouter / Gemini / Grounded Synthesizer)
                       └────┬────┘
                            ▼
                 ┌─────────────────────┐
                 │ Grounded Answer     │
                 │ + Source References │
                 │ (Doc Name, Page, %) │
                 └─────────────────────┘
```

---

# 5. Strict Zero-Hallucination & Fallback Specification

The chatbot must never invent, guess, or extrapolate college policies, dates, fees, cutoffs, or contacts that are not present in the retrieved knowledge base context.

### When Information is Found (`found: true`):
* The answer must be strictly synthesized from the retrieved chunks.
* The response must include supporting sources with document name, page number, category, confidence match percentage, and context excerpt.

### When Information is NOT Found (`found: false`):
* If no chunks exceed the similarity threshold, or if the retrieved chunks do not address the question, the system must return:
  > *"I couldn't find verified information about this in the Sinhgad Academy of Engineering knowledge base. Please contact the college administration or student section for official assistance."*
* `found` is set to `false`, and `sources` is set to `[]`.
* The UI displays a distinct warning banner indicating that verified information could not be found.

---

# 6. Database & Vector Schema Design

## 6.1 Users Collection
```text
User
├── _id: ObjectId
├── name: String
├── email: String (unique)
├── password: String (bcrypt hashed)
├── role: 'student' | 'admin'
├── createdAt: Date
└── updatedAt: Date
```

## 6.2 Documents Collection
```text
Document
├── _id: ObjectId
├── title: String
├── fileName: String
├── collegeId: String (indexed, default: 'saoe_pune')
├── category: Enum [
│     'Admissions', 'Courses & Academics', 'Departments & Faculty',
│     'Fees', 'Scholarships', 'Placements', 'Campus Facilities',
│     'Rules & Policies', 'Notices & Announcements',
│     'Important Contacts', 'Student FAQs', 'General'
│   ]
├── description: String
├── version: String
├── uploadedBy: ObjectId -> User
├── processingStatus: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'
├── chunkCount: Number
├── fileSize: Number
├── filePath: String
├── errorMessage: String
├── createdAt: Date
└── updatedAt: Date
```

## 6.3 Conversations Collection
```text
Conversation
├── _id: ObjectId
├── userId: ObjectId -> User (indexed)
├── collegeId: String (indexed, default: 'saoe_pune')
├── title: String
├── createdAt: Date
└── updatedAt: Date
```

## 6.4 Messages Collection
```text
Message
├── _id: ObjectId
├── conversationId: ObjectId -> Conversation (indexed)
├── role: 'user' | 'assistant'
├── content: String
├── sources: [
│     {
│       documentId: String,
│       documentName: String,
│       collegeId: String,
│       page: Number,
│       category: String,
│       score: Number,
│       excerpt: String
│     }
│   ]
├── retrievalScore: Number
├── found: Boolean
└── createdAt: Date
```

## 6.5 Vector Store Chunks (`data/vector_store.json`)
```json
{
  "id": "docId_chunk_0",
  "documentId": "docId",
  "documentName": "01_Admissions_Guidelines_SAOE.txt",
  "collegeId": "saoe_pune",
  "category": "Admissions",
  "pageNumber": 1,
  "chunkIndex": 0,
  "text": "SINHGAD ACADEMY OF ENGINEERING...",
  "tokenCount": 450,
  "embedding": [0.0123, -0.0456, 0.0891, "...(384 dimensions)..."]
}
```

---

# 7. API Specification

### Authentication
* `POST /api/auth/register` — Register a new student account
* `POST /api/auth/login` — Login with credentials (returns JWT token)
* `GET  /api/auth/me` — Retrieve current authenticated user profile
* `POST /api/auth/logout` — Invalidate user session

### Student Chat
* `POST /api/chat` — Post message (`{ conversationId, message, collegeId }`), retrieve context, synthesize RAG answer, return answer and sources
* `GET  /api/conversations?collegeId=saoe_pune` — Retrieve student conversation history
* `GET  /api/conversations/:id` — Retrieve full conversation message thread
* `DELETE /api/conversations/:id` — Delete conversation thread

### Documents (Admin)
* `POST   /api/documents` — Upload new PDF/DOCX/TXT file with `collegeId` and `category`
* `GET    /api/documents?collegeId=saoe_pune&category=...&status=...` — Filter and list documents
* `GET    /api/documents/:id` — Get document details
* `PUT    /api/documents/:id` — Update document metadata
* `DELETE /api/documents/:id` — Delete document and purge vector embeddings

### Admin Analytics & Health
* `GET /api/admin/dashboard` — Live metrics (documents, ready count, total questions, indexed vectors)
* `GET /api/health` — System health check

---

# 8. Sinhgad Academy of Engineering Evaluation Queries

The deployed system must demonstrate accurate responses for:

1. **Admissions:**
   > *"What are the eligibility criteria and DTE Choice Code for First Year Computer Engineering at Sinhgad Academy of Engineering?"*  
   > *Expected:* Cites DTE Code 6187, MHT-CET/JEE Main non-zero score, 45% aggregate in 10+2 PCM (40% for reserved category). Sources: `01_Admissions_Guidelines_SAOE.txt`.

2. **Fees & Concessions:**
   > *"What is the approved fee structure for Open category and EBC students at SAOE?"*  
   > *Expected:* Open category total Rs. 100,500/year; EBC 50% tuition waiver (Rs. 58,324/year). Payment via DD or GEMS online gateway. Sources: `04_Fee_Structure_and_Payment_SAOE.txt`.

3. **Placements:**
   > *"Which companies recruit from Sinhgad Central Placement Cell and what is the highest package?"*  
   > *Expected:* TCS, Accenture, Cognizant, Infosys, Persistent; Highest package Rs. 32 LPA; Average Rs. 4.8 - 6.2 LPA. Sources: `06_Training_and_Placements_SAOE.txt`.

4. **Academics & Attendance:**
   > *"What is the mandatory attendance requirement and SPPU exam grading pattern?"*  
   > *Expected:* SPPU Ordinance 0.60 mandates minimum 75% attendance; In-Sem (30 marks) + End-Sem (70 marks). Sources: `02_Courses_and_Academics_SAOE.txt` or `08_Rules_and_Institutional_Policies_SAOE.txt`.

5. **Campus Facilities & Hostels:**
   > *"What hostel accommodation, mess timings, and bus transport facilities are available at Sinhgad Kondhwa?"*  
   > *Expected:* Sahyadri/Shivneri (boys) and Saraswati/Savitribai (girls) hostels; 4 daily mess meals; bus transport across Pune. Sources: `07_Campus_Facilities_and_Hostels_SAOE.txt`.

6. **Unknown Question Handling (Zero Hallucination):**
   > *"What is the college policy on deep-sea submarine archaeology research?"*  
   > *Expected:* Clearly states that verified information could not be found in the Sinhgad Academy of Engineering knowledge base. `found: false`, 0 sources.
