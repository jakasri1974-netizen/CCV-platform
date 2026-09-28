import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import Modal from '../components/ui/Modal';
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
  Eye,
  ExternalLink,
  FileText,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Certificate Modal State
  const [viewingCert, setViewingCert] = useState(null);
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

  const handleShareVerificationLink = (certId) => {
    const url = `${window.location.origin}/verify/${certId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(certId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const studentRef = user?.studentRef || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Welcome Student Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40 text-2xl font-black shrink-0">
                  {user ? user.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-white">Welcome, {user?.name || 'Student'}</h1>
                    <Badge variant="emerald" icon={ShieldCheck}>Verified Student</Badge>
                  </div>
                  <p className="text-xs text-indigo-300 font-mono mt-1">
                    Student ID: {studentRef.registerNumber || studentRef.studentId || user?.email}
                  </p>
                </div>
              </div>

              {/* Student Information Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-xs bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">College</span>
                  <span className="font-bold text-white truncate block mt-0.5 max-w-[140px]">
                    {studentRef.institution || 'ABC Engineering College'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Department</span>
                  <span className="font-bold text-white truncate block mt-0.5 max-w-[130px]">
                    {studentRef.department || 'Computer Science'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Course</span>
                  <span className="font-bold text-white truncate block mt-0.5 max-w-[140px]">
                    {studentRef.degree || 'B.E Computer Science'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Batch</span>
                  <span className="font-bold text-white truncate block mt-0.5">
                    {studentRef.batch || '2023-2027'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* My Certificates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">My Certificates</h2>
                <p className="text-xs text-slate-500">Official verified degree certificates and institutional credentials</p>
              </div>
              <Badge variant="indigo" icon={Award}>
                {certificates.length} Issued Credentials
              </Badge>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
                Loading my certificates...
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
                        {cert.certificateType || (cert.course ? cert.course.name : 'Degree Certificate')}
                      </h3>

                      <div className="text-xs text-slate-600 mt-2 space-y-1 font-medium">
                        <div>Issue Date: <span className="font-bold text-slate-900">{cert.completionDate || new Date().toLocaleDateString()}</span></div>
                        <div>College: <span className="font-bold text-slate-900">{cert.institutionId || studentRef.institution || 'College of Engineering Guindy'}</span></div>
                        <div>Status: <span className="font-bold text-emerald-600">Issued & Verified</span></div>
                      </div>
                    </div>

                    {/* Actions: View, Download, QR / Share */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setViewingCert(cert)}
                      >
                        View
                      </Button>

                      <a
                        href={cert.pdfUrl || `/api/documents/pdf/${cert.certificateId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                        >
                          Download
                        </Button>
                      </a>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={QrCode}
                        onClick={() => setSelectedQrCertId(cert.certificateId)}
                      >
                        QR / Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200">
                <EmptyState
                  title="No Certificates Issued Yet"
                  description="Your institution has not issued any degree certificates or marksheets to your account yet."
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Student Certificate View Modal (Clean College View, No Raw Technical Blockchain Hashes) */}
      <Modal
        isOpen={Boolean(viewingCert)}
        onClose={() => setViewingCert(null)}
        title="Student Certificate Details"
        subtitle={viewingCert ? `Certificate ID: ${viewingCert.certificateId}` : ''}
        maxWidth="max-w-xl"
      >
        {viewingCert && (
          <div className="space-y-5 text-xs">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-indigo-600">Certificate Status</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{viewingCert.status || 'VERIFIED'}</div>
              </div>
              <StatusBadge status={viewingCert.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Certificate Type</span>
                <span className="font-bold text-slate-900 mt-1 block">{viewingCert.certificateType || 'Degree Certificate'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Certificate ID</span>
                <span className="font-mono font-bold text-indigo-600 mt-1 block">{viewingCert.certificateId}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Student Name</span>
                <span className="font-bold text-slate-900 mt-1 block">{user?.name}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Student ID / Register No</span>
                <span className="font-mono font-bold text-slate-800 mt-1 block">{studentRef.registerNumber || studentRef.studentId || user?.email}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Course</span>
                <span className="font-bold text-slate-900 mt-1 block">{studentRef.degree || (viewingCert.course ? viewingCert.course.name : 'B.E Computer Science')}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch</span>
                <span className="font-bold text-slate-800 mt-1 block">{studentRef.batch || '2023-2027'}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Issue Date</span>
                <span className="font-bold text-slate-800 mt-1 block">{viewingCert.completionDate || new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions inside Modal */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <a
                href={viewingCert.pdfUrl || `/api/documents/pdf/${viewingCert.certificateId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button variant="primary" size="md" className="w-full" icon={Eye}>
                  View Certificate PDF
                </Button>
              </a>

              <a
                href={viewingCert.pdfUrl || `/api/documents/pdf/${viewingCert.certificateId}`}
                download
                className="flex-1"
              >
                <Button variant="outline" size="md" className="w-full" icon={Download}>
                  Download PDF
                </Button>
              </a>

              <Button
                variant="outline"
                size="md"
                icon={QrCode}
                onClick={() => {
                  setSelectedQrCertId(viewingCert.certificateId);
                  setViewingCert(null);
                }}
              >
                Show QR
              </Button>

              <Button
                variant="success"
                size="md"
                icon={copiedId === viewingCert.certificateId ? Check : Share2}
                onClick={() => handleShareVerificationLink(viewingCert.certificateId)}
              >
                {copiedId === viewingCert.certificateId ? 'Link Copied' : 'Share Verification Link'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <QRModal
        certificateId={selectedQrCertId}
        isOpen={Boolean(selectedQrCertId)}
        onClose={() => setSelectedQrCertId(null)}
      />
    </div>
  );
}
