import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

// Connect to production database (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.owtrmmsszrqhvpqgqjn:R2P5K8e8HhU4vH@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  ssl: {
    rejectUnauthorized: false
  },
});

async function updateProductionUserRole() {
  try {
    const email = 'luca04985@gmail.com';
    const newRole = 'admin';

    console.log('🔌 Connecting to production database...');

    // Update user role to admin in production
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
      [newRole, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found in production with email:', email);
      return;
    }

    console.log('✅ Production user role updated successfully:');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Old Role: manager');
    console.log('New Role:', result.rows[0].role);
    
  } catch (error) {
    console.error('❌ Error updating production user role:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateProductionUserRole();
