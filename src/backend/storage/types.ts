export type LogEvent = {
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

export type LatestComponentStates = {
  componentName: string;
  states: Array<{
    key: string;
    value: unknown;
    isError: boolean;
    meta: Record<string, unknown> | null;
    serverTs: string;
  }>;
};

export type LogStore = {
  init(): Promise<void>;
  insert(event: LogEvent): Promise<void>;
  getLatestByComponent(): Promise<LatestComponentStates[]>;
};
