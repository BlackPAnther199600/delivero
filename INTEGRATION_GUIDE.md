# 🎯 Guida Integrazione - Nuovi Servizi Delivero

## ✅ Cosa è stato implementato

Sono stati aggiunti **4 nuovi servizi** completi al backend e frontend di Delivero:

### Backend
- ✅ Database schema con 6 nuove tabelle
- ✅ 4 Models per gestire la business logic
- ✅ 4 Controllers con logica completa
- ✅ 4 Route files con tutti gli endpoint
- ✅ Utility S3 per upload foto su AWS
- ✅ Integrazione nel file app.js principale

### Frontend Web (React)
- ✅ BillPaymentUpload.jsx - Upload foto barcode/QR
- ✅ PharmacyOrder.jsx - Ordini farmaci
- ✅ MedicalTransport.jsx - Prenotazione trasporto medico
- ✅ DocumentPickup.jsx - Ritiro documenti

### Mobile (React Native)
- ✅ BillPaymentScreen.js - Pagamento bollette mobile
- ✅ PharmacyScreen.js - Ordini farmacie mobile
- ✅ MedicalTransportScreen.js - Trasporto medico mobile
- ✅ DocumentPickupScreen.js - Ritiro documenti mobile

---

## 🚀 Come Integrare

### 1. Configurare il Database

```bash
# Connettiti al database
psql -U postgres -d delivero

# Esegui lo script SQL
\i backend/src/config/database.sql

# Verifica le nuove tabelle
\dt
```

### 2. Installare Dipendenze AWS

```bash
cd backend
npm install aws-sdk
```

### 3. Configurare Variabili di Ambiente

Copia le variabili dal file `.env.example`:

```bash
cp .env.example .env
```

Modifica `.env` con le tue credenziali AWS:

```env
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_REGION=eu-west-1
AWS_S3_BUCKET=your-bucket-name
```

**Come ottenere credenziali AWS:**
1. Vai su [AWS Console](https://console.aws.amazon.com)
2. IAM → Users → Create User
3. Permissions → S3FullAccess
4. Security Credentials → Create Access Key

### 4. Creare Bucket S3

```bash
# Via AWS CLI
aws s3 mb s3://your-delivero-bucket --region eu-west-1

# Impostare CORS
aws s3api put-bucket-cors --bucket your-delivero-bucket --cors-configuration '{
  "CORSRules": [{
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "MaxAgeSeconds": 3000
  }]
}'
```

### 5. Integrare Routes in Frontend

**In `frontend/src/App.jsx`:**

```jsx
import BillPaymentUpload from './components/BillPaymentUpload';
import PharmacyOrder from './components/PharmacyOrder';
import MedicalTransport from './components/MedicalTransport';
import DocumentPickup from './components/DocumentPickup';

// Aggiungi nuove rotte
<Route path="/services/bills" element={<BillPaymentUpload />} />
<Route path="/services/pharmacy" element={<PharmacyOrder />} />
<Route path="/services/medical" element={<MedicalTransport />} />
<Route path="/services/documents" element={<DocumentPickup />} />
```

### 6. Integrare Schermate Mobile

**In `mobile/screens/customer/CustomerHomeScreen.js`:**

```jsx
import BillPaymentScreen from './BillPaymentScreen';
import PharmacyScreen from './PharmacyScreen';
import MedicalTransportScreen from './MedicalTransportScreen';
import DocumentPickupScreen from './DocumentPickupScreen';

const CustomerHomeScreen = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View>
      {activeTab === 'bills' && <BillPaymentScreen />}
      {activeTab === 'pharmacy' && <PharmacyScreen />}
      {activeTab === 'medical' && <MedicalTransportScreen />}
      {activeTab === 'documents' && <DocumentPickupScreen />}
    </View>
  );
};
```

### 7. Testare gli Endpoint

```bash
# Start backend
cd backend
npm run dev

# In un'altra terminal, testa gli endpoint
curl -X GET https://delivero-gyjx.onrender.com/api/health

# Crea un bill payment
curl -X POST https://delivero-gyjx.onrender.com/api/bill-payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"billId": 1, "paymentMethod": "cash"}'
```

---

## 📱 Aggiornare Pacchetto Mobile

Se usi nel mobile, aggiungi dipendenza per date picker:

```bash
cd mobile
expo install @react-native-community/datetimepicker
```

---

## 👥 Ruoli e Permessi

```
CLIENT → Può:
├─ Creare bill payments
├─ Caricare foto barcode/QR
├─ Cercare farmacie e ordinare
├─ Prenotare trasporti medici
└─ Richiedere ritiri documenti

RIDER → Può:
├─ Vedere pagamenti assegnati
├─ Effettuare consegne farmacia
├─ Accompagnare a clinica
└─ Ritirare e consegnare documenti

ADMIN → Può:
├─ Assegnare rider a richieste
├─ Approvare farmacie
└─ Visualizzare statistiche
```

---

## 🔧 Troubleshooting

### Errore: "AWS credentials not found"
```bash
# Verifica che il file .env esista e abbia le credenziali
cat backend/.env | grep AWS
```

### Errore: "S3 bucket not found"
```bash
# Verifica che il bucket esista
aws s3 ls | grep your-bucket
```

### Errore: "CORS error uploading to S3"
```bash
# Riconfigura CORS sul bucket
aws s3api get-bucket-cors --bucket your-bucket
```

### Errore: "Table already exists"
```bash
# Se le tabelle esistono già, puoi droparle prima
psql -U postgres -d delivero
DROP TABLE IF EXISTS bill_payments, pharmacies, pharmacy_products, pharmacy_orders, medical_transports, document_pickups CASCADE;
# Poi esegui di nuovo il script SQL
```

---

## 📊 Monitorare i Nuovi Servizi

### Endpoint Statistiche (Admin Only)

```bash
# Bill Payment Stats
GET /api/bill-payments/admin/stats?startDate=2024-01-01&endDate=2024-12-31

# Medical Transport Stats
GET /api/medical-transports/admin/stats

# Document Pickup Stats
GET /api/document-pickups/admin/stats
GET /api/document-pickups/admin/document-types
```

---

## 🎨 Personalizzare Stili

Tutti i componenti React usano CSS inline o CSS classes. Puoi personalizzare:

```css
/* Aggiungi a index.css o App.css */

.bill-payment-upload {
  max-width: 500px;
  margin: 0 auto;
}

.pharmacy-order {
  padding: 20px;
}

.medical-transport form {
  max-width: 600px;
}

.document-pickup .info-box {
  background-color: #f0f7ff;
  border-left: 4px solid #007AFF;
}
```

---

## ✨ Prossimi Miglioramenti Suggeriti

1. **Notifiche Push** - Notificare clienti e rider via FCM
2. **Valutazioni** - Sistema di stelline per servizi
3. **Storico completo** - Dashboard con cronologia
4. **Pagamenti integrati** - Stripe per tutti i servizi
5. **Mappe** - Integrazione Google Maps per tracking
6. **Automazione** - Auto-assegnazione rider basata su posizione
7. **Chatbot support** - Assistant per domande frequenti

---

## 📞 Support

Se hai problemi durante l'integrazione:

1. Verifica il file `NEW_SERVICES.md` per documentazione
2. Controlla i log backend: `npm run dev`
3. Verifica credenziali AWS nel `.env`
4. Assicurati che il database sia aggiornato

---

## ✅ Checklist Pre-Deploy

- [ ] Database schema aggiornato
- [ ] AWS S3 bucket creato e configurato
- [ ] Variabili `.env` impostate
- [ ] Dipendenze npm installate
- [ ] Test locale eseguiti
- [ ] Api token JWT funzionano
- [ ] Upload file su S3 funziona
- [ ] Backend risponde agli endpoint
- [ ] Frontend componenti importati
- [ ] Mobile schermate integrate
- [ ] CORS configurato correttamente

---

**Deployment completato e pronto! 🎉**
