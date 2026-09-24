@echo off
cd /d C:\Users\Teller-01\Documents\SEVIGN AI\backend
C:\Users\Teller-01\Documents\SEVIGN AI\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8080