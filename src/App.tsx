import { useEffect, useRef, useState } from 'react';
import './App.css';

type Task = {
  id: string;
  text: string;
  createdAt: number;
};

const STORAGE_KEY = '@sticknotes:tasks';
const LEGACY_KEY = '@projectreact';

function loadInitialTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Task[];

    // Migrate legacy format (string[]) to the new one (Task[])
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as string[];
      return arr.map((text) => ({
        id: crypto.randomUUID(),
        text,
        createdAt: Date.now(),
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [value, setValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const isEditing = editingId !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;

    if (isEditing) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, text } : t))
      );
      setEditingId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        { id: createId(), text, createdAt: Date.now() },
      ]);
    }
    setValue('');
    inputRef.current?.focus();
  }

  function handleEdit(task: Task) {
    setValue(task.text);
    setEditingId(task.id);
    inputRef.current?.focus();
  }

  function handleCancel() {
    setValue('');
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) handleCancel();
  }

  const filtered = tasks.filter((t) =>
    t.text.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">StickNotes</h1>
        <p className="counter" aria-live="polite">
          {tasks.length === 0 && 'No pending tasks'}
          {tasks.length === 1 && 'You have 1 pending task'}
          {tasks.length > 1 && `You have ${tasks.length} pending tasks`}
        </p>
      </header>

      <form className="inputInfo" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="task-input">
          New task
        </label>
        <input
          id="task-input"
          ref={inputRef}
          className="input"
          placeholder="Type a task and press Enter"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={140}
        />
        <div className="formActions">
          <button className="button" type="submit" disabled={!value.trim()}>
            {isEditing ? 'Update task' : 'Add task'}
          </button>
          {isEditing && (
            <button className="button ghost" type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      {filtered.length === 0 && (
        <p className="empty">
          {tasks.length === 0
            ? 'Start by adding your first note above.'
            : 'No results for this search.'}
        </p>
      )}

      {filtered.map((task) => (
        <section key={task.id} className="stickers">
          <div className="info">
            <span>{task.text}</span>
          </div>
          <div className="actionButtons">
            <button
              className="editar"
              type="button"
              onClick={() => handleEdit(task)}
            >
              Edit
            </button>
            <button
              className="excluir"
              type="button"
              onClick={() => handleDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}