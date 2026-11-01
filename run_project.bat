@echo off
title HydroSense AI - Multi-Tier System Launcher
echo =====================================================================
echo  HydroSense AI - State Water Resource Digital Twin & Effluent Portal
echo  Starting 3-Tier Government System (FastAPI ML + Node.js + Vite)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI ML Engine on Port 8000...
start "HydroSense [Tier 1] - Python ML Core (Port 8000)" cmd /k ".\.venv\Scripts\python.exe -m uvicorn ml_service.app:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Express Gateway on Port 5000...
start "HydroSense [Tier 2] - Express Gateway (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting React + Vite Frontend Portal on Port 5173...
start "HydroSense [Tier 3] - Vite Frontend Portal (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo =====================================================================
echo  All services launched successfully!
echo   * Web Portal: http://localhost:5173
echo   * Gateway API: http://localhost:5000/api/health
echo   * ML Service:  http://localhost:8000/api/health
echo =====================================================================
echo.
echo Opening browser to http://localhost:5173...
start http://localhost:5173

pause

