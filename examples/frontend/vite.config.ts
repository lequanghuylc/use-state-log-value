import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

type LogEntry = {
  componentName: string;
  key: string;
  value: unknown;
  valueHash: string;
  isError: boolean;
  meta: Record<string, unknown> | null;
  clientTs: string | null;
  serverTs: string;
  source: string;
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

        if (req.method === 'POST' && (req.url === '/api/logs' || req.url === '/api/logs/ingest')) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              logs.push({
                componentName: String(parsed.componentName ?? 'ReactComponent'),
                key: String(parsed.key ?? 'state'),
                value: parsed.value,
                valueHash: String(parsed.valueHash ?? ''),
                isError: Boolean(parsed.isError),
                meta: (parsed.meta ?? null) as Record<string, unknown> | null,
                clientTs: parsed.clientTs ? String(parsed.clientTs) : null,
                serverTs: new Date().toISOString(),
                source: String(parsed.source ?? 'frontend'),
              });
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, count: logs.length }));
            } catch {
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
