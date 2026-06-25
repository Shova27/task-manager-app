import React from 'react';
import { CalendarDays, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  title: '',
  description: '',
  dueDate: ''
};

export function TaskForm({ onSubmit, isSaving }) {
  const [form, setForm] = useState(initialForm);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const wasCreated = await onSubmit({
      title: form.title,
      description: form.description,
      dueDate: form.dueDate || null
    });

    if (wasCreated) {
      setForm(initialForm);
    }
  }

  return (
    <form
      className="rounded-lg border border-white bg-white/90 p-4 shadow-sm shadow-slate-200/80 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/70"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_12rem_auto] xl:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Task</span>
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-zinc-950 outline-none transition duration-200 placeholder:text-slate-400 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            name="title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Add a high-priority task"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Notes</span>
          <span className="relative block">
            <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 pl-10 pr-3 text-sm text-zinc-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Optional"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Due</span>
          <span className="relative block">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 pl-10 pr-3 text-sm text-zinc-900 outline-none transition duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              value={form.dueDate}
              onChange={(event) => updateField('dueDate', event.target.value)}
              type="date"
            />
          </span>
        </label>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-100 transition duration-200 hover:-translate-y-0.5 hover:from-sky-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-sky-200 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
          disabled={isSaving || !form.title.trim()}
          title={!form.title.trim() ? 'Enter a task title' : 'Add task'}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Adding' : 'Add'}
        </button>
      </div>
    </form>
  );
}
