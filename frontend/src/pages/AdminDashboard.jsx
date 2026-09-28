import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { dashboardApi } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Users,
  Building,
  Layers,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  Ban,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  FileCheck,
  Activity,
  CheckCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.success) {
        setStats(res);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                University Control Center
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Operations Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of college academic records, certificate issuances, and verification requests
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                to="/admin/issue"
                icon={PlusCircle}
              >
                + Issue Certificate
              </Button>
              <Button
                variant="success"
                size="sm"
                to="/admin/students"
                icon={Users}
              >
                + Add Student
              </Button>
              <Button
                variant="outline"
                size="sm"
                to="/verify"
                icon={ShieldCheck}
              >
                Verify Certificate
              </Button>
            </div>
          </div>

          {/* College Level Metric Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Total Students</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats?.stats?.totalStudents || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Certificates Issued</span>
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {stats?.stats?.totalIssued || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Certificates Pending</span>
                  <FileCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-500">
                  {stats?.stats?.pendingCertificates || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Certificates Revoked</span>
                  <Ban className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-600">
                  {stats?.stats?.revokedCertificates || 0}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Verification Requests</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {stats?.stats?.totalVerifications || 0}
                </div>
              </div>
            </div>
          )}

          {/* Chart & System Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Issuance Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Monthly Credential Issuances</h3>
                  <p className="text-xs text-slate-500">Historical certificate issuance statistics</p>
                </div>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.chartData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="issued" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Status Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>System Status</span>
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    All Operational
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Database Service</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Document Storage</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Available
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Public Verifier Service</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Operational
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Verification Engine</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Operational
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Institutional records secured with cryptographic tamper detection.
              </div>
            </div>
          </div>

          {/* Recent Operations Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Recent Activity Log</h3>
                <p className="text-xs text-slate-500">Recent certificate issuances and student registrations</p>
              </div>
              <a
                href="/admin/certificates"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View Full Registry →
              </a>
            </div>

            {loading ? (
              <TableSkeleton rows={4} />
            ) : stats?.recentActivity?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-5">Certificate ID</th>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Course Program</th>
                      <th className="p-3.5">Issue Date</th>
                      <th className="p-3.5 pr-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {stats.recentActivity.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono text-indigo-600 font-bold">
                          {cert.certificateId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {cert.student ? cert.student.name : 'N/A'}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {cert.course ? cert.course.name : 'N/A'}
                        </td>
                        <td className="p-3.5 text-slate-500">{cert.completionDate}</td>
                        <td className="p-3.5 pr-5 text-right">
                          <Badge status={cert.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No Recent Activity Records"
                description="No academic certificates have been issued yet. Click 'Issue Certificate' to start."
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
