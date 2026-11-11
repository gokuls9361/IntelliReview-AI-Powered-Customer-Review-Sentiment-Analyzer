@echo off
echo ===================================================
echo  Launching Full-Stack Customer Review Sentiment System
echo ===================================================
cd /d "%~dp0"

start "FastAPI Sentiment Backend (Port 8000)" cmd /k run_backend.bat
start "React Sentiment Frontend (Port 3000)" cmd /k run_frontend.bat

echo System launched!
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo - Frontend Dashboard: http://localhost:3000
