import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CascadingSelector from '../components/CascadingSelector';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
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
  Mail,
  User,
  Phone,
  Hash,
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                Student Registry Management
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Users className="w-6 h-6 text-indigo-600" />
                Student Roster & Verification Records
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Filter students by College ➔ Department ➔ Course ➔ Batch. Import bulk student rosters via CSV or register manually.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsImportModalOpen(true)}
                icon={FileSpreadsheet}
              >
                Bulk Import CSV
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                icon={Plus}
              >
                Add Student
              </Button>
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, register number, or Academic Record ID..."
              />
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={fetchStudents}
              isLoading={loading}
              icon={RefreshCw}
              className="shrink-0"
            >
              Load Batch Students ({totalCount})
            </Button>
          </div>

          {/* Students Datatable */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Register No</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Department & Degree</th>
                    <th className="p-3.5">Institution</th>
                    <th className="p-3.5">Batch</th>
                    <th className="p-3.5">Academic Record ID</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-6">
                        <TableSkeleton rows={5} />
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono text-indigo-600 font-bold">
                          {student.registerNumber}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          <div>{student.name}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{student.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-800">{student.degree || student.department}</div>
                          <div className="text-[10px] text-slate-500">{student.department}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {student.institution || student.college?.collegeName || 'ABC Engineering College'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{student.batch}</td>
                        <td className="p-3.5">
                          {student.academicRecordId ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 font-bold">
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              {student.academicRecordId}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Upload docs to generate</span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStudentProfile(student)}
                            icon={Eye}
                          >
                            View Profile
                          </Button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8">
                        <EmptyState
                          title="No Student Records Found"
                          description="No student records match the selected hierarchy filter. Click '+ Add Student' or 'Bulk Import CSV' to populate records."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={50}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </main>
      </div>

      {/* Modal 1: Manual Add Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        subtitle={`Target: ${selectedCollege?.collegeName || 'ABC College'} • ${selectedBatch?.name || '2023-2027'}`}
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="Full Student Name"
            icon={User}
            required
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
            placeholder="e.g. Sri Abhirami"
          />

          <Input
            label="Register Number"
            icon={Hash}
            required
            value={studentForm.registerNumber}
            onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value })}
            placeholder="e.g. 23CSE001"
          />

          <Input
            label="Student Email"
            icon={Mail}
            type="email"
            required
            value={studentForm.email}
            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            placeholder="e.g. student@example.com"
          />

          <Input
            label="Phone Number (Optional)"
            icon={Phone}
            value={studentForm.phone}
            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
            placeholder="e.g. +91 9876543210"
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Student Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Bulk CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Student Roster (CSV)"
        subtitle={`Import roster for ${selectedCollege?.collegeName || 'Selected College'}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste CSV Data or Upload File
            </label>
            <textarea
              rows="6"
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="registerNumber,name,email,department,course,batch&#10;23CSE001,Sri Abhirami,student1@example.com,CSE,B.E CSE,2023-2027"
              className="w-full bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600 font-medium text-xs">Select .CSV file:</span>
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
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
            />
          </div>

          {importResult && (
            <div className={`p-4 rounded-xl border ${importResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div className="font-bold text-sm mb-1">{importResult.message}</div>
              {importResult.stats && (
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-2">
                  <div className="bg-white p-2 rounded-lg border border-slate-200"><span className="text-slate-500 block">Total</span><span className="font-bold">{importResult.stats.totalRecords}</span></div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200"><span className="text-emerald-600 block">Valid</span><span className="font-bold text-emerald-600">{importResult.stats.validCount}</span></div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200"><span className="text-amber-600 block">Duplicates</span><span className="font-bold text-amber-600">{importResult.stats.duplicateCount}</span></div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200"><span className="text-rose-600 block">Invalid</span><span className="font-bold text-rose-600">{importResult.stats.invalidCount}</span></div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={importing}
              icon={Check}
            >
              Confirm & Import Records
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Student Profile & Academic Documents View */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? selectedStudent.name : ''}
        subtitle={selectedStudent ? `${selectedStudent.registerNumber} • ${selectedStudent.degree} (${selectedStudent.batch})` : ''}
        maxWidth="max-w-4xl"
      >
        {selectedStudent && (
          <div className="space-y-5 text-xs">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">Institution: </span>
                {selectedStudent.institution || 'ABC Engineering College'}
              </div>
              <Button
                variant="success"
                size="sm"
                icon={Upload}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload Academic Document
              </Button>
            </div>

            {/* Verification Metadata Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Academic Record ID</div>
                <div className="font-mono text-sm text-indigo-600 font-bold">
                  {selectedStudent.academicRecordId || 'Not Generated Yet'}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Calculated Merkle Root</div>
                <div className="font-mono text-xs text-emerald-600 truncate font-semibold">
                  {selectedStudent.merkleRoot || 'No documents hashed'}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Public QR Verifier</div>
                  {selectedStudent.academicRecordId ? (
                    <a
                      href={`/verify/${selectedStudent.academicRecordId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify Record
                    </a>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Pending upload</div>
                  )}
                </div>
                <QrCode className="w-8 h-8 text-indigo-500 opacity-80" />
              </div>
            </div>

            {/* Academic Documents Datatable */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Academic Documents & IPFS Storage ({studentDocs.length})
              </h4>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 pl-4">Document Type</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">IPFS CID</th>
                      <th className="p-3">SHA-256 Hash</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {loadingDocs ? (
                      <tr><td colSpan="6" className="text-center p-6 text-slate-500">Loading documents...</td></tr>
                    ) : studentDocs.length > 0 ? (
                      studentDocs.map((doc) => (
                        <tr key={doc._id} className="hover:bg-slate-50 transition">
                          <td className="p-3 pl-4 font-bold text-slate-900">{doc.documentType}</td>
                          <td className="p-3 text-slate-500">{doc.semester}</td>
                          <td className="p-3 font-mono text-[11px] text-teal-700">
                            <span className="bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {doc.ipfsCid.slice(0, 14)}...{doc.ipfsCid.slice(-6)}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-indigo-600">
                            {doc.documentHash.slice(0, 10)}...{doc.documentHash.slice(-6)}
                          </td>
                          <td className="p-3">
                            <Badge variant="emerald" icon={CheckCircle}>
                              IPFS Stored
                            </Badge>
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <a
                              href={doc.ipfsUrl || `/api/documents/ipfs/${doc.ipfsCid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] px-2.5 py-1 rounded-lg border border-indigo-200 transition font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-8 text-slate-400">
                          No documents uploaded yet. Click "Upload Academic Document" to add semester marksheets or degree certificate.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 4: Document Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen && !!selectedStudent}
        onClose={() => { setIsUploadModalOpen(false); setUploadMessage(null); }}
        title="Upload Academic Document to IPFS"
        subtitle={selectedStudent ? `Student: ${selectedStudent.name} (${selectedStudent.registerNumber})` : ''}
      >
        <form onSubmit={handleDocumentUpload} className="space-y-4 text-xs">
          {uploadMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold ${uploadMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {uploadMessage.text}
            </div>
          )}

          <Select
            label="Document Type"
            value={uploadForm.documentType}
            onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
            options={['Semester Marksheet', 'Final Degree Certificate']}
          />

          {uploadForm.documentType === 'Semester Marksheet' && (
            <Select
              label="Semester"
              value={uploadForm.semester}
              onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
              options={[
                'Semester 1',
                'Semester 2',
                'Semester 3',
                'Semester 4',
                'Semester 5',
                'Semester 6',
                'Semester 7',
                'Semester 8',
              ]}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Document File (PDF / Image) <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-700 text-xs focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => { setIsUploadModalOpen(false); setUploadMessage(null); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={uploading}
              icon={Upload}
            >
              Upload to IPFS & Hash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
