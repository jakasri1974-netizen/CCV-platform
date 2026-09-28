import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Award,
  Users,
  Search,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ModulesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    {
      title: 'Certificate Management',
      description: 'Issue degree certificates, provisional certificates, and semester marksheets with automated blockchain anchoring.',
      icon: Award,
      color: 'from-indigo-500 to-indigo-600',
      badge: 'Core Workflow',
      link: '/admin/issue',
      actionText: 'Launch Issuance Engine',
    },
    {
      title: 'Student Management',
      description: 'Manage student roster, register numbers, academic data fields, and initial account setup.',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      badge: 'Roster Hub',
      link: '/admin/students',
      actionText: 'View Student Roster',
    },
    {
      title: 'Credential Verification',
      description: 'Public verification gateway for employers and institutions to verify certificate authenticity via ID or QR code.',
      icon: Search,
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Public Gateway',
      link: '/verify',
      actionText: 'Open Verifier',
    },
    {
      title: 'Reports & Analytics',
      description: 'View institutional statistics, credential issuance trends, and department-level distribution metrics.',
      icon: BarChart3,
      color: 'from-amber-500 to-amber-600',
      badge: 'Analytics',
      link: '/admin/reports',
      actionText: 'View Reports',
    },
    {
      title: 'Audit & Security',
      description: 'Immutable system audit log tracking all student registrations, certificate issuances, and revocation events.',
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      badge: 'Security Log',
      link: '/admin/audit-logs',
      actionText: 'View Audit Logs',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Institutional Feature Hub</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                Institutional Functional Modules
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Access primary operational tools and services for college credential management
              </p>
            </div>
          </div>

          {/* Functional Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod, idx) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-md`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100">
                    <Link
                      to={mod.link}
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
                    >
                      <span>{mod.actionText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
