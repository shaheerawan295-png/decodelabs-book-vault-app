const service = require('../services/books.service');
const ApiError = require('../utils/ApiError');
const { validateBook, parseId, STATUSES } = require('../utils/validators');

const idOrFail = (req) => {
  const id = parseId(req.params.id);
  if (!id) throw new ApiError(400, 'Invalid book id.');
  return id;
};

const validOrFail = (body) => {
  const { errors, value } = validateBook(body);
  if (Object.keys(errors).length) throw new ApiError(422, 'Validation failed.', errors);
  return value;
};

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const categoryId = parseId(req.query.category_id) || undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  res.json(await service.list({ q, status, categoryId, page, limit }));
};

exports.get = async (req, res) => {
  const book = await service.getById(idOrFail(req));
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json(book);
};

exports.create = async (req, res) => {
  const book = await service.create(validOrFail(req.body));
  res.status(201).location(`/api/books/${book.id}`).json(book);
};

exports.update = async (req, res) => {
  const id = idOrFail(req);
  const book = await service.update(id, validOrFail(req.body));
  if (!book) throw new ApiError(404, 'Book not found.');
  res.json(book);
};

exports.remove = async (req, res) => {
  if (!(await service.remove(idOrFail(req)))) throw new ApiError(404, 'Book not found.');
  res.status(204).end();
};

exports.categories = async (req, res) => res.json(await service.listCategories());
