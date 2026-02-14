@echo off
REM ============================================
REM  DELIVERO - AUTO START
REM  Clicca questo file per iniziare il test
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   🚀 DELIVERO - Auto Start Test Mode                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is running
echo [1/4] Checking Docker...
docker-compose ps >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker not running, starting now...
    docker-compose up -d
    timeout /t 5 /nobreak
) else (
    echo ✅ Docker is running
)

echo.
echo [2/4] Opening Web Dashboard...
start http://localhost:3000
timeout /t 3 /nobreak

echo.
echo [3/4] Starting Mobile Web Preview...
cd /d "C:\Users\luca0\Desktop\delivero\mobile"
"C:\Program Files\nodejs\npm.cmd" run web

echo.
echo ✅ Setup complete!
echo.
echo Test accounts:
echo   customer@example.com / password123
echo   rider@example.com / password123
echo   manager@example.com / password123
echo.

pause
