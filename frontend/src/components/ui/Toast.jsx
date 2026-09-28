import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    error: 'bg-rose-900 text-rose-100 border-rose-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
    info: 'bg-slate-900 text-slate-100 border-slate-700',
  };

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const IconComp = icons[type] || Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl ${styles[type]} text-xs`}>
        <IconComp className="w-5 h-5 shrink-0" />
        <p className="flex-1 font-medium">{message}</p>
        {onClose && (
          <button onClick={onClose} className="opacity-70 hover:opacity-100 transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
