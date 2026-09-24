# Sovereign AI — Quick Start

## Prerequisites
- Docker Desktop running
- Python 3.11+
- Node.js 18+
- Ollama installed (https://ollama.com/download)

## One-Command Start
```
start.bat
```

## Manual Start

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Start Ollama and pull models
```bash
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### 3. Start backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start frontend
```bash
cd frontend
npm install
npm run dev
```

## Access
- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health/

## How It Works
1. Upload a PDF through the Documents tab
2. Backend chunks it, embeds via Ollama, stores in Qdrant
3. Ask questions in Chat — retrieves relevant chunks, sends grounded prompt to LLM
4. Every interaction logged to Postgres audit table
5. View all logs in Audit Log tab — searchable, filterable
