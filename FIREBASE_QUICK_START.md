# Firebase Setup Quick Start - Delivero

## Minuetti necessari: 5-10 (se hai account Firebase)

### 1. Crea progetto Firebase (console.firebase.google.com)
- Nome: "delivero-prod"
- Abilita Cloud Messaging

### 2. Scarica Service Account JSON
- **Project Settings** → **Service Accounts** tab
- Clicca "Generate New Private Key"
- File JSON scariato (es: `serviceAccountKey.json`)

### 3. Configura Backend

**Opzione A: usando un file**
```bash
# Copia il file nel backend
cp serviceAccountKey.json backend/firebase-key.json

# Set env var nel docker-compose.yml:
environment:
  - FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-key.json
```

**Opzione B: usando env var (consigliato)**
```bash
# Converti JSON a base64
cat serviceAccountKey.json | base64 -w0
# (su Windows PowerShell: [Convert]::ToBase64String([IO.File]::ReadAllBytes('serviceAccountKey.json')))

# Set in docker-compose.yml:
environment:
  - FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### 4. Riavvia Backend
```bash
docker-compose restart backend
```

### 5. Testa Push
```bash
# Esegui test integration con push
node backend/scripts/test_push_and_batching.js

# Logs dovrebbe mostrare: "Push sent, result: <message_id>"
# o "FCM not configured; skipping push" se credenziali assenti
```

## Risultato Atteso
- ✅ Order created
- ✅ 8 location updates (batching in action)
- ✅ Track history compressed (3 print ratios)
- ✅ Push notification attempts logged
- ✅ WebSocket events arriving

## Se Niente Funziona
- Verifica che il file JSON è valido: `jq . firebase-key.json`
- Controlla log del container: `docker-compose logs backend | tail -100`
- Assicurati che la tabella `users` ha colonna `push_token` (auto-migrata)

## Prossimi Passi
1. Setup push token registration nel mobile app (già in `App.js` con expo-notifications)
2. Integrare Firebase nelle pagine web (opzionale, richiede Service Worker)
3. Monitorare push delivery in Firebase Console

📚 Vedi `FIREBASE_SETUP.md` per guida completa.
