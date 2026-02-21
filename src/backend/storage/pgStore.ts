import { Pool } from 'pg';
import { LatestComponentStates, LogEvent, LogStore } from './types';

export function createPgStore(databaseUrl: string): LogStore {
  const pool = new Pool({ connectionString: databaseUrl });

  return {
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS state_logs (
          id BIGSERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          component_name TEXT NOT NULL,
          key TEXT NOT NULL,
          value JSONB NOT NULL,
          value_hash TEXT NOT NULL,
          is_error BOOLEAN NOT NULL DEFAULT false,
          meta JSONB,
          client_ts TIMESTAMPTZ,
          source TEXT NOT NULL DEFAULT 'frontend'
        );
        CREATE INDEX IF NOT EXISTS idx_state_logs_component_key_created
          ON state_logs (component_name, key, created_at DESC);
      `);
    },

    async insert(e) {
      await pool.query(
        `INSERT INTO state_logs (component_name, key, value, value_hash, is_error, meta, client_ts, source)
         VALUES ($1, $2, $3::jsonb, $4, $5, $6::jsonb, $7, $8)`,
        [
          e.componentName,
          e.key,
          JSON.stringify(e.value),
          e.valueHash,
          e.isError,
          e.meta ? JSON.stringify(e.meta) : null,
          e.clientTs ? new Date(e.clientTs) : null,
          e.source,
        ]
      );
    },

    async getLatestByComponent(): Promise<LatestComponentStates[]> {
      const { rows } = await pool.query(`
        WITH latest AS (
          SELECT DISTINCT ON (component_name, key)
            component_name, key, value, is_error, meta, created_at
          FROM state_logs
          ORDER BY component_name, key, created_at DESC
        )
        SELECT * FROM latest ORDER BY component_name, key;
      `);

      const grouped = new Map<string, LatestComponentStates>();
      for (const r of rows) {
        if (!grouped.has(r.component_name)) grouped.set(r.component_name, { componentName: r.component_name, states: [] });
        grouped.get(r.component_name)!.states.push({
          key: r.key,
          value: r.value,
          isError: r.is_error,
          meta: r.meta,
          serverTs: new Date(r.created_at).toISOString(),
        });
      }
      return [...grouped.values()];
    },
  };
}
