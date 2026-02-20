import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export type StateLogger<T> = (message: string, meta: { prev: T; next: T; label?: string }) => void;

export interface UseStateLogValueOptions<T> {
  label?: string;
  logger?: StateLogger<T>;
  format?: (prev: T, next: T, label?: string) => string;
}

const defaultLogger: StateLogger<any> = (message) => {
  // eslint-disable-next-line no-console
  console.log(message);
};

export function useStateLogValue<T>(
  initialValue: T,
  options: UseStateLogValueOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const prevRef = useRef<T>(initialValue);

  useEffect(() => {
    const prev = prevRef.current;
    if (Object.is(prev, value)) return;

    const logger = options.logger ?? defaultLogger;
    const labelPart = options.label ? `[${options.label}] ` : '';
    const message =
      options.format?.(prev, value, options.label) ??
      `${labelPart}state changed from ${JSON.stringify(prev)} to ${JSON.stringify(value)}`;

    logger(message, { prev, next: value, label: options.label });
    prevRef.current = value;
  }, [value, options]);

  return [value, setValue];
}
