import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { dashboardApi } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  Ban,
  TrendingUp,
  Cpu,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Institution Control Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time certificate issuance analytics and Polygon blockchain status
              </p>
            </div>

            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Students</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats?.stats.totalStudents || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Courses</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats?.stats.totalCourses || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Issued</span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats?.stats.totalIssued || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Verified</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {stats?.stats.totalVerifications || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Active</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {stats?.stats.activeCertificates || 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Revoked</span>
                <Ban className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                {stats?.stats.revokedCertificates || 0}
              </div>
            </div>
          </div>

          {/* Chart & Blockchain Node Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Issuance Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Certificates Issued by Month</h3>
                  <p className="text-xs text-slate-500">Historical credential volume</p>
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

            {/* Blockchain Network Node Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Polygon Node Status</span>
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Network</span>
                    <span className="font-bold text-indigo-300 block mt-0.5">
                      {stats?.blockchain?.networkName || 'Polygon Amoy (80002)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Smart Contract Address</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate block mt-0.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {stats?.blockchain?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Latest Block Number</span>
                    <span className="font-mono text-xs text-white font-bold block mt-0.5">
                      #{stats?.blockchain?.blockNumber || '1542389'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Total On-Chain Certificates</span>
                    <span className="font-mono text-sm text-emerald-400 font-extrabold block mt-0.5">
                      {stats?.blockchain?.totalOnChain || stats?.stats?.totalIssued || 0} Anchored
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="/admin/blockchain"
                className="mt-6 w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-md"
              >
                <span>Full Blockchain Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Issuance Activity</h3>
                <p className="text-xs text-slate-500">Latest certificates anchored on Polygon</p>
              </div>
              <a
                href="/admin/certificates"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Certificate ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5">Blockchain Tx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stats?.recentActivity?.length > 0 ? (
                    stats.recentActivity.map((cert) => (
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
                        <td className="p-3.5">
                          <StatusBadge status={cert.status} />
                        </td>
                        <td className="p-3.5 pr-5">
                          <a
                            href={`/verify/${cert.certificateId}`}
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 hover:text-indigo-600 truncate max-w-[120px]"
                          >
                            <span>{cert.transactionHash ? `${cert.transactionHash.slice(0,10)}...` : 'Pending'}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-400">
                        No recent issuance activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
