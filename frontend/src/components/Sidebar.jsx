import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  PlusCircle,
  Search,
  BarChart3,
  ClipboardList,
  Settings,
  ShieldCheck,
  UserCheck,
  LayoutGrid,
} from 'lucide-react';

export default function Sidebar({ isOpen = true, onClose = () => {} }) {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'college_admin');
  const isSuperAdmin = user && user.role === 'super_admin';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Issue Certificate', path: '/admin/issue', icon: PlusCircle },
    { name: 'Student Details', path: '/admin/students', icon: Users },
    { name: 'Modules', path: '/admin/modules', icon: LayoutGrid },
    { name: 'Verify Certificate', path: '/verify', icon: Search },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const studentNav = [
    { name: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: UserCheck },
    { name: 'My Certificates', path: '/student/certificates', icon: Award },
    { name: 'Verify / Share', path: '/verify', icon: Search },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 p-4 flex flex-col border-r border-slate-800 shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } min-h-[calc(100vh-4rem)]`}
      >
        {/* User Context Card */}
        <div className="mb-5 px-3.5 py-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">
            {isSuperAdmin ? 'Super Admin System' : isAdmin ? 'University Admin' : 'Student Portal'}
          </div>
          <div className="text-xs text-white font-bold truncate mt-0.5">
            {user ? user.name : 'Guest User'}
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
            {user ? user.email : 'Unauthenticated'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* System Operational Badge */}
        <div className="mt-auto pt-4 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Verification Active</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Tamper-proof academic credential registry online.
          </p>
        </div>
      </aside>
    </>
  );
}
