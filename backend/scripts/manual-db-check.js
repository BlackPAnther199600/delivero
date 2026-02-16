import db from '../src/config/db.js';

async function manualDBCheck() {
  try {
    console.log('=== CONNESSIONE DATABASE ===');
    console.log('Host:', process.env.DB_HOST || 'aws-1-eu-west-1.pooler.supabase.com:6543');
    console.log('Database:', process.env.DB_NAME || 'delivero');
    
    // 1. Verifica tabelle
    console.log('\n=== VERIFICA TABELLE ===');
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Tabelle trovate:', tables.rows.map(t => t.table_name));
    
    // 2. Verifica colonne restaurants
    console.log('\n=== COLONNE RESTAURANTS ===');
    const restaurantsColumns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants' 
      ORDER BY ordinal_position
    `);
    restaurantsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // 3. Verifica dati restaurants
    console.log('\n=== DATI RESTAURANTS ===');
    const restaurantsData = await db.query('SELECT * FROM restaurants LIMIT 3');
    console.log('Primi 3 ristoranti:');
    restaurantsData.rows.forEach(r => {
      console.log(`  ID: ${r.id}, Name: ${r.name}, Active: ${r.is_active}`);
    });
    
    // 4. Test query problematica
    console.log('\n=== TEST QUERY PROBLEMATICA ===');
    try {
      const testQuery = await db.query(`
        SELECT id, name, rating 
        FROM restaurants 
        WHERE id = $1 AND restaurants.is_active = true
      `, [3]);
      console.log('Query con restaurants.is_active:', testQuery.rows);
    } catch (error) {
      console.error('ERRORE QUERY:', error.message);
    }
    
  } catch (error) {
    console.error('ERRORE GENERALE:', error.message);
  } finally {
    await db.end();
  }
}

manualDBCheck();
