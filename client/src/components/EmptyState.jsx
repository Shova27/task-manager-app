import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

export function EmptyState({ filter, hasSearch, onAddTask }) {
  const message = hasSearch
    ? 'No tasks match that search.'
    : filter === 'completed'
      ? 'No completed tasks yet.'
      : filter === 'active'
        ? 'No active tasks right now.'
        : 'Create your first task above.';

  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <ClipboardList className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-950">No tasks here</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">{message}</p>
      {!hasSearch && (
        <button
          type="button"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition duration-200 hover:-translate-y-0.5 hover:from-sky-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-sky-200"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Task
        </button>
      )}
    </div>
  );
}
