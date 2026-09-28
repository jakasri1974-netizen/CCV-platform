import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SearchableSelect from '../components/ui/SearchableSelect';
import { departmentApi, collegeApi } from '../services/api';
import { masterColleges } from '../data/masterColleges';
import {
  Layers,
  Plus,
  Search,
  Building,
  Hash,
  CheckCircle,
  X,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal & Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formCollegeId, setFormCollegeId] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [search, selectedCollegeId]);

  const fetchColleges = async () => {
    try {
      const res = await collegeApi.getAll();
      if (res.success && res.data?.length > 0) {
        setColleges(res.data);
      } else {
        setColleges(masterColleges.map((c, i) => ({ _id: `col-${i}`, collegeCode: c.code, collegeName: c.name })));
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
      setColleges(masterColleges.map((c, i) => ({ _id: `col-${i}`, collegeCode: c.code, collegeName: c.name })));
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      let params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedCollegeId) params.push(`collegeId=${encodeURIComponent(selectedCollegeId)}`);
      
      const queryStr = params.length > 0 ? params.join('&') : '';
      const res = await departmentApi.getAll(queryStr);
      if (res.success) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!formCollegeId || !departmentCode || !departmentName) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await departmentApi.create({
        collegeId: formCollegeId,
        departmentCode: departmentCode.toUpperCase(),
        departmentName,
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: `Department ${departmentCode.toUpperCase()} created successfully` });
        setIsAddOpen(false);
        setDepartmentCode('');
        setDepartmentName('');
        setFormCollegeId('');
        fetchDepartments();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create department' });
    } finally {
      setSubmitting(false);
    }
  };

  const collegeOptions = colleges.map((c) => ({
    value: c._id || c.collegeCode,
    label: `${c.collegeName} (${c.collegeCode})`,
    searchText: `${c.collegeName} ${c.collegeCode}`,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
                <Layers className="w-4 h-4" /> Academic Structure
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Academic Departments
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage academic departments across affiliated institutions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={RefreshCw}
                onClick={fetchDepartments}
                className="text-xs"
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsAddOpen(true)}
                className="text-xs font-bold"
              >
                Add Department
              </Button>
            </div>
          </div>

          {/* Toast Notification */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-center justify-between border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3 text-sm">
                {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <X className="w-5 h-5 shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
              <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search department name or code..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="w-full md:w-80">
              <SearchableSelect
                options={collegeOptions}
                value={selectedCollegeId}
                onChange={setSelectedCollegeId}
                placeholder="Filter by College..."
                clearable
              />
            </div>
          </div>

          {/* Department List Grid */}
          {loading ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mb-3" />
              <div className="text-sm text-slate-400">Loading academic departments...</div>
            </div>
          ) : departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {departments.map((dept) => {
                const colName = typeof dept.college === 'object' ? dept.college?.collegeName : 'Affiliated Institution';
                const colCode = typeof dept.college === 'object' ? dept.college?.collegeCode : 'INST';

                return (
                  <div
                    key={dept._id || dept.departmentId}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold rounded-lg">
                          {dept.departmentCode}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/80">
                          {dept.departmentId}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 leading-snug">
                        {dept.departmentName}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{colName} ({colCode})</span>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Active Courses</span>
                      </div>
                      <span className="font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                        Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Departments Found"
              description="No academic departments found matching selected filters."
            />
          )}
        </main>
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Academic Department"
        subtitle="Define new department for an institution"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Affiliated Institution / College <span className="text-rose-400">*</span>
            </label>
            <SearchableSelect
              options={collegeOptions}
              value={formCollegeId}
              onChange={setFormCollegeId}
              placeholder="Select Institution..."
            />
          </div>

          <Input
            label="Department Code"
            required
            icon={Hash}
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
            placeholder="e.g. CSE, ECE, MECH, EEE, CIVIL"
            className="font-mono uppercase font-bold text-indigo-400"
          />

          <Input
            label="Department Name"
            required
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="e.g. Computer Science and Engineering"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
