import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MetaMaskConnect from './MetaMaskConnect';
import { Shield, Search, LogOut, User, LayoutDashboard, Award } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                Block<span className="text-indigo-600">Cert</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Polygon Verified
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/verify"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
            >
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Verify Credential</span>
            </Link>

            {user && (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>{user.role === 'admin' ? 'Admin Portal' : 'My Credentials'}</span>
              </Link>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* MetaMask Integration Button */}
            <MetaMaskConnect />

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[10px] font-medium text-slate-400 capitalize">
                    {user.role} • ABC Institute
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
