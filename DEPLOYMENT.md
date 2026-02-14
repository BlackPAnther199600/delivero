# Deployment Guide - Railway.app

Railway è la piattaforma più facile per deployare Delivero senza costi nascosti.

## 📋 Prerequisiti

- Account GitHub
- Account [Railway.app](https://railway.app) (free tier disponibile)

## 🚀 Deploy su Railway

### 1. Setup Railway

```bash
# Installa Railway CLI
npm i -g railway

# Accedi a Railway
railway login

# Crea nuovo progetto
railway init
```

### 2. Configura Database PostgreSQL

Nel dashboard Railroad:
1. Clicca "+ Create"
2. Seleziona "PostgreSQL"
3. Aggiungi al progetto

Railway creerà automaticamente le variabili `DATABASE_URL`

### 3. Deploy Backend

```bash
cd backend

# Genera railway.json
railway link

# Deploy
railway up
```

Oppure via GitHub:
1. Push il code su GitHub
2. Nel dashboard Railroad: "+ Create" → "GitHub Repo"
3. Seleziona il repository e il branch

### 4. Configure Environment Variables

Nel dashboard Railroad, vai a "Variables" e aggiungi:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_change_this
STRIPE_SECRET_KEY=sk_test_your_stripe_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### 5. Deploy Frontend

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Deploy su Vercel, Netlify, o Railway:

**Con Railway:**
```bash
railway link  # Nella directory frontend
railway up
```

**Con Vercel (consigliato per React):**
```bash
npm i -g vercel
vercel
```

### 6. Database Migration

Una volta deployato:

1. Esegui le migrazioni SQL:
```bash
psql <DATABASE_URL_DA_RAILWAY> -f backend/src/config/database.sql
```

Oppure via `psql` il file direttamente dal dashboard Railway.

### 7. Domini Personalizzati

Nel dashboard Railroad:
1. Seleziona il servizio (backend/frontend)
2. "Domains" → "+ Create Domain"
3. Aggiungi il tuo dominio personalizzato

Configura DNS records nel tuo provider di dominio.

## 💰 Costi

- **Gratuito**: $5 crediti mensili
- **Pagamento**: $5 al mese per 1GB RAM + database

## 📊 Monitoring

Railway ti fornisce:
- Logs in tempo reale
- Metrics (CPU, RAM, Network)
- Deploys history
- Rollback capabilities

## 🚨 Troubleshooting

### Problemi di connessione al database

```bash
# Verifica connection string
railway run bash
echo $DATABASE_URL
```

### Build fails

Assicurati che:
- Node versione supportata (18+)
- package.json esiste nella root o subdirectory
- Build script nel package.json è corretto

### Ordini non arrivano

Verifica:
- FRONTEND_URL nelle environment variables
- CORS configurato correttamente
- Socket.IO port disponibile

## 🔐 Backup Database

Railway fa backup automatici. Puoi anche:

```bash
# Scarica backup
railway run pg_dump > backup.sql

# Ripristina
railway run psql < backup.sql
```

## 🚀 Prossimi Step

1. Setup dominio personalizzato
2. Configura email service (SendGrid, Mailgun)
3. Setup Stripe production keys
4. Implementa monitoring (Sentry, LogRocket)
5. Setup autoscaling per traffic spikes

## 📚 Link Utili

- [Railway Docs](https://docs.railway.app)
- [Railway CLI Guides](https://docs.railway.app/cli/general-commands)
- [Deployment Checklist](https://docs.railway.app/deploy/checklist)
