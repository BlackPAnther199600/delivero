# 🚀 Nuovi Servizi Delivero

## Panoramica

Questa documentazione descrive i 4 nuovi servizi aggiunti a Delivero:

1. **Bill Payment Service** - Pagamento bollette
2. **Pharmacy Service** - Ordini farmaci
3. **Medical Transport** - Trasporto sanitario
4. **Document Pickup** - Ritiro documenti

---

## 1️⃣ Bill Payment Service (Pagamento Bollette)

### Descrizione
Consente ai clienti di chiedere al rider di pagare le loro bollette al posto loro. Supporta due modalità:
- **Contanti**: Il rider paga in contanti e raccoglie i soldi dal cliente
- **Pre-pagamento**: Il cliente paga in anticipo via app

### Flusso Utente:
1. Cliente carica la foto del barcode/QR code della bolletta
2. Sistema assegna il pagamento a un rider
3. Rider ritira i soldi o stampa il codice per pagare
4. Rider conferma il pagamento avvenuto
5. Cliente riceve notifica di completamento

### Endpoint API:

```
POST /api/bill-payments
├─ Crea richiesta pagamento bolletta
└─ body: { billId, paymentMethod: 'cash'|'prepaid' }

POST /api/bill-payments/:billPaymentId/upload-images
├─ Upload foto barcode e QR code
└─ files: { barcode, qrCode }

GET /api/bill-payments/user/payments
├─ Recupera pagamenti dell'utente
└─ auth required

GET /api/bill-payments/rider/pending
├─ Recupera pagamenti assegnati al rider
└─ auth required

PATCH /api/bill-payments/:billPaymentId/status
├─ Aggiorna stato pagamento
└─ body: { status, riderPaymentStatus }
```

### Componente Frontend:
```
<BillPaymentUpload billId={id} onSuccess={handleSuccess} />
```

---

## 2️⃣ Pharmacy Service (Farmacie)

### Descrizione
Integrazione con farmacie affiliate per ordini di farmaci. Supporta:
- Vendita libera (niente ricette richieste)
- Ricerca farmacie per posizione
- Gestione magazzino farmacia
- Ordini con consegna via rider

### Flusso Utente:
1. Cliente cerca farmacie disponibili
2. Seleziona farmacia e visualizza prodotti
3. Aggiunge prodotti al carrello
4. Procede al checkout
5. Rider effettua consegna

### Flusso Farmacia:
1. Farmacia si registra nell'app
2. Admin approva la registrazione
3. Farmacia aggiunge prodotti
4. Riceve ordini dai clienti
5. Ordini vanno al rider per consegna

### Endpoint API:

```
POST /api/pharmacies/register
├─ Registrazione farmacia
└─ body: { email, password, name, address, ... }

GET /api/pharmacies
├─ Elenco farmacie disponibili
└─ query: { lat, lon, radius }

GET /api/pharmacies/:pharmacyId/products
├─ Prodotti di una farmacia
└─ no auth required

POST /api/pharmacies/:pharmacyId/products
├─ Aggiungi prodotto (farmacia admin)
└─ auth required, files: { image }

POST /api/pharmacies/orders/create
├─ Crea ordine farmaci
└─ body: { pharmacyId, items, deliveryAddress, lat, lon }

GET /api/pharmacies/orders/user/list
├─ Ottieni ordini dell'utente
└─ auth required

PATCH /api/pharmacies/orders/:orderId/status
├─ Aggiorna stato ordine
└─ body: { status, notes }
```

### Componente Frontend:
```
<PharmacyOrder />
```

---

## 3️⃣ Medical Transport (Trasporto Sanitario)

### Descrizione
Servizio di accompagnamento dai medici. Include:
- Prenotazione appuntamenti
- Ritorno da clinica opzionale
- Tracking in tempo reale
- Stima costi

### Flusso Utente:
1. Cliente inserisce dettagli medico e clinica
2. Sceglie data e ora appuntamento
3. Seleziona se desidera ritorno
4. Specifica esigenze speciali (mobilità, accompagnatore)
5. Rider effettua il ritiro e accompagnamento

### Endpoint API:

```
POST /api/medical-transports
├─ Crea richiesta trasporto medico
└─ body: { doctorName, clinicName, appointmentDate, appointmentTime, ... }

GET /api/medical-transports/user/list
├─ Recupera trasporti dell'utente
└─ auth required

GET /api/medical-transports/rider/pending
├─ Recupera trasporti assegnati al rider
└─ auth required

GET /api/medical-transports/appointments/upcoming
├─ Ottieni appuntamenti prossimi
└─ no auth required

PATCH /api/medical-transports/:transportId/status
├─ Aggiorna stato trasporto
└─ body: { status }
│  statuses: pending, confirmed, pickup_done, at_clinic, return_in_progress, completed

PATCH /api/medical-transports/:transportId/cost
├─ Aggiorna costo stimato/effettivo
└─ body: { estimatedCost, actualCost }
```

### Componente Frontend:
```
<MedicalTransport />
```

---

## 4️⃣ Document Pickup (Ritiro Documenti)

### Descrizione
Servizio di ritiro e consegna documenti. Include:
- Tracciamento con numero tracking
- Firma opzionale alla consegna
- Vari tipi di documenti
- Stima costi

### Flusso Utente:
1. Cliente specifica tipo documento
2. Indica luogo ritiro e consegna
3. Aggiunge descrizione
4. Sceglie se richiede firma
5. Rider ritira e consegna documenti
6. Cliente può tracciare con numero tracking

### Endpoint API:

```
POST /api/document-pickups
├─ Crea richiesta ritiro
└─ body: { documentType, pickupLocation, deliveryAddress, description, ... }

GET /api/document-pickups/user/list
├─ Recupera ritiri dell'utente
└─ auth required

GET /api/document-pickups/rider/pending
├─ Recupera ritiri assegnati al rider
└─ auth required

GET /api/document-pickups/track/:trackingNumber
├─ Traccia ritiro (pubblico)
└─ no auth required, params: { trackingNumber }

PATCH /api/document-pickups/:pickupId/status
├─ Aggiorna stato ritiro
└─ body: { status }
│  statuses: pending, confirmed, picked_up, delivered

GET /api/document-pickups/admin/stats
├─ Statistiche (admin)
└─ auth required

GET /api/document-pickups/admin/document-types
├─ Statistiche per tipo documento (admin)
└─ auth required
```

### Componente Frontend:
```
<DocumentPickup />
```

---

## 📋 Variabili di Ambiente (.env)

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-west-1
AWS_S3_BUCKET=your-bucket

# Payment Methods
PAYMENT_METHOD_CASH_ENABLED=true
PAYMENT_METHOD_PREPAID_ENABLED=true

# Pharmacy
PHARMACY_VERIFICATION_REQUIRED=true
PHARMACY_RADIUS_DEFAULT_KM=5

# Medical Transport
DEFAULT_MEDICAL_TRANSPORT_COST_PER_KM=2.50

# Document Pickup
DEFAULT_DOCUMENT_PICKUP_COST=5.00
SIGNATURE_VERIFICATION_ENABLED=true
```

---

## 🗄️ Struttura Database

### Tabelle Nuove:

1. **bill_payments**
   - id, bill_id, user_id, rider_id
   - payment_method, amount, status
   - barcode_image_url, qr_code_image_url

2. **pharmacies**
   - id, email, password, name, phone
   - address, city, postal_code, license_number
   - lat, lon, is_verified, rating

3. **pharmacy_products**
   - id, pharmacy_id, name, price, stock_quantity
   - category, image_url, active

4. **pharmacy_orders**
   - id, user_id, pharmacy_id, rider_id
   - items (JSONB), total_amount, status

5. **medical_transports**
   - id, user_id, rider_id
   - doctor_name, clinic_name, clinic_address
   - appointment_date, appointment_time
   - status, estimated_cost, actual_cost

6. **document_pickups**
   - id, user_id, rider_id
   - document_type, pickup_location, delivery_address
   - tracking_number, signature_required, status

---

## 🔐 Permessi e Autorizzazioni

### Cliente:
- ✅ Creare bill payments
- ✅ Caricare foto barcode/QR
- ✅ Cercare farmacie
- ✅ Creare ordini farmaci
- ✅ Prenotare trasporto medico
- ✅ Richiedere ritiro documenti

### Rider:
- ✅ Vedere pagamenti assegnati
- ✅ Confermare ricezione pagamenti
- ✅ Effettuare consegne farmacie
- ✅ Accompagnare a clinica
- ✅ Ritirare e consegnare documenti

### Admin:
- ✅ Approvare farmacie
- ✅ Assegnare rider a richieste
- ✅ Visualizzare statistiche
- ✅ Gestire tutti i servizi

---

## 📱 Integrazione Mobile

I componenti React possono essere usati nel frontend mobile (React Native Expo). Esempio:

```javascript
// mobile/screens/customer/PharmacyScreen.js
import PharmacyOrder from '../../components/PharmacyOrder';

export default function PharmacyScreen() {
  return <PharmacyOrder />;
}
```

---

## 🚀 Deployment

1. **Aggiornare database**:
   ```bash
   psql -U postgres -d delivero -f backend/src/config/database.sql
   ```

2. **Installare dipendenze**:
   ```bash
   npm install
   ```

3. **Configurare AWS S3**:
   - Creare bucket S3
   - Impostare credenziali in .env

4. **Verificare routes**:
   ```bash
   npm run start:dev
   ```

---

## 📞 Support

Per domande sui nuovi servizi, consultare la documentazione API dettagliata nei controller.
