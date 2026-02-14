import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import child_process from 'child_process';

dotenv.config();

// Prefer a single DATABASE_URL when available (e.g. Supabase or production),
// otherwise fall back to individual DB_* env vars. Use 127.0.0.1 instead of
// 'localhost' as a default to avoid IPv6 (::1) connection issues on some setups.
let pool;
if (process.env.DATABASE_URL) {
  // When connecting to hosted Postgres (Supabase), enable SSL and allow
  // self-signed certificates by disabling strict certificate validation.
  // If the environment requests IPv4-only (DB_FORCE_IPV4=true) attempt to
  // resolve the DB host to an IPv4 address and use that to avoid ENETUNREACH
  // errors on hosts that resolve to IPv6 addresses on networks without v6.
  let connectionString = process.env.DATABASE_URL;
  if (process.env.DB_FORCE_IPV4 === 'true') {
    try {
      // extract hostname from the connection string
      const url = new URL(process.env.DATABASE_URL);
      const host = url.hostname;
      // Use a platform-friendly command to prefer IPv4: ping with -4 (works on Windows and Unix)
      const out = child_process.execSync(`ping -4 -n 1 ${host}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const m = out.match(/\[(\d+\.\d+\.\d+\.\d+)\]/);
      if (m && m[1]) {
        const ipv4 = m[1];
        // replace hostname in connection string with IPv4 literal
        url.hostname = ipv4;
        connectionString = url.toString();
        console.info(`Resolved ${host} -> ${ipv4} (forced IPv4)`);
      } else {
        console.warn('DB_FORCE_IPV4 requested but unable to resolve IPv4 address, falling back to original DATABASE_URL');
      }
    } catch (e) {
      console.warn('DB_FORCE_IPV4 resolution failed, continuing with original DATABASE_URL:', e.message);
    }
  }

  pool = new Pool({
    connectionString,
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
