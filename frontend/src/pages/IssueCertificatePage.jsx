import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import QRModal from '../components/QRModal';
import { studentApi, certificateApi } from '../services/api';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Search,
  Upload,
  Eye,
  User,
  Hash,
  FileText,
  FileCheck,
  Download,
  QrCode,
  Check,
} from 'lucide-react';

export default function IssueCertificatePage() {
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [certificateId, setCertificateId] = useState(`BCERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [certificateType, setCertificateType] = useState('Degree Certificate');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Processing State
  const [issuanceStep, setIssuanceStep] = useState(0); // 0: Form, 1: Processing, 2: Success
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Fetch initial student list or search results
  useEffect(() => {
    fetchStudentSearchResults(studentSearch);
  }, [studentSearch]);

  const fetchStudentSearchResults = async (query) => {
    setLoadingSearch(true);
    try {
      const res = await studentApi.getAll(`limit=20&search=${encodeURIComponent(query)}`);
      if (res.success) {
        setSearchResults(res.data);
        if (!selectedStudent && res.data.length > 0 && !query) {
          setSelectedStudent(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Student search error:', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(fileUrl);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedStudent) {
      setErrorMsg('Please search and select a student record first.');
      return;
    }

    try {
      setIssuanceStep(1);

      let customPdfBase64 = null;
      if (pdfFile) {
        customPdfBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(pdfFile);
        });
      }

      // Step 1: Prepare certificate payload & canonical hash
      const res = await certificateApi.prepare({
        studentId: selectedStudent._id,
        courseId: selectedStudent.courseRef?._id || selectedStudent.courseRef || '65c000000000000000000001',
        certificateId,
        grade: 'Pass',
        completionDate: new Date().toISOString().split('T')[0],
        certificateType,
        institutionId: selectedStudent.institution || 'ABC Engineering College',
        customPdfBase64,
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to prepare certificate');
      }

      // Step 2: Confirm issuance & backend Polygon anchoring
      const confirmRes = await certificateApi.confirm({
        certificateId,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: 1542389,
        issuerAddress: 'Backend Issuer Signer (Polygon)',
      });

      setResultData({
        certificateId,
        studentName: selectedStudent.name,
        registerNumber: selectedStudent.registerNumber,
        department: selectedStudent.department,
        degree: selectedStudent.degree,
        batch: selectedStudent.batch,
        certificateType,
        pdfUrl: confirmRes.data?.pdfUrl || res.data?.pdfUrl,
        qrVerificationUrl: res.data?.qrVerificationUrl || `/verify/${certificateId}`,
      });

      setIssuanceStep(2);
    } catch (err) {
      console.error('Issuance error:', err);
      setErrorMsg(err.message || 'Certificate issuance failed');
      setIssuanceStep(0);
    }
  };

  const certificateTypeOptions = [
    'Semester Certificate',
    'Degree Certificate',
    'Provisional Certificate',
    'Transfer Certificate',
    'Other Institutional Certificate',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>College Credential Management</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Award className="w-6 h-6 text-indigo-600" />
                Issue Academic Certificate
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Select student, load details automatically, attach PDF credential, and issue tamper-proof certificate.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold">Issuance Error</div>
                <div className="text-rose-700 mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Stepper Processing State */}
          {issuanceStep === 1 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div className="text-base font-black text-slate-900">
                Processing Certificate & Anchoring to Registry...
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Validating PDF, calculating SHA-256 digest, uploading to IPFS storage, generating QR code, and executing backend Polygon anchoring...
              </p>
            </div>
          )}

          {/* Success Result Step */}
          {issuanceStep === 2 && resultData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs text-emerald-950 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Certificate Issued Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Student <span className="font-bold text-slate-900">{resultData.studentName} ({resultData.registerNumber})</span> • Certificate ID <span className="font-mono font-bold text-indigo-600">{resultData.certificateId}</span>
                  </p>
                </div>
              </div>

              {/* Certificate Details Summary */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 text-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Certificate Type</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{resultData.certificateType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{resultData.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Batch</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{resultData.batch}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={resultData.pdfUrl || `/api/documents/pdf/${resultData.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[140px]"
                >
                  <Button variant="primary" size="md" className="w-full" icon={Eye}>
                    View Certificate PDF
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="md"
                  icon={QrCode}
                  onClick={() => setShowQrModal(true)}
                >
                  Show QR
                </Button>

                <a
                  href={`/verify/${resultData.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[160px]"
                >
                  <Button variant="success" size="md" className="w-full" icon={ExternalLink}>
                    Share Verification Link
                  </Button>
                </a>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setIssuanceStep(0);
                    setSelectedStudent(null);
                    setStudentSearch('');
                    setPdfFile(null);
                    setPdfPreviewUrl(null);
                    setCertificateId(`BCERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  icon={RefreshCw}
                >
                  Issue Another
                </Button>
              </div>
            </div>
          )}

          {/* Main Issuance Workflow Form */}
          {issuanceStep === 0 && (
            <form onSubmit={handleIssueSubmit} className="space-y-6">
              {/* Step 1: Select Student */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    1. Select Student Record
                  </h2>
                  {selectedStudent && (
                    <Badge variant="emerald" icon={ShieldCheck}>Student Loaded</Badge>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Search Student ID / Name"
                    icon={Search}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Type student name or ID (e.g. 23CSE001, Sri Abhirami)..."
                  />

                  {/* Search Results Dropdown List */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-md max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.map((s) => (
                        <div
                          key={s._id}
                          onClick={() => handleStudentSelect(s)}
                          className={`p-3 text-xs cursor-pointer flex items-center justify-between hover:bg-slate-50 transition ${
                            selectedStudent?._id === s._id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="text-slate-500 text-[11px] ml-2">({s.registerNumber || s.studentId})</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {s.department} • {s.degree} • {s.batch}
                            </div>
                          </div>
                          {selectedStudent?._id === s._id && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Automatically Loaded Student Information Card */}
                {selectedStudent && (
                  <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Selected Student Details (Auto-Loaded)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Student Name</span>
                        <span className="font-extrabold text-slate-900">{selectedStudent.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Student ID / Register No</span>
                        <span className="font-mono font-bold text-indigo-600">{selectedStudent.registerNumber || selectedStudent.studentId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Department</span>
                        <span className="font-bold">{selectedStudent.department}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Course & Batch</span>
                        <span className="font-bold">{selectedStudent.batch}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Certificate Configuration & Upload */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    2. Select Certificate Type & PDF Upload
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <Select
                    label="Certificate Type"
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    options={certificateTypeOptions}
                  />

                  <Input
                    label="Certificate ID / Serial Number"
                    required
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    icon={Hash}
                    className="font-mono font-bold text-indigo-600"
                  />
                </div>

                {/* Upload Certificate PDF */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Certificate PDF (Optional file upload)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                    />
                    {pdfPreviewUrl && (
                      <a
                        href={pdfPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        Preview PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!selectedStudent}
                  icon={Award}
                >
                  Issue Certificate
                </Button>
              </div>
            </form>
          )}

          <QRModal
            certificateId={resultData?.certificateId}
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
          />
        </main>
      </div>
    </div>
  );
}
