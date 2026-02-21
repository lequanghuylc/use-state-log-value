import express from 'express';
import { createFileStore } from './storage/fileStore';
import { createPgStore } from './storage/pgStore';
import { LogEvent, LogStore } from './storage/types';
import { sendTelegramMessage, TelegramConfig } from './notify/telegram';

let telegramConfig: TelegramConfig | null = null;

export function setTelegramConfig(config: TelegramConfig): void {
  telegramConfig = config;
}

async function getStore(): Promise<LogStore> {
  if (process.env.DATABASE_URL) {
    const pg = createPgStore(process.env.DATABASE_URL);
    await pg.init();
    return pg;
  }

  const file = createFileStore({
    prefix: 'backend',
    readDays: Number(process.env.STATE_LOG_READ_DAYS ?? 3),
  });
  await file.init();
  return file;
}

export async function startServer(port: number): Promise<ReturnType<import('express').Express['listen']>> {
  const store = await getStore();
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/ingest', async (req, res) => {
    const b = req.body ?? {};
    if (!b.valueHash) return res.status(400).json({ ok: false, error: 'valueHash is required' });

    const event: LogEvent = {
      componentName: String(b.componentName ?? 'UnknownComponent'),
      key: String(b.key ?? 'state'),
      value: b.value ?? null,
      valueHash: String(b.valueHash),
      isError: Boolean(b.isError),
      meta: (b.meta ?? null) as Record<string, unknown> | null,
      clientTs: b.clientTs ? new Date(b.clientTs).toISOString() : null,
      serverTs: new Date().toISOString(),
      source: String(b.source ?? 'frontend'),
    };

    try {
      await store.insert(event);
      if (event.isError && telegramConfig) {
        void sendTelegramMessage(
          telegramConfig,
          `State log error\nComponent: ${event.componentName}\nKey: ${event.key}\nValue: ${JSON.stringify(event.value).slice(0, 500)}`
        );
      }
      res.json({ ok: true });
    } catch {
      res.status(500).json({ ok: false, error: 'ingest failed' });
    }
  });

  app.get('/states', async (_req, res) => {
    try {
      const components = await store.getLatestByComponent();
      res.json({ ok: true, components });
    } catch {
      res.status(500).json({ ok: false, error: 'states failed' });
    }
  });

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[use-state-log-value] server listening on :${port}`);
  });
}
