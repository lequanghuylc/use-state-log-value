import React from 'react';
import ReactDOM from 'react-dom/client';
import { useStateLogValue } from '../../../src/frontend/useStateLogValue';

function App() {
  const [value, setValue] = useStateLogValue(0, { label: 'example-counter' });

  return (
    <div style={{ fontFamily: 'Arial', padding: 24 }}>
      <h1>use-state-log-value example</h1>
      <p data-cy="value">Current value: {value}</p>
      <button data-cy="inc" onClick={() => setValue((v) => v + 1)}>Increment</button>
      <button data-cy="dec" onClick={() => setValue((v) => v - 1)} style={{ marginLeft: 12 }}>Decrement</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
