import { createServer } from 'node:http';
import app from './app.js';
import { closeDb } from './config/database.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`[Auth Server] Running on http://localhost:${PORT}`);
  console.log(`[Auth Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[Auth Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    closeDb();
    console.log('[Auth Server] Closed.');
    process.exit(0);
  });

  // Force exit after 5s
  setTimeout(() => {
    console.error('[Auth Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
