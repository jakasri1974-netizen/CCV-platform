import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CascadingSelector from '../components/CascadingSelector';
import { studentApi, documentApi } from '../services/api';
import {
  Users,
  Plus,
  Search,
  Trash2,
  X,
  FileText,
  Upload,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  QrCode,
  GraduationCap,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Cascading Selection State
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDocs, setStudentDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Manual Add Form State
  const [studentForm, setStudentForm] = useState({
    name: 'Sri Abhirami',
    registerNumber: '23CSE001',
    email: 'student@example.com',
    phone: '+91 9876543210',
  });

  // Bulk CSV Import State
  const [csvContent, setCsvContent] = useState(
    'registerNumber,name,email,department,course,batch\n23CSE004,Student Four,student4@example.com,CSE,B.E CSE,2023-2027\n23CSE005,Student Five,student5@example.com,CSE,B.E CSE,2023-2027\n23CSE006,Student Six,student6@example.com,CSE,B.E CSE,2023-2027'
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Form State for Document Upload
  const [uploadForm, setUploadForm] = useState({
    documentType: 'Semester Marksheet',
    semester: 'Semester 1',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedCollege, selectedDept, selectedCourse, selectedBatch, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let queryParams = `page=${page}&limit=50&search=${encodeURIComponent(search)}`;
      if (selectedCollege) queryParams += `&collegeId=${selectedCollege._id}`;
      if (selectedDept) queryParams += `&departmentId=${selectedDept._id}`;
      if (selectedCourse) queryParams += `&courseId=${selectedCourse._id}`;
      if (selectedBatch) queryParams += `&batchId=${selectedBatch._id}`;

      const res = await studentApi.getAll(queryParams);
      if (res.success) {
        setStudents(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || res.data.length);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...studentForm,
        collegeId: selectedCollege?._id,
        departmentId: selectedDept?._id,
        courseId: selectedCourse?._id,
        batchId: selectedBatch?._id,
        department: selectedDept?.departmentName || 'Computer Science and Engineering',
        degree: selectedCourse?.courseName || 'B.E Computer Science and Engineering',
        institution: selectedCollege?.collegeName || 'ABC Engineering College',
        batch: selectedBatch?.name || '2023-2027',
      };

      const res = await studentApi.create(payload);
      if (res.success) {
        setIsAddModalOpen(false);
        setStudentForm({ name: '', registerNumber: '', email: '', phone: '' });
        fetchStudents();
      }
    } catch (err) {
      alert(err.message || 'Failed to create student');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    setImporting(true);
    setImportResult(null);

    try {
      const payload = {
        csvData: csvContent,
        collegeId: selectedCollege?._id,
        departmentId: selectedDept?._id,
        courseId: selectedCourse?._id,
        batchId: selectedBatch?._id,
      };

      const res = await studentApi.importCsv(payload);
      if (res.success) {
        setImportResult(res);
        fetchStudents();
      }
    } catch (err) {
      setImportResult({
        success: false,
        message: `Import Error: ${err.message}`,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await studentApi.delete(id);
      if (selectedStudent?._id === id) setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const openStudentProfile = async (student) => {
    setSelectedStudent(student);
    fetchStudentDocuments(student._id);
  };

  const fetchStudentDocuments = async (studentId) => {
    setLoadingDocs(true);
    try {
      const res = await documentApi.getByStudent(studentId);
      if (res.success) {
        setStudentDocs(res.data);
        if (res.student) {
          setSelectedStudent(res.student);
        }
      }
    } catch (err) {
      console.error('Fetch documents error:', err);
      setStudentDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert('Please select an academic PDF/image file to upload.');
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('studentId', selectedStudent._id);
      formData.append('documentType', uploadForm.documentType);
      formData.append('semester', uploadForm.documentType === 'Final Degree Certificate' ? 'N/A' : uploadForm.semester);
      formData.append('file', uploadForm.file);

      const res = await documentApi.upload(formData);

      if (res.success) {
        setUploadMessage({
          type: 'success',
          text: `✅ Document Stored on IPFS! CID: ${res.data.ipfsCid}`,
          data: res.data,
        });
        setUploadForm({ ...uploadForm, file: null });
        fetchStudentDocuments(selectedStudent._id);
        fetchStudents();
        setTimeout(() => setIsUploadModalOpen(false), 2000);
      }
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: `❌ Upload Failed: ${err.message}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-md">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <Users className="w-7 h-7 text-indigo-400" />
                College-Wise Student Management
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Filter students by College ➔ Department ➔ Course ➔ Batch. Import bulk student rosters via CSV or add manually.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-slate-600 shadow-md transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>📁 Bulk Import CSV</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Student</span>
              </button>
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

          {/* Search & Actions Bar */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, register number, or Academic Record ID..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={fetchStudents}
              className="flex items-center gap-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold px-4 py-2 rounded-xl transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Load Batch Students ({totalCount})</span>
            </button>
          </div>

          {/* Students Datatable */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-4 pl-6">Register No</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Department & Degree</th>
                    <th className="p-4">Institution</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">Academic Record ID</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 font-medium text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-slate-400">Loading student records from central database...</td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-700/30 transition">
                        <td className="p-4 pl-6 font-mono text-indigo-400 font-bold">
                          {student.registerNumber}
                        </td>
                        <td className="p-4 font-bold text-white">
                          <div>{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{student.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-200">{student.degree || student.department}</div>
                          <div className="text-[10px] text-slate-400">{student.department}</div>
                        </td>
                        <td className="p-4 text-slate-400">
                          {student.institution || student.college?.collegeName || 'ABC Engineering College'}
                        </td>
                        <td className="p-4 font-mono text-slate-400">{student.batch}</td>
                        <td className="p-4">
                          {student.academicRecordId ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                              <ShieldCheck className="w-3 h-3 text-indigo-400" />
                              {student.academicRecordId}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Upload docs to generate</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            onClick={() => openStudentProfile(student)}
                            className="inline-flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Profile & Docs</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-slate-500">
                        No student records found matching selected hierarchy filter. Click "+ Add Student" or "📁 Bulk Import CSV" to populate records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <div>Showing page {page} of {totalPages} ({totalCount} total students)</div>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal 1: Manual Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full p-6 relative text-slate-100">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Register New Student</h3>
                <p className="text-xs text-slate-400">
                  Target: {selectedCollege?.collegeName || 'ABC College'} • {selectedBatch?.name || '2023-2027'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Full Student Name (e.g. Sri Abhirami) *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={studentForm.registerNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
                  placeholder="Register Number (e.g. 23CSE001) *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="Student Email (e.g. student@example.com) *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  placeholder="Phone Number (Optional)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg transition mt-2"
              >
                Save Student Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-xl w-full p-6 sm:p-8 relative text-slate-100 space-y-4">
            <button onClick={() => setIsImportModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Bulk Import Student List (CSV / Excel)</h3>
                <p className="text-xs text-slate-400">Import thousands of student records for {selectedCollege?.collegeName || 'Selected College'}.</p>
              </div>
            </div>

            <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Paste CSV Content or Upload CSV File</label>
                <textarea
                  rows="6"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="registerNumber,name,email,department,course,batch&#10;23CSE001,Sri Abhirami,student1@example.com,CSE,B.E CSE,2023-2027"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400">File upload support:</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => setCsvContent(evt.target.result);
                      reader.readAsText(file);
                    }
                  }}
                  className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                />
              </div>

              {importResult && (
                <div className={`p-4 rounded-2xl border ${importResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
                  <div className="font-bold text-sm mb-1">{importResult.message}</div>
                  {importResult.stats && (
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-2">
                      <div className="bg-slate-900/80 p-2 rounded-lg"><span className="text-slate-400 block">Total</span><span className="font-bold">{importResult.stats.totalRecords}</span></div>
                      <div className="bg-slate-900/80 p-2 rounded-lg"><span className="text-emerald-400 block">Valid</span><span className="font-bold text-emerald-400">{importResult.stats.validCount}</span></div>
                      <div className="bg-slate-900/80 p-2 rounded-lg"><span className="text-amber-400 block">Duplicates</span><span className="font-bold text-amber-400">{importResult.stats.duplicateCount}</span></div>
                      <div className="bg-slate-900/80 p-2 rounded-lg"><span className="text-rose-400 block">Invalid</span><span className="font-bold text-rose-400">{importResult.stats.invalidCount}</span></div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={importing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {importing ? (
                  <span>Validating & Importing...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Import Records</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Student Profile & Academic Documents View */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-4xl w-full p-6 sm:p-8 relative text-slate-100 space-y-6">
            <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{selectedStudent.name}</h2>
                  <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                    {selectedStudent.registerNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedStudent.degree} • {selectedStudent.institution || 'ABC Engineering College'} ({selectedStudent.batch})
                </p>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
              >
                <Upload className="w-4 h-4" />
                <span>+ Upload Academic Document</span>
              </button>
            </div>

            {/* Verification Metadata Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Academic Record ID</div>
                <div className="font-mono text-sm text-indigo-400 font-bold">
                  {selectedStudent.academicRecordId || 'Not Generated Yet'}
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Calculated Merkle Root</div>
                <div className="font-mono text-xs text-emerald-400 truncate font-semibold">
                  {selectedStudent.merkleRoot || 'No documents hashed'}
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Public QR Verifier</div>
                  {selectedStudent.academicRecordId ? (
                    <a
                      href={`/verify/${selectedStudent.academicRecordId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-300 hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify Record
                    </a>
                  ) : (
                    <div className="text-xs text-slate-500">Pending upload</div>
                  )}
                </div>
                <QrCode className="w-8 h-8 text-indigo-400 opacity-80" />
              </div>
            </div>

            {/* Academic Documents Datatable */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Academic Documents & IPFS Storage ({studentDocs.length})
              </h3>

              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3.5 pl-5">Document Type</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">IPFS CID</th>
                      <th className="p-3.5">SHA-256 Hash</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 pr-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 font-medium text-slate-300">
                    {loadingDocs ? (
                      <tr><td colSpan="6" className="text-center p-6 text-slate-400">Loading documents...</td></tr>
                    ) : studentDocs.length > 0 ? (
                      studentDocs.map((doc) => (
                        <tr key={doc._id} className="hover:bg-slate-700/20 transition">
                          <td className="p-3.5 pl-5 font-bold text-white">{doc.documentType}</td>
                          <td className="p-3.5 text-slate-400">{doc.semester}</td>
                          <td className="p-3.5 font-mono text-[11px] text-teal-400">
                            <span className="bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                              {doc.ipfsCid.slice(0, 14)}...{doc.ipfsCid.slice(-6)}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-indigo-300">
                            {doc.documentHash.slice(0, 10)}...{doc.documentHash.slice(-6)}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              Stored on IPFS
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <a
                              href={doc.ipfsUrl || `/api/documents/ipfs/${doc.ipfsCid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[11px] px-2.5 py-1 rounded-lg border border-indigo-500/30 transition"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Document
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-8 text-slate-500">
                          No documents uploaded yet. Click "+ Upload Academic Document" to add semester marksheets or final degree certificate.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Document Upload Modal */}
      {isUploadModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full p-6 relative text-slate-100">
            <button onClick={() => { setIsUploadModalOpen(false); setUploadMessage(null); }} className="absolute top-5 right-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <Upload className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Upload Academic Document</h3>
                <p className="text-xs text-slate-400">Student: {selectedStudent.name} ({selectedStudent.registerNumber})</p>
              </div>
            </div>

            {uploadMessage && (
              <div className={`p-3 rounded-xl border text-xs font-semibold mb-4 ${uploadMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                {uploadMessage.text}
              </div>
            )}

            <form onSubmit={handleDocumentUpload} className="space-y-4 text-xs">
              <div>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Semester Marksheet">Semester Marksheet</option>
                  <option value="Final Degree Certificate">Final Degree Certificate</option>
                </select>
              </div>

              {uploadForm.documentType === 'Semester Marksheet' && (
                <div>
                  <select
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-300 focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg transition mt-2 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <span>Uploading to IPFS & Hashing...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload to IPFS & Calculate Hash</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
