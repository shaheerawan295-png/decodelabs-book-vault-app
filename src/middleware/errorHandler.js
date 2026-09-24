const ApiError = require('../utils/ApiError');

/** Maps PostgreSQL error codes to meaningful HTTP responses. */
function translatePgError(err) {
  switch (err.code) {
    case '23505': return new ApiError(409, 'A record with this unique value already exists.');
    case '23503': return new ApiError(422, 'Referenced record does not exist.');
    case '23514':
    case '23502':
    case '22001':
    case '22P02': return new ApiError(400, 'Data violates a database constraint.');
    default: return null;
  }
}

const notFound = (req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') err = new ApiError(400, 'Malformed JSON body.');
  const apiErr = err instanceof ApiError ? err : translatePgError(err) || err;
  const status = apiErr.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Internal server error.' : apiErr.message,
    ...(apiErr.details && { details: apiErr.details }),
  });
};

module.exports = { notFound, errorHandler };
