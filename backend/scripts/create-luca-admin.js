import bcrypt from 'bcryptjs';
import db from '../src/config/db.js';

async function createLucaAdmin() {
  try {
    const email = 'luca04985@gmail.com';
    const password = '1223456';
    const name = 'Luca Admin';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await db.query('SELECT id, role FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ User already exists with role:', existingUser.rows[0].role);
      
      // Update role to admin if not already admin
      if (existingUser.rows[0].role !== 'admin') {
        const updateResult = await db.query(
          'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
          [role, email]
        );
        console.log('✅ Role updated to admin:', updateResult.rows[0]);
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await db.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, hashedPassword, name, role]
    );

    console.log('✅ Luca admin user created successfully:', result.rows[0]);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);
    
  } catch (error) {
    console.error('❌ Error creating Luca admin:', error);
  } finally {
    process.exit(0);
  }
}

createLucaAdmin();
