# Crypton AI Backend - Start Script (PowerShell)
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Crypton AI Setup ===" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$venv = "backend\python\venv"
$python = "$venv\Scripts\python.exe"
$pip = "$venv\Scripts\pip.exe"

# Step 1
if (-not (Test-Path $venv)) {
    Write-Host "[1/5] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venv
}
else {
    Write-Host "[1/5] Virtual environment already exists." -ForegroundColor Green
}

# Step 2
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
& $pip install -r backend\python\requirements.txt

# Step 3
Write-Host "[3/5] Starting Python backend..." -ForegroundColor Yellow

$backend = Start-Process `
    -FilePath $python `
    -ArgumentList "-m", "uvicorn", "backend.python.main:app", "--reload" `
    -WorkingDirectory $root `
    -PassThru

# Wait until backend responds
$running = $false

for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep 1

    try {
        Invoke-RestMethod http://127.0.0.1:8000 | Out-Null
        $running = $true
        break
    }
    catch {}
}

if ($running) {
    Write-Host "Backend running at http://127.0.0.1:8000" -ForegroundColor Green
}
else {
    Write-Host "Backend failed to start." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/5] Starting frontend..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend
npm run dev
Pop-Location

Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173/"
