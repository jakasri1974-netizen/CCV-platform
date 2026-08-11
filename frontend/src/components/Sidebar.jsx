import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  PlusCircle,
  Search,
  Cpu,
  Layers,
  Building,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'college_admin');
  const isSuperAdmin = user && user.role === 'super_admin';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ name: 'Colleges Master', path: '/admin/colleges', icon: Building }] : []),
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Batch Management', path: '/admin/batches', icon: Layers },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Issue Certificate', path: '/admin/issue', icon: PlusCircle },
    { name: 'Public Verification', path: '/verify', icon: Search },
    { name: 'Blockchain Network', path: '/admin/blockchain', icon: Cpu },
  ];

  const studentNav = [
    { name: 'My Credentials', path: '/student/dashboard', icon: Award },
    { name: 'Verify Credential', path: '/verify', icon: Search },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col border-r border-slate-800 shrink-0">
      <div className="mb-6 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
        <div className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
          {isSuperAdmin ? 'Super Admin Portal' : isAdmin ? 'College Admin Panel' : 'Student Portal'}
        </div>
        <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
          {user ? user.name : 'Guest User'}
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Network Notice Footer */}
      <div className="mt-auto p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 text-indigo-300 font-bold mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>Polygon PoS Anchored</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Cryptographic SHA-256 Merkle proofs stored on-chain.
        </p>
      </div>
    </aside>
  );
}
