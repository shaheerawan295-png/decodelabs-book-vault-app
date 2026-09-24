/** Shared PostgreSQL connection pool. Author: Muhammad Shaheer Haider */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');

const createNativePool = () => {
  if (!process.env.DATABASE_URL) return null;

  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  pool.on('error', (err) => console.error('Unexpected pool error:', err.message));
  return pool;
};

const createMemoryPool = () => {
  const db = newDb();
  db.public.registerFunction({
    name: 'trim',
    args: ['text'],
    returns: 'text',
    implementation: (value) => String(value ?? '').trim(),
  });
  db.public.registerFunction({
    name: 'char_length',
    args: ['text'],
    returns: 'int',
    implementation: (value) => String(value ?? '').length,
  });

  const { Pool } = db.adapters.createPg();
  const pool = new Pool();
  pool.on = pool.on || (() => pool);
  pool._db = db;
  return pool;
};

const pool = createNativePool() || createMemoryPool();

const schemaSql = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');

pool.initialize = async () => {
  if (pool._initialized) return pool;

  if (process.env.DATABASE_URL) {
    try {
      await pool.query('SELECT 1');
      pool._initialized = true;
      return pool;
    } catch (err) {
      console.warn(`Primary database unavailable (${err.message}). Falling back to in-memory PostgreSQL.`);
      if (typeof pool.end === 'function') await pool.end().catch(() => {});

      const memoryPool = createMemoryPool();
      pool.query = memoryPool.query.bind(memoryPool);
      pool.end = memoryPool.end.bind(memoryPool);
      pool.on = memoryPool.on.bind(memoryPool);
      pool._db = memoryPool._db;
      pool._fallback = true;
    }
  }

  if (pool._fallback || !process.env.DATABASE_URL) {
    await pool.query(schemaSql);
    pool._initialized = true;
  }

  return pool;
};

module.exports = pool;
