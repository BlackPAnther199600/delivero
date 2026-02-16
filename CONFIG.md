# Configuration Guide - Delivero

Complete configuration reference for all Delivero components.

## Environment Variables

### Backend (.env in `backend/`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivero
DB_USER=postgres
DB_PASSWORD=postgres

# Server
NODE_ENV=production
PORT=5000
AUTH_SECRET=your-secret-key-change-me-in-production

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SEND_GRID_API_KEY=optional-sendgrid-key

# AWS S3 (for file uploads)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=delivero-uploads

# Payment Gateway (Stripe/PayPal)
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_SECRET=your-paypal-secret

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=7d

# Logging
LOG_LEVEL=info
```

### Frontend (.env in `frontend/`)

```env
# API
REACT_APP_API_URL=https://delivero-gyjx.onrender.com/api

# Environment
REACT_APP_ENV=development

# Optional: Analytics
REACT_APP_SENTRY_DSN=optional-error-tracking
```

### Mobile (.env in `mobile/`)

```env
# API
EXPO_PUBLIC_API_URL=https://delivero-gyjx.onrender.com/api

# Environment
EXPO_PUBLIC_ENV=development

# Expo Project
EXPO_PUBLIC_USER_ID=your-expo-account-id
```

## Database Configuration

### PostgreSQL Connection String

```
postgresql://user:password@localhost:5432/delivero
```

### Database Initialization

The database is **automatically created** on first backend startup via `backend/src/config/database.sql`.

**Tables created:**
- `users` - User accounts with roles
- `orders` - Delivery orders
- `bills` - Bill payments
- `bill_payments` - Payment records
- `restaurants` - Restaurant data
- `pharmacies` - Pharmacy network
- `pharmacy_products` - Pharmacy items
- `pharmacy_orders` - Pharmacy orders
- `medical_transports` - Medical transport  
- `document_pickups` - Document delivery
- `tickets` - Support tickets
- `ticket_comments` - Ticket updates

### Backup & Restore

```bash
# Backup database
docker exec postgres pg_dump -U postgres delivero > backup.sql

# Restore database
docker exec -i postgres psql -U postgres delivero < backup.sql
```

## Docker Configuration

### docker-compose.yml Structure

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: delivero
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - delivero-net

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      # ... other env vars
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - delivero-net

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    networks:
      - delivero-net

volumes:
  postgres_data:

networks:
  delivero-net:
    driver: bridge
```

## Authentication & Security

### JWT Configuration

**Token Structure:**
```javascript
{
  userId: 123,
  email: "user@example.com",
  role: "customer",
  iat: 1234567890,
  exp: 1234654290
}
```

**Token Storage:**
- Frontend: `localStorage.getItem('token')`
- Mobile: `AsyncStorage.getItem('token')`

**Token Usage:**
```javascript
// In all API requests:
headers: {
  'Authorization': 'Bearer ' + token
}
```

### CORS Configuration

**Backend (Express):**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://delivero.com'],
  credentials: true
}));
```

**Nginx (Frontend):**
```nginx
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE';
```

### Password Security

- **Hashing:** bcrypt with salt rounds = 10
- **Requirements:** Minimum 8 characters
- **Reset:** Email verification required

### Rate Limiting

Configure in backend `app.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit requests per window
});

app.use('/api/', limiter);
```

## File Upload Configuration

### AWS S3 Setup

1. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://delivero-uploads
   ```

2. **Configure CORS:**
   ```json
   {
     "CORSRules": [{
       "AllowedOrigins": ["http://localhost:3000", "https://delivero.com"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "MaxAgeSeconds": 3000
     }]
   }
   ```

3. **Set environment variables:**
   ```env
   AWS_REGION=eu-west-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_S3_BUCKET=delivero-uploads
   ```

### Local File Uploads (Development)

If S3 not available, uploads go to `backend/uploads/`:

```javascript
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
```

## Email Configuration

### Gmail Setup

1. **Enable 2-factor authentication**
2. **Generate app password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy generated password

3. **Set environment variables:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

### SendGrid Alternative

```env
SEND_GRID_API_KEY=SG.xxxxxxxxxx
```

Use in backend:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
```

## Payment Gateway

### Stripe Configuration

1. **Get keys from** https://dashboard.stripe.com/apikeys
2. **Set environment variables:**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

3. **Create webhook endpoint** for payment notifications:
   ```javascript
   app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
     const event = req.body;
     // Handle payment.succeeded event
   });
   ```

### PayPal Configuration

```env
PAYPAL_CLIENT_ID=AXxxx
PAYPAL_SECRET=ECxxx
PAYPAL_MODE=sandbox  # or live
```

## Logging & Monitoring

### Backend Logging

```javascript
const logger = require('./utils/logger');
logger.info('User logged in', { userId: 123 });
logger.error('Database error', error);
```

**Log Levels:**
- `debug` - Detailed debugging
- `info` - General information
- `warn` - Warning messages
- `error` - Error messages

### Log Files (Docker)

```bash
# View logs
docker logs backend-container

# Real-time logs
docker logs -f backend-container

# Last 100 lines
docker logs --tail 100 backend-container
```

## Performance Tuning

### Database Optimization

```sql
-- Create indices (already in database.sql)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Monitor slow queries
SET log_min_duration_statement = 1000;
```

### Caching Strategy

**Frontend:**
- Static assets: 1-year cache
- API responses: Redis (optional)

**Backend:**
- Session data: Redis cache
- Database queries: Query result caching

### Database Connection Pool

```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Backup & Recovery

### Automated Backups

**Daily backup script:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/delivero"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U postgres delivero > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
```

Schedule with cron:
```
0 2 * * * /scripts/backup.sh
```

### S3 Backup Upload

```bash
aws s3 cp backup.sql.gz s3://delivero-backups/
```

## SSL/TLS Configuration

### Self-Signed Certificate (Development)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### Let's Encrypt (Production)

```bash
docker run --rm -v $(pwd)/certbot:/etc/letsencrypt certbot/certbot certonly \
  --manual --preferred-challenges=dns -d delivero.com
```

**Nginx configuration:**
```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/delivero.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/delivero.com/privkey.pem;
```

## Compliance

### GDPR Compliance

**User Data Export:**
```javascript
// GET /api/users/me/export
// Returns all user data as JSON
```

**Data Deletion:**
```javascript
// DELETE /api/users/me
// Anonymizes and deletes all user data
```

### PCI DSS (Payment Security)

- ✓ Never store full credit card numbers
- ✓ Use tokenized payments (Stripe/PayPal)
- ✓ Encrypt sensitive data in transit (HTTPS)
- ✓ Maintain audit logs

---

**Last Updated:** 2024
**Delivero v1.0.0**
