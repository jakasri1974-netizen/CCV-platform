import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { certificateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Download,
  QrCode,
  Share2,
  GraduationCap,
  Check,
  ShieldCheck,
  Building,
  Layers,
  BookOpen,
  Eye,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrCertId, setSelectedQrCertId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStudentCertificates();
  }, []);

  const fetchStudentCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getAll();
      if (res.success) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error("Fetch student certificates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (certId) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const studentRef = user?.studentRef || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Student Profile Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 border border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40 text-2xl font-black shrink-0">
                  {user ? user.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-white">{user?.name || 'Student Name'}</h1>
                    <Badge variant="emerald" icon={ShieldCheck}>Verified Student</Badge>
                  </div>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">
                    Register No: {studentRef.registerNumber || user?.studentId || '23CSE001'}
                  </p>
                </div>
              </div>

              {/* Profile Overview Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto text-xs bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Institution</span>
                  <span className="font-bold text-white truncate block mt-0.5">
                    {studentRef.institution || 'Anna University'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Department</span>
                  <span className="font-bold text-white truncate block mt-0.5">
                    {studentRef.department || 'Computer Science'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batch</span>
                  <span className="font-bold text-white truncate block mt-0.5">
                    {studentRef.batch || '2023-2027'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">My Certificates & Marksheets</h2>
                <p className="text-xs text-slate-500">Official verified degree certificates and semester marksheets</p>
              </div>
              <Badge variant="indigo" icon={Award}>
                {certificates.length} Total Credentials
              </Badge>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
                Loading academic credentials...
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <StatusBadge status={cert.status} />
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                          {cert.certificateId}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-base">
                        {cert.course ? (cert.course.courseName || cert.course.name) : 'Degree Certificate'}
                      </h3>

                      <div className="text-xs text-slate-600 mt-2 space-y-1 font-medium">
                        <div>Type: <span className="font-bold text-slate-900">{cert.documentType || 'Semester Marksheet'}</span></div>
                        <div>Issued Date: <span className="font-bold text-slate-900">{cert.completionDate || new Date().toLocaleDateString()}</span></div>
                        <div>Institution: <span className="font-bold text-slate-900">{cert.institutionId || 'Anna University'}</span></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        icon={QrCode}
                        onClick={() => setSelectedQrCertId(cert.certificateId)}
                      >
                        Show QR
                      </Button>

                      <a
                        href={`/verify/${cert.certificateId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          icon={Eye}
                        >
                          View
                        </Button>
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={copiedId === cert.certificateId ? Check : Share2}
                        onClick={() => handleCopyLink(cert.certificateId)}
                        title="Share Verification Link"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <EmptyState
                  title="No Certificates Issued Yet"
                  description="Your institution has not issued any degree certificates or consolidated marksheets to your account yet."
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <QRModal
        certificateId={selectedQrCertId}
        isOpen={Boolean(selectedQrCertId)}
        onClose={() => setSelectedQrCertId(null)}
      />
    </div>
  );
}
