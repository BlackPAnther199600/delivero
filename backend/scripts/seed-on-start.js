#!/usr/bin/env node
/**
 * Seed-on-start: runs only if DB is empty (no users).
 * Safe to call from Docker CMD every container start.
 */
import db from '../src/config/db.js';
import bcrypt from 'bcryptjs';

const CENTER = { lat: 41.880025, lon: 12.67594 };

const jitter = (v, meters) => {
  const dLat = meters / 111111;
  const dLon = meters / (111111 * Math.cos((CENTER.lat * Math.PI) / 180));
  const r1 = (Math.random() - 0.5) * 2;
  const r2 = (Math.random() - 0.5) * 2;
  return v + (v === CENTER.lat ? r1 * dLat : r2 * dLon);
};

const ensureOrderTrackingColumns = async () => {
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id INTEGER REFERENCES users(id);`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_latitude DECIMAL(10, 8);`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_longitude DECIMAL(11, 8);`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS eta_minutes INTEGER;`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMP;`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8);`);
  await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8);`);
};

const upsertUser = async ({ email, name, role }) => {
  const password = await bcrypt.hash('123456', 10);
  const res = await db.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password = EXCLUDED.password
     RETURNING id, email, role`,
    [email, password, name, role]
  );
  return res.rows[0];
};

const insertRestaurant = async ({ name, address, latitude, longitude }) => {
  const res = await db.query(
    `INSERT INTO restaurants (name, description, address, rating, latitude, longitude, is_open, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true, true)
     RETURNING id, name`,
    [name, 'Demo restaurant seeded nearby', address, 4.7, latitude, longitude]
  );
  return res.rows[0];
};

const insertOrder = async ({ userId, restaurantId, totalAmount, deliveryAddress, deliveryLat, deliveryLon, riderId, riderLat, riderLon, etaMinutes, status }) => {
  const items = [
    { id: 1, name: 'Pizza Margherita', price: 8.5, quantity: 1 },
    { id: 2, name: 'Acqua', price: 1.5, quantity: 1 },
  ];

  const res = await db.query(
    `INSERT INTO orders (
       user_id, restaurant_id, items, total_amount, delivery_address,
       delivery_latitude, delivery_longitude, rider_id, rider_latitude, rider_longitude,
       eta_minutes, received_at, status, created_at, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12,NOW(),NOW()
     )
     RETURNING id, status`,
    [
      userId, restaurantId, JSON.stringify(items), totalAmount, deliveryAddress,
      deliveryLat, deliveryLon, riderId, riderLat, riderLon, etaMinutes, status,
    ]
  );
  return res.rows[0];
};

(async () => {
  try {
    // Check if DB already has users
    const userCount = await db.query('SELECT COUNT(*) AS cnt FROM users');
    const count = parseInt(userCount.rows[0].cnt, 10);
    if (count > 0) {
      console.log('Database already has users; skipping seed-on-start.');
      process.exit(0);
    }

    console.log('Empty DB detected; running seed-on-start near:', CENTER);

    await ensureOrderTrackingColumns();

    const customer = await upsertUser({
      email: 'demo.customer@delivero.local',
      name: 'Demo Customer',
      role: 'customer',
    });

    const rider = await upsertUser({
      email: 'demo.rider@delivero.local',
      name: 'Demo Rider',
      role: 'rider',
    });

    const manager = await upsertUser({
      email: 'demo.manager@delivero.local',
      name: 'Demo Manager',
      role: 'manager',
    });

    console.log('Users:', { customer, rider, manager });

    const r1 = await insertRestaurant({
      name: 'Demo Pizza Roma Est',
      address: 'Via Demo 1, Roma',
      latitude: jitter(CENTER.lat, 350),
      longitude: jitter(CENTER.lon, 350),
    });

    const r2 = await insertRestaurant({
      name: 'Demo Sushi Roma Est',
      address: 'Via Demo 2, Roma',
      latitude: jitter(CENTER.lat, 600),
      longitude: jitter(CENTER.lon, 600),
    });

    console.log('Restaurants:', { r1, r2 });

    const deliveryLat = jitter(CENTER.lat, 120);
    const deliveryLon = jitter(CENTER.lon, 120);
    const riderLat = jitter(CENTER.lat, 200);
    const riderLon = jitter(CENTER.lon, 200);

    const order = await insertOrder({
      userId: customer.id,
      restaurantId: r1.id,
      totalAmount: 10.0,
      deliveryAddress: 'Vicino alla tua posizione (demo)',
      deliveryLat,
      deliveryLon,
      riderId: rider.id,
      riderLat,
      riderLon,
      etaMinutes: 12,
      status: 'in_transit',
    });

    console.log('Seeded order:', order);
    console.log('Seed-on-start completed.');
    process.exit(0);
  } catch (e) {
    console.error('Seed-on-start failed:', e?.message || e);
    process.exit(1);
  }
})();
