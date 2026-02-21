import express from 'express';
import { createFileStore } from './storage/fileStore';
import { LogEvent } from './storage/types';

export async function startOfflineFileServer(port: number): Promise<ReturnType<import('express').Express['listen']>> {
  const store = createFileStore({
    prefix: 'backend',
    readDays: Number(process.env.STATE_LOG_READ_DAYS ?? 3),
  });
  await store.init();

  const app = express();
  app.use(express.json({ limit: '2mb' }));

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
      res.json({ ok: true });
    } catch {
      res.status(500).json({ ok: false, error: 'ingest failed' });
    }
  });

  app.get('/states', async (_req, res) => {
    const components = await store.getLatestByComponent();
    res.json({ ok: true, components });
  });

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[stateLogServer] running at http://127.0.0.1:${port}`);
  });
}
