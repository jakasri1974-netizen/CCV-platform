import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import { certificateApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Download,
  QrCode,
  Share2,
  ExternalLink,
  User,
  GraduationCap,
  Calendar,
  Check,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrCertId, setSelectedQrCertId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          {/* Student Profile Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40 text-xl font-black">
                  {user ? user.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h1 className="text-xl font-black text-white">{user?.name || 'Student Name'}</h1>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">
                    {user?.email} • Student ID: {user?.studentRef?.studentId || 'STU-2026-001'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      {user?.studentRef?.department || 'Computer Science'}
                    </span>
                    <span>•</span>
                    <span>Batch: {user?.studentRef?.batch || '2022-2026'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-bold shrink-0">
                🎓 Verified Academic Profile
              </div>
            </div>
          </div>

          {/* Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">My Credentials</h2>
                <p className="text-xs text-slate-500">Official blockchain anchored certificates</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {certificates.length} Total Certificates
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading credentials...</div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <StatusBadge status={cert.status} />
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {cert.certificateId}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base">
                        {cert.course ? cert.course.name : 'Blockchain Credentials'}
                      </h3>

                      <div className="text-xs text-slate-500 mt-1 space-y-1 font-medium">
                        <div>Grade: <span className="font-bold text-slate-800">{cert.grade}</span></div>
                        <div>Issued Date: {cert.completionDate}</div>
                        <div>Institution: {cert.institutionId}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedQrCertId(cert.certificateId)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-xl transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Code</span>
                      </button>

                      {cert.pdfUrl && (
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleCopyLink(cert.certificateId)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title="Share Verification Link"
                      >
                        {copiedId === cert.certificateId ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
                No credentials issued yet to your account.
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
