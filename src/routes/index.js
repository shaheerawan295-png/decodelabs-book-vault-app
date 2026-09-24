const router = require('express').Router();
const c = require('../controllers/books.controller');

// Wraps async handlers so rejections reach the central error middleware.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/categories', h(c.categories));
router.route('/books').get(h(c.list)).post(h(c.create));
router.route('/books/:id').get(h(c.get)).put(h(c.update)).delete(h(c.remove));

module.exports = router;
