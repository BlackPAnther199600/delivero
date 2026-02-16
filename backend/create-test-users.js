#!/usr/bin/env node
/**
 * Test Data Seeder for Delivero
 * Crea utenti demo per test: customer, rider, manager
 */

const API_URL = 'https://delivero-gyjx.onrender.com/api/auth';

const testUsers = [
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer'
  },
  {
    name: 'Maria Rider',
    email: 'rider@example.com',
    password: 'password123',
    role: 'rider'
  },
  {
    name: 'Marco Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager'
  }
];

async function createTestUsers() {
  console.log('🌱 Creazione utenti di test...\n');

  for (const user of testUsers) {
    try {
      console.log(`📝 Creando ${user.role}: ${user.email}...`);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const data = await response.json();

      if (response.status === 201 || response.status === 200) {
        console.log(`✅ ${user.role.toUpperCase()} creato con successo!`);
        console.log(`   ID: ${data.user?.id}`);
        console.log(`   Token: ${data.token?.substring(0, 20)}...\n`);
      } else if (response.status === 409) {
        console.log(`⚠️  ${user.role.toUpperCase()} già esiste (${user.email})\n`);
      } else {
        console.error(`❌ Errore creazione ${user.role}:`, data?.message || response.statusText);
      }
    } catch (error) {
      console.error(`❌ Errore creazione ${user.role}:`, error.message);
    }
  }
  console.log('\n📋 Utenti di test disponibili:');
  console.log('─'.repeat(50));
  testUsers.forEach(u => {
    console.log(`\n${u.role.toUpperCase()}:`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Password: ${u.password}`);
  });
  console.log('\n' + '─'.repeat(50));
  console.log('✨ Ready for testing!\n');
}

// Esegui lo script
createTestUsers().catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
