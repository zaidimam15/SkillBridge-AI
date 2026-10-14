# SkillBridge AI ðŸŽ¯

### ATS Resume Screening & Skill-Gap Diagnostic Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com)

---

## ðŸ“Œ Project Description

**SkillBridge AI** is a complete, production-style final-year B.Tech Computer Science major project. It is an **ATS Resume Screening & Skill-Gap Diagnostic Platform** that creates a **Three-Way Bridge** connecting:

- ðŸ‘¨â€ðŸŽ“ **Students** â€” Resume analysis, skill-gap diagnosis, learning roadmaps
- ðŸ¢ **Recruiters/HR** â€” Candidate screening, bulk analysis, shortlisting
- ðŸ« **College T&P Cells** â€” Institutional analytics, placement readiness, training priorities

---

## ðŸŽ¯ Problem Statement

Modern hiring processes rely heavily on ATS (Applicant Tracking System) tools that filter candidates automatically before human review. Students often lack visibility into:
1. How their resumes perform against job requirements
2. Which specific skills are missing
3. How to bridge their skill gaps systematically

Simultaneously, college placement cells lack a centralized system to understand student readiness and plan targeted training programs.

---

## ðŸ”¬ Research Gap

Existing resume screening tools either:
- Show only a generic score without explanation
- Do not provide actionable skill-gap diagnosis
- Lack integration with placement cell analytics
- Do not support three-way visibility (student + recruiter + institution)

SkillBridge AI addresses this gap by creating an integrated, explainable, and institutionally-aware platform.

---

## ðŸŽ¯ Objectives

1. Implement an academic NLP-based ATS compatibility engine (TF-IDF + Cosine Similarity)
2. Provide transparent, explainable ATS results
3. Diagnose skill gaps at four levels: Strong, Moderate, Priority, Recommended
4. Generate personalized learning roadmaps and capstone project recommendations
5. Enable recruiter-side candidate screening with human oversight
6. Provide T&P cells with institutional analytics and training priority detection
7. Implement secure RBAC with four user roles
8. Build a premium React-based UI with dark/light mode support

---

## ðŸŒ‰ Three-Way Bridge Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                   SkillBridge AI                     â”‚
â”‚              ATS & Skill-Gap Platform                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â†‘                  â†‘                  â†‘
         â”‚                  â”‚                  â”‚
  â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
  â”‚  ðŸ‘¨â€ðŸŽ“ Student â”‚   â”‚ ðŸ¢ Recruiter â”‚   â”‚ ðŸ« T&P Cell â”‚
  â”‚             â”‚   â”‚              â”‚   â”‚             â”‚
  â”‚ â€¢ Upload CV â”‚   â”‚ â€¢ Post Jobs  â”‚   â”‚ â€¢ Analytics â”‚
  â”‚ â€¢ ATS Score â”‚   â”‚ â€¢ Screen CVs â”‚   â”‚ â€¢ Readiness â”‚
  â”‚ â€¢ Skill Gap â”‚   â”‚ â€¢ Shortlist  â”‚   â”‚ â€¢ Training  â”‚
  â”‚ â€¢ Roadmap   â”‚   â”‚ â€¢ Compare    â”‚   â”‚ â€¢ Reports   â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## âœ¨ Features

### ðŸŽ“ Student Features
- Resume upload (PDF, DOCX, TXT)
- Structured resume parsing with preview
- ATS compatibility scoring (TF-IDF + Cosine Similarity)
- Explainable results (why you matched, what is missing)
- Four-tier skill classification (Strong / Moderate / Priority / Recommended)
- Resume quality analysis
- Personalized learning roadmap
- Capstone project recommendations
- Career pathway compatibility
- Resume version history
- Analysis history & comparison
- Downloadable PDF report
- Career readiness score

### ðŸ¢ Recruiter Features
- Job posting creation
- JD skill extraction
- Bulk resume upload & analysis
- Candidate ranking table
- ATS score, matched/missing skills per candidate
- Shortlisting with notes
- Human-review-first design
- Candidate comparison

### ðŸ« T&P Cell Features
- Institutional analytics dashboard
- Role-wise student readiness
- Department & batch analytics
- Skill gap frequency charts
- Training priority detection
- Student readiness matrix
- Historical improvement tracking

### ðŸ” Admin Features
- User management
- Canonical skill management
- Skill alias management
- Career role management
- Learning resource management
- Capstone project management
- Audit logs
- Algorithm version tracking

---

## ðŸ—ï¸ System Architecture

```
client/ (React + Vite + Tailwind)
    â†• REST API
server/ (Node.js + Express)
    â†• HTTP/subprocess
server/ai/ (Python NLP Engine)
    - PDF/DOCX/TXT parsing
    - Skill extraction & normalization
    - TF-IDF vectorization
    - Cosine similarity
    - Skill-gap calculation
    â†•
MongoDB Atlas (Cloud Database)
```

---

## ðŸ› ï¸ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Authentication | JWT, bcryptjs |
| Database | MongoDB Atlas (Mongoose ODM) |
| File Upload | Multer |
| Security | Helmet, CORS, express-rate-limit |
| AI/NLP | Python 3, scikit-learn, spaCy |
| PDF Parsing | PyMuPDF (fitz), python-docx |
| NLP | NLTK, scikit-learn (TF-IDF) |

---

## ðŸ“ AI/NLP Methodology

### TF-IDF Vectorization

```
TF-IDF(t, d) = TF(t, d) Ã— IDF(t)

where:
  TF(t, d)  = frequency of term t in document d
  IDF(t)    = log(N / df(t)) + 1
  N         = total number of documents
  df(t)     = number of documents containing term t
```

### Cosine Similarity

```
cos(Î¸) = (R Â· J) / (||R|| Ã— ||J||)

where:
  R = TF-IDF vector of resume
  J = TF-IDF vector of job description
  Î¸ = angle between vectors
```

The similarity is converted to an ATS Compatibility Percentage.

> âš ï¸ **Academic Disclaimer**: ATS Compatibility Score represents similarity calculated by SkillBridge AI using TF-IDF + Cosine Similarity. This is an academic indicator and may differ from proprietary employer ATS systems.

### Skill-Gap Calculation

```
Missing Skills = Required JD Skills - Extracted Resume Skills

Four-Tier Classification:
  Strong    â†’ Score â‰¥ 0.8 in skill match
  Moderate  â†’ Score 0.5â€“0.79 in skill match
  Priority  â†’ Score < 0.5 but in top JD requirements
  Recommended â†’ Useful but not core JD requirements
```

---

## ðŸ‘¥ User Roles

| Role | Description |
|------|-------------|
| Student | Upload resumes, view analysis, access roadmap |
| Recruiter | Create jobs, screen candidates, shortlist |
| T&P Admin | View institutional analytics, manage training |
| Super Admin | Full system access, skill management, audit logs |

---

## ðŸ“ Project Structure

```
skillbridge-ai/
â”‚
â”œâ”€â”€ client/                   # React + Vite Frontend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/       # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ pages/            # Page components
â”‚   â”‚   â”œâ”€â”€ layouts/          # Layout wrappers
â”‚   â”‚   â”œâ”€â”€ hooks/            # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ services/         # API service layer
â”‚   â”‚   â”œâ”€â”€ context/          # React context providers
â”‚   â”‚   â”œâ”€â”€ utils/            # Utility functions
â”‚   â”‚   â”œâ”€â”€ charts/           # Chart components
â”‚   â”‚   â””â”€â”€ assets/           # Static assets
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ server/                   # Node.js Backend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ controllers/      # Route handlers
â”‚   â”‚   â”œâ”€â”€ routes/           # Express routes
â”‚   â”‚   â”œâ”€â”€ models/           # Mongoose models
â”‚   â”‚   â”œâ”€â”€ middleware/       # Custom middleware
â”‚   â”‚   â”œâ”€â”€ services/         # Business logic
â”‚   â”‚   â”œâ”€â”€ utils/            # Utilities
â”‚   â”‚   â”œâ”€â”€ config/           # Configuration
â”‚   â”‚   â””â”€â”€ validators/       # Input validation
â”‚   â”œâ”€â”€ ai/                   # Python AI/NLP Module
â”‚   â”‚   â”œâ”€â”€ parser/           # Resume/JD parsers
â”‚   â”‚   â”œâ”€â”€ nlp/              # NLP preprocessing
â”‚   â”‚   â”œâ”€â”€ matching/         # TF-IDF matching engine
â”‚   â”‚   â”œâ”€â”€ skills/           # Skill dictionary
â”‚   â”‚   â””â”€â”€ requirements.txt
â”‚   â”œâ”€â”€ uploads/              # File storage
â”‚   â””â”€â”€ .env.example
â”‚
â”œâ”€â”€ docs/                     # Documentation
â””â”€â”€ README.md
```

---

## ðŸš€ Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/zaidimam15/skillbridge-ai.git
cd skillbridge-ai
```

### 2. Environment Variables

```bash
# Server
cp server/.env.example server/.env
# Fill in your MongoDB Atlas URI, JWT secret, etc.
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Install Python AI Dependencies

```bash
cd server/ai
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m nltk.downloader stopwords punkt
```

### 5. Install Frontend Dependencies

```bash
cd client
npm install
```

### 6. Database Setup

The MongoDB collections are created automatically via Mongoose models. Run the seed script for demo data:

```bash
cd server
npm run seed
```

### 7. Run the Application

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## ðŸ”‘ Environment Variables

See `server/.env.example` for all required variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
UPLOAD_MAX_SIZE=5242880
```

---

## ðŸ“¡ API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload resume |
| GET | `/api/resumes` | Get user's resumes |
| GET | `/api/resumes/:id` | Get resume by ID |
| DELETE | `/api/resumes/:id` | Delete resume |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis` | Run ATS analysis |
| GET | `/api/analysis/history` | Get analysis history |
| GET | `/api/analysis/:id` | Get analysis by ID |
| GET | `/api/analysis/:id/report` | Download report |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/:id` | Get job by ID |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

---

## ðŸ” Security

- JWT authentication with refresh token strategy
- Passwords hashed with bcryptjs (12 rounds)
- Role-based access control (RBAC)
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input validation and sanitization
- File type & size validation
- SQL/NoSQL injection protection
- XSS protection
- Audit logging

---

## âš–ï¸ Privacy & Responsible AI

- Resumes contain sensitive personal data â€” stored securely
- User-controlled data deletion
- No sensitive attributes (gender, caste, religion, race) used in matching
- AI assists human decision-making; never auto-rejects candidates
- All AI-assisted actions logged for transparency
- Explicit disclaimer shown on all ATS scores

---

## ðŸ”® Future Scope

- Semantic embedding matching (BERT/Sentence-Transformers)
- LinkedIn profile import
- Video interview analysis
- Real-time job market API integration
- Mobile application
- Email notifications
- Advanced analytics with ML predictions

---

## âš ï¸ Limitations

- ATS scores are academic indicators, not employer-grade ATS guarantees
- Scanned PDFs (image-based) may not parse correctly
- Salary and market data are from configurable seed data, not real-time APIs
- Semantic matching is future work; current implementation uses TF-IDF

---

## ðŸ“Š Academic Integrity

All performance metrics and statistics in this project are:
- Based on the implemented algorithm
- Validated on test data
- Clearly labeled as demo data where applicable
- Not fabricated or inflated

Final quantitative performance values will be reported after controlled testing per academic evaluation guidelines.

---

## ðŸ‘¥ Team

- **Developer**: MD Zaid Imam
- **Supervisor**: [Supervisor Name]
- **Institution**: IMS Engineering College, Ghaziabad
- **Batch**: 2027

---

## ðŸ“„ License

MIT License â€” see [LICENSE](LICENSE) for details.

---

*SkillBridge AI â€” Bridging the gap between education and employment.*


