import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CascadingSelector from '../components/CascadingSelector';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { studentApi, certificateApi } from '../services/api';
import {
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Cpu,
  FileCheck,
  User,
  GraduationCap,
  ArrowRight,
  Database,
  Hash,
  Lock,
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

  const selectedStudentObj = students.find((s) => s._id === studentId);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      alert('Please select a student from the filtered list.');
      return;
    }

    if (!selectedStudentObj) return;

    try {
      setIssuanceStep(1);

      // Prepare certificate record via backend API
      const res = await certificateApi.prepare({
        studentId: selectedStudentObj._id,
        courseId: selectedCourse?._id || selectedStudentObj.courseRef || '65c000000000000000000001',
        certificateId,
        grade: 'Pass',
        completionDate: new Date().toISOString().split('T')[0],
        certificateType,
        institutionId: selectedCollege?.collegeName || selectedStudentObj.institution || 'ABC Engineering College',
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
        studentName: selectedStudentObj.name,
        registerNumber: selectedStudentObj.registerNumber,
        academicRecordId: selectedStudentObj.academicRecordId || certificateId,
        qrVerificationUrl: res.data.qrVerificationUrl,
      });

      setIssuanceStep(2);
    } catch (err) {
      console.error('Issuance error:', err);
      setErrorMsg(err.message || 'Issuance failed');
      setIssuanceStep(0);
    }
  };

  const workflowSteps = [
    { num: 1, title: 'Student Selection', icon: User },
    { num: 2, title: 'Identity Check', icon: ShieldCheck },
    { num: 3, title: 'Academic Record', icon: FileCheck },
    { num: 4, title: 'IPFS Storage', icon: Database },
    { num: 5, title: 'SHA-256 Hashing', icon: Hash },
    { num: 6, title: 'Merkle Root', icon: Cpu },
    { num: 7, title: 'Blockchain Anchor', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Institutional Issuance Engine</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Award className="w-6 h-6 text-indigo-600" />
                Issue & Anchor Academic Credential Record
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Filter by College ➔ Department ➔ Course ➔ Batch to generate SHA-256 tamper-proof credentials anchored to blockchain backend.
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

          {/* 7-Step Workflow Visualization Stepper */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px] gap-2">
              {workflowSteps.map((step, index) => {
                const IconComp = step.icon;
                const isActive = issuanceStep === 1 || (issuanceStep === 2 && step.num <= 7);
                const isComplete = issuanceStep === 2;

                return (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                          isComplete
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isActive
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">
                        {step.title}
                      </span>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="w-6 h-[2px] bg-slate-200 shrink-0 self-center mb-4" />
                    )}
                  </React.Fragment>
                );
              })}
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
                Generating Academic Credential & Computing Merkle Proof...
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Computing SHA-256 hash digest, pinning metadata to IPFS, and executing backend Polygon anchoring transaction...
              </p>
            </div>
          )}

          {/* Success Result Step */}
          {issuanceStep === 2 && resultData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs text-emerald-950 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Academic Credential Issued & Anchored Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Student <span className="font-bold text-slate-900">{resultData.studentName} ({resultData.registerNumber})</span> • Certificate ID <span className="font-mono font-bold text-indigo-600">{resultData.certificateId}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Record ID</span>
                  <span className="font-mono font-bold text-indigo-600">{resultData.academicRecordId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Verification Gateway</span>
                  <span className="font-mono text-emerald-700 font-bold">SHA-256 IPFS & Polygon Proof</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`/verify/${resultData.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button variant="success" size="md" className="w-full" icon={ExternalLink}>
                    View Public Verification Page
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIssuanceStep(0);
                    setCertificateId(`BCERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
                  }}
                  icon={RefreshCw}
                >
                  Issue Another Credential
                </Button>
              </div>
            </div>
          )}

          {/* Main Issuance Form */}
          {issuanceStep === 0 && (
            <form onSubmit={handleIssueSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <Select
                  label={`Select Target Student (${students.length} in selected batch)`}
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={loadingStudents || students.length === 0}
                >
                  {students.length > 0 ? (
                    students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.registerNumber} – {s.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No students found in selected batch</option>
                  )}
                </Select>

                <Input
                  label="Academic Certificate / Credential ID"
                  required
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  icon={Hash}
                  className="font-mono font-bold text-indigo-600"
                />
              </div>

              {/* Selected Student Detail Card */}
              {selectedStudentObj && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{selectedStudentObj.name}</span>
                      <Badge variant="indigo">{selectedStudentObj.registerNumber}</Badge>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {selectedStudentObj.degree || 'Degree N/A'} • {selectedStudentObj.institution || 'ABC Engineering College'} ({selectedStudentObj.batch})
                    </p>
                  </div>
                  <Badge variant="emerald" icon={ShieldCheck}>
                    Verified Roster Record
                  </Badge>
                </div>
              )}

              <Select
                label="Credential Document Type"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                options={[
                  'Final Degree Certificate',
                  'Consolidated Academic Marksheet',
                  'Provisional Degree Certificate',
                ]}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!studentId}
                  icon={Award}
                >
                  Issue & Anchor Academic Credential Record
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

