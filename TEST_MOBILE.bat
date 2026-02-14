@echo off
REM Script di avvio per test Delivero
REM Setup alias Node.js e avvia Expo

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║         🚀 DELIVERO - Mobile App Test Setup            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Verifica Docker
echo [1/3] Verificando Docker containers...
docker-compose ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ✅ Docker running
) else (
  echo ❌ Docker non è in esecuzione
  echo Avviamento Docker...
  docker-compose up -d
)

echo.
echo [2/3] Test Utenti...
echo ───────────────────────────────────────────────────────
echo CUSTOMER:  customer@example.com / password123
echo RIDER:     rider@example.com / password123
echo MANAGER:   manager@example.com / password123
echo ───────────────────────────────────────────────────────

echo.
echo [3/3] Avvio Expo Mobile Test...
echo.
echo Scegli piattaforma:
echo   [i] iOS (richiede macOS)
echo   [a] Android
echo   [w] Web (test veloce)
echo.

setlocal enabledelayedexpansion
set /p choice="Scelta (i/a/w): "

cd /d c:\Users\luca0\Desktop\delivero\mobile

if /I "!choice!"=="i" (
  echo Starting iOS emulator...
  call "C:\Program Files\nodejs\npm.cmd" run ios
) else if /I "!choice!"=="a" (
  echo Starting Android emulator...
  call "C:\Program Files\nodejs\npm.cmd" run android
) else if /I "!choice!"=="w" (
  echo Starting web preview...
  call "C:\Program Files\nodejs\npm.cmd" run web
) else (
  echo Starting Expo...
  call "C:\Program Files\nodejs\npm.cmd" start
)

pause
