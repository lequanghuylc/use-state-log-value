#!/usr/bin/env node
import { startOfflineFileServer } from './offlineServer';

function resolvePort(argv: string[]): number {
  const i = argv.indexOf('--port');
  if (i !== -1 && argv[i + 1]) {
    const n = Number(argv[i + 1]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  if (process.env.STATE_LOG_SERVER_PORT) {
    const n = Number(process.env.STATE_LOG_SERVER_PORT);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return 8787;
}

void startOfflineFileServer(resolvePort(process.argv.slice(2)));
