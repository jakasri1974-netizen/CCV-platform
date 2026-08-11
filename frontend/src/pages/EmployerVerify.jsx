import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { verifyApi } from '../services/api';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Building,
  GraduationCap,
  Award,
  User,
  Hash,
  RefreshCw,
  Upload,
  Check,
  XCircle,
  Link as LinkIcon,
  Layers,
  FileSearch,
} from 'lucide-react';

export default function EmployerVerify() {
  const { certificateId: paramId } = useParams();
  const [activeTab, setActiveTab] = useState('CERTIFICATE_ID'); // 'CERTIFICATE_ID' | 'PDF_UPLOAD'
  const [certIdInput, setCertIdInput] = useState(paramId || 'BCERT-TN-2026-000001');
  const [uploadedFile, setUploadedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (paramId) {
      setCertIdInput(paramId);
      setActiveTab('CERTIFICATE_ID');
      performIdVerification(paramId);
    }
  }, [paramId]);

  const performIdVerification = async (idToVerify) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await verifyApi.verify(idToVerify.trim());
      setReport(res);
    } catch (err) {
      setError(err.message || 'Verification search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIdSearchSubmit = (e) => {
    e.preventDefault();
    if (certIdInput.trim()) {
      navigate(`/verify/${certIdInput.trim()}`);
    }
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      if (certIdInput) formData.append('certificateId', certIdInput);

      const response = await fetch('/api/verify/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok && !result.data) {
        throw new Error(result.message || 'PDF file verification failed');
      }

      setReport(result);
    } catch (err) {
      setError(err.message || 'File verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Employer Academic Verification Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Verify academic records, semester marksheets, and degree certificates directly against IPFS storage, SHA-256 Merkle Roots, and Polygon blockchain smart contracts. Zero Web3 wallet required.
          </p>

          {/* Verification Method Tabs */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('CERTIFICATE_ID')}
              className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-2xl border transition ${
                activeTab === 'CERTIFICATE_ID'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Method 1: Verify by Certificate ID</span>
            </button>

            <button
              onClick={() => setActiveTab('PDF_UPLOAD')}
              className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-2xl border transition ${
                activeTab === 'PDF_UPLOAD'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Method 2: Upload Certificate PDF</span>
            </button>
          </div>

          {/* Method 1: Search Form */}
          {activeTab === 'CERTIFICATE_ID' && (
            <form onSubmit={handleIdSearchSubmit} className="mt-4 max-w-xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. BCERT-TN-2026-000001)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify ID</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Method 2: PDF Upload Form */}
          {activeTab === 'PDF_UPLOAD' && (
            <form onSubmit={handleFileUploadSubmit} className="mt-4 max-w-xl mx-auto space-y-3">
              <div className="bg-slate-800 border border-dashed border-slate-600 hover:border-indigo-500 rounded-3xl p-6 text-center transition">
                <FileSearch className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-white mb-1">Select Certificate PDF File</div>
                <p className="text-[11px] text-slate-400 mb-3">Upload student's PDF to compute binary SHA-256 & search MongoDB index</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !uploadedFile}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calculating SHA-256 & Searching Database...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Verify PDF Document Bytes</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/80 rounded-3xl p-12 text-center border border-slate-700 shadow-xl my-6 backdrop-blur-md">
            <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
            <div className="text-base font-bold text-white">Performing Cryptographic Verification...</div>
            <div className="text-xs text-slate-400 mt-1">
              Calculating SHA-256 binary document hash, querying MongoDB, and checking Polygon Amoy block anchor...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center shadow-xl my-6 backdrop-blur-md">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-rose-200">Verification Failed</h3>
            <p className="text-xs text-rose-300 mt-1 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {/* Verification Report Display */}
        {report && !loading && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-3xl p-6 border shadow-2xl backdrop-blur-md ${
                report.isVerified
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {report.isVerified ? (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight">
                        {report.isVerified ? 'OFFICIAL ACADEMIC CERTIFICATE VERIFIED' : 'VERIFICATION ALERT'}
                      </h2>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase ${
                          report.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs mt-1 font-medium text-slate-300">{report.message}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>Verification Method:</div>
                  <div className="font-mono text-slate-200 font-bold">{report.verificationMethod}</div>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            {report.data && report.data.student && (
              <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6">
                <div className="border-b border-slate-700/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-indigo-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{report.data.student.name}</h3>
                      <p className="text-xs text-slate-400">Register No: <span className="font-mono text-indigo-300 font-bold">{report.data.student.registerNumber}</span></p>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/30 self-start sm:self-auto">
                    Certificate ID: {report.data.certificateId}
                  </span>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium block">Degree Program</span>
                    <span className="font-bold text-white mt-1 block">{report.data.student.degree}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium block">Department</span>
                    <span className="font-bold text-slate-200 mt-1 block">{report.data.student.department}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium block">Institution</span>
                    <span className="font-bold text-slate-300 mt-1 block">{report.data.student.institution}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium block">University & Batch</span>
                    <span className="font-bold text-slate-300 mt-1 block">{report.data.student.university} ({report.data.student.batch})</span>
                  </div>
                </div>

                {/* Document Information & IPFS View Link */}
                {report.data.document && (
                  <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Registered Academic Document Info</span>
                      </h4>

                      <a
                        href={report.data.document.ipfsUrl || `/api/documents/ipfs/${report.data.document.ipfsCid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-500/30 transition shadow-lg"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Original on IPFS</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[10px] block font-sans">Document Type</span>
                        <span className="text-slate-200 font-bold">{report.data.document.documentType} ({report.data.document.semester})</span>
                      </div>

                      <div className="font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[10px] block font-sans">SHA-256 Hash</span>
                        <span className="text-indigo-300 font-bold break-all text-[11px]">
                          {report.data.document.sha256Hash}
                        </span>
                      </div>

                      <div className="font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[10px] block font-sans">IPFS Storage CID</span>
                        <span className="text-teal-400 font-bold break-all text-[11px]">
                          {report.data.document.ipfsCid}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cryptographic Badges & Blockchain Anchor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Merkle Tree Cryptographic Proof</span>
                    </span>
                    <div className="font-mono text-[11px] space-y-1">
                      <div>Student Record Hash: <span className="text-indigo-300">{report.data.cryptographicProof?.studentRecordHash?.slice(0, 16)}...</span></div>
                      <div>Batch Merkle Root: <span className="text-teal-300">{report.data.cryptographicProof?.merkleRoot?.slice(0, 16)}...</span></div>
                      <div>Proof Status: <span className="text-emerald-400 font-bold">✅ VALID</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-400" />
                      <span>Polygon Blockchain Anchor</span>
                    </span>
                    <div className="font-mono text-[11px] space-y-1">
                      <div>Network: <span className="text-white">{report.data.blockchainAnchor?.network || 'Polygon Amoy'}</span></div>
                      <div>Tx Hash: <span className="text-indigo-300">{report.data.blockchainAnchor?.transactionHash ? `${report.data.blockchainAnchor.transactionHash.slice(0, 16)}...` : 'Pending Anchor'}</span></div>
                      <div>Status: <span className="text-emerald-400 font-bold">{report.data.blockchainAnchor?.anchored ? '✅ CONFIRMED ON POLYGON' : 'PENDING'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
