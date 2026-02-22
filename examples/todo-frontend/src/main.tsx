import React from 'react';
import ReactDOM from 'react-dom/client';
import { createUseState, setLogServer } from 'use-state-log-value';

// Logs go to local stateLogServer when you run: npx stateLogServer (or npm run server from repo root)
setLogServer('offline');

const useStateLogValue = createUseState('TodoApp');

type SubItem = { id: string; text: string; done: boolean };
type Todo = { id: string; title: string; done: boolean; subItems: SubItem[]; createdAt: string };
type Filter = 'all' | 'active' | 'done';
type SortBy = 'date' | 'title';

function nextId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const initialTodos: Todo[] = [
  {
    id: nextId(),
    title: 'Try use-state-log-value',
    done: false,
    createdAt: new Date().toISOString(),
    subItems: [
      { id: nextId(), text: 'Install from npm', done: true },
      { id: nextId(), text: 'Run stateLogServer', done: false },
    ],
  },
  {
    id: nextId(),
    title: 'Build a todo list',
    done: false,
    createdAt: new Date().toISOString(),
    subItems: [
      { id: nextId(), text: 'Add sub-items', done: true },
      { id: nextId(), text: 'Add comments', done: true },
    ],
  },
];

function TodoApp() {
  const [todos, setTodos] = useStateLogValue<Todo[]>(initialTodos, 'todos');
  const [comments, setComments] = useStateLogValue<Record<string, string[]>>({}, 'comments');
  const [filter, setFilter] = useStateLogValue<Filter>('all', 'filter');
  const [sortBy, setSortBy] = useStateLogValue<SortBy>('date', 'sortBy');
  const [searchQuery, setSearchQuery] = useStateLogValue('', 'searchQuery');
  const [newTodoTitle, setNewTodoTitle] = useStateLogValue('', 'newTodoTitle');
  const [subItemDraft, setSubItemDraft] = useStateLogValue<Record<string, string>>({}, 'subItemDraft');
  const [commentDraft, setCommentDraft] = useStateLogValue<Record<string, string>>({}, 'commentDraft');

  const addTodo = () => {
    const title = newTodoTitle.trim();
    if (!title) return;
    setTodos((prev) => [
      ...prev,
      { id: nextId(), title, done: false, subItems: [], createdAt: new Date().toISOString() },
    ]);
    setNewTodoTitle('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addSubItem = (todoId: string) => {
    const text = subItemDraft[todoId]?.trim();
    if (!text) return;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, subItems: [...t.subItems, { id: nextId(), text, done: false }] }
          : t
      )
    );
    setSubItemDraft((prev) => ({ ...prev, [todoId]: '' }));
  };

  const toggleSubItem = (todoId: string, subId: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, subItems: t.subItems.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) }
          : t
      )
    );
  };

  const addComment = (todoId: string) => {
    const draft = commentDraft[todoId]?.trim();
    if (!draft) return;
    setComments((prev) => ({
      ...prev,
      [todoId]: [...(prev[todoId] ?? []), draft],
    }));
    setCommentDraft((prev) => ({ ...prev, [todoId]: '' }));
  };

  const filteredAndSorted = React.useMemo(() => {
    let list = todos.filter((t) => {
      const matchFilter =
        filter === 'all' || (filter === 'active' && !t.done) || (filter === 'done' && t.done);
      const matchSearch =
        !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
    list = [...list].sort((a, b) =>
      sortBy === 'date'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : a.title.localeCompare(b.title)
    );
    return list;
  }, [todos, filter, searchQuery, sortBy]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Todo list</h1>
      <p style={{ color: '#666', fontSize: 14 }}>
        Uses <code>use-state-log-value</code> from npm with <code>setLogServer('offline')</code>.
        Run <code>npx stateLogServer</code> to see logs in <code>.log-values/</code>.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="New todo"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          style={{ flex: 1, padding: 8 }}
        />
        <button type="button" onClick={addTodo} style={{ padding: '8px 16px' }}>
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search todos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: 8, minWidth: 160 }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{ padding: 8 }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="done">Done</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{ padding: 8 }}
        >
          <option value="date">Sort by date</option>
          <option value="title">Sort by title</option>
        </select>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredAndSorted.map((todo) => (
          <li
            key={todo.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              background: todo.done ? '#f5f5f5' : '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ flex: 1, textDecoration: todo.done ? 'line-through' : undefined }}>
                {todo.title}
              </span>
            </div>
            {todo.subItems.length > 0 && (
              <ul style={{ margin: '8px 0 0 24px', padding: 0, fontSize: 14, color: '#555' }}>
                {todo.subItems.map((sub) => (
                  <li key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => toggleSubItem(todo.id, sub.id)}
                    />
                    <span style={{ textDecoration: sub.done ? 'line-through' : undefined }}>
                      {sub.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Add sub-item"
                value={subItemDraft[todo.id] ?? ''}
                onChange={(e) =>
                  setSubItemDraft((prev) => ({ ...prev, [todo.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSubItem(todo.id);
                }}
                style={{ width: '100%', padding: 6, fontSize: 13 }}
              />
            </div>
            <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Comments</div>
              {(comments[todo.id] ?? []).map((c, i) => (
                <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>
                  {c}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={commentDraft[todo.id] ?? ''}
                  onChange={(e) =>
                    setCommentDraft((prev) => ({ ...prev, [todo.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addComment(todo.id);
                  }}
                  style={{ flex: 1, padding: 6, fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={() => addComment(todo.id)}
                  style={{ padding: '6px 12px', fontSize: 13 }}
                >
                  Add comment
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TodoApp />
  </React.StrictMode>
);
