@echo off
REM ============================================
REM  DELIVERO - WEB ONLY TEST
REM  Test il web dashboard per tutti i 3 ruoli
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   🌐 DELIVERO - Web Dashboard Test                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Docker
echo Checking Docker status...
docker-compose ps >nul 2>&1
if errorlevel 1 (
    echo Starting Docker containers...
    docker-compose up -d
    timeout /t 5 /nobreak
) else (
    echo ✅ Docker running
)

echo.
echo ✅ Opening Web Dashboard at http://localhost:3000
start http://localhost:3000

echo.
echo 📋 Test Credentials:
echo.
echo 👤 CUSTOMER
echo    Email: customer@example.com
echo    Pass:  password123
echo.
echo 👤 RIDER  
echo    Email: rider@example.com
echo    Pass:  password123
echo.
echo 👤 MANAGER
echo    Email: manager@example.com
echo    Pass:  password123
echo.
echo Ready to test! 🚀
echo.

pause
