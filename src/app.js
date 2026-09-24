const path = require('path');
const express = require('express');
const helmet = require('helmet');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ['https://fonts.gstatic.com'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
  } },
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
