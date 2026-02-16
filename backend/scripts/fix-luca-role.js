import db from '../src/config/db.js';

async function fixLucaRole() {
  try {
    const email = 'luca04985@gmail.com';
    const newRole = 'admin';

    // Update user role to admin
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
      [newRole, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('✅ User role updated successfully:');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Old Role: manager');
    console.log('New Role:', result.rows[0].role);
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    process.exit(0);
  }
}

fixLucaRole();
