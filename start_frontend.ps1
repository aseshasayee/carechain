# PowerShell script to start a simple HTTP server for the frontend
Write-Host "Starting CareChain Healthcare Portal Frontend..." -ForegroundColor Green

# Change to frontend directory
Set-Location -Path ".\frontend\test-ui"

# Check if Python is installed and use its HTTP server
try {
    $pythonVersion = python --version
    Write-Host "Using $pythonVersion to serve the frontend" -ForegroundColor Cyan
    
    # Default port
    $port = 8080
    
    # Try to start the server, use different port if 8080 is in use
    try {
        Write-Host "Starting server on http://localhost:$port" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        python -m http.server $port
    } catch {
        $port = 8090
        Write-Host "Port 8080 is busy, trying port $port instead" -ForegroundColor Yellow
        Write-Host "Starting server on http://localhost:$port" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        python -m http.server $port
    }
} catch {
    Write-Host "Python not found. Please install Python to serve the frontend." -ForegroundColor Red
    Write-Host "Alternatively, you can use any other HTTP server to serve the files in .\frontend\test-ui" -ForegroundColor Yellow
}

# Change back to original directory when server stops
Set-Location -Path "..\.." 