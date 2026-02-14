# 🚀 QUICK START - Clicka e Vai!

## Se sei su Windows, usa questi file batch:

### ✅ **Option 1: WEB MOBILE PREVIEW (EASIEST)**
📁 **Clicca su:** `START_WEB_PREVIEW.bat`
- ✅ Si apre automaticamente http://localhost:19006
- ✅ Test completo senza emulatore
- ✅ Stesso UI di iOS/Android

### ✅ **Option 2: WEB DASHBOARD (per manager)**
Apri in browser: http://localhost:3000
- Login: manager@example.com / password123

---

## 🎯 Se vuoi usare PowerShell:

### Primo setup (solo 1 volta):
```powershell
# Aggiungi Node.js path permanentemente
$profile_path = $PROFILE
if (-not (Test-Path (Split-Path $profile_path))) {
    New-Item -ItemType Directory -Path (Split-Path $profile_path) -Force | Out-Null
}
Add-Content $profile_path "`n`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH"
```

### Poi in ogni terminale:
```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
cd c:\Users\luca0\Desktop\delivero\mobile
npm run web
```

---

## 🌐 URL Pronte

| App | URL | Accesso |
|-----|-----|---------|
| **Web Dashboard** | http://localhost:3000 | customer@example.com |
| **Mobile Preview** | http://localhost:19006 | (avvio via npm run web) |
| **Backend API** | http://localhost:5000 | JWT auth |
| **Database** | localhost:5432 | PostgreSQL |

---

## 🎭 Test Accounts

```
CUSTOMER:  customer@example.com / password123
RIDER:     rider@example.com / password123
MANAGER:   manager@example.com / password123
```

---

## 📋 Checklist Rapido

- [ ] Docker running (`docker-compose ps`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Can login as customer
- [ ] Can create order
- [ ] Can login as rider
- [ ] Can accept order
- [ ] Mobile web preview works
- [ ] All 3 roles tested

---

**🎉 Ready to test! Pick option 1 above.**
