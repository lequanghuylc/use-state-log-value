# use-state-log-value

A small utility package with:

- `useStateLogValue` for frontend React state-change logging
- `createStateLogger` for backend state-change tracking

## Install

```bash
npm install
```

## Test

```bash
npm test
npm run test:frontend
npm run test:backend
```

## Examples

Frontend demo (2-page IMDb app: list + details):

```bash
npm run example:frontend
```

Backend demo:

```bash
npm run example:backend
```

## Cypress E2E (records video)

```bash
npm run example:frontend
# in another terminal
npm run cypress:run
```

Video output:

`cypress/videos/**/*.mp4`
