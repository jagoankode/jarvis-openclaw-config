require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/database');

const PORT = process.env.PORT || 3000;

/**
 * Start the server and test DB connection.
 */
async function start() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connected.');
    client.release();
  } catch (err) {
    console.warn('⚠️  Database not available — server will start but DB features will fail.');
    console.warn(`   ${err.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║  🛒  Ecommerce API Server               ║
║  📡  Port: ${String(PORT).padEnd(30)}║
║  🌍  Env:  ${(process.env.NODE_ENV || 'development').padEnd(30)}║
║  📋  API:  http://localhost:${PORT}/api  ║
╚══════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      console.log('Server closed.');
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
