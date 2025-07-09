# Module Assignment Test Runner
# PowerShell script to run comprehensive module assignment tests

param(
    [string]$TestType = "all",
    [string]$ServerUrl = "http://localhost:5000",
    [string]$MongoUri = "",
    [string]$SuperAdminEmail = "",
    [string]$SuperAdminPassword = "",
    [switch]$Verbose
)

Write-Host "🚀 Module Assignment Test Runner" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Set environment variables if provided
if ($MongoUri) {
    $env:MONGODB_URI = $MongoUri
}
if ($SuperAdminEmail) {
    $env:SUPERADMIN_EMAIL = $SuperAdminEmail
}
if ($SuperAdminPassword) {
    $env:SUPERADMIN_PASSWORD = $SuperAdminPassword
}

# Function to run backend tests
function Run-BackendTests {
    Write-Host "`n🔧 Running Backend Tests..." -ForegroundColor Yellow
    
    $serverPath = "d:\eximclient\server"
    if (!(Test-Path $serverPath)) {
        Write-Host "❌ Server directory not found: $serverPath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $serverPath
    
    try {
        # Check if test file exists
        if (!(Test-Path "test-module-assignment.js")) {
            Write-Host "❌ Backend test file not found" -ForegroundColor Red
            return $false
        }
        
        # Run the test
        Write-Host "⏳ Executing backend tests..." -ForegroundColor Cyan
        
        $env:API_BASE_URL = $ServerUrl
        if ($Verbose) {
            $env:DEBUG = "true"
        }
        
        $result = node test-module-assignment.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend tests completed successfully" -ForegroundColor Green
            if ($Verbose) {
                Write-Host $result -ForegroundColor Gray
            }
            return $true
        } else {
            Write-Host "❌ Backend tests failed" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error running backend tests: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Pop-Location
    }
}

# Function to check frontend test setup
function Check-FrontendTests {
    Write-Host "`n🖥️ Checking Frontend Test Setup..." -ForegroundColor Yellow
    
    $clientPath = "d:\eximclient\client"
    if (!(Test-Path $clientPath)) {
        Write-Host "❌ Client directory not found: $clientPath" -ForegroundColor Red
        return $false
    }
    
    $testFile = "$clientPath\src\utils\moduleAssignmentTester.js"
    if (!(Test-Path $testFile)) {
        Write-Host "❌ Frontend test file not found: $testFile" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Frontend test file found" -ForegroundColor Green
    Write-Host "📋 To run frontend tests:" -ForegroundColor Cyan
    Write-Host "   1. Open your React application in browser" -ForegroundColor Gray
    Write-Host "   2. Log in as a customer" -ForegroundColor Gray
    Write-Host "   3. Open browser console (F12)" -ForegroundColor Gray
    Write-Host "   4. Run: window.testModuleAssignment()" -ForegroundColor Gray
    
    return $true
}

# Function to run system checks
function Run-SystemChecks {
    Write-Host "`n🔍 Running System Checks..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found or not working" -ForegroundColor Red
        return $false
    }
    
    # Check if server is running
    try {
        $response = Invoke-WebRequest -Uri "$ServerUrl/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Server is running at $ServerUrl" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Server might not be running at $ServerUrl" -ForegroundColor Yellow
        Write-Host "   Please start the server before running tests" -ForegroundColor Gray
    }
    
    # Check required environment variables
    $requiredEnvVars = @("MONGODB_URI", "SUPERADMIN_EMAIL", "SUPERADMIN_PASSWORD")
    $missingVars = @()
    
    foreach ($var in $requiredEnvVars) {
        if (!(Get-Item -Path "env:$var" -ErrorAction SilentlyContinue)) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Gray
        }
        Write-Host "   You can set them as parameters or environment variables" -ForegroundColor Gray
    } else {
        Write-Host "✅ All required environment variables are set" -ForegroundColor Green
    }
    
    return $true
}

# Function to show test summary
function Show-TestSummary {
    Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    
    Write-Host "Backend Tests: " -NoNewline
    if ($script:backendTestsPassed) {
        Write-Host "✅ PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
    }
    
    Write-Host "Frontend Tests: " -NoNewline
    if ($script:frontendTestsReady) {
        Write-Host "✅ READY" -ForegroundColor Green
    } else {
        Write-Host "❌ NOT READY" -ForegroundColor Red
    }
    
    Write-Host "System Checks: " -NoNewline
    if ($script:systemChecksPass) {
        Write-Host "✅ PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
    }
}

# Function to show usage
function Show-Usage {
    Write-Host "`n📖 Usage:" -ForegroundColor Cyan
    Write-Host "==========" -ForegroundColor Cyan
    Write-Host ".\run-module-tests.ps1 [options]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -TestType [all|backend|frontend|system]  Type of tests to run (default: all)"
    Write-Host "  -ServerUrl [url]                         Server URL (default: http://localhost:5000)"
    Write-Host "  -MongoUri [uri]                          MongoDB connection string"
    Write-Host "  -SuperAdminEmail [email]                 SuperAdmin email"
    Write-Host "  -SuperAdminPassword [password]           SuperAdmin password"
    Write-Host "  -Verbose                                 Enable verbose output"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run-module-tests.ps1 -TestType backend -Verbose"
    Write-Host "  .\run-module-tests.ps1 -ServerUrl http://localhost:3000"
    Write-Host "  .\run-module-tests.ps1 -MongoUri 'mongodb://localhost:27017/test'"
}

# Main execution
$script:backendTestsPassed = $false
$script:frontendTestsReady = $false
$script:systemChecksPass = $false

switch ($TestType.ToLower()) {
    "all" {
        $script:systemChecksPass = Run-SystemChecks
        $script:backendTestsPassed = Run-BackendTests
        $script:frontendTestsReady = Check-FrontendTests
        Show-TestSummary
    }
    "backend" {
        $script:systemChecksPass = Run-SystemChecks
        $script:backendTestsPassed = Run-BackendTests
    }
    "frontend" {
        $script:frontendTestsReady = Check-FrontendTests
    }
    "system" {
        $script:systemChecksPass = Run-SystemChecks
    }
    "help" {
        Show-Usage
        exit 0
    }
    default {
        Write-Host "❌ Invalid test type: $TestType" -ForegroundColor Red
        Show-Usage
        exit 1
    }
}

# Final status
if ($TestType.ToLower() -eq "all") {
    if ($script:backendTestsPassed -and $script:frontendTestsReady -and $script:systemChecksPass) {
        Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n⚠️  Some tests failed or are not ready. Please check the output above." -ForegroundColor Yellow
        exit 1
    }
} elseif ($TestType.ToLower() -eq "backend") {
    if ($script:backendTestsPassed) {
        Write-Host "`n🎉 Backend tests completed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n❌ Backend tests failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Test execution completed." -ForegroundColor Green
