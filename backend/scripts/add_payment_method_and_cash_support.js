#!/usr/bin/env node
import db from '../src/config/db.js';

(async () => {
  try {
    console.log('Ensuring payments table supports cash payments and optional stripe id...');

    await db.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'card';`);

    // Allow NULL stripe id for cash payments
    await db.query(`ALTER TABLE payments ALTER COLUMN stripe_payment_id DROP NOT NULL;`);

    // Optional: widen status usage
    // statuses: pending, completed, failed, cash_due, refunded

    console.log('✓ payments table updated');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
