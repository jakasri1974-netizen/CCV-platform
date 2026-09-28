import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function MetaMaskConnect() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Polygon Amoy Active</span>
      </div>

      <div className="hidden lg:flex items-center bg-slate-900 text-white rounded-full px-3 py-1 text-xs font-medium border border-slate-800 shadow-sm">
        <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
        <span className="text-slate-300">Backend Signer</span>
      </div>
    </div>
  );
}
