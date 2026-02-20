import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useStateLogValue } from '../../src/frontend/useStateLogValue';

function Counter({ logger }: { logger: any }) {
  const [count, setCount] = useStateLogValue(0, { label: 'counter', logger });
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((v) => v + 1)}>inc</button>
    </div>
  );
}

describe('useStateLogValue', () => {
  it('logs when value changes', () => {
    const logger = jest.fn();
    render(<Counter logger={logger} />);

    fireEvent.click(screen.getByText('inc'));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0][1]).toMatchObject({ prev: 0, next: 1, label: 'counter' });
  });
});
