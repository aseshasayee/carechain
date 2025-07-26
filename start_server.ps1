# PowerShell script to start the Django development server
Write-Host "Starting Django development server..." -ForegroundColor Green

# Change to backend directory
Set-Location -Path "./backend"

# Activate virtual environment if it exists
if (Test-Path -Path "./venv/Scripts/Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "./venv/Scripts/Activate.ps1"
} elseif (Test-Path -Path "../venv/Scripts/Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "../venv/Scripts/Activate.ps1"
} else {
    Write-Host "No virtual environment found. Running with system Python." -ForegroundColor Yellow
}

# Start the Django server
Write-Host "Running Django server..." -ForegroundColor Green
python manage.py runserver

# Return to original directory when server is stopped
Set-Location -Path ".." 