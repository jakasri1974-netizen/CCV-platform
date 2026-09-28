import React from 'react';

export default function Table({
  headers = [],
  children,
  emptyMessage = 'No records found matching criteria.',
  isEmpty = false,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`p-3.5 ${i === 0 ? 'pl-5' : ''} ${i === headers.length - 1 ? 'pr-5 text-right' : ''} ${
                    h.className || ''
                  }`}
                >
                  {typeof h === 'string' ? h : h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length || 10} className="text-center p-8 text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
