# 🐛 Debug Login Problem

## Cosa Fare Adesso:

### 1️⃣ Apri http://localhost:19006 nel browser

### 2️⃣ Premi F12 per aprire Developer Console

### 3️⃣ Vai al tab "Network"

### 4️⃣ Inserisci credenziali:
- Email: `customer@example.com`
- Password: `password123`

### 5️⃣ Clicca il pulsante di login

### 6️⃣ Guarda cosa succede:

**Nella tab Network:**
- Dovresti vedere un request POST a `/api/auth/login`
- Questo request dovrebbe avere Status Code `200` (success)
- La risposta dovrebbe contenere il `token` JWT

**Se Status è 200 ma non vai avanti:**
- Vai tab "Console"
- Copia tutto quello che vedi in rosso (errors)
- Mandami la foto/testo

**Se Status è 401/404/500:**
- Proprio l'API che non risponde bene
- Mandami il error message che appare

---

## Alternative: Test via Web Browser Console

### Apri Console (F12) e copia-incolla:

```javascript
// Test di login direttamente
fetch('https://delivero-gyjx.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'customer@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(e => console.error('Error:', e))
```

**Dovresti vedere il token JWT nella console**

---

## Soluzione Rapida: Pulisci e Riprova

Nel browser:
1. Apri Developer Console (F12)
2. Vai tab "Application"
3. Clicca "Local Storage"
4. Seleziona localhost:19006
5. Clicca "Clear All"
6. Aggiorna pagina F5
7. Prova login di nuovo

---

## Comuni Errori:

### ❌ "Cannot reach server"
```
Soluzione: 
docker-compose status backend
Assicurati che backend è UP
```

### ❌ "Email or password incorrect"
```
Soluzione:
- Prova con: customer@example.com / password123
- ESATTO: email piccolo, niente spazi
```

### ❌ "Network error"
```
Soluzione:
- Refresh il browser (F5)
- Riavvia Expo: premi r in terminale
```

### ❌ "AsyncStorage undefined"
```
Soluzione:
- Questo è OK su web (usa localStorage)
- Refresh pagina e riprova
```

---

## Test Token Manuale

Se il login API funziona, prova a salvare il token manualmente.

Nel browser Console esegui:
```javascript
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiY3VzdG9tZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NzEwMjQwNTgsImV4cCI6MTc3MTYyODg1OH0.1exneOwgMb-J3cuCxY324HHlYhncXN2WY14e0JFdhGM');
localStorage.setItem('user', JSON.stringify({id:3, email:'customer@example.com', name:'John Customer', role:'customer'}));
location.reload();
```

Se questo funziona, allora il login salva i dati correttamente.

---

**Mandami uno screenshot della console con gli errori specifici.**
