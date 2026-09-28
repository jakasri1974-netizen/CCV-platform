import React from 'react';
import { CheckCircle2, Clock, Ban, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Badge({ status = 'VERIFIED', text = null }) {
  const normStatus = (status || '').toUpperCase();

  const configs = {
    VERIFIED: {
      label: text || 'BLOCKCHAIN VERIFIED',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    },
    CONFIRMED: {
      label: text || 'CONFIRMED ON POLYGON',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    },
    ANCHORED: {
      label: text || 'ANCHORED ON POLYGON',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: ShieldCheck,
      dot: 'bg-indigo-500',
    },
    GENERATED: {
      label: text || 'MERKLE ROOT GENERATED',
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: ShieldCheck,
      dot: 'bg-indigo-500',
    },
    PENDING: {
      label: text || 'PENDING ANCHOR',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500',
    },
    REVOKED: {
      label: text || 'REVOKED',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: Ban,
      dot: 'bg-rose-500',
    },
    INVALID: {
      label: text || 'INVALID RECORD',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertTriangle,
      dot: 'bg-rose-500',
    },
  };

  const config = configs[normStatus] || {
    label: text || normStatus || 'ACTIVE',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CheckCircle2,
    dot: 'bg-slate-500',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold tracking-tight ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
