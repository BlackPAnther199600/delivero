# 🚀 Delivero - Multi-Service Delivery Platform

**Delivero** is a comprehensive delivery and service management platform supporting restaurants, pharmacies, medical transport, bill payments, and document pickups—all with real-time tracking, admin control, and mobile-native apps.

[![status](https://img.shields.io/badge/status-active-success)](#)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](#)
[![React](https://img.shields.io/badge/React-18-blue)](#)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-orange)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-red)](#)
[![Docker](https://img.shields.io/badge/Docker-containerized-blue)](#)

## 📚 Quick Navigation

### Documentation
- **[WEB.md](WEB.md)** - Frontend development, features, and local setup
- **[MOBILE_BUILD.md](MOBILE_BUILD.md)** - Mobile app setup and APK building
- **[CONFIG.md](CONFIG.md)** - Environment variables and all configurations  
- **[DEPLOY.md](DEPLOY.md)** - Production deployment (Docker, Heroku, AWS)
- **[QUICK_START.md](QUICK_START.md)** - Fastest way to get running
- **[DEBUG_LOGIN.md](DEBUG_LOGIN.md)** - Authentication troubleshooting
- **[TEST_SCRIPT.md](TEST_SCRIPT.md)** - Testing with provided credentials

---

## 🎯 Core Features

### 🔐 **Multi-Role Authentication**
- Customer, Rider, Manager, and Admin roles
- JWT-based security with token refresh
- Email verification and password reset
- Role-specific dashboards and permissions

### 🍅 **Food Delivery (Restaurants)**
- Browse restaurants and menus
- Real-time order tracking with Socket.IO
- Driver assignment and location tracking
- Order status notifications

### 💊 **Pharmacy Management**
- Medication catalog and inventory
- Fast order processing
- Same-day delivery options
- Prescription verification workflow

### 🚑 **Medical Transport Services**
- Patient transport booking
- Ambulance availability mapping
- Healthcare facility coordination
- Emergency response tracking

### 📋 **Bill Payment System**
- Digital bill uploads and storage
- Multiple payment method support
- Payment history and receipts
- Automated payment reminders

### 📄 **Document Pickup Service**
- On-demand document collection
- Secure handling verification
- Delivery to chosen locations
- Document tracking

### 🎫 **Support Ticket System**
- User-created support tickets (bugs, complaints, features, support)
- Admin ticket management interface
- Priority and status tracking
- Comment history and resolution workflow

### 📊 **Admin Dashboard**
- Real-time KPI metrics
- User and order management
- Financial reports and analytics
- Service metrics and performance tracking
- Ticket resolution monitoring

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Axios** - HTTP client
- **React Router** - Navigation
- **CSS-in-JS** - Unified theme system
- **localStorage** - Session persistence
- **nginx** - Reverse proxy & serving

### Backend
- **Express.js** - REST API framework
- **PostgreSQL 15** - Relational database
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment integration
- **Socket.IO** - Real-time features
- **Node.js 18** - Runtime

### Mobile
- **React Native** - Cross-platform mobile
- **Expo** - Development and building
- **Axios** - API communication
- **AsyncStorage** - Local persistence
- **React Navigation** - App routing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **PostgreSQL Docker** - Managed database
- **nginx** - Load balancing & SSL
- **GitHub Actions** - CI/CD ready

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)
```bash
# One command startup
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Admin user: admin@delivero.com / admin123
```

See [QUICK_START.md](QUICK_START.md) for more details.

### Option 2: Local Development

**Backend:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:500
- **Nodemailer** - Email service

### Frontend
- **React 18** - UI framework
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Vite** - Build tool

### Mobile (opzionale)
- **React Native** - Cross-platform mobile
- **Expo** - Development platform

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Reverse proxy

## 📁 Struttura del Progetto

```
delivero/
├── backend/                    # API REST Node.js/Express
│   ├── src/
│   │   ├── controllers/        # Logica business
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Custom middleware
│   │   ├── config/             # Configurazione
│   │   └── app.js              # App entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   └── App.jsx             # Main component
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── mobile/                     # React Native app
│   ├── App.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
│
├── docker-compose.yml          # Multi-container setup
└── README.md
```

## 🚀 Quick Start

### Prerequisiti
- Docker e Docker Compose
- Node.js 18+ (per sviluppo locale)
- PostgreSQL 15 (per sviluppo locale)
- Git

### Setup con Docker (Consigliato)

1. **Clone il repository:**
   ```bash
   git clone <repository>
   cd delivero
   ```

2. **Crea file `.env`:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Edita il `.env` con i tuoi valori:**
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_HOST=postgres
   DB_NAME=delivero
   JWT_SECRET=your_jwt_secret_change_this
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Avvia i container:**
   ```bash
   docker-compose up -d
   ```

5. **Accedi alle applicazioni:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Setup Locale (Sviluppo)

#### Backend Setup

```bash
cd backend

# Installa dipendenze
npm install

# Configura `.env`
cp .env.example .env

# Crea database e tabelle
psql -U postgres -d delivero -f src/config/database.sql

# Avvia il server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Installa dipendenze
npm install

# Avvia dev server
npm start
```

Accedi a http://localhost:5173

## 📚 API Documentation

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201
{
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
  "token": "eyJhbGc..."
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe", "role": "user" },
  "token": "eyJhbGc..."
}
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

### Orders

**Get All Orders**
```http
GET /api/orders
Authorization: Bearer <token>

Response: 200
[
  { "id": 1, "total_amount": 25.50, "status": "completed", "created_at": "2026-02-13T..." },
  ...
]
```

**Create Order**
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": 1,
  "items": [{ "id": 1, "name": "Pizza", "qty": 2, "price": 10 }],
  "totalAmount": 25.50,
  "deliveryAddress": "123 Main St"
}

Response: 201
{ "id": 1, "status": "pending", ... }
```

**Update Order Status**
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_delivery",
  "location": "5km away"
}

Response: 200
{ "message": "Order status updated", "order": {...} }
```

### Bills

**Get All Bills**
```http
GET /api/bills
Authorization: Bearer <token>

Response: 200
[
  { "id": 1, "type": "Luce", "amount": 50.00, "due_date": "2026-03-13", ... },
  ...
]
```

**Create Bill**
```http
POST /api/bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Gas",
  "amount": 75.00,
  "dueDate": "2026-03-15",
  "description": "Monthly gas bill"
}

Response: 201
{ "id": 1, "type": "Gas", ... }
```

### Payments

**Create Payment**
```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "amount": 25.50
}

Response: 201
{
  "clientSecret": "pi_...",
  "paymentIntentId": "pi_..."
}
```

**Confirm Payment**
```http
POST /api/payments/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_...",
  "orderId": 1
}

Response: 200
{ "message": "Payment confirmed successfully" }
```

### Admin

**Get Dashboard Stats**
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response: 200
{
  "totalUsers": 150,
  "totalOrders": 1250,
  "totalRevenue": 25000.00,
  "recentOrders": [...]
}
```

## 🔐 Sicurezza

- JWT tokens con scadenza
- Password hashing con bcryptjs
- HTTPS in produzione (configurare certificati SSL)
- CORS configurato
- Validazione input
- Rate limiting (aggiungere)

## 📧 Email Configuration

Per usare Gmail:

1. Abilita "App Passwords" in Google Account
2. Aggiungi le credenziali nel `.env`:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

Per altri provider, configura nel file `backend/src/services/email.js`

## 💳 Stripe Integration

1. Registrati su [Stripe](https://stripe.com)
2. Ottieni le chiavi dal dashboard
3. Aggiungi al `.env`:
   ```env
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 🚀 Deployment

### Con Docker (Raccomandato)

```bash
# Build images
docker-compose build

# Push to registry
docker-compose push

# Deploy su server con docker-compose installed
docker-compose up -d
```

### Opzioni di Cloud Hosting

- **Railway.app** - Deploy facile con $5/mese crediti
- **Heroku** - Flex dynos, database PostgreSQL
- **DigitalOcean** - App Platform, Droplets
- **AWS** - ECS, RDS, ALB

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📊 Database Schema

### Users
```sql
id (PK) | email | password | name | role | created_at
```

### Orders
```sql
id (PK) | user_id (FK) | restaurant_id | items | total_amount | status | created_at | updated_at
```

### Bills
```sql
id (PK) | user_id (FK) | type | amount | due_date | description | paid | created_at | updated_at
```

### Payments
```sql
id (PK) | order_id (FK) | stripe_payment_id | amount | status | created_at | updated_at
```

## 🤝 Contributing

1. Fork il repository
2. Create una feature branch (`git checkout -b feature/amazing-feature`)
3. Commit i cambiamenti (`git commit -m 'Add amazing-feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Open una Pull Request

## 📝 License

MIT License - vedi LICENSE file

## 🆘 Support

Per problemi e domande, apri un GitHub Issue.
