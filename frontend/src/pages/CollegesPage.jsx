import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { collegeApi } from '../services/api';
import {
  Building,
  Plus,
  Search,
  UserPlus,
  MapPin,
  Globe,
  CheckCircle,
  X,
  RefreshCw,
} from 'lucide-react';

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedCollegeForAdmin, setSelectedCollegeForAdmin] = useState(null);

  // Forms
  const [collegeForm, setCollegeForm] = useState({
    collegeCode: '',
    collegeName: '',
    university: 'Anna University',
    state: 'Tamil Nadu',
    district: 'Chennai',
    location: '',
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, [search]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await collegeApi.getAll(search ? `search=${encodeURIComponent(search)}` : '');
      if (res.success) {
        setColleges(res.data);
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      const res = await collegeApi.create(collegeForm);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `✅ College '${res.data.collegeName}' created!` });
        setIsAddCollegeOpen(false);
        fetchColleges();
      }
    } catch (err) {
      alert(err.message || 'Failed to create college');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedCollegeForAdmin) return;
    try {
      const res = await collegeApi.createAdmin(selectedCollegeForAdmin._id, adminForm);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `✅ Admin account '${res.data.email}' onboarded for ${selectedCollegeForAdmin.collegeName}!`,
        });
        setIsAdminModalOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to onboard admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-md">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Building className="w-7 h-7 text-indigo-400" />
                Central College Master Registry
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Super Admin Master Data management for affiliated colleges, university campuses, and onboarded College Admins across Tamil Nadu.
              </p>
            </div>

            <button
              onClick={() => setIsAddCollegeOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New College</span>
            </button>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
              {statusMessage.text}
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college name, code, district, or university..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button onClick={fetchColleges} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Colleges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center p-12 text-slate-400">Loading master college registry...</div>
            ) : colleges.length > 0 ? (
              colleges.map((college) => (
                <div key={college._id} className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4 backdrop-blur-md hover:border-indigo-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg">
                      {college.collegeCode}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      ACTIVE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{college.collegeName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{college.university}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{college.district ? `${college.district}, ` : ''}{college.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{college.collegeId}</span>
                    <button
                      onClick={() => {
                        setSelectedCollegeForAdmin(college);
                        setIsAdminModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Onboard Admin</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-12 text-slate-500">No colleges found in master database.</div>
            )}
          </div>
        </main>
      </div>

      {/* Modal 1: Add College */}
      {isAddCollegeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full p-6 relative text-slate-100">
            <button onClick={() => setIsAddCollegeOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <Building className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Add New Institution / College</h3>
                <p className="text-xs text-slate-400">Add college to central verification platform.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCollege} className="space-y-3 text-xs">
              <div>
                <input
                  type="text"
                  value={collegeForm.collegeCode}
                  onChange={(e) => setCollegeForm({ ...collegeForm, collegeCode: e.target.value })}
                  placeholder="College Code (e.g. 1001, CEG, GCT) *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={collegeForm.collegeName}
                  onChange={(e) => setCollegeForm({ ...collegeForm, collegeName: e.target.value })}
                  placeholder="Full College Name *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={collegeForm.university}
                  onChange={(e) => setCollegeForm({ ...collegeForm, university: e.target.value })}
                  placeholder="Affiliated University *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={collegeForm.district}
                  onChange={(e) => setCollegeForm({ ...collegeForm, district: e.target.value })}
                  placeholder="District (e.g. Chennai, Coimbatore) *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={collegeForm.location}
                  onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                  placeholder="Campus Location *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg transition mt-2"
              >
                Save College to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Onboard College Admin */}
      {isAdminModalOpen && selectedCollegeForAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full p-6 relative text-slate-100">
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <UserPlus className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Onboard College Admin Account</h3>
                <p className="text-xs text-slate-400">College: {selectedCollegeForAdmin.collegeName}</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="Admin Full Name *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="Official Email *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Password *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-2xl shadow-lg transition mt-2"
              >
                Create College Admin Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
