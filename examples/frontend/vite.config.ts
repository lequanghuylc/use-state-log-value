import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

type LogEntry = {
  message: string;
  meta: {
    prev: unknown;
    next: unknown;
    label?: string;
  };
  timestamp: string;
};

const logs: LogEntry[] = [];

function logApiPlugin(): Plugin {
  return {
    name: 'log-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        if (req.method === 'GET' && req.url === '/api/logs') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ count: logs.length, logs }, null, 2));
          return;
        }

        if (req.method === 'POST' && req.url === '/api/logs') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              logs.push({
                message: String(parsed.message ?? ''),
                meta: {
                  prev: parsed.prev,
                  next: parsed.next,
                  label: parsed.label,
                },
                timestamp: String(parsed.timestamp ?? new Date().toISOString()),
              });
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, count: logs.length }));
            } catch (error) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react(), logApiPlugin()],
  server: {
    port: 4173,
  },
});
