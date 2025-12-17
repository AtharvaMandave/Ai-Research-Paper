# ARPS - AI Research Paper Studio

A complete AI-powered platform for generating, editing, formatting, and validating research papers.

## 🚀 Features

### 1. AI Paper Generator
- Generate complete research papers from just a topic
- Automatic IEEE-compliant structure
- AI-generated citations and references
- Multiple domain support (AI, IoT, Cybersecurity, Healthcare, etc.)

### 2. Format & Improve Engine  
- Paste existing content for AI restructuring
- Plagiarism detection and removal
- Grammar correction
- Academic tone conversion
- IEEE format conversion

### 3. Real-Time Collaborative Editor
- TipTap-based rich text editor
- Live IEEE preview
- AI rewrite tools
- Reference manager
- Version history
- Multi-user collaboration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, TipTap Editor
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **AI Engine**: Python, FastAPI, Google Gemini API

## 📦 Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB

### Installation

1. **Clone and install dependencies:**

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install

# AI Engine
cd ../ai-engine
pip install -r requirements.txt
```

2. **Configure environment:**

```bash
# Server
cp server/.env.example server/.env
# Edit with your MongoDB URI and API keys

# AI Engine
cp ai-engine/.env.example ai-engine/.env
# Add your GEMINI_API_KEY
```

3. **Start services:**

```bash
# Terminal 1 - Frontend
cd client && npm run dev

# Terminal 2 - Backend
cd server && npm run dev

# Terminal 3 - AI Engine
cd ai-engine
./venv/Scripts/activate  # Windows
python main.py
```

## 📁 Project Structure

```
Research-Paper/
├── client/          # Next.js frontend
│   ├── src/
│   │   ├── app/     # Pages
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── ai-engine/       # Python AI service
    └── main.py
```

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Documents
- `GET/POST /api/documents`
- `GET/PUT/DELETE /api/documents/:id`
- `POST /api/documents/:id/versions`

### AI
- `POST /api/ai/generate-paper`
- `POST /api/ai/improve-text`
- `POST /api/ai/check-plagiarism`

## 📄 License

MIT
# Research-Paper
# Research-Paper-Generation-Analysis
# Research-Paper
# Research-Paper
# Research-Paper
