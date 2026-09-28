import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../services/api';
import {
  UserCheck,
  ShieldCheck,
  Phone,
  Lock,
  Mail,
  Building,
  Layers,
  BookOpen,
  GraduationCap,
  Save,
  CheckCircle,
  AlertCircle,
  User,
  Hash,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, checkLoggedInUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentRef = user?.studentRef || {};

  const [phone, setPhone] = useState(studentRef.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const payload = { phone };
      if (newPassword) payload.password = newPassword;

      const res = await studentApi.updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        if (checkLoggedInUser) checkLoggedInUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Header Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40 text-2xl font-black shrink-0">
                {user ? user.name.charAt(0) : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{user?.name || 'Student Name'}</h1>
                  <Badge variant="emerald" icon={ShieldCheck}>Verified Student Account</Badge>
                </div>
                <p className="text-xs text-indigo-300 font-mono mt-1">
                  Student ID: {studentRef.studentId || studentRef.registerNumber || user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Academic Identity Details (Read-Only / Admin-Controlled) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Academic Identity Records (Managed by Administration)
              </h2>
              <p className="text-xs text-slate-500">
                Official institutional identity fields cannot be modified directly by students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Student ID / Register No</span>
                <span className="font-mono font-bold text-indigo-600 mt-1 block">
                  {studentRef.registerNumber || studentRef.studentId || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Full Name</span>
                <span className="font-bold text-slate-900 mt-1 block">
                  {studentRef.name || user?.name}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Institutional Email</span>
                <span className="font-bold text-slate-800 mt-1 block truncate">
                  {studentRef.email || user?.email}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">College / Institution</span>
                <span className="font-bold text-slate-900 mt-1 block">
                  {studentRef.institution || 'ABC Engineering College'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
                <span className="font-bold text-slate-800 mt-1 block">
                  {studentRef.department || 'Computer Science'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Course / Degree</span>
                <span className="font-bold text-slate-900 mt-1 block">
                  {studentRef.degree || 'B.E Computer Science'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch</span>
                <span className="font-bold text-slate-800 mt-1 block">
                  {studentRef.batch || '2023-2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Student Contact & Security Settings */}
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Student Contact & Security Settings
              </h2>
              <p className="text-xs text-slate-500">
                You may update your phone number and account password.
              </p>
            </div>

            <div className="space-y-4 text-xs max-w-lg">
              <Input
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />

              <Input
                label="Update Password (Leave blank to keep unchanged)"
                type="password"
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
              />

              {newPassword && (
                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={saving}
                  icon={Save}
                >
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
