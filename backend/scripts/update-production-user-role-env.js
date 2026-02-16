import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to production database using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

async function updateProductionUserRole() {
  try {
    const email = 'luca04985@gmail.com';
    const newRole = 'admin';

    console.log('🔌 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('🔌 Connecting to production database...');

    // First check if user exists
    const existingUser = await pool.query('SELECT id, email, name, role FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length === 0) {
      console.log('❌ User not found in production with email:', email);
      return;
    }

    console.log('📋 Current user:', existingUser.rows[0]);

    // Update user role to admin in production
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
      [newRole, email]
    );

    console.log('✅ Production user role updated successfully:');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Old Role:', existingUser.rows[0].role);
    console.log('New Role:', result.rows[0].role);
    
  } catch (error) {
    console.error('❌ Error updating production user role:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateProductionUserRole();
