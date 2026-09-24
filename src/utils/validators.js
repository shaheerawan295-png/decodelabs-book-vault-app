/** Input sanitisation & validation. Author: Muhammad Shaheer Haider */
const STATUSES = ['to_read', 'reading', 'finished'];

const clean = (v) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, '').trim() : v;

const isEmpty = (v) => v === undefined || v === null || v === '';

function toInt(v, field, min, max, errors) {
  if (isEmpty(v)) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    errors[field] = `Must be a whole number between ${min} and ${max}.`;
    return null;
  }
  return n;
}

function validateBook(body = {}) {
  const errors = {};
  const title = clean(body.title);
  const author = clean(body.author);
  const isbn = isEmpty(body.isbn) ? null : clean(String(body.isbn));
  const status = isEmpty(body.status) ? 'to_read' : clean(body.status);

  if (!title || title.length > 150) errors.title = 'Required, up to 150 characters.';
  if (!author || author.length > 100) errors.author = 'Required, up to 100 characters.';
  if (isbn && !/^[0-9Xx-]{10,17}$/.test(isbn)) errors.isbn = 'Use 10-17 digits or hyphens.';
  if (!STATUSES.includes(status)) errors.status = `Must be one of: ${STATUSES.join(', ')}.`;

  const value = {
    title, author, isbn, status,
    year: toInt(body.year, 'year', 1000, 2100, errors),
    pages: toInt(body.pages, 'pages', 1, 100000, errors),
    rating: toInt(body.rating, 'rating', 1, 5, errors),
    category_id: toInt(body.category_id, 'category_id', 1, 2147483647, errors),
  };
  return { errors, value };
}

/** Parses :id route params safely. */
const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
};

module.exports = { validateBook, parseId, STATUSES };
