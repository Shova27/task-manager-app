import React from 'react';

export function FilterTabs({ filters, activeFilter, onChange }) {
  return (
    <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white/80 p-1 shadow-inner shadow-slate-100" aria-label="Task status filter">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`rounded-md px-3 py-2.5 text-sm font-semibold capitalize transition duration-200 ${
            activeFilter === filter
              ? 'bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-md shadow-sky-100'
              : 'text-slate-600 hover:-translate-y-0.5 hover:bg-sky-50 hover:text-sky-700'
          }`}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
