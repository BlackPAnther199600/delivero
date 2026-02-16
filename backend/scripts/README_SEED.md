# Seeding scripts for Delivero backend

## 1. Automatic seeding on container start (recommended for production)

- `backend/scripts/seed-on-start.js` – runs only if DB is empty (no users)
- Called by `backend/scripts/entrypoint.sh` which is the Docker ENTRYPOINT
- Safe to run on every container start; idempotent

## 2. Manual seeding (local or remote)

Run locally:
```bash
node backend/scripts/seed_nearby_demo_data.js
```

Run against remote DB (set DATABASE_URL):
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db node backend/scripts/seed_nearby_demo_data.js
```

## 3. Admin endpoint to trigger seeding

POST `/api/admin/seed` – admin/manager only
- Triggers `seed_nearby_demo_data.js` asynchronously
- Returns 202 Accepted immediately

Example with curl (requires auth token):
```bash
curl -X POST https://delivero-gyjx.onrender.com/api/admin/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## What gets seeded

- 3 demo users (customer, rider, manager) with password `123456`
- 2 restaurants near Rome (lat 41.880025, lon 12.67594)
- 1 active order `in_transit` with rider coordinates and ETA
- Ensures required columns exist on `orders` table

All scripts are idempotent: re-running updates existing demo users to password `123456`.
