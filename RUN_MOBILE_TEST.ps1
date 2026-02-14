#!/usr/bin/env pwsh
# Script di avvio Delivero Mobile Test
# Esegui: .\RUN_MOBILE_TEST.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 DELIVERO - Mobile App Test (Expo)     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Setup alias per Node
Set-Alias node "C:\Program Files\nodejs\node.exe"
Set-Alias npm "C:\Program Files\nodejs\npm.cmd"

# Verifica Docker
Write-Host "[1/4] Verificando Docker..." -ForegroundColor Yellow
try {
  $containers = docker-compose ps
  Write-Host "✅ Docker containers running" -ForegroundColor Green
} catch {
  Write-Host "⚠️  Docker non in esecuzione, avvio..." -ForegroundColor Yellow
  docker-compose up -d
}

# Verifica Node.js
Write-Host "`n[2/4] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = & node --version
$npmVersion = & npm --version
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm $npmVersion" -ForegroundColor Green

# Mostra credenziali test
Write-Host "`n[3/4] Credenziali di Test:" -ForegroundColor Yellow
Write-Host "─" * 50
Write-Host "CUSTOMER:  customer@example.com / password123" -ForegroundColor Cyan
Write-Host "RIDER:     rider@example.com / password123" -ForegroundColor Cyan
Write-Host "MANAGER:   manager@example.com / password123" -ForegroundColor Cyan
Write-Host "─" * 50

# Selezione piattaforma
Write-Host "`n[4/4] Scegli piattaforma:" -ForegroundColor Yellow
Write-Host "  [1] 🌐 Web (più facile - consigliato)" -ForegroundColor Green
Write-Host "  [2] 🤖 Android Emulator"
Write-Host "  [3] 🍎 iOS Simulator (solo macOS)"
Write-Host "  [4] 📱 Expo (QR code scanner)"
Write-Host ""

$choice = Read-Host "Scelta (1-4)"

# Naviga alla cartella mobile
cd c:\Users\luca0\Desktop\delivero\mobile

Write-Host "`n🔄 Avvio Expo..." -ForegroundColor Yellow
Write-Host ""

switch ($choice) {
  "1" {
    Write-Host "🌐 Avviando Web Preview..." -ForegroundColor Cyan
    npm run web
  }
  "2" {
    Write-Host "🤖 Avviando Android..." -ForegroundColor Cyan
    npm run android
  }
  "3" {
    Write-Host "🍎 Avviando iOS..." -ForegroundColor Cyan
    npm run ios
  }
  "4" {
    Write-Host "📱 Avviando Expo Server (scansiona QR code)..." -ForegroundColor Cyan
    npm start
  }
  default {
    Write-Host "📱 Default: Expo Server..." -ForegroundColor Cyan
    npm start
  }
}
