# 🚀 Guida Avvio Delivero - Con Docker

## Prerequisiti

- Docker Desktop installato e in esecuzione
- Node.js 16+ installato
- Git (per clonare il repo)

## 📋 Setup Iniziale

### 1️⃣ Avviare Docker Desktop
- Windows: Cerca "Docker Desktop" e avvia l'applicazione
- Aspetta che Docker sia completely avviato (icona nella taskbar)

### 2️⃣ Clonare/Navigare al Progetto
```bash
cd c:\Users\luca0\Desktop\delivero
```

### 3️⃣ Creare file .env (se non esiste)
Copia il file `.env.example` e salva come `.env`:
```bash
cp .env.example .env
```

Modifica i valori sensibili nel `.env` (AWS, email, Stripe, ecc)

## 🐳 Avvio con Docker Compose

### Opzione 1: Avvio Completo (Consigliato)
```bash
docker-compose up --build
```

Questo avvierà:
- **PostgreSQL** sulla porta 5432
- **Backend** API sulla porta 5000
- **Frontend** React sulla porta 3000

Aspetta i messaggi:
```
backend-1    | Server running on port 5000
frontend-1   | Compiled successfully!
```

### Opzione 2: Avvio Solo Database
Se preferisci eseguire backend e frontend localmente:
```bash
docker-compose up postgres
```

Poi in terminali separati:
```bash
# Terminale 1 (Backend)
cd backend
npm install
npm start

# Terminale 2 (Frontend)
cd frontend
npm install
npm start

# Terminale 3 (Mobile - Expo)
cd mobile
npm install
npm start
```

## 🛑 Fermare i Servizi

```bash
docker-compose down
```

Rimuove container ma mantiene i dati:
```bash
docker-compose down -v  # Cancella anche i volumi/database
```

## 🌐 Accesso Applicazione

### Web (Frontend)
- **URL**: http://localhost:3000
- **Default User**: demo@example.com / password123

### API Backend
- **Base URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Mobile (Expo)
```bash
cd mobile
npm start
```
- Scansiona QR code con Expo Go app
- Oppure premi `w` per web preview

## 📱 Test Ticket System

### Step 1: Login
Accedi con un account customer o rider

### Step 2: Creare Ticket
- Web: Clicca su "📝 Segnalazioni" → "Crea Segnalazione"
- Mobile: Accedi al menu → "Ticket" → "Crea Segnalazione"

### Step 3: Admin Dashboard
- Accedi come admin (role: 'admin' nel token)
- Web: /admin oppure button nel navbar
- Mobile: sezione admin nell'app
- Vedi statistiche, gestisci ticket, aggiorna stato

## 🗄️ Database Init Automatico

Docker esegue automaticamente:
1. File `database.sql` per creare tabelle
2. Crea schema per: users, orders, bills, payments, restaurants, services (4 nuovi)
3. Crea tabelle ticket e ticket_comments

Controlla stato database:
```bash
docker-compose exec postgres psql -U postgres -d delivero -c "\dt"
```

## 📂 Struttura File Importante

```
delivero/
├── docker-compose.yml         # Configurazione container
├── .env.example               # Variabili ambiente template
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── controllers/       # Controller logica
│   │   │   └── ticketsController.js   # ✨ NUOVO: gestione ticket
│   │   ├── routes/
│   │   │   └── tickets.js             # ✨ NUOVO: endpoint ticket
│   │   ├── models/
│   │   │   └── Ticket.js              # ✨ NUOVO: model ticket
│   │   └── config/
│   │       └── database.sql   # Schema SQL
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                  # React.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketForm.jsx         # ✨ NUOVO: crea ticket
│   │   │   └── TicketsList.jsx        # ✨ NUOVO: visualizza ticket
│   │   ├── pages/
│   │   │   └── AdminTickets.jsx       # ✨ NUOVO: admin gestione
│   │   └── services/
│   │       └── api.js         # Axios client
│   └── Dockerfile
│
└── mobile/                    # React Native + Expo
    ├── screens/
    │   ├── customer/
    │   │   ├── TicketFormScreen.js    # ✨ NUOVO
    │   │   ├── MyTicketsScreen.js     # ✨ NUOVO
    │   ├── admin/
    │   │   └── AdminTicketsScreen.js  # ✨ NUOVO
    │   └── ...other screens
    └── App.js
```

## 🔌 Connessione Database

Se Docker non si avvia:

### Errore: "Docker daemon is not running"
```bash
# Avvia Docker Desktop manualmente
# Oppure in PowerShell:
& 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
```

### Errore: "Connection refused at 5432"
```bash
# Controlla se container postgres è in running
docker ps | findstr postgres

# Se non c'è, riavvia
docker-compose restart postgres
```

### Reset Completo Database
```bash
# Ferma e rimuove tutto
docker-compose down -v

# Riavvia da zero
docker-compose up --build
```

## 🧪 Test Endpoints Ticket

### Create Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "bug",
    "title": "App crasha quando...",
    "description": "Descrizione dettagliata...",
    "attachmentUrls": []
  }'
```

### Get My Tickets
```bash
curl http://localhost:5000/api/tickets/my-tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Get All
```bash
curl http://localhost:5000/api/tickets/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Statistics
```bash
curl http://localhost:5000/api/tickets/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Variabili Ambiente

Nel file `.env`:
```env
# Database
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=postgres          # Nome del servizio Docker
DB_PORT=5432
DB_NAME=delivero

# API
PORT=5000
JWT_SECRET=your_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=delivero-bucket

# URLs
FRONTEND_URL=http://localhost:3000
```

## 📊 Logs e Debug

### Visualizzare Log Backend
```bash
docker-compose logs -f backend
```

### Visualizzare Log Database
```bash
docker-compose logs -f postgres
```

### Entrare in Shell Docker
```bash
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d delivero
```

## 🚨 Problemi Comuni

### "Port 5000 already in use"
```bash
# Trova processo sulla porta
netstat -ano | findstr :5000

# Termina processo (sostituisci PID)
taskkill /PID 1234 /F

# Oppure cambia porta in docker-compose.yml
ports:
  - "5001:5000"  # Esterno:Interno
```

### "Cannot connect to Docker daemon"
1. Apri Docker Desktop
2. Aspetta che sia completamente caricato
3. Riprova `docker-compose up`

### Database non si inizializza
```bash
# Rimuovi volume e riavvia
docker-compose down -v
docker-compose up --build
```

### Frontend non mostra API data
1. Controlla che backend sia in running
2. Verifica Authorization header con token JWT valido
3. Controlla CORS in app.js

## ✨ Nuove Funzionalità Implementate

✅ **Ticket/Segnalazioni System**
- Model: Ticket, TicketComments
- Controller: 11 funzioni CRUD
- Routes: 8 endpoint + admin only
- Components: Web (TicketForm, TicketsList, Admin) + Mobile (3 screens)
- Database: 2 nuove tabelle con indici

✅ **Admin Dashboard**
- Dashboard ticket con statistiche
- Gestione stato ticket
- Commenti admin
- Filtri by tipo e stato

✅ **Customer/Rider Features**
- Creare segnalazioni
- Visualizzare propri ticket
- Aggiungere commenti
- Ricevere risposte admin

## 🎯 Prossimi Passi

1. Configurare AWS S3 per upload immagini ticket
2. Implementare notifiche email per nuovo ticket
3. Aggiungere attachment upload nel form
4. Implementare feedback system (rating)
5. Build APK Android con EAS

## 📞 Support

- Controlla logs: `docker-compose logs`
- Verifica connessione: `docker-compose exec postgres psql -U postgres -d delivero`
- Reset database: `docker-compose down -v && docker-compose up --build`

---

**Sistema pronto per il deployment! 🚀**
