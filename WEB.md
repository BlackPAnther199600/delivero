# Delivero Web Application Guide

Complete guide for setting up, developing, and deploying the Delivero web frontend.

## Overview

The Delivero web application is a **React-based SPA** (Single Page Application) served through nginx. It includes:
- **Customer Dashboard** - Order tracking, delivery management
- **Rider Dashboard** - Active orders, delivery navigation
- **Manager Dashboard** - Team management, metrics
- **Admin Dashboard** - System management, user control, billing reports

## Technology Stack

- **Frontend:** React 18, axios, React Router
- **Server:** nginx (containerized)
- **State Management:** React hooks & localStorage
- **Styling:** CSS-in-JS with unified theme system
- **Authentication:** JWT tokens

## Prerequisites

### Local Development
- **Node.js** v18+ with npm
- **npm** package manager
- **Git** (optional)

### Production (Docker)
- **Docker** and **Docker Compose**
- See [DEPLOY.md](DEPLOY.md) for deployment details

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file in `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

For production, change to your server:
```env
REACT_APP_API_URL=https://api.delivero.com/api
REACT_APP_ENV=production
```

### 3. Start Development Server

```bash
npm start
```

Application runs on **http://localhost:3000**

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── LoginForm.jsx       # User login
│   │   ├── RegisterForm.jsx    # User registration with role selection
│   │   ├── TicketForm.jsx      # Create support tickets
│   │   ├── TicketsList.jsx     # View user's tickets
│   │   ├── AdminTickets.jsx    # Admin ticket management
│   │   ├── OrderTracking.jsx   # Order status tracking
│   │   ├── BillForm.jsx        # Bill payment form
│   │   └── PaymentForm.jsx     # Payment processing
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin system dashboard
│   │   ├── BillsList.jsx       # User's bills
│   │   ├── OrdersList.jsx      # User's orders
│   │   └── customer/
│   │       └── CustomerDashboard.jsx
│   │   └── rider/
│   │       └── RiderDashboard.jsx
│   │   └── manager/
│   │       └── ManagerDashboard.jsx
│   ├── services/
│   │   └── api.js              # API client & request methods
│   ├── theme/
│   │   └── theme.js            # Unified theme configuration
│   └── index.js                # React entry point
├── nginx.conf                  # nginx configuration
├── Dockerfile                  # Docker image definition
└── package.json                # Dependencies
```

## Key Features

### Authentication Flow

1. **Registration** - `RegisterForm.jsx`
   - Email, password, name, **role selection** (customer/rider/manager/admin)
   - API: `POST /auth/register`

2. **Login** - `LoginForm.jsx`
   - Email & password authentication
   - JWT token stored in localStorage
   - API: `POST /auth/login`

3. **Role-Based Routing**
   - Customer → `/customer` (orders, delivery tracking)
   - Rider → `/rider` (available orders, active deliveries)
   - Manager → `/manager` (team & warehouse management)
   - Admin → `/admin` (full system control)

### Admin Dashboard

The admin panel provides full system management:

**Statistics Tab**
- Total users, orders, revenue
- Recent order activity

**Orders Tab**
- Filter by status (pending, confirmed, completed, cancelled)
- View order details

**Users Tab**
- List all users with roles
- Edit user roles
- Delete users

**Finance Tab**
- Revenue breakdown
- Payment method statistics
- Order status distribution

**Metrics Tab**
- Pharmacy orders
- Medical transports
- Document pickups
- Bill payments

**Tickets Tab**
- Support ticket statistics
- Filter by status/priority
- View unresolved tickets

### Ticket/Reporting System

Users can create support tickets for:
- **Bug Reports** - Technical issues
- **Complaints** - Service quality issues
- **Feature Requests** - Suggested improvements
- **Support** - General support needs

**Components:**
- `TicketForm.jsx` - Create new ticket
- `TicketsList.jsx` - View personal tickets
- `AdminTickets.jsx` - Manage all tickets (admin only)

### Theme System

Unified styling across web and mobile via `theme.js`:

```javascript
import { theme } from './theme/theme.js';

// Colors
theme.colors.primary      // #FF6B00 (Orange)
theme.colors.secondary    // #0066FF (Blue)
theme.colors.success      // #4CAF50
theme.colors.error        // #D32F2F

// Typography
theme.typography.fontSize.base    // 14px
theme.typography.fontWeight.bold  // 700

// Spacing (8px base)
theme.spacing[4]          // 16px
```

## Development Workflow

### Adding a New Component

1. Create component file in `src/components/`:
```jsx
// Example component with theme
import { useState } from 'react';
import { theme } from '../theme/theme.js';

export default function MyComponent() {
  const styles = {
    container: { padding: theme.spacing[4] },
    button: { 
      ...theme.buttons.base.web,
      ...theme.buttons.primary.web
    }
  };
  
  return <div style={styles.container}>...</div>;
}
```

2. Import in relevant page or App.jsx

### Adding a New API Endpoint

Update `src/services/api.js`:

```javascript
export const myNewAPI = {
  getData: () => apiClient.get('/my-endpoint'),
  submitData: (data) => apiClient.post('/my-endpoint', data),
  updateData: (id, data) => apiClient.put(`/my-endpoint/${id}`, data),
  deleteData: (id) => apiClient.delete(`/my-endpoint/${id}`)
};
```

Use in component:
```javascript
import { myNewAPI } from '../services/api';

const response = await myNewAPI.getData();
```

### Styling Best Practices

1. **Use theme colors:**
   ```javascript
   { color: theme.colors.primary }  // ✓ Good
   { color: '#FF6B00' }            // ✗ Avoid hardcoding
   ```

2. **Use spacing system:**
   ```javascript
   { padding: theme.spacing[4] }   // ✓ 16px (consistent)
   { padding: '15px' }             // ✗ Inconsistent
   ```

3. **Use theme shadows:**
   ```javascript
   { boxShadow: theme.shadows.md } // ✓ Predefined
   { boxShadow: '0 2px 4px...' }  // ✗ Hardcoded
   ```

## Building for Production

### Build Command

```bash
npm run build
```

Generates optimized build in `build/` directory.

### Docker Build

```bash
docker build -t delivero-frontend:1.0 .
```

### Docker Compose (Recommended)

```bash
docker-compose up frontend
```

Nginx runs on **http://localhost:3000**

## Testing & Debugging

### Browser DevTools

1. Open Chrome DevTools (F12)
2. **Network tab** - Monitor API calls
3. **Console** - Check for errors
4. **Storage/Cookies** - View JWT token

### Common Issues

**"Cannot POST /auth/register"**
- Backend not running on port 5000
- Check Docker container: `docker ps`

**"Non autorizzato" (Unauthorized)**
- JWT token expired → Logout and re-login
- Role permissions issue → Check user role in admin panel

**Blank page**
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for React errors (F12)

**API calls to http:// on https:**
- Update `.env` to match protocol
- Check CORS configuration in backend

## Performance Optimization

### Code Splitting

React automatically splits code by route. Monitor in DevTools:
1. Network tab → Filter by "js"
2. Look for chunk filenames

### Lazy Loading

Already implemented for dashboard components:
```javascript
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

### Caching Headers

Configured in `nginx.conf`:
- Static assets: 1 year cache
- HTML: No cache (always fresh)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `http://localhost:5000/api` |
| `REACT_APP_ENV` | Environment mode | `development` or `production` |

## Deployment

See [DEPLOY.md](DEPLOY.md) for:
- Docker Compose deployment
- Nginx configuration
- SSL certificates
- DDoS protection
- Monitoring setup

## Mobile Version

For mobile (iOS/Android), see [MOBILE_BUILD.md](MOBILE_BUILD.md)

The web app is **fully responsive** and works on mobile browsers, but for native app features, use React Native mobile app.

## Support & Troubleshooting

### Useful Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Install new packages
npm install package-name

# Update packages
npm update
```

### Getting Help

1. Check browser console for errors (F12)
2. Review [DEPLOY.md](DEPLOY.md) for deployment issues
3. Check [CONFIG.md](CONFIG.md) for environment setup
4. Review server logs: `docker logs backend-container`

---

**Last Updated:** 2024
**Delivero Web v1.0.0**
