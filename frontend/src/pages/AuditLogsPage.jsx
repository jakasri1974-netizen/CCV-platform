import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import SearchableSelect from '../components/ui/SearchableSelect';
import {
  ClipboardList,
  Search,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Award,
  Users,
  FileCheck,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Sample system audit trail events
  const [logs] = useState([
    {
      id: 'LOG-10928',
      action: 'CERTIFICATE_ISSUED',
      description: 'Issued Degree Certificate BCERT-TN-2026-000001 for Student STU-1001 (Arun Kumar)',
      actor: 'Admin (CEG Registrar)',
      timestamp: '2026-09-22 11:42:10',
      category: 'Issuance',
      status: 'SUCCESS',
      hash: '0xea2f8c05...61b88ce5',
    },
    {
      id: 'LOG-10927',
      action: 'CERTIFICATE_VERIFIED',
      description: 'Public Employer Verification for BCERT-TN-2026-000001 (Verification status: VERIFIED)',
      actor: 'Employer / Public Portal',
      timestamp: '2026-09-22 11:45:33',
      category: 'Verification',
      status: 'SUCCESS',
      hash: '0x6d136d3e...d2b160',
    },
    {
      id: 'LOG-10926',
      action: 'MERKLE_BATCH_ANCHORED',
      description: 'Anchored Merkle Batch BATCH-1790055694325 on Polygon Amoy (Block #48233462)',
      actor: 'Automated Anchor Engine',
      timestamp: '2026-09-22 11:41:02',
      category: 'Anchoring',
      status: 'SUCCESS',
      hash: '0x8ED130360DB4eCabCAAa3Eb9cf4afAb107c16f59',
    },
    {
      id: 'LOG-10925',
      action: 'STUDENT_ONBOARDED',
      description: 'Added student STU-1002 (Priya Raman) to Anna University CSE Department',
      actor: 'Admin (CEG Registrar)',
      timestamp: '2026-09-22 10:15:00',
      category: 'Student',
      status: 'SUCCESS',
      hash: null,
    },
    {
      id: 'LOG-10924',
      action: 'COLLEGE_ONBOARDED',
      description: 'Registered Institution: PSG College of Technology (College Code: 2006)',
      actor: 'Super Admin',
      timestamp: '2026-09-22 09:30:12',
      category: 'College',
      status: 'SUCCESS',
      hash: null,
    },
    {
      id: 'LOG-10923',
      action: 'TAMPER_CHECK_ALERT',
      description: 'Verification test detected file modification on modified PDF sample (STATUS: MODIFIED)',
      actor: 'Security Audit System',
      timestamp: '2026-09-22 08:20:45',
      category: 'Security',
      status: 'WARNING',
      hash: '0x892a01...f721a',
    },
  ]);

  const categories = [
    { value: 'Issuance', label: 'Issuance Events' },
    { value: 'Verification', label: 'Verification Queries' },
    { value: 'Anchoring', label: 'Batch Anchoring' },
    { value: 'Student', label: 'Student Management' },
    { value: 'College', label: 'College Administration' },
    { value: 'Security', label: 'Security & Integrity' },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search === '' ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <ClipboardList className="w-4 h-4" /> System Audit Trail
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Security & Activity Audit Logs
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Immutable activity logs for credential issuance, verification, and system changes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={() => {}}
                className="text-xs"
              >
                Refresh Log
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by event description, log ID, or actor..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="w-full md:w-64">
              <SearchableSelect
                options={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="Filter by Event Category..."
                clearable
              />
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    log.status === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {log.status === 'WARNING' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {log.id}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {log.action}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                        {log.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans mb-1.5">
                      {log.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="w-3 h-3 text-slate-500" />
                        {log.actor}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {log.hash && (
                  <div className="shrink-0 font-mono text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase">Proof Hash:</span>
                    <span className="text-indigo-400">{log.hash}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
