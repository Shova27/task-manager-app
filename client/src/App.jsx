import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { createTask, deleteTask, getTasks, reorderTasks, updateTask } from './api.js';
import { EmptyState } from './components/EmptyState.jsx';
import { FilterTabs } from './components/FilterTabs.jsx';
import { TaskForm } from './components/TaskForm.jsx';
import { TaskItem } from './components/TaskItem.jsx';

const filters = ['all', 'active', 'completed'];

export default function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const trimmedSearch = useMemo(() => search.trim().toLowerCase(), [search]);
  const counts = useMemo(() => getCounts(allTasks), [allTasks]);
  const progress = counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100);
  const visibleTasks = useMemo(
    () => allTasks.filter((task) => matchesCurrentView(task, filter, trimmedSearch)),
    [allTasks, filter, trimmedSearch]
  );
  const overdueCount = useMemo(() => allTasks.filter(isOverdue).length, [allTasks]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getTasks({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setAllTasks(normalizeOrder(response.data));
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => controller.abort();
  }, []);

  async function handleCreate(task) {
    setIsSaving(true);
    setError('');

    try {
      const response = await createTask(task);
      setAllTasks((current) => normalizeOrder([response.data, ...current]));
      showToast('Task added.');
      return true;
    } catch (requestError) {
      setError(requestError.message);
      showToast('Could not add task.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(id, updates) {
    setError('');

    const previousTasks = allTasks;
    const existingTask = previousTasks.find((task) => task.id === id);

    if (!existingTask) {
      return;
    }

    const optimisticTask = { ...existingTask, ...updates, updatedAt: new Date().toISOString() };
    setAllTasks((current) => current.map((task) => (task.id === id ? optimisticTask : task)));

    try {
      const response = await updateTask(id, updates);
      setAllTasks((current) => current.map((task) => (task.id === id ? response.data : task)));
      showToast(response.data.completed !== existingTask.completed ? 'Status updated.' : 'Task updated.');
    } catch (requestError) {
      setAllTasks(previousTasks);
      setError(requestError.message);
      showToast('Could not update task.', 'error');
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const visibleIds = visibleTasks.map((task) => task.id);
    const oldIndex = visibleIds.indexOf(active.id);
    const newIndex = visibleIds.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedVisibleIds = arrayMove(visibleIds, oldIndex, newIndex);
    const previousTasks = allTasks;
    const nextTasks = mergeVisibleOrder(previousTasks, visibleIds, reorderedVisibleIds);

    setAllTasks(nextTasks);

    try {
      await reorderTasks(nextTasks.map((task) => task.id));
      showToast('Task order saved.');
    } catch (requestError) {
      setAllTasks(previousTasks);
      setError(requestError.message);
      showToast('Could not save order.', 'error');
    }
  }

  async function confirmDelete() {
    if (!taskPendingDelete) {
      return;
    }
    setError('');

    const previousTasks = allTasks;
    setAllTasks((current) => current.filter((task) => task.id !== taskPendingDelete.id));

    try {
      await deleteTask(taskPendingDelete.id);
      showToast('Task deleted.');
      setTaskPendingDelete(null);
    } catch (requestError) {
      setAllTasks(previousTasks);
      setError(requestError.message);
      showToast('Could not delete task.', 'error');
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2400);
  }

  function focusQuickAdd() {
    const titleInput = document.querySelector('input[name="title"]');
    titleInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => titleInput?.focus(), 200);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 text-zinc-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-950 via-sky-900 to-emerald-800 text-white shadow-2xl shadow-sky-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(125,211,252,0.34),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(52,211,153,0.28),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.11),transparent_42%)]" />
          <div className="relative grid gap-8 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
            <div className="flex min-h-52 flex-col justify-between gap-8">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-50 shadow-sm backdrop-blur">
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                  Executive task command
                </div>
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  TaskFlow Studio
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-sky-50/90">
                  A focused operating board for priority work, completion momentum, and fast daily execution.
                </p>
              </div>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                <Metric label="Total" value={counts.total} />
                <Metric label="Active" value={counts.active} />
                <Metric label="Complete" value={`${progress}%`} />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-white/20 bg-white/15 p-5 shadow-xl shadow-sky-950/10 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-50/80">Completion</p>
                  <p className="mt-3 text-5xl font-semibold text-white">{counts.completed}</p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-300 to-cyan-300 text-slate-950 shadow-lg shadow-emerald-900/20">
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between text-sm text-sky-50/90">
                  <span>{counts.active} active</span>
                  <span>{overdueCount} overdue</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-amber-300 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <TaskForm onSubmit={handleCreate} isSaving={isSaving} />

          <div className="rounded-lg border border-white bg-white/90 p-4 shadow-sm shadow-slate-200/80 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70">
            <div className="grid gap-3">
              <label className="relative block">
                <span className="sr-only">Search tasks by title</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 pl-10 pr-3 text-sm font-medium text-zinc-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks"
                />
              </label>
              <FilterTabs filters={filters} activeFilter={filter} onChange={setFilter} />
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <section className="min-h-64">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Task List</h2>
              <p className="mt-1 text-sm text-zinc-500">{visibleTasks.length} visible of {counts.total}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Drag to reorder
            </span>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <Sparkles className="mb-4 h-9 w-9 animate-pulse text-emerald-500" aria-hidden="true" />
              <p className="text-base font-semibold text-zinc-800">Loading tasks...</p>
              <p className="mt-2 text-sm text-zinc-500">Backend target: localhost:4000.</p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <EmptyState filter={filter} hasSearch={Boolean(trimmedSearch)} onAddTask={focusQuickAdd} />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {visibleTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdate}
                      onDelete={setTaskPendingDelete}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </section>
      {taskPendingDelete && (
        <DeleteModal
          task={taskPendingDelete}
          onCancel={() => setTaskPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="group rounded-lg border border-white/20 bg-white/15 px-4 py-3 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/25 hover:shadow-xl hover:shadow-sky-950/10">
      <div className="text-xs font-semibold uppercase tracking-wide text-cyan-50/75 transition group-hover:text-white">{label}</div>
      <div className="mt-2 text-3xl font-semibold leading-none text-white">{value}</div>
    </div>
  );
}

function DeleteModal({ task, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-lg border border-rose-100 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Delete task?</h2>
              <p className="mt-1 text-sm text-zinc-500">This will permanently remove "{task.title}".</p>
            </div>
          </div>
          <button className="icon-button text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" type="button" onClick={onCancel} title="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white shadow-md shadow-rose-100 transition hover:bg-rose-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}

function Toast({ message, type }) {
  const success = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-xl">
      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {success ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <AlertCircle className="h-5 w-5" aria-hidden="true" />}
      </span>
      {message}
    </div>
  );
}

function normalizeOrder(tasks) {
  return tasks
    .map((task, index) => ({
      ...task,
      order: Number.isFinite(task.order) ? task.order : index
    }))
    .sort((a, b) => a.order - b.order);
}

function mergeVisibleOrder(tasks, visibleIds, reorderedVisibleIds) {
  const reorderedTasksById = new Map(reorderedVisibleIds.map((id, index) => [visibleIds[index], tasks.find((task) => task.id === id)]));
  const nextVisibleTasks = reorderedVisibleIds.map((id) => tasks.find((task) => task.id === id));
  let nextVisibleIndex = 0;

  return tasks
    .map((task) => (reorderedTasksById.has(task.id) ? nextVisibleTasks[nextVisibleIndex++] : task))
    .map((task, index) => ({ ...task, order: index }));
}

function matchesCurrentView(task, filter, search) {
  const matchesFilter =
    filter === 'all' ||
    (filter === 'active' && !task.completed) ||
    (filter === 'completed' && task.completed);
  const matchesSearch = !search || task.title.toLowerCase().includes(search);

  return matchesFilter && matchesSearch;
}

function getCounts(tasks) {
  return tasks.reduce(
    (counts, task) => {
      if (task.completed) {
        counts.completed += 1;
      } else {
        counts.active += 1;
      }

      return counts;
    },
    { active: 0, completed: 0, total: tasks.length }
  );
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}
