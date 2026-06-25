import React from 'react';
import { CalendarDays, Check, GripVertical, Pencil, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function TaskItem({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate || ''
  });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const overdue = isOverdue(task);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  function resetDraft() {
    setDraft({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || ''
    });
  }

  async function saveChanges(event) {
    event.preventDefault();

    if (!draft.title.trim()) {
      return;
    }

    await onUpdate(task.id, {
      title: draft.title,
      description: draft.description,
      dueDate: draft.dueDate || null
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style} className="rounded-lg border border-sky-200 bg-white p-4 shadow-lg shadow-sky-100/60">
        <form className="grid gap-3" onSubmit={saveChanges}>
          <label>
            <span className="sr-only">Task title</span>
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 px-3 text-sm font-semibold outline-none transition duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            <span className="sr-only">Task description</span>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none transition duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Optional notes"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="sm:w-48">
              <span className="sr-only">Due date</span>
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-white/80 px-3 text-sm outline-none transition duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-sm focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                value={draft.dueDate}
                onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
                type="date"
              />
            </label>
            <div className="flex gap-2">
              <button
                className="icon-button bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-md shadow-sky-100 hover:-translate-y-0.5 hover:shadow-lg"
                type="submit"
                title="Save task"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                className="icon-button border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                type="button"
                title="Cancel edit"
                onClick={() => {
                  resetDraft();
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg border bg-white/95 p-4 shadow-sm shadow-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/70 ${
        isDragging ? 'relative z-20 scale-[1.01] border-emerald-300 shadow-xl' : overdue ? 'border-rose-200' : task.completed ? 'border-emerald-100' : 'border-white'
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${overdue ? 'bg-rose-400' : task.completed ? 'bg-emerald-400' : 'bg-sky-400'}`} />
      <div className="grid gap-3 pl-1 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <button
          className="icon-button cursor-grab border border-slate-200 bg-slate-50 text-slate-400 transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 active:cursor-grabbing"
          type="button"
          title="Reorder task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <button
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition ${
                task.completed
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                  : 'border-slate-300 bg-white text-transparent hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
              type="button"
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              onClick={() => onUpdate(task.id, { completed: !task.completed })}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h3 className={`break-words text-base font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-950'}`}>
                {task.title}
              </h3>
              {task.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{task.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                {task.dueDate && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${overdue ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-sky-100 bg-sky-50 text-slate-600'}`}>
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                {task.completed && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Complete
                  </span>
                )}
                {overdue && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Overdue
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:ml-4">
          <button
            className="icon-button border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-md"
            type="button"
            title="Edit task"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            className="icon-button border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md"
            type="button"
            title="Delete task"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
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

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}
