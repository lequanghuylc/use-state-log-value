import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

type LogServerMode = 'offline' | string;
let logServer: LogServerMode | null = null;

export function setLogServer(server: LogServerMode): void {
  logServer = server;
}

const isDev = (): boolean => {
  if (typeof window !== 'undefined') return true;
  return typeof process !== 'undefined' && Boolean(process.env) && process.env.NODE_ENV === 'development';
};

const stableStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  const normalize = (input: unknown): unknown => {
    if (input === null || typeof input !== 'object') return input;
    if (Array.isArray(input)) return input.map(normalize);
    if (input instanceof Date) return { $date: input.toISOString() };

    if (seen.has(input)) return '[Circular]';
    seen.add(input);

    const obj = input as Record<string, unknown>;
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = normalize(obj[key]);
        return acc;
      }, {});
  };

  try {
    return JSON.stringify(normalize(value));
  } catch {
    return JSON.stringify({ $unstringifiable: true });
  }
};

const getIngestUrl = (): string | null => {
  if (!logServer) return null;

  if (logServer === 'offline') {
    if (!isDev()) return null;

    const envPort = typeof process !== 'undefined' ? Number(process.env?.STATE_LOG_SERVER_PORT) : NaN;
    const browserPort = typeof window !== 'undefined' ? Number((window as any).__STATE_LOG_SERVER_PORT__) : NaN;
    const port = Number.isFinite(envPort) && envPort > 0 ? envPort : Number.isFinite(browserPort) && browserPort > 0 ? browserPort : 8787;

    return `http://127.0.0.1:${port}/ingest`;
  }

  return logServer.endsWith('/ingest') ? logServer : `${logServer.replace(/\/+$/, '')}/ingest`;
};

function createUseStateLogValue(componentName: string) {
  return function useStateLogValue<T>(initialValue: T, label = 'state'): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(initialValue);
    const prevRef = useRef<T>(initialValue);
    const lastHashRef = useRef<string>('');

    useEffect(() => {
      const prev = prevRef.current;
      if (Object.is(prev, value)) return;

      const valueHash = stableStringify(value);
      if (lastHashRef.current === valueHash) return;

      const payload = {
        componentName,
        key: label,
        value,
        valueHash,
        isError: false,
        meta: { prev },
        clientTs: new Date().toISOString(),
        source: 'frontend',
      };

      const url = getIngestUrl();
      if (url) {
        void fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => undefined);
      }

      prevRef.current = value;
      lastHashRef.current = valueHash;
    }, [value, label]);

    return [value, setValue];
  };
}

export function createUseState(componentName: string) {
  return createUseStateLogValue(componentName);
}
