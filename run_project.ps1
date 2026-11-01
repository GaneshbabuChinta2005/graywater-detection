# HydroSense AI - Multi-Tier System Launcher (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " HydroSense AI - State Water Resource Digital Twin & Effluent Portal" -ForegroundColor Green
Write-Host " Starting 3-Tier Government System (FastAPI ML + Node.js + Vite)" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Start Python FastAPI ML Engine (Port 8000)
Write-Host "[1/3] Starting Python FastAPI ML Engine on Port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir'; .\.venv\Scripts\python.exe -m uvicorn ml_service.app:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

# 2. Start Node.js Express Gateway (Port 5000)
Write-Host "[2/3] Starting Node.js Express Gateway on Port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; npm run dev"

Start-Sleep -Seconds 2

# 3. Start React + Vite Frontend (Port 5173)
Write-Host "[3/3] Starting React + Vite Frontend Portal on Port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "All services initiated!" -ForegroundColor Green
Write-Host "  * Web Portal: http://localhost:5173" -ForegroundColor White
Write-Host "  * Gateway API: http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  * ML Service:  http://localhost:8000/api/health" -ForegroundColor White
Write-Host ""

Start-Process "http://localhost:5173"

