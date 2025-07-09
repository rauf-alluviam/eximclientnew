# Simple Module Assignment Test Runner
Write-Host "Module Assignment Test Runner" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "server\test-module-assignment.js")) {
    Write-Host "Error: test-module-assignment.js not found in server directory" -ForegroundColor Red
    Write-Host "Please run this script from the eximclient root directory" -ForegroundColor Yellow
    exit 1
}

# Set working directory to server
Set-Location "server"

Write-Host "Running backend module assignment tests..." -ForegroundColor Yellow

# Run the test
try {
    node test-module-assignment.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend tests completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Backend tests failed!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Error running tests: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Test execution completed." -ForegroundColor Green
