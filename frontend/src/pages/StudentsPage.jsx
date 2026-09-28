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
import { studentApi, documentApi, collegeApi, departmentApi, courseApi, certificateApi } from '../services/api';
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
  Edit,
  Award,
  Lock,
  Ban,
} from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Master options for autocomplete
  const [collegesList, setCollegesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  // Cascading Selection Filter State
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCertificatesModalOpen, setIsCertificatesModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCerts, setStudentCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Manual Add/Edit Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    studentId: '',
    registerNumber: '',
    email: '',
    phone: '',
    collegeName: '',
    departmentName: '',
    courseName: '',
    batchName: '2023-2027',
    password: '',
    status: 'ACTIVE',
  });

  // Bulk CSV Import State
  const [csvContent, setCsvContent] = useState(
    'registerNumber,name,email,department,course,batch\n23CSE004,Student Four,student4@example.com,CSE,B.E CSE,2023-2027\n23CSE005,Student Five,student5@example.com,CSE,B.E CSE,2023-2027'
  );
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, selectedCollege, selectedDept, selectedCourse, selectedBatch, page]);

  const fetchMasterData = async () => {
    try {
      const [colRes, deptRes, crsRes] = await Promise.all([
        collegeApi.getAll('limit=100'),
        departmentApi.getAll('limit=100'),
        courseApi.getAll('limit=100'),
      ]);
      if (colRes.success) setCollegesList(colRes.data);
      if (deptRes.success) setDepartmentsList(deptRes.data);
      if (crsRes.success) setCoursesList(crsRes.data);
    } catch (err) {
      console.error('Fetch master data error:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let queryParams = `page=${page}&limit=50&search=${encodeURIComponent(search)}`;
      if (statusFilter) queryParams += `&status=${statusFilter}`;
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
        name: studentForm.name,
        registerNumber: studentForm.registerNumber || studentForm.studentId,
        studentId: studentForm.studentId || `STU-${studentForm.registerNumber}`,
        email: studentForm.email,
        phone: studentForm.phone,
        password: studentForm.password || 'Student@123',
        collegeId: selectedCollege?._id,
        departmentId: selectedDept?._id,
        courseId: selectedCourse?._id,
        batchId: selectedBatch?._id,
        department: studentForm.departmentName || selectedDept?.departmentName || 'Computer Science and Engineering',
        degree: studentForm.courseName || selectedCourse?.courseName || 'B.E Computer Science and Engineering',
        institution: studentForm.collegeName || selectedCollege?.collegeName || 'College of Engineering Guindy',
        batch: studentForm.batchName || selectedBatch?.name || '2023-2027',
      };

      const res = await studentApi.create(payload);
      if (res.success) {
        setIsAddModalOpen(false);
        resetForm();
        fetchStudents();
      }
    } catch (err) {
      alert(err.message || 'Failed to create student');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const payload = {
        name: studentForm.name,
        email: studentForm.email,
        phone: studentForm.phone,
        department: studentForm.departmentName,
        degree: studentForm.courseName,
        institution: studentForm.collegeName,
        batch: studentForm.batchName,
        status: studentForm.status,
      };
      if (studentForm.password) payload.password = studentForm.password;

      const res = await studentApi.update(selectedStudent._id, payload);
      if (res.success) {
        setIsEditModalOpen(false);
        resetForm();
        fetchStudents();
      }
    } catch (err) {
      alert(err.message || 'Failed to update student');
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
    if (!window.confirm('Are you sure you want to deactivate/delete this student record?')) return;
    try {
      await studentApi.delete(id);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const openStudentCertificates = async (student) => {
    setSelectedStudent(student);
    setIsCertificatesModalOpen(true);
    setLoadingCerts(true);
    try {
      const res = await certificateApi.getAll(`studentId=${student._id}`);
      if (res.success) {
        setStudentCerts(res.data);
      }
    } catch (err) {
      console.error('Fetch student certificates error:', err);
      setStudentCerts([]);
    } finally {
      setLoadingCerts(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setStudentForm({
      name: student.name || '',
      studentId: student.studentId || student.registerNumber || '',
      registerNumber: student.registerNumber || '',
      email: student.email || '',
      phone: student.phone || '',
      collegeName: student.institution || student.college?.collegeName || 'College of Engineering Guindy',
      departmentName: student.department || 'Computer Science and Engineering',
      courseName: student.degree || 'B.E Computer Science and Engineering',
      batchName: student.batch || '2023-2027',
      password: '',
      status: student.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentForm({
      name: '',
      studentId: '',
      registerNumber: '',
      email: '',
      phone: '',
      collegeName: '',
      departmentName: '',
      courseName: '',
      batchName: '2023-2027',
      password: '',
      status: 'ACTIVE',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                College Credential Management
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <Users className="w-6 h-6 text-indigo-600" />
                Student Details & Roster
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage student records, academic data fields, initial passwords, and certificate histories.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsImportModalOpen(true)}
                icon={FileSpreadsheet}
              >
                Import Students (CSV)
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                icon={Plus}
              >
                + Add Student
              </Button>
            </div>
          </div>

          {/* Search & Cascading Hierarchy Filters */}
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

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Student ID, Register Number, Name, or Email..."
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 text-xs"
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive / Suspended', value: 'SUSPENDED' },
              ]}
            />

            <Button
              variant="secondary"
              size="md"
              onClick={fetchStudents}
              isLoading={loading}
              icon={RefreshCw}
              className="shrink-0"
            >
              Refresh ({totalCount})
            </Button>
          </div>

          {/* Students Datatable */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Student ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">College</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Batch</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="p-6">
                        <TableSkeleton rows={5} />
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono text-indigo-600 font-bold">
                          {student.registerNumber || student.studentId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {student.name}
                        </td>
                        <td className="p-3.5 text-slate-600 truncate max-w-[150px]">
                          {student.institution || student.college?.collegeName || 'Anna University'}
                        </td>
                        <td className="p-3.5 text-slate-600 truncate max-w-[130px]">
                          {student.department}
                        </td>
                        <td className="p-3.5 text-slate-800 font-medium truncate max-w-[150px]">
                          {student.degree}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{student.batch}</td>
                        <td className="p-3.5 text-slate-500 truncate max-w-[160px]">{student.email}</td>
                        <td className="p-3.5">
                          <Badge variant={student.status === 'SUSPENDED' ? 'rose' : 'emerald'}>
                            {student.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="p-3.5 pr-5 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(student)}
                            icon={Edit}
                            title="Edit Student"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStudentCertificates(student)}
                            icon={Award}
                            title="View Certificates"
                          >
                            Certificates
                          </Button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Deactivate / Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-8">
                        <EmptyState
                          title="No Student Records Found"
                          description="No student records match the search filter. Click '+ Add Student' or 'Import Students (CSV)' to populate records."
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

      {/* Modal 1: Add Student */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Student Account"
        subtitle="Registers student data fields and creates a linked Student Portal login account"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Name"
              icon={User}
              required
              value={studentForm.name}
              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
              placeholder="e.g. Sri Abhirami"
            />

            <Input
              label="Student ID / Register Number"
              icon={Hash}
              required
              value={studentForm.registerNumber}
              onChange={(e) => setStudentForm({ ...studentForm, registerNumber: e.target.value, studentId: `STU-${e.target.value}` })}
              placeholder="e.g. 23CSE001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Email Address"
              icon={Mail}
              type="email"
              required
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
              placeholder="e.g. student@example.com"
            />

            <Input
              label="Phone Number"
              icon={Phone}
              value={studentForm.phone}
              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
          </div>

          {/* Searchable Autocomplete Data Fields */}
          <Input
            label="College / Institution"
            value={studentForm.collegeName || selectedCollege?.collegeName || ''}
            onChange={(e) => setStudentForm({ ...studentForm, collegeName: e.target.value })}
            placeholder="Search or enter College Name..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={studentForm.departmentName || selectedDept?.departmentName || ''}
              onChange={(e) => setStudentForm({ ...studentForm, departmentName: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
            />

            <Input
              label="Course / Degree"
              value={studentForm.courseName || selectedCourse?.courseName || ''}
              onChange={(e) => setStudentForm({ ...studentForm, courseName: e.target.value })}
              placeholder="e.g. B.E. Computer Science & Engineering"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch"
              value={studentForm.batchName}
              onChange={(e) => setStudentForm({ ...studentForm, batchName: e.target.value })}
              placeholder="e.g. 2023-2027"
            />

            <Input
              label="Set Initial Password"
              type="password"
              icon={Lock}
              value={studentForm.password}
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
              placeholder="Default: Student@123"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Student Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit Student */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Record"
        subtitle={selectedStudent ? `${selectedStudent.name} (${selectedStudent.registerNumber})` : ''}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            icon={User}
            required
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              icon={Mail}
              type="email"
              required
              value={studentForm.email}
              onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
            />

            <Input
              label="Phone"
              icon={Phone}
              value={studentForm.phone}
              onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
            />
          </div>

          <Input
            label="College / Institution"
            value={studentForm.collegeName}
            onChange={(e) => setStudentForm({ ...studentForm, collegeName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              value={studentForm.departmentName}
              onChange={(e) => setStudentForm({ ...studentForm, departmentName: e.target.value })}
            />

            <Input
              label="Course / Degree"
              value={studentForm.courseName}
              onChange={(e) => setStudentForm({ ...studentForm, courseName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch"
              value={studentForm.batchName}
              onChange={(e) => setStudentForm({ ...studentForm, batchName: e.target.value })}
            />

            <Input
              label="Reset Password (Optional)"
              type="password"
              icon={Lock}
              value={studentForm.password}
              onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
              placeholder="Leave blank to keep unchanged"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Bulk CSV Import */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Student Roster (CSV)"
        subtitle="Imports student records into roster and provisions student login accounts"
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
            <Button type="submit" variant="success" isLoading={importing} icon={Check}>
              Confirm & Import Records
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Student Certificates View */}
      <Modal
        isOpen={isCertificatesModalOpen}
        onClose={() => setIsCertificatesModalOpen(false)}
        title={selectedStudent ? `Certificates for ${selectedStudent.name}` : ''}
        subtitle={selectedStudent ? `Student ID: ${selectedStudent.registerNumber} • ${selectedStudent.degree}` : ''}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          {loadingCerts ? (
            <div className="p-8 text-center text-slate-500">Loading student certificates...</div>
          ) : studentCerts.length > 0 ? (
            <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden">
              {studentCerts.map((cert) => (
                <div key={cert._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cert.certificateType || 'Degree Certificate'}</span>
                      <Badge variant={cert.status === 'VERIFIED' ? 'emerald' : cert.status === 'REVOKED' ? 'rose' : 'amber'}>
                        {cert.status}
                      </Badge>
                    </div>
                    <div className="font-mono text-xs text-indigo-600 font-bold mt-1">{cert.certificateId}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Issued Date: {cert.completionDate || 'N/A'}</div>
                  </div>
                  <a
                    href={`/verify/${cert.certificateId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" size="sm" icon={ExternalLink}>
                      Verify Link
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Certificates Issued Yet"
              description="No degree certificates or marksheets have been issued to this student yet."
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
