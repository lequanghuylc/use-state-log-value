#!/usr/bin/env node
import { startOfflineFileServer } from './offlineServer';

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`stateLogServer - local offline ingest server for use-state-log-value

Usage:
  stateLogServer [--port <number>] [--help]

Options:
  --port <number>   Port for local server (default: 8787)
  --help            Show this help message

Environment variables:
  STATE_LOG_SERVER_PORT   Default port when --port is not provided
  STATE_LOG_READ_DAYS     Days of rotated logs scanned by GET /states (default: 3)

Behavior:
  - Writes logs to ./.log-values/backend-YYYY-MM-DD.log
  - Exposes POST /ingest and GET /states
`);
}

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

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

void startOfflineFileServer(resolvePort(args));
