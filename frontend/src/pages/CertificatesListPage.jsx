import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { certificateApi } from '../services/api';
import {
  Award,
  Search,
  Download,
  QrCode,
  Ban,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';

export default function CertificatesListPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQrCertId, setSelectedQrCertId] = useState(null);

  // Revocation Modal State
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Administrative Audit Correction');
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [search, statusFilter]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getAll(`search=${search}&status=${statusFilter}`);
      if (res.success) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error("Fetch certificates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRevoke = async (e) => {
    e.preventDefault();
    if (!revokeTarget) return;

    setRevoking(true);
    try {
      const res = await certificateApi.revoke(revokeTarget.certificateId, { reason: revokeReason });
      if (res.success) {
        setRevokeTarget(null);
        fetchCertificates();
      } else {
        throw new Error(res.message || "Revocation failed.");
      }
    } catch (err) {
      console.error("Revocation error:", err);
      alert(err.message || "Revocation failed.");
    } finally {
      setRevoking(false);
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
                Polygon Smart Contract Registry
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Award className="w-6 h-6 text-indigo-600" />
                Issued Credentials & Audit Log
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Audit list of all academic credentials anchored on Polygon smart contracts with tamper-evident status checks.
              </p>
            </div>

            <a href="/admin/issue">
              <Button variant="primary" size="md" icon={Award}>
                Issue New Certificate
              </Button>
            </a>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by certificate ID, student name, or course..."
              />
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Credential Statuses' },
                  { value: 'VERIFIED', label: 'BLOCKCHAIN VERIFIED' },
                  { value: 'REVOKED', label: 'REVOKED ON-CHAIN' },
                  { value: 'PENDING', label: 'PENDING ANCHOR' },
                ]}
              />
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Certificate ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Course / Degree</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Blockchain Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-6">
                        <TableSkeleton rows={6} />
                      </td>
                    </tr>
                  ) : certificates.length > 0 ? (
                    certificates.map((cert) => (
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
                        <td className="p-3.5 font-bold text-slate-900">{cert.grade}</td>
                        <td className="p-3.5 text-slate-500">{cert.completionDate}</td>
                        <td className="p-3.5">
                          <StatusBadge status={cert.status} />
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-1">
                          <button
                            onClick={() => setSelectedQrCertId(cert.certificateId)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Show Verification QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {cert.pdfUrl && (
                            <a
                              href={cert.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {cert.status === 'VERIFIED' && (
                            <button
                              onClick={() => setRevokeTarget(cert)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Revoke Certificate On-Chain"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8">
                        <EmptyState
                          title="No Certificates Found"
                          description="No certificate records match your search or status criteria."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* QR Code Verification Modal */}
      <QRModal
        certificateId={selectedQrCertId}
        isOpen={Boolean(selectedQrCertId)}
        onClose={() => setSelectedQrCertId(null)}
      />

      {/* Revocation Confirmation Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Academic Certificate On-Chain"
        subtitle={revokeTarget ? `Target: ${revokeTarget.certificateId} (${revokeTarget.student?.name || 'Student'})` : ''}
      >
        {revokeTarget && (
          <form onSubmit={handleConfirmRevoke} className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs">Irreversible Blockchain Action</div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Revoking this certificate updates the Polygon smart contract state to REVOKED. All future public QR scans and employer verifications will mark this document as invalid.
                </div>
              </div>
            </div>

            <Select
              label="Select Official Reason for Revocation"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              options={[
                'Administrative Audit Correction',
                'Fraudulent Document Submission',
                'Degree Requirement Incomplete',
                'Administrative Recall by Registrar',
              ]}
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setRevokeTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={revoking}
                icon={Ban}
              >
                Confirm On-Chain Revocation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

