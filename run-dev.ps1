# Starts both the Flask backend and the React frontend in separate terminals.
# Run this from the repository root:
#   .\run-dev.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting backend (Flask) in a new PowerShell window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$repoRoot'; python app.py"

Write-Host "Starting frontend (Vite) in a new PowerShell window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$repoRoot\frontend'; npm run dev"
