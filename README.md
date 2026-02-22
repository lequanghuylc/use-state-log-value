# use-state-log-value

State logging for React with a clean one-line hook API, plus optional backend server utilities.

## Features

- Per-component state logging: `createUseState('ComponentName')` returns a `useState`-like hook that logs with that component name
- Global logger config: `setLogServer('offline')` or `setLogServer('https://...')`
- `offline` mode (dev only): sends logs to local `stateLogServer`
- Generated local CLI binary: `./node_modules/.bin/stateLogServer`
- Local server writes logs to `./.log-values/` with daily rotation (`backend-YYYY-MM-DD.log`)
- Backend API: `POST /ingest`, `GET /states`
- Backend helper exports: `startServer(port)`, `setUpNotification(...)`
- Optional Telegram notification for error logs
- Jest tests + frontend demo + Cypress video flow
- **Cursor rule**: on install, a rule file is copied to your project’s `.cursor/rules/` so Cursor can use the library correctly. If you use `--ignore-scripts` or the rule wasn’t installed, run: `npx use-state-log-value-install-rules`

## Install

```bash
npm install use-state-log-value
```

## Frontend usage

Create a hook per component so logs are tagged with the correct component name:

```ts
import { createUseState, setLogServer } from 'use-state-log-value';

setLogServer('offline');
// or
setLogServer('https://some-remote-server.com');

const useStateLogValue = createUseState('Filters');
```

```tsx
function Filters() {
  const [type, setType] = useStateLogValue<'all' | 'movie' | 'tv'>('all', 'imdb-filter');
  const [query, setQuery] = useStateLogValue('', 'search-query');

  return (
    <>
      <button onClick={() => setType('movie')}>Movie</button>
      <button onClick={() => setType('tv')}>TV Series</button>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </>
  );
}
```

## Offline mode local server

`setLogServer('offline')` is active only when `NODE_ENV=development`.

Start the local server:

```bash
./node_modules/.bin/stateLogServer
# or
npx stateLogServer
# optional
npx stateLogServer --port 8787
# help
npx stateLogServer --help
```

This writes logs to:

- `./.log-values/backend-YYYY-MM-DD.log`

### Environment variables

- `STATE_LOG_SERVER_PORT`: default local server port if `--port` is not provided
- `STATE_LOG_READ_DAYS`: number of rotated log days scanned by `GET /states` (default: `3`)

## Backend usage

```ts
import { startServer, setUpNotification } from 'use-state-log-value/backend';

startServer(3000);

setUpNotification({
  telegramBotToken: '...',
  groupId: -1001234567890,
  topicId: 3,
});
```

## Test

```bash
npm test
npm run test:frontend
npm run test:backend
```

## Examples

```bash
npm run example:frontend
npm run example:backend
```

## Cypress E2E

```bash
npm run example:frontend
npm run cypress:run
```
