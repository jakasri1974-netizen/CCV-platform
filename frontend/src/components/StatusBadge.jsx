import React from 'react';
import { ShieldCheck, AlertCircle, Ban, Clock } from 'lucide-react';

export default function StatusBadge({ status, size = 'normal' }) {
  const isLarge = size === 'large';
  const paddingClass = isLarge ? 'px-4 py-1.5 text-sm font-bold' : 'px-2.5 py-0.5 text-xs font-semibold';

  if (status === 'VERIFIED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm verified-glow ${paddingClass}`}>
        <ShieldCheck className={isLarge ? 'w-5 h-5 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
        <span>BLOCKCHAIN VERIFIED</span>
      </span>
    );
  }

  if (status === 'REVOKED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-sm ${paddingClass}`}>
        <Ban className={isLarge ? 'w-5 h-5 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />
        <span>REVOKED</span>
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm ${paddingClass}`}>
        <Clock className={isLarge ? 'w-5 h-5 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>PENDING CONFIRMATION</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-sm ${paddingClass}`}>
      <AlertCircle className={isLarge ? 'w-5 h-5 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
      <span>{status || 'UNVERIFIED'}</span>
    </span>
  );
}
