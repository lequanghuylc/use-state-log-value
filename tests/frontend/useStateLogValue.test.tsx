import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setLogServer, useStateLogValue } from '../../src/frontend/useStateLogValue';

function Counter() {
  const [count, setCount] = useStateLogValue(0, 'counter');
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount((v) => v + 1)}>inc</button>
    </div>
  );
}

describe('useStateLogValue', () => {
  it('logs when value changes to configured server', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchMock;

    setLogServer('https://example.com');

    render(<Counter />);
    fireEvent.click(screen.getByText('inc'));

    expect(screen.getByTestId('count').textContent).toBe('1');

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.com/ingest');
  });
});
