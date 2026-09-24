@echo off
echo ============================================
echo   Sovereign AI Platform — Starting Services
echo ============================================

echo.
echo [1/5] Starting Docker services (Postgres, Qdrant)...
docker compose up -d
timeout /t 8 /nobreak >nul

echo.
echo [2/5] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo      Ollama not running. Please install and start Ollama:
    echo      https://ollama.com/download
    echo      Then run: ollama pull llama3.1:8b
    echo      And:      ollama pull nomic-embed-text
    pause
    exit /b 1
)
echo      Ollama is running.

echo.
echo [3/5] Pulling models if needed...
ollama pull llama3.1:8b 2>nul
ollama pull nomic-embed-text 2>nul

echo.
echo [4/5] Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [5/5] Starting FastAPI backend...
cd backend
start "SovAI Backend" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo.
echo Starting frontend...
cd frontend
start "SovAI Frontend" cmd /k "npm install && npm run dev"
cd ..

echo.
echo ============================================
echo   Sovereign AI Platform is starting!
echo   Backend:  http://localhost:8000/docs
echo   Frontend: http://localhost:5173
echo ============================================
pause
