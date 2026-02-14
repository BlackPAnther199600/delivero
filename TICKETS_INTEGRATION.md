# 🎯 Sistema di Ticket/Segnalazioni - Guida Integrazione

## Panoramica

Il sistema di ticket/segnalazioni consente ai clienti e ai rider di segnalare problemi, reclami, richieste di funzioni e richiedere supporto. Gli admin possono gestire, commentare e aggiornare lo stato dei ticket.

## 📊 Architettura

### Database
- Tabelle: `tickets`, `ticket_comments`
- Relazioni: Ogni ticket appartiene a un utente, può avere più commenti

### API Endpoints

#### Per Clienti/Rider
- `POST /api/tickets` - Creare nuovo ticket
- `GET /api/tickets/my-tickets` - Visualizzare propri ticket
- `GET /api/tickets/:id` - Dettagli ticket con commenti
- `POST /api/tickets/:id/comments` - Aggiungere commento
- `GET /api/tickets/:id/comments` - Visualizzare commenti

#### Per Admin
- `GET /api/tickets/admin/all` - Lista tutti i ticket con filtri (status, type, priority)
- `GET /api/tickets/admin/stats` - Statistiche dashboard
- `PATCH /api/tickets/:id/status` - Aggiornare stato + note admin
- `PATCH /api/tickets/:id/priority` - Aggiornare priorità
- `DELETE /api/tickets/:id` - Cancellare ticket
- `GET /api/tickets/search/:term` - Ricerca ticket

### Controller Functions (Backend)

Tutti i metodi sono in `backend/src/controllers/ticketsController.js`:

```javascript
// Creazione
createTicket(userId, type, title, description, attachmentUrls)

// Lettura
getAllTickets(filters) // Admin
getUserTickets(userId)
getTicketById(ticketId) // Include commenti
getTicketStats()
searchTickets(searchTerm)

// Aggiornamento
updateTicketStatus(ticketId, status, adminNotes)
updateTicketPriority(ticketId, priority)
addTicketComment(ticketId, userId, comment)
getTicketComments(ticketId)

// Cancellazione
deleteTicket(ticketId) // Admin
```

## 🖥️ Component Web (React)

### TicketForm.jsx
Componente per creare nuovi ticket
- Seleziona tipo (bug, complaint, feature_request, support)
- Inserisci titolo e descrizione
- Allega immagini (opzionale)
- Submit crea ticket in database

### TicketsList.jsx
Visualizza ticket dell'utente corrente
- Lista con filtro per stato
- Click per vedere dettagli
- Visualizzazione commenti
- Possibilità di aggiungere commenti

### AdminTickets.jsx (AdminDashboard.jsx)
Dashboard admin per gestione ticket
- Statistiche (totale, aperto, in corso, risolto, chiuso, critico)
- Filtri per tipo e stato
- Tabella con ID, tipo, titolo, utente, stato, priorità, data
- Dettagli ticket con:
  - Meta info (utente, tipo, priorità, data)
  - Note admin
  - Descrizione
  - Commenti
  - Form per aggiornare stato e aggiungere note
  - Sezione commenti con input

## 📱 Component Mobile (React Native)

### TicketFormScreen.js
Schermata per creare ticket su mobile
- Picker per tipo di segnalazione
- TextInput per titolo e descrizione
- Button per inviare
- Feedback con Alert

### MyTicketsScreen.js
Visualizza ticket dell'utente mobile
- FlatList di ticket propri
- Dettagli con nota admin
- Commenti e input per nuovo commento
- Back button per tornare alla lista

### AdminTicketsScreen.js
Dashboard admin su mobile
- Statistiche compatte
- Picker per filtri
- Lista ticket con icon e badge stato
- Dettagli con update form
- Stato, note, commenti

## 🔐 Autorizzazione

- **Customer/Rider**: Può creare ticket, visualizzare propri, aggiungere commenti
- **Admin**: Accesso a tutti i ticket, statistiche, aggiornamento stato, gestione

Middleware `authenticateToken` verifica JWT token.

## 📋 Tipi di Ticket

- `bug` - 🐛 Errore tecnico/bug dell'app
- `complaint` - 😞 Reclamo su servizio
- `feature_request` - 💡 Richiesta di nuova funzione
- `support` - 🆘 Richiesta generica di supporto

## 🎯 Priorità

- `critical` - 🔴 Critico
- `high` - 🟠 Alto
- `medium` - 🟡 Medio (default)
- `low` - 🟢 Basso

## 📊 Stati Ticket

- `open` - 🔴 Appena creato, non assegnato
- `in_progress` - 🔵 Admin sta lavorandoci
- `resolved` - 🟢 Risolto, in attesa conferma utente
- `closed` - ⚫ Chiuso definitivamente

## 🚀 Utilizzo

### Per Customer/Rider

1. **Creare Ticket**
   ```javascript
   // Frontend - TicketForm component
   POST /api/tickets
   {
     type: 'complaint',
     title: 'Il rider non è venuto',
     description: 'Dettagli del problema...',
     attachmentUrls: ['url_immagine']
   }
   ```

2. **Visualizzare Ticket Propri**
   ```javascript
   // Componente TicketsList carica i ticket
   GET /api/tickets/my-tickets
   ```

3. **Aggiungere Commento**
   ```javascript
   POST /api/tickets/:id/comments
   { comment: 'Mio commento...' }
   ```

### Per Admin

1. **Dashboard Statistiche**
   ```javascript
   GET /api/tickets/admin/stats
   // Returns:
   {
     total: 42,
     open: 15,
     in_progress: 10,
     resolved: 12,
     closed: 5,
     critical_count: 2,
     bug_count: 8,
     complaint_count: 20,
     feature_count: 10,
     support_count: 4
   }
   ```

2. **Lista Tutti i Ticket**
   ```javascript
   GET /api/tickets/admin/all?status=open&type=complaint&priority=high
   ```

3. **Aggiornare Stato**
   ```javascript
   PATCH /api/tickets/:id/status
   {
     status: 'in_progress',
     adminNotes: 'Stiamo indagando su questo...'
   }
   ```

## 🗄️ Database Schema

### Tabella `tickets`
```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'bug', 'complaint', 'feature_request', 'support'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_urls JSONB,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabella `ticket_comments`
```sql
CREATE TABLE ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Flusso Completo

1. **Customer segnala problema** → Crea ticket tramite TicketForm
2. **Admin riceve notifica** → Dashboard mostra nuovo ticket
3. **Admin assegna priorità** → Aggiorna status a "in_progress"
4. **Admin aggiunge nota** → Spiega cosa sta facendo
5. **Admin commenta** → Comunica con il customer
6. **Customer risponde** → Aggiunge commento
7. **Admin risolve** → Cambia status a "resolved"
8. **Customer conferma** → Chiude ticket (status "closed")

## 📡 Integrazione Frontend

### Aggiungere TicketForm alla Dashboard
```jsx
import TicketForm from './components/TicketForm';

<TicketForm onTicketCreated={handleTicketCreated} />
```

### Aggiungere TicketsList alla Dashboard
```jsx
import TicketsList from './components/TicketsList';

<TicketsList />
```

### Aggiungere AdminTickets al Dashboard Admin
```jsx
import AdminTickets from './pages/AdminTickets';

// In AdminDashboard tab system
<Tabs>
  <Tab name="Ticket" component={AdminTickets} />
</Tabs>
```

## 📱 Integrazione Mobile

### Navigation Setup
```javascript
// Stack di customer
navigation.addListener('tabPress', () => {
  navigation.navigate('TicketForm');
});

// Stack di admin
navigation.navigate('AdminTickets');
```

### Importare Screens
```javascript
import TicketFormScreen from './screens/customer/TicketFormScreen';
import MyTicketsScreen from './screens/customer/MyTicketsScreen';
import AdminTicketsScreen from './screens/admin/AdminTicketsScreen';
```

## 🐛 Troubleshooting

### Ticket non appare in lista
- Verifica JWT token in localStorage
- Controlla Authorization header
- Verifica user_id nel token corrisponde a quello nel ticket

### Commenti non si caricano
- Assicurati che ticket.comments sia un array
- Ricarica ticket dopo aggiunta commento
- Verifica permessi utente

### Admin non vede dati statistici
- Controlla role nel JWT token sia 'admin'
- Verifica /api/tickets/admin/stats non ritorni errore 403

## 📝 Note Implementazione

- Tutti i timestamp in CURRENT_TIMESTAMP (server time)
- Attachment URLs salvate come JSONB array
- Commenti cascata delete se ticket cancellato
- Admin_notes nullable, update solo da admin
- Priority default 'medium', aggiornabile later
- Status edit only from admin, visible by creator

---

Sistema completemente integrato e testabile! 🚀
