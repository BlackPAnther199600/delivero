Configurazioni richieste

- BACKEND (env - file .env nella cartella backend o docker env):
  - PORT=5000
  - DATABASE_URL=postgres://user:pass@db:5432/delivero
  - FRONTEND_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:19007,http://localhost:5173
  - FRONTEND_URL (opzionale) - singolo URL per socket

- FRONTEND (.env nella cartella frontend):
  - REACT_APP_API_URL=https://delivero-gyjx.onrender.com/api
  - REACT_APP_WS_URL=http://localhost:5000

- MOBILE (Expo) (.env o config):
  - API_URL=https://delivero-gyjx.onrender.com/api
  - WS_URL=http://localhost:5000

Cose da fare per abilitare push reali (opzionale):
- Registrare token FCM/APNs nel profilo utente e memorizzarli nella tabella `users` (campo push_token)
- Aggiungere credenziali FCM (server key) come env var: FCM_SERVER_KEY
- Integrare libreria server-side (firebase-admin) e inviare notifiche quando `riderNearby` viene rilevato

Come testare tutte le API e il flusso (automazione inclusa)

1) Creare tabella per tracking (già incluso nello script):

```bash
node backend/scripts/create_tracking_table.js
```

2) Creare utenti di test (se non esistono):

```bash
node backend/create-test-users.js
```

3) Eseguire test di integrazione automatico (verifica login, create order, accept, location updates, sockets, storico):

```bash
node backend/scripts/integration_test.js
```

Questo script effettua:
- Login customer/rider/manager
- Connessione socket di customer/manager/rider
- Creazione ordine
- Rider accetta ordine
- Rider invia 3 aggiornamenti di posizione
- Verifica ricezione eventi socket da parte di customer e manager
- Recupera storico tracciamento via `/api/orders/:id/track-history`

4) Chiamate API manuali (curl esempi):

```bash
# Login
curl -X POST https://delivero-gyjx.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"customer@example.com","password":"password123"}'

# Create order (customer)
curl -X POST https://delivero-gyjx.onrender.com/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"items":[{"category":"food","description":"pizza"}],"totalAmount":10.5,"deliveryAddress":"Via Roma 1"}'

# Get active orders (manager)
curl -X GET https://delivero-gyjx.onrender.com/api/orders/active/all -H "Authorization: Bearer <MANAGER_TOKEN>"

# Update rider location
curl -X POST https://delivero-gyjx.onrender.com/api/orders/<ORDER_ID>/location -H "Content-Type: application/json" -H "Authorization: Bearer <RIDER_TOKEN>" -d '{"latitude":45.0,"longitude":9.0,"eta_minutes":5}'

# Get track history
curl -X GET https://delivero-gyjx.onrender.com/api/orders/<ORDER_ID>/track-history -H "Authorization: Bearer <TOKEN>"
```

Note rapide
- Il sistema ora emette eventi WebSocket: `trackingUpdate`, `riderNearby`, `activeOrderUpdate`, `orderStatusUpdate`.
- Per ricevere notifiche in frontend/mobile: stabilire connessione socket e fare `socket.emit('joinUserRoom', userId)` per il customer o `socket.emit('joinManagerRoom')` per i manager.

Suggerimenti implementati
- WebSocket per aggiornamenti live (server e test client)
- Notifiche "riderNearby" via WebSocket basate su ETA
- Storico tracking memorizzato in `order_tracks` e accessibile via `/orders/:id/track-history`

Prossimi miglioramenti consigliati (opzionali)
- Salvare lat/lng del punto di consegna per calcolo distanza reale
- Integrazione FCM/APNs per notifiche push reali
- UI: visualizzare polilinee con storico tracciamento nelle view web/mobile
- Ottimizzazione: limitare frequenza di scrittura su DB per tracking (bulk/write every N seconds)

Push token registration (mobile web)

- Mobile (Expo): il codice `mobile/App.js` prova a registrare il token push usando `expo-notifications` e invia il token a `/api/auth/push-token`;
- Web: per ricevere push via FCM è necessario integrare Firebase nel frontend (service worker + firebase-messaging). Ho aggiunto un endpoint per salvare il `push_token` lato server, ma il frontend web non esegue la registrazione automatica (richiede configurazione FCM). 

Endpoint utente per push

- PUT /api/auth/push-token  (body: { push_token: '...' })  // richiede autenticazione

Test push (simulazione)

- Se non hai il service account Firebase, il server salterà l'invio reale ma emetterà comunque l'evento WebSocket `riderNearby` che il client può usare per mostrare notifiche locali.
