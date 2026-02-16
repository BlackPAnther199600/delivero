import bcrypt from 'bcryptjs';
import db from '../src/config/db.js';

async function createAdminUser() {
  try {
    const email = 'admin@delivero.com';
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'admin';

    // Check if admin already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
    );

    console.log('Admin user created successfully:', result.rows[0]);
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
