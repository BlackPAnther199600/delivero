import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // Configurazione per Render + Supabase
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Obbligatorio per Supabase
    },
  });
} else {
  // Configurazione per sviluppo locale
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || 'delivero',
  });
}

pool.on('connect', () => {
  console.log('✅ Database connesso con successo');
});

pool.on('error', (err) => {
  console.error('❌ Errore inaspettato sul client database', err);
});

export default pool;