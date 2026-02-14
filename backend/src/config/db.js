import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import child_process from 'child_process';
import dns from 'dns';

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
      // Safely extract hostname even if password contains special chars
      const atIdx = connectionString.lastIndexOf('@');
      if (atIdx > -1) {
        const afterAt = connectionString.slice(atIdx + 1);
        const host = afterAt.split(/[:\/]/)[0];

        // prefer dns lookup to get IPv4 address
        const lookup = dns.promises.lookup || ((h, opts) => new Promise((res, rej) => dns.lookup(h, opts, (e, address) => e ? rej(e) : res({ address }))));
        const result = await lookup(host, { family: 4 });
        const ipv4 = result.address || result;

        // rebuild connection string replacing only the host portion after the last @
        const restAfterHost = afterAt.slice(host.length);
        connectionString = connectionString.slice(0, atIdx + 1) + ipv4 + restAfterHost;
        console.info(`Resolved ${host} -> ${ipv4} (forced IPv4)`);
      } else {
        console.warn('DB_FORCE_IPV4 requested but connection string missing @ separator');
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
