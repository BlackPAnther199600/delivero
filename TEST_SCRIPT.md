# 🧪 Test Delivero - Guida Completa v2.0

## ✅ Setup Verificato

| Componente | Status | Details |
|-----------|--------|---------|
| Docker | ✅ Running | Frontend, Backend, Database |
| Node.js | ✅ v24.13.1 | Installato in `C:\Program Files\nodejs` |
| npm | ✅ v11.8.0 | Package manager ready |
| Mobile App | ✅ Installato | 639 packages in `node_modules` |
| Test Users | ✅ Creati | 3 utenti demo (customer, rider, manager) |

---

## 🌐 Test Web Frontend

### Stack URL
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: localhost:5432

### 1️⃣ **CUSTOMER (Cliente) - Test Login**

```
Email: customer@example.com
Password: password123
```

**Funzionalità da testare:**
- ✅ Login form con email/password
- ✅ Dashboard con 6 categorie (🍔 Cibo, 💊 Farmacia, 🛒 Spesa, 👕 Abbigliamento, 💻 Elettronica, 📚 Libri)
- ✅ Form creazione ordine (descrizione, indirizzo, prezzo, categoria)
- ✅ Visualizzazione ordini creati
- ✅ Logout button

**Flusso di Test:**
1. Apri http://localhost:3000
2. Clicca "Registrati" (opzionale per nuovo utente)
3. Login con credenziali sopra
4. Seleziona categoria (es: 🍔 Cibo)
5. Compila form ordine
6. Clicca "🚀 Crea Ordine"
7. Vai a tab "📋 Ordini" per vedere lista
8. Logout

---

### 2️⃣ **RIDER (Corriere) - Test Login**

```
Email: rider@example.com
Password: password123
```

**Funzionalità da testare:**
- ✅ Dashboard con ordini disponibili
- ✅ Ordini ordinati per distanza (GPS)
- ✅ Pulsante "Accetta Ordine"
- ✅ Tab "Le Mie Consegne" con ordini accettati
- ✅ Pulsante "Completa Consegna"
- ✅ Statistiche live (ordini attivi, completati, guadagni)

**Flusso di Test:**
1. Apri http://localhost:3000
2. Login con rider credentials
3. Vedi lista ordini disponibili con distanza
4. Clicca "✅ Accetta" su un ordine
5. Vai a tab "Le Mie Consegne"
6. Vedi ordine nella lista
7. Clicca "✅ Completa" per segnare completato
8. Statistiche si aggiornano
9. Logout

---

### 3️⃣ **MANAGER/ADMIN (Gestore/Amministratore) - Test Login**

```
Email: manager@example.com
Password: password123
```

**Funzionalità da testare:**
- ✅ Admin Dashboard (Statistiche, Ordini, Utenti, Finanza, Metriche, Ticket)
- ✅ Gestione utenti (modifica ruoli, elimina utenti)
- ✅ Rapporti finanziari
- ✅ Ticket di supporto
- ✅ Metriche servizi (farmacia, transport, pickups, bollette)

**Flusso di Test:**
1. Apri http://localhost:3000
2. Login con manager credentials
3. Accedi all'Admin Dashboard
4. Testa i 6 tab:
   - 📊 Statistiche: KPI principali
   - 📦 Ordini: Filtra per status
   - 👥 Utenti: Modifica ruoli o elimina
   - 💰 Finance: Report finanziari
   - 📈 Metrics: Dati servizi
   - 🎫 Tickets: Gestisci ticket di supporto
5. Logout

---

## 📱 Test Mobile App (React Native)

### Setup Iniziale

```bash
# Verifica Node.js
node --version  # Deve essere v24.13.1 o superiore
npm --version   # Deve essere v11.8.0 o superiore

# Naviga alla cartella mobile
cd c:\Users\luca0\Desktop\delivero\mobile

# Le dipendenze sono già installate (639 packages)
# Se serve reinstallare:
npm install
```

### Opzioni di Avvio Test

#### 🌐 **Web Preview (Più facile per test veloce)**
```bash
npm run web

# Si aprirà automaticamente browser con http://localhost:19006
# Mostra versione web del mobile app
```

#### 🤖 **Android Emulator(Se emulatore Android è configurato)**
```bash
npm run android

# Richiede Android Studio emulator o Genymotion in esecuzione
```

#### 🍎 **iOS Simulator (Solo su macOS)**
```bash
npm run ios

# Richiede macOS con Xcode installato
```

#### 🎮 **Expo Go on Physical Device**
```bash
npm start

# Scansiona QR code con Expo Go app (disponibile su App Store/Google Play)
# Permette test su dispositivo reale
```

---

## 📋 Test Scenari Mobile

### Scenario 1: Customer Registration & Order Creation

**Steps:**
1. Avvia `npm run web` (o altra piattaforma)
2. Mostra schermata Login
3. Clicca "Non hai account? Registrati"
4. Vai a RegisterScreen
5. Compila:
   - Name: "Test Customer"
   - Email: "test.customer@example.com"
   - Password: "password123"
   - Confirm: "password123"
   - Role: "customer" (dall'picker)
6. Clicca "Registra"
7. Torna a Login automaticamente
8. Login con nuove credenziali
9. Vedi CustomerHome con 6 categorie
10. Seleziona "🍔 Cibo"
11. Compila form:
    - Descrizione: "2 Margherita"
    - Indirizzo: "Via Roma 123"
    - Prezzo: "29.99"
12. Clicca "🚀 Crea Ordine"
13. Vai a tab "📋 Ordini"
14. Vedi ordine nella lista con status "⏳ In Attesa"

**Expected Result:** ✅ Ordine visibile in CustomerOrdersScreen

---

### Scenario 2: Rider Order Acceptance Flow

**Setup:** Customer ha creato almeno 1 ordine

**Steps:**
1. Login come new rider:
   - Email: "test.rider@example.com"
   - Password: "password123"
   - Role: "rider"
2. Vai RiderHomeScreen
3. Vedi lista ordini con distanza
4. Clicca "✅ Accetta" su ordine
5. Sistema mostra "Ordine accettato! 🎉"
6. Lista si aggiorna automaticamente
7. Vai a tab "🚗 Consegne"
8. Vedi ordine accettato nella lista
9. Clicca "✅ Completa"
10. Mostra dialog "Completa Consegna?"
11. Clicca "Sì, Completa"
12. Sistema mostra "Ordine completato!"
13. Tab statistiche aggiorna (completed count +1, earnings updated)

**Expected Result:** ✅ Order flow completo from rider perspective

---

### Scenario 3: Order Tracking (Customer)

**Setup:** Rider ha accettato ordine customer

**Steps:**
1. Login come customer che ha creato ordine
2. Vai tab "📋 Ordini"
3. Vedi ordine con status "🚗 In Consegna"
4. Seleziona filtro "In Consegna"
5. Vedi solo ordini in consegna
6. Clicca "📍 Traccia"
7. (App mostra posizione rider - demo feature)
8. Attendi rider completion
9. Ordine passa a status "✅ Consegnato"
10. Clicca "⭐ Valuta" per fare review

**Expected Result:** ✅ Real-time status updates

---

## 🧪 API Test Manuale (Optional)

### Register Customer
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{"name":"Test User","email":"test@test.com","password":"pass123","role":"customer"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{"email":"customer@example.com","password":"password123"}"

REM Risposta include token JWT
```

### Create Order (richiede token)
```bash
curl -X POST http://localhost:5000/api/orders ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{"description":"Pizza","address":"Via Roma 1","total_price":15,"category":"food"}"
```

---

## 📋 Checklist Completa Test

### Web Frontend ✅
- [ ] Customer login/register
- [ ] Customer vede 6 categorie
- [ ] Customer crea ordine con tutte categorie
- [ ] Customer visualizza ordini creati
- [ ] Rider login funziona
- [ ] Rider vede ordini disponibili
- [ ] Rider accetta ordine
- [ ] Rider completa ordine
- [ ] Manager login funziona
- [ ] Manager vede statistiche
- [ ] Manager filtra ordini
- [ ] Logout funziona (3 ruoli)
- [ ] UI è responsive
- [ ] Colori tema applicati (Orange #FF6B00, Blue #0066FF)

### Mobile App ✅
- [ ] Login screen monta correttamente
- [ ] Register screen con role picker funziona
- [ ] Customer home mostra 6 categorie grid
- [ ] Customer crea ordine con form
- [ ] Customer vede ordini con filtri
- [ ] Customer può annullare ordini pending
- [ ] Rider home mostra ordini con distanza
- [ ] Rider accetta ordine e sposta a tab Active
- [ ] Rider completa ordine
- [ ] Rider vede statistiche aggiornate
- [ ] Logout funziona
- [ ] Navigazione tabs funziona smooth
- [ ] Icone emoji rendono bene
- [ ] Styling coerente con web

### Database ✅
- [ ] PostgreSQL running (5432)
- [ ] Utenti creati correttamente
- [ ] Ordini salvati in DB
- [ ] JWT tokens generati
- [ ] Password hash

### Backend API ✅
- [ ] /api/auth/register funziona
- [ ] /api/auth/login funziona e genera token
- [ ] /api/orders POST crea ordine
- [ ] /api/orders GET lista ordini
- [ ] /api/orders/:id GET dettagli
- [ ] Token validation middleware funziona
- [ ] Errori 409 per duplicate email

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
cd c:\Users\luca0\Desktop\delivero\mobile
npm install
```

### "Backend non risponde"
```bash
docker-compose restart backend
docker-compose logs backend  # Vedi errori
```

### "Database connection failed"
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### "Port 3000/5000 already in use"
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```

### "npm not found"
```bash
# Aggiungi full path
"C:\Program Files\nodejs\npm.cmd" install

# Oppure aggiungi al PATH manualmente:
SET PATH=%PATH%;C:\Program Files\nodejs
```

### "Expo: Unable to start server"
```bash
# Pulisci cache Expo
npm start -- --clear
# o
npx expo start --clear
```

---

## 📸 Expected Screenshots

### Web
1. **Login Page** - Form con email/password/role
2. **Customer Dashboard** - 6 categorie in grid colorato
3. **Create Order Modal** - Form con descrizione/indirizzo/prezzo
4. **Rider Dashboard** - Ordini con distanza badge
5. **Manager Analytics** - 4 stat cards + order list
6. **Order Tracking** - Status badges (⏳ 🚗 ✅)

### Mobile (React Native)
1. **LoginScreen** - Email, password, role info
2. **RegisterScreen** - Form completo + role picker
3. **CustomerHome** - 6 categorie emoji scrollable
4. **CustomerOrders** - Filtri + status badges
5. **RiderHome** - Ordini per distanza con ✅ Accetta
6. **RiderActive** - Stats cards + completa button

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Docker (sempre)
docker-compose up -d

# Terminal 2: Web Test
cd c:\Users\luca0\Desktop\delivero
# Apri http://localhost:3000 in browser

# Terminal 3: Mobile Test (scegli uno)
cd c:\Users\luca0\Desktop\delivero\mobile
npm run web        # Web preview (più facile)
npm run android    # Android emulator
npm run ios        # iOS simulator
npm start          # Expo per QR code scanner
```

---

## 📊 Test Status Summary

```
✅ BACKEND         - Running on port 5000
✅ FRONTEND        - Running on port 3000
✅ DATABASE        - PostgreSQL 15 on 5432
✅ TEST USERS      - 3 demo accounts created
✅ MOBILE APP      - Expo configured, 639 packages installed
✅ DOCUMENTATION   - Complete test guide ready

🎯 READY FOR TESTING!
```

**Pronto a partire! 🚀** Per iniziare:
1. Apri http://localhost:3000 per il web
2. Oppure esegui `npm run web` per il mobile preview
3. Usa credenziali di test sopra

