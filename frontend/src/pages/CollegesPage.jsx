import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
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
  Mail,
  User,
  Lock,
  Hash,
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                University Master Registry
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Building className="w-6 h-6 text-indigo-600" />
                Central College Master Registry
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Super Admin Master Data management for affiliated colleges, university campuses, and onboarded College Admins.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddCollegeOpen(true)}
              icon={Plus}
            >
              Add New College
            </Button>
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-xl border text-xs font-semibold ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              {statusMessage.text}
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college name, code, district, or university..."
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchColleges}
              isLoading={loading}
              icon={RefreshCw}
            />
          </div>

          {/* Colleges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center p-12 text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
                Loading master college registry...
              </div>
            ) : colleges.length > 0 ? (
              colleges.map((college) => (
                <div key={college._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-black text-base">
                        {college.collegeCode}
                      </div>
                      <Badge variant="emerald" icon={CheckCircle}>
                        ACTIVE
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 line-clamp-1">{college.collegeName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{college.university}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{college.district ? `${college.district}, ` : ''}{college.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500 font-bold">{college.collegeId}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={UserPlus}
                      onClick={() => {
                        setSelectedCollegeForAdmin(college);
                        setIsAdminModalOpen(true);
                      }}
                    >
                      Onboard Admin
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  title="No Colleges Found"
                  description="No affiliated colleges found matching search query in master database."
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal 1: Add College */}
      <Modal
        isOpen={isAddCollegeOpen}
        onClose={() => setIsAddCollegeOpen(false)}
        title="Add New Institution / College"
        subtitle="Add college to central verification platform"
      >
        <form onSubmit={handleCreateCollege} className="space-y-4">
          <Input
            label="College Code"
            required
            icon={Hash}
            value={collegeForm.collegeCode}
            onChange={(e) => setCollegeForm({ ...collegeForm, collegeCode: e.target.value })}
            placeholder="e.g. 1001, CEG, GCT"
            className="font-mono uppercase font-bold text-indigo-600"
          />

          <Input
            label="Full College Name"
            required
            value={collegeForm.collegeName}
            onChange={(e) => setCollegeForm({ ...collegeForm, collegeName: e.target.value })}
            placeholder="e.g. Government College of Technology"
          />

          <Input
            label="Affiliated University"
            required
            value={collegeForm.university}
            onChange={(e) => setCollegeForm({ ...collegeForm, university: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="District"
              required
              value={collegeForm.district}
              onChange={(e) => setCollegeForm({ ...collegeForm, district: e.target.value })}
            />

            <Input
              label="Campus Location"
              required
              value={collegeForm.location}
              onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddCollegeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save College
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Onboard College Admin */}
      <Modal
        isOpen={isAdminModalOpen && !!selectedCollegeForAdmin}
        onClose={() => setIsAdminModalOpen(false)}
        title="Onboard College Admin Account"
        subtitle={selectedCollegeForAdmin ? `College: ${selectedCollegeForAdmin.collegeName}` : ''}
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <Input
            label="Admin Full Name"
            required
            icon={User}
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            placeholder="e.g. Dr. R. Ramanathan"
          />

          <Input
            label="Official Admin Email"
            type="email"
            required
            icon={Mail}
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            placeholder="admin@college.edu.in"
          />

          <Input
            label="Initial Password"
            type="password"
            required
            icon={Lock}
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAdminModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Create Admin Login
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

