@echo off
echo ===================================================
echo  Starting Customer Review Sentiment Analysis Backend
echo ===================================================
cd /d "%~dp0"

if exist venv\Scripts\python.exe (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Using Python: %PYTHON_EXE%
%PYTHON_EXE% backend\run.py
pause
