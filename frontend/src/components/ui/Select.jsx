import React from 'react';

export default function Select({
  label,
  options = [],
  error,
  helperText,
  className = '',
  required = false,
  children,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <select
        className={`w-full bg-white border ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
        } rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-4 transition duration-150 ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt, i) =>
              typeof opt === 'string' ? (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value || i} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
      </select>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
