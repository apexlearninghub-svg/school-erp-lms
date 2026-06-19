@echo off
title School ERP - Starting...
color 0A
echo.
echo  ================================================
echo         SCHOOL ERP - STARTING SERVERS
echo  ================================================
echo.

echo  [1/2] Starting Backend (Flask)...
cd /d "%~dp0backend"
start /B "" venv\Scripts\python.exe run.py > ..\backend.log 2>&1
echo  [OK] Backend starting on http://127.0.0.1:5000
echo.

echo  [2/2] Waiting for backend to be ready...
timeout /t 3 /nobreak >nul

echo  [OK] Opening browser...
start http://localhost:5173
echo.

echo  Starting Frontend (Vite)...
cd /d "%~dp0frontend"
echo.
echo  ================================================
echo   Both servers running! 
echo   Website: http://localhost:5173
echo   Press CTRL+C to stop
echo  ================================================
echo.
npm run dev

echo.
echo  Frontend stopped. Stopping backend...
taskkill /F /IM python.exe >nul 2>&1
echo  All servers stopped.
pause
