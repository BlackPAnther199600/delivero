import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('📁 Inizializzazione database...');

    // Leggi il file SQL
    const sqlPath = path.join(__dirname, 'src/config/database.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Rimuovi commenti (-- fino a fine riga)
    const cleanedScript = sqlScript
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Dividi per statement (separa da ;)
    let statements = cleanedScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Separa CREATE TABLE dai CREATE INDEX
    const createTableStatements = statements.filter(stmt => stmt.toUpperCase().startsWith('CREATE TABLE'));
    const createIndexStatements = statements.filter(stmt => stmt.toUpperCase().startsWith('CREATE INDEX'));
    const otherStatements = statements.filter(stmt => 
      !stmt.toUpperCase().startsWith('CREATE TABLE') && 
      !stmt.toUpperCase().startsWith('CREATE INDEX')
    );

    console.log(`📊 Trovati: ${createTableStatements.length} CREATE TABLE, ${createIndexStatements.length} CREATE INDEX`);

    // Esegui in ordine: CREATE TABLE, poi altri, poi CREATE INDEX
    const orderedStatements = [...createTableStatements, ...otherStatements, ...createIndexStatements];

    console.log(`🔧 Esecuzione ${orderedStatements.length} statement SQL...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < orderedStatements.length; i++) {
      try {
        const stmt = orderedStatements[i];
        await db.query(stmt);
        successCount++;
        console.log(`✓ [${i + 1}/${orderedStatements.length}] OK`);
      } catch (error) {
        // Alcuni errori sono normali (es: tabella/indice già esiste)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('violates unique constraint')) {
          console.log(`⚠ [${i + 1}/${orderedStatements.length}] ESISTE GIÀ`);
          successCount++;
        } else {
          errorCount++;
          console.error(`✗ [${i + 1}/${orderedStatements.length}] ERRORE: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Risultato: ${successCount} OK, ${errorCount} errori`);
    console.log('✅ Inizializzazione database completata!');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
