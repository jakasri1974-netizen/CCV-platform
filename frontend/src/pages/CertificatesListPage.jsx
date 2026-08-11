import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import QRModal from '../components/QRModal';
import { certificateApi } from '../services/api';
import { useWallet } from '../context/WalletContext';
import {
  Award,
  Search,
  Download,
  QrCode,
  Ban,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export default function CertificatesListPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQrCertId, setSelectedQrCertId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const { signer, account, connectWallet } = useWallet();

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

  const handleRevoke = async (cert) => {
    if (!account || !signer) {
      alert("Please connect your MetaMask wallet to execute smart contract revocation.");
      connectWallet();
      return;
    }

    if (!window.confirm(`Are you sure you want to REVOKE certificate ${cert.certificateId}? This will mark status as valid=false on Polygon smart contract.`)) {
      return;
    }

    setRevokingId(cert.certificateId);
    try {
      const contractService = await import('../services/contractService');
      const receipt = await contractService.revokeCertificateOnChain(signer, cert.certificateId);
      
      await certificateApi.revoke(cert.certificateId, {
        transactionHash: receipt.transactionHash,
      });

      alert(`Certificate ${cert.certificateId} has been successfully REVOKED on-chain.`);
      fetchCertificates();
    } catch (err) {
      console.error("Revocation error:", err);
      alert(err.message || "Revocation failed.");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Issued Certificates Registry</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit list of all academic credentials anchored on Polygon smart contracts.
              </p>
            </div>

            <a
              href="/admin/issue"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Award className="w-4 h-4" />
              <span>Issue New Certificate</span>
            </a>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by certificate ID, student name, or course..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">BLOCKCHAIN VERIFIED</option>
              <option value="REVOKED">REVOKED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Certificate ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {certificates.length > 0 ? (
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
                              onClick={() => handleRevoke(cert)}
                              disabled={revokingId === cert.certificateId}
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
                      <td colSpan="7" className="text-center p-8 text-slate-400">
                        No certificate records found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
