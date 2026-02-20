export type BackendLogger<T> = (payload: {
  scope?: string;
  key: string;
  prev: T;
  next: T;
  timestamp: string;
}) => void;

export interface BackendStateLogger<T extends Record<string, any>> {
  update: (key: keyof T & string, next: T[keyof T]) => void;
  getState: () => T;
}

export function createStateLogger<T extends Record<string, any>>(
  initialState: T,
  logger: BackendLogger<any>
): BackendStateLogger<T> {
  let state = { ...initialState };

  return {
    update(key, next) {
      const prev = state[key];
      if (Object.is(prev, next)) return;

      state = { ...state, [key]: next };

      logger({
        key,
        prev,
        next,
        timestamp: new Date().toISOString(),
      });
    },
    getState() {
      return state;
    },
  };
}
