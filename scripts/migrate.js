/** Applies db/schema.sql. Author: Muhammad Shaheer Haider */
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

(async () => {
  try {
    await pool.initialize();
    await pool.query(fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'));
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
})();
