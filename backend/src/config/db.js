import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Prefer a single DATABASE_URL when available (e.g. Supabase or production),
// otherwise fall back to individual DB_* env vars. Use 127.0.0.1 instead of
// 'localhost' as a default to avoid IPv6 (::1) connection issues on some setups.
let pool;
if (process.env.DATABASE_URL) {
  // When connecting to hosted Postgres (Supabase), enable SSL and allow
  // self-signed certificates by disabling strict certificate validation.
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'delivero',
  });
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
