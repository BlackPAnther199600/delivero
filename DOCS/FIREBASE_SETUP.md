# Firebase Cloud Messaging (FCM) Setup Guide - Delivero

## Step 1: Crea un Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca "Create Project"
3. Nome: `delivero-prod` (o come preferisci)
4. Abilita Google Analytics (opzionale)
5. Crea il progetto

## Step 2: Configura il Service Account

1. Nel progetto Firebase, vai a **Project Settings** (⚙️ → Project Settings)
2. Vai al tab **Service Accounts**
3. Clicca "Generate New Private Key"
4. Scarica il file JSON (es: `serviceAccountKey.json`)
5. Salva il file in un posto sicuro (es: `backend/.env.firebase.json` o usa env vars)

## Step 3: Backend - Configura Firebase Admin SDK

### Opzione A: File Path (Docker)

Se usi Docker, copia il file JSON nel container:

```dockerfile
# In backend/Dockerfile
COPY serviceAccountKey.json /app/serviceAccountKey.json
```

Poi imposta env var:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/app/serviceAccountKey.json
```

### Opzione B: Env Variable (Consigliato per sicurezza)

1. Leggi il contenuto del JSON:
   ```bash
   cat serviceAccountKey.json | base64 -w0
   ```
   (su Windows PowerShell: `[Convert]::ToBase64String([System.IO.File]::ReadAllBytes('serviceAccountKey.json'))`)

2. Imposta come env var nel container:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

## Step 4: Abilita FCM nel Progetto Firebase

1. In Firebase Console, vai a **Cloud Messaging**
2. Se non è ancora abilitato, abilita l'API
3. Copia il **Service Account JSON** (già scaricato in Step 2)

## Step 5: Configura Web & Mobile

### Web (React)

Il frontend web al momento invia token ma non registra automaticamente push (richiede Service Worker).

Opzioni:
- **A) Usare Firebase SDK nel frontend**: aggiungi `firebase` e `firebase-messaging` al frontend
- **B) Usare OneSignal**: più semplice ma terzo party

Per ora, il backend salterà se FCM non configurato.

### Mobile (React Native/Expo)

Il mobile già registra token via `expo-notifications`:
- L'app chiede permessi push all'avvio
- Se concesso, registra il token Expo
- Invia il token a `/api/auth/push-token`
- Il backend può inviare a Expo Projects Direct (Expo è il provider per ACL)

**Nota**: Expo gestisce il delivery verso iOS/Android. Se vuoi Firebase diretto da Expo, vedi [Expo + Firebase docs](https://docs.expo.dev/guides/using-fcm/).

## Step 6: Testa il Sistema

### Test 1: Verifica Push Token Salvato

```bash
# Login e chiedi il profilo
curl -X GET https://delivero-gyjx.onrender.com/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Verifica che users.push_token sia popolato
```

### Test 2: Simula Trigger Radius < 500m

Lo script di integrazione test trigger `riderNearby` quando ETA <= 5 min:

```bash
node backend/scripts/integration_test.js
```

Cercare nel log:
```
FCM not configured; skipping push
```

oppure (se configurato):
```
Push sent, result: <message id>
```

### Test 3: Push Reale (una volta configurato Firebase)

```bash
# Crea ordine, fai accept, invia location con ETA basso
# Dovrebbe ricevere notifica su mobile/web
```

## Step 7: Monitoraggio

In Firebase Console → Cloud Messaging Dashboard:
- Vedi numero di messaggi inviati
- Vedi delivery rate
- Debug dei fallimenti

## Troubleshooting

### "FCM not configured"
- Env var `FIREBASE_SERVICE_ACCOUNT_PATH` o `FIREBASE_SERVICE_ACCOUNT_JSON` non impostato
- Riavvia backend con la var corretta

### Token non arriva al backend
- **Mobile**: controlla `mobile/App.js` - permessi push
- **Web**: il token non viene registrato automaticamente (require manual Firebase SDK setup)

### Notifiche non arrivano su dispositivo
- Verifica che il `push_token` nel DB sia valido
- Mobile: check Expo status (https://status.expo.io)
- Web: setup Firebase Service Worker (vedi sezione bonus)

## Bonus A: WebSocket Local Notifications (Fallback)

Se FCM non è disponibile, il frontend riceve comunque evento `riderNearby` via WebSocket e mostra notifica locale:

```javascript
socket.on('riderNearby', (data) => {
  // Desktop Web Notification
  if (Notification.permission === 'granted') {
    new Notification('Il rider è vicino!', { body: `ETA: ${data.eta_minutes} min` });
  }
  // Mobile toast via react-native-toast-message
});
```

Già implementato nel backend (emette sempre il WebSocket anche se FCM fallisce).

## Bonus B: Firebase Web Setup (Opzionale)

Se vuoi push anche nel web browser:

1. Aggiungi Firebase al frontend:
```bash
npm install firebase @react-native-firebase/messaging
```

2. Integra Service Worker in `frontend/public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/9/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9/firebase-messaging-compat.js');
firebase.initializeApp({ ... });
const messaging = firebase.messaging();
```

3. Registra token al login:
```javascript
const token = await messaging.getToken();
await userAPI.setPushToken(token);
```

(Questo aggiunterebbe payload significativo al frontend; consiglio OneSignal per web + mobile unified)

## Bonus C: Performance Tuning

Geografia di rider → customer distanza Haversine già implementata in `backend/src/controllers/ordersController.js`.

Location update batching: scrivi su DB ogni 30sec invece che per ogni update.

Vedi `backend/scripts/optimize_tracking.md` per dettagli.

---

**Riassunto finale**: Ottieni il service account JSON, imposta env var, testa con `integration_test.js`, monitora in Firebase Console. ✅
