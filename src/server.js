/** Entry point. Author: Muhammad Shaheer Haider */
require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await pool.initialize();
    const server = app.listen(PORT, () => console.log(`Book Vault running on http://localhost:${PORT}`));
    const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
})();
