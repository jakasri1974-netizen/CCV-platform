import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no records matching your request at this time.',
  icon: Icon = Inbox,
  action = null,
  className = '',
}) {
  return (
    <div className={`p-10 text-center bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
