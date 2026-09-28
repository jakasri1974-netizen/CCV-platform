import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { verifyApi } from '../services/api';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  GraduationCap,
  Upload,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Check,
  QrCode,
  Eye,
} from 'lucide-react';

export default function EmployerVerify() {
  const { certificateId: paramId } = useParams();
  const [activeTab, setActiveTab] = useState('CERTIFICATE_ID');
  const [certIdInput, setCertIdInput] = useState(paramId || 'BCERT-TN-2026-000001');
  const [uploadedFile, setUploadedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleShareLink = () => {
    if (navigator.clipboard && certIdInput) {
      navigator.clipboard.writeText(`${window.location.origin}/verify/${certIdInput}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            VERIFY A CERTIFICATE
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Instant public verification of official academic certificates, degrees, and marksheets.
          </p>

          {/* Verification Method Tabs */}
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('CERTIFICATE_ID')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition ${
                activeTab === 'CERTIFICATE_ID'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Verify by Certificate ID</span>
            </button>

            <button
              onClick={() => setActiveTab('PDF_UPLOAD')}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition ${
                activeTab === 'PDF_UPLOAD'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Verify PDF Document</span>
            </button>
          </div>

          {/* Search Form */}
          {activeTab === 'CERTIFICATE_ID' && (
            <form onSubmit={handleIdSearchSubmit} className="mt-4 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  icon={Search}
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="Enter Certificate ID (e.g. BCERT-TN-2026-000001)..."
                  className="font-mono font-bold text-indigo-600"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                icon={Search}
                className="shrink-0"
              >
                Verify Certificate
              </Button>
            </form>
          )}

          {/* PDF Upload Form */}
          {activeTab === 'PDF_UPLOAD' && (
            <form onSubmit={handleFileUploadSubmit} className="mt-4 max-w-xl mx-auto space-y-3 text-xs">
              <div className="bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition">
                <FileText className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-900 mb-1">Select Certificate PDF File</div>
                <p className="text-[11px] text-slate-500 mb-3">Upload PDF to verify digital authenticity</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                disabled={!uploadedFile}
                icon={Upload}
              >
                Verify PDF Document
              </Button>
            </form>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-base font-black text-slate-900">Verifying Academic Credential...</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Checking institutional records and document authenticity...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <h3 className="text-lg font-black text-rose-950">Verification Unsuccessful</h3>
            <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto font-medium">{error}</p>
          </div>
        )}

        {/* Successful Verification Display */}
        {report && !loading && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-3xl p-6 border shadow-xs ${
                report.isVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {report.isVerified ? (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight text-slate-900">
                        {report.isVerified ? '✓ VERIFIED' : 'VERIFICATION ALERT'}
                      </h2>
                      <Badge variant={report.isVerified ? 'emerald' : 'rose'}>
                        {report.isVerified ? 'AUTHENTIC RECORD' : report.status}
                      </Badge>
                    </div>
                    <p className="text-xs mt-1 font-semibold text-emerald-800">
                      {report.isVerified
                        ? 'Certificate is authentic and has not been modified or revoked.'
                        : report.message}
                    </p>
                  </div>
                </div>

                {report.isVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={copiedLink ? Check : Share2}
                    onClick={handleShareLink}
                  >
                    {copiedLink ? 'Link Copied' : 'Share Verification'}
                  </Button>
                )}
              </div>
            </div>

            {/* Certificate Student & Academic Details */}
            {report.data && report.data.student && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{report.data.student.name}</h3>
                      <p className="text-xs text-slate-500">Student ID: <span className="font-mono text-indigo-600 font-bold">{report.data.student.registerNumber}</span></p>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 self-start sm:self-auto">
                    Certificate ID: {report.data.certificateId}
                  </span>
                </div>

                {/* Profile Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">College / Institution</span>
                    <span className="font-bold text-slate-900 mt-1 block">{report.data.student.institution}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Department</span>
                    <span className="font-bold text-slate-800 mt-1 block">{report.data.student.department}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Degree / Course</span>
                    <span className="font-bold text-slate-900 mt-1 block">{report.data.student.degree}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Batch</span>
                    <span className="font-bold text-slate-800 mt-1 block">{report.data.student.batch}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Certificate Type</span>
                    <span className="font-bold text-slate-800 mt-1 block">
                      {report.data.document ? report.data.document.documentType : 'Degree Certificate'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Certificate Status</span>
                    <span className="font-bold text-emerald-600 mt-1 block">Active & Verified</span>
                  </div>
                </div>

                {/* Actions */}
                {report.data.document && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={report.data.document.ipfsUrl || `/api/documents/ipfs/${report.data.document.ipfsCid}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button variant="primary" size="md" icon={Eye}>
                        View Certificate Document
                      </Button>
                    </a>
                  </div>
                )}

                {/* Expandable Technical Cryptographic Breakdown */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
                  >
                    <span>Verification Audit Details</span>
                    {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showTechnicalDetails && (
                    <div className="mt-3 p-4 bg-slate-900 text-slate-300 rounded-2xl text-[11px] font-mono space-y-2">
                      <div>Document Hash: <span className="text-indigo-400 font-bold">{report.data.document?.sha256Hash || 'Verified'}</span></div>
                      <div>Proof Root: <span className="text-teal-400 font-bold">{report.data.cryptographicProof?.merkleRoot || 'Verified'}</span></div>
                      <div>Verification Authority: <span className="text-emerald-400 font-bold">BlockCert Cryptographic Registry</span></div>
                    </div>
                  )}
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
