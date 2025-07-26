# PowerShell script to properly start the Django backend server
Write-Host "Starting CareChain Healthcare Portal Backend..." -ForegroundColor Green

# Change to backend directory
Set-Location -Path ".\backend"

# Check for virtual environment and activate if it exists
if (Test-Path -Path ".\venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & ".\venv\Scripts\Activate.ps1"
} elseif (Test-Path -Path "..\venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "..\venv\Scripts\Activate.ps1"
} else {
    Write-Host "No virtual environment found. Running with system Python." -ForegroundColor Yellow
}

# Run Django migrations to ensure database is up to date
Write-Host "Applying database migrations..." -ForegroundColor Cyan
python manage.py migrate

# Run Django server
Write-Host "Starting Django development server..." -ForegroundColor Green
python manage.py runserver

# Change back to original directory when server stops
Set-Location -Path ".." 