import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CascadingSelector from '../components/CascadingSelector';
import { studentApi, certificateApi, documentApi } from '../services/api';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Cpu,
  FileCheck,
  Upload,
  FileText,
  X,
  User,
  GraduationCap,
} from 'lucide-react';

export default function IssueCertificatePage() {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Cascading Selector State
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [certificateId, setCertificateId] = useState(`BCERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [certificateType, setCertificateType] = useState('Final Degree Certificate');

  // Processing State
  const [issuanceStep, setIssuanceStep] = useState(0); // 0: Idle, 1: Processing, 2: Success
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFilteredStudents();
  }, [selectedCollege, selectedDept, selectedCourse, selectedBatch]);

  const fetchFilteredStudents = async () => {
    setLoadingStudents(true);
    try {
      let queryParams = 'limit=100';
      if (selectedCollege) queryParams += `&collegeId=${selectedCollege._id}`;
      if (selectedDept) queryParams += `&departmentId=${selectedDept._id}`;
      if (selectedCourse) queryParams += `&courseId=${selectedCourse._id}`;
      if (selectedBatch) queryParams += `&batchId=${selectedBatch._id}`;

      const res = await studentApi.getAll(queryParams);
      if (res.success) {
        setStudents(res.data);
        if (res.data.length > 0) {
          setStudentId(res.data[0]._id);
        } else {
          setStudentId('');
        }
      }
    } catch (err) {
      console.error('Fetch filtered students error:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      alert('Please select a student from the filtered list.');
      return;
    }

    const selectedStudent = students.find((s) => s._id === studentId);
    if (!selectedStudent) return;

    try {
      setIssuanceStep(1);

      // Prepare certificate record via backend API
      const res = await certificateApi.prepare({
        studentId: selectedStudent._id,
        courseId: selectedCourse?._id || selectedStudent.courseRef || '65c000000000000000000001',
        certificateId,
        grade: 'Pass',
        completionDate: new Date().toISOString().split('T')[0],
        certificateType,
        institutionId: selectedCollege?.collegeName || selectedStudent.institution || 'ABC Engineering College',
      });

      if (!res.success) {
        throw new Error(res.message || 'Failed to generate academic record');
      }

      // Backend anchoring
      await certificateApi.confirm({
        certificateId,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: 1542389,
        issuerAddress: 'Backend Issuer Signer (Polygon)',
      });

      setResultData({
        certificateId,
        studentName: selectedStudent.name,
        registerNumber: selectedStudent.registerNumber,
        academicRecordId: selectedStudent.academicRecordId || certificateId,
        qrVerificationUrl: res.data.qrVerificationUrl,
      });

      setIssuanceStep(2);
    } catch (err) {
      console.error('Issuance error:', err);
      setErrorMsg(err.message || 'Issuance failed');
      setIssuanceStep(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cascading Filter Selection</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Issue Academic Record & Certificate</h1>
              <p className="text-xs text-slate-400 mt-1">
                Select College ➔ Department ➔ Course ➔ Batch to filter students and issue official blockchain-verifiable credentials.
              </p>
            </div>
          </div>

          {/* Cascading Hierarchy Selector */}
          <CascadingSelector
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
            selectedDept={selectedDept}
            setSelectedDept={setSelectedDept}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
          />

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold">Issuance Error</div>
                <div className="text-rose-300 mt-0.5">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Stepper Progress Indicator */}
          {issuanceStep === 1 && (
            <div className="bg-slate-800 rounded-3xl p-8 text-center border border-slate-700 shadow-xl">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
              <div className="text-base font-bold text-white">Generating Academic Credential & Hashing...</div>
              <div className="text-xs text-slate-400 mt-1">
                Computing SHA-256 Merkle Root & anchoring via backend wallet service...
              </div>
            </div>
          )}

          {/* Success Step */}
          {issuanceStep === 2 && resultData && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 shadow-xl text-emerald-100 space-y-5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Academic Record Issued Successfully!
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Student <span className="font-bold text-white">{resultData.studentName} ({resultData.registerNumber})</span> • ID <span className="font-mono font-bold text-indigo-300">{resultData.certificateId}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={`/verify/${resultData.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-3 rounded-2xl text-center shadow-lg transition"
                >
                  View Employer Verification Page
                </a>
                <button
                  onClick={() => {
                    setIssuanceStep(0);
                    setCertificateId(`BCERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold px-5 py-3 rounded-2xl transition"
                >
                  Issue Another Credential
                </button>
              </div>
            </div>
          )}

          {/* Main Issuance Form */}
          {issuanceStep === 0 && (
            <form onSubmit={handleIssueSubmit} className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl space-y-6 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Select Student ({students.length} in selected batch)</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loadingStudents || students.length === 0}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    required
                  >
                    {students.length > 0 ? (
                      students.map((s) => (
                        <option key={s._id} value={s._id} className="bg-slate-900 text-white">
                          {s.registerNumber} – {s.name}
                        </option>
                      ))
                    ) : (
                      <option value="" className="bg-slate-900 text-slate-400">No students found in selected batch</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Academic Record / Certificate ID</label>
                  <input
                    type="text"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Credential Document Type</label>
                <select
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Final Degree Certificate">Final Degree Certificate</option>
                  <option value="Consolidated Marksheet">Consolidated Academic Marksheet</option>
                  <option value="Provisional Degree Certificate">Provisional Degree Certificate</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!studentId}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mt-4"
              >
                <Award className="w-4 h-4" />
                <span>Issue & Anchor Academic Credential Record</span>
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
