/** Data-access layer: every query is parameterised (no string concatenation of input). */
const pool = require('../config/db');

const SELECT = `
  SELECT b.*, c.name AS category
  FROM books b LEFT JOIN categories c ON c.id = b.category_id`;

async function list({ q, status, categoryId, page = 1, limit = 20 }) {
  const where = [];
  const params = [];
  if (q)          { params.push(`%${q}%`); where.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`); }
  if (status)     { params.push(status);     where.push(`b.status = $${params.length}`); }
  if (categoryId) { params.push(categoryId); where.push(`b.category_id = $${params.length}`); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = await pool.query(`SELECT COUNT(*)::int AS n FROM books b ${clause}`, params);
  const { rows } = await pool.query(
    `${SELECT} ${clause} ORDER BY b.created_at DESC, b.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, (page - 1) * limit]
  );
  return { data: rows, meta: { total: total.rows[0].n, page, limit } };
}

async function getById(id) {
  const { rows } = await pool.query(`${SELECT} WHERE b.id = $1`, [id]);
  return rows[0] || null;
}

async function create(b) {
  const { rows } = await pool.query(
    `INSERT INTO books (title, author, isbn, year, pages, status, rating, category_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [b.title, b.author, b.isbn, b.year, b.pages, b.status, b.rating, b.category_id]
  );
  return getById(rows[0].id);
}

async function update(id, b) {
  const { rowCount } = await pool.query(
    `UPDATE books SET title=$1, author=$2, isbn=$3, year=$4, pages=$5,
            status=$6, rating=$7, category_id=$8, updated_at=now()
     WHERE id=$9`,
    [b.title, b.author, b.isbn, b.year, b.pages, b.status, b.rating, b.category_id, id]
  );
  return rowCount ? getById(id) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM books WHERE id = $1', [id]);
  return rowCount > 0;
}

async function listCategories() {
  const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY name');
  return rows;
}

module.exports = { list, getById, create, update, remove, listCategories };
