# Todo list example

This example uses **use-state-log-value** from npm with `setLogServer('offline')`. It demonstrates multiple logged state values: todos (with sub-items), comments, filter, sort, search, and drafts.

## Run

From the **monorepo root**:

```bash
npm run example:todo
```

This installs dependencies (including `use-state-log-value` from npm) in this folder and starts the Vite dev server at http://localhost:4174.

To see state changes in logs, start the offline log server in another terminal (from repo root):

```bash
npm run server
```

Logs are written to `./.log-values/backend-YYYY-MM-DD.log` in the directory where you ran `npm run server`.

## Or run from this folder

```bash
cd examples/todo-frontend
npm install
npm run dev
```

In another terminal (from repo root): `npm run server`.

## Features (all state is logged)

- **todos** – list of todos with sub-items (each sub-item can be checked)
- **comments** – comments per todo (separate state)
- **filter** – all / active / done
- **sortBy** – date or title
- **searchQuery** – search filter
- **newTodoTitle** – draft for new todo title
- **subItemDraft** – draft for new sub-item per todo
- **commentDraft** – draft for new comment per todo
