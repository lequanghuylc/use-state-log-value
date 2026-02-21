import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LatestComponentStates, LogEvent, LogStore } from './types';

type FileStoreOptions = {
  dirName?: string;
  prefix?: string;
  readDays?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
const dayStamp = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function createFileStore(options: FileStoreOptions = {}): LogStore {
  const dir = path.resolve(process.cwd(), options.dirName ?? '.log-values');
  const prefix = options.prefix ?? 'backend';
  const readDays = options.readDays ?? 3;

  const fileForDay = (d: Date) => path.join(dir, `${prefix}-${dayStamp(d)}.log`);

  return {
    async init() {
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(fileForDay(new Date()), '');
    },

    async insert(event) {
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(fileForDay(new Date()), JSON.stringify(event) + '\n', 'utf8');
    },

    async getLatestByComponent(): Promise<LatestComponentStates[]> {
      const latest = new Map<string, LogEvent>();
      const now = new Date();

      for (let i = readDays - 1; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const file = fileForDay(day);
        try {
          const content = await fs.readFile(file, 'utf8');
          for (const line of content.split('\n')) {
            if (!line.trim()) continue;
            try {
              const e = JSON.parse(line) as LogEvent;
              const k = `${e.componentName}::${e.key}`;
              const prev = latest.get(k);
              if (!prev || prev.serverTs < e.serverTs) latest.set(k, e);
            } catch {
              // ignore invalid line
            }
          }
        } catch {
          // ignore missing day file
        }
      }

      const grouped = new Map<string, LatestComponentStates>();
      for (const e of latest.values()) {
        if (!grouped.has(e.componentName)) grouped.set(e.componentName, { componentName: e.componentName, states: [] });
        grouped.get(e.componentName)!.states.push({
          key: e.key,
          value: e.value,
          isError: e.isError,
          meta: e.meta,
          serverTs: e.serverTs,
        });
      }

      return [...grouped.values()].sort((a, b) => a.componentName.localeCompare(b.componentName));
    },
  };
}
