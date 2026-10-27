# Nivara - AI Independent Living Companion Development Runner
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Nivara AI Companion (Patient, Guardian & Doctor)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server
Write-Host "-> Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$BackendProcess = Start-Process python -ArgumentList "-m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory $CurrentDir -PassThru

# Start Frontend Dev Server
Write-Host "-> Launching Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
$FrontendProcess = Start-Process npm -ArgumentList "run dev" -WorkingDirectory "$CurrentDir\frontend" -PassThru

Write-Host ""
Write-Host "All services active!" -ForegroundColor Green
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend REST API: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C or enter 'stop' to terminate both processes." -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Red
    Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
}
