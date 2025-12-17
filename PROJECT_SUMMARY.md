# ARPS - AI Research Paper Studio: Project Summary & Tech Stack

## 1. Project Overview
**ARPS (AI Research Paper Studio)** is a comprehensive, AI-powered platform designed to assist researchers and students in generating, editing, formatting, and validating research papers. It streamlines the academic writing process by automating complex tasks like structure generation, citation management, and formatting compliance (IEEE).

The platform features a modern, collaborative web interface backed by a robust AI engine that leverages Large Language Models (LLMs) and real-time web search to ensure content quality and originality.

## 2. Technology Stack

### Frontend (Client)
- **Framework**: Next.js 16 (React 19) - *Bleeding edge version*
- **Styling**: Tailwind CSS v4
- **Editor**: TipTap (Headless wrapper for ProseMirror) with extensions for highlighting, placeholders, etc.
- **State/Collaboration**: Yjs, y-websocket (for real-time collaboration)
- **UI Components**: Radix UI primitives, Lucide React icons
- **HTTP Client**: Axios
- **Utilities**: html2pdf.js, html-docx-js-typescript

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (via Mongoose v9)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **File Handling**: Multer, pdf-lib, docx

### AI Engine (Python Service)
- **Framework**: FastAPI
- **LLM Provider**: Groq (using Llama 3.3 70B Versatile)
  - *Note: Originally Google Gemini, migrated to Groq for performance/quality.*
- **Search & Detection**:
  - `duckduckgo-search`: For real-time academic source discovery and plagiarism checking.
  - `textstat`: For readability metrics and stylistic analysis.
- **Core Libraries**: Pydantic, python-dotenv, uvicorn

## 3. Key Features

### 🤖 AI Paper Generator
- **Topic-to-Paper**: Generates complete research papers from a simple topic or title.
- **Smart Outlining**: Creates structured outlines (Introduction, Methodology, Results, etc.) before generation.
- **Real Citations**: Searches the web for actual academic sources to generate valid IEEE citations, avoiding "hallucinated" references.
- **Humanized Writing**: Uses advanced prompting to vary sentence structure and avoid common AI patterns.

### 📝 Real-Time Collaborative Editor
- **Rich Text Editing**: robust editor supporting headings, lists, bold/italic, and more.
- **Live Collaboration**: Multiple users can edit the same document simultaneously (Google Docs style).
- **IEEE Preview**: Real-time preview of how the paper looks in standard IEEE two-column format.
- **Version Control**: Tracks changes and versions.

### 🔍 Professional Analysis Tools
- **Plagiarism Checker**:
  - **Search-Based**: Performs live web searches on document sentences to find matches.
  - **Source Detection**: Identifies specific URLs and titles of matching content.
  - **Score & Highlights**: Returns a plagiarism percentage and highlights specific sentences.
- **AI Content Detector**:
  - **Multi-Layer Analysis**: Combines statistical metrics (entropy, variance) with LLM-based stylistic analysis.
  - **Detailed Feedback**: Explains *why* text looks like AI (e.g., "lack of sentence variance", "overuse of transition words").
  - **Humanizer**: Tool to rewrite AI-detected text to sound more natural.

### 🛠️ Format & Improve Engine
- **Grammar Checker**: Identifies and corrects grammar/spelling errors.
- **Tone Adjuster**: Converts casual text into formal academic tone.
- **Citation Converter**: Converts various citation formats into IEEE standard.
- **Summarizer**: Condenses long sections into concise abstracts or summaries.

## 4. Project Structure

```
Research-Paper/
├── client/          # Next.js 16 Frontend
│   ├── src/app/     # App Router Pages
│   ├── src/components/ # UI & Editor Components
│   └── src/services/   # API Integration
├── server/          # Express Backend
│   ├── controllers/ # Business Logic
│   ├── models/      # Mongoose Schemas (User, Document, etc.)
│   └── routes/      # API Endpoints
└── ai-engine/       # Python AI Service
    ├── main.py      # FastAPI Application & Logic
    └── venv/        # Python Environment
```

## 5. Recent Updates (Professional Upgrade)
The system recently underwent a major upgrade to replace mock/placeholder AI features with functional professional-grade tools:
- **Groq Integration**: Switched to Llama 3.3 for faster, higher-quality generation.
- **Real Web Search**: Integrated DuckDuckGo for checking plagiarism and finding real sources.
- **Statistical Analysis**: Added `textstat` to analyze reading level and sentence variance for better AI detection.
