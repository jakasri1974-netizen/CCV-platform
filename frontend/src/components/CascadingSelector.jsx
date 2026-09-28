import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collegeApi, departmentApi, courseApi, batchApi } from '../services/api';
import SearchableSelect from './ui/SearchableSelect';
import { Building, Layers, BookOpen, Calendar, Filter } from 'lucide-react';

export default function CascadingSelector({
  selectedCollege,
  setSelectedCollege,
  selectedDept,
  setSelectedDept,
  selectedCourse,
  setSelectedCourse,
  selectedBatch,
  setSelectedBatch,
  onSelectionChange,
}) {
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const isCollegeAdmin = user?.role === 'college_admin';

  // 1. Fetch Colleges on Load
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await collegeApi.getAll();
      if (res.success && res.data.length > 0) {
        setColleges(res.data);

        // Auto-select college if college admin or if no college selected
        if (isCollegeAdmin && user.collegeRef) {
          const matched = res.data.find((c) => c._id === user.collegeRef._id || c._id === user.collegeRef);
          if (matched) setSelectedCollege(matched);
          else setSelectedCollege(res.data[0]);
        } else if (!selectedCollege) {
          setSelectedCollege(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    }
  };

  // 2. Fetch Departments when College changes
  useEffect(() => {
    if (selectedCollege) {
      fetchDepartments(selectedCollege._id);
    } else {
      setDepartments([]);
      setSelectedDept(null);
    }
  }, [selectedCollege]);

  const fetchDepartments = async (collegeId) => {
    try {
      const res = await departmentApi.getAll(`collegeId=${collegeId}`);
      if (res.success && res.data.length > 0) {
        setDepartments(res.data);
        if (!selectedDept || !res.data.some((d) => d._id === selectedDept._id)) {
          setSelectedDept(res.data[0]);
        }
      } else {
        setDepartments([]);
        setSelectedDept(null);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
      setDepartments([]);
    }
  };

  // 3. Fetch Courses when Department changes
  useEffect(() => {
    if (selectedCollege && selectedDept) {
      fetchCourses(selectedCollege._id, selectedDept._id);
    } else {
      setCourses([]);
      setSelectedCourse(null);
    }
  }, [selectedCollege, selectedDept]);

  const fetchCourses = async (collegeId, deptId) => {
    try {
      const res = await courseApi.getAll(`collegeId=${collegeId}&departmentId=${deptId}`);
      if (res.success && res.data.length > 0) {
        setCourses(res.data);
        if (!selectedCourse || !res.data.some((c) => c._id === selectedCourse._id)) {
          setSelectedCourse(res.data[0]);
        }
      } else {
        setCourses([]);
        setSelectedCourse(null);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
      setCourses([]);
    }
  };

  // 4. Fetch Batches when Course changes
  useEffect(() => {
    if (selectedCollege && selectedDept && selectedCourse) {
      fetchBatches(selectedCollege._id, selectedDept._id, selectedCourse._id);
    } else {
      setBatches([]);
      setSelectedBatch(null);
    }
  }, [selectedCollege, selectedDept, selectedCourse]);

  const fetchBatches = async (collegeId, deptId, courseId) => {
    try {
      const res = await batchApi.getAll(`collegeId=${collegeId}&departmentId=${deptId}&courseId=${courseId}`);
      if (res.success && res.data.length > 0) {
        setBatches(res.data);
        if (!selectedBatch || !res.data.some((b) => b._id === selectedBatch._id)) {
          setSelectedBatch(res.data[0]);
        }
      } else {
        setBatches([]);
        setSelectedBatch(null);
      }
    } catch (err) {
      console.error('Fetch batches error:', err);
      setBatches([]);
    }
  };

  // Trigger callback whenever selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({
        college: selectedCollege,
        department: selectedDept,
        course: selectedCourse,
        batch: selectedBatch,
      });
    }
  }, [selectedCollege, selectedDept, selectedCourse, selectedBatch]);

  return (
    <div className="bg-slate-800/80 p-4 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Academic Hierarchy Filter</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* 1. Select College */}
        <div className="relative">
          <SearchableSelect
            placeholder="Search college..."
            icon={Building}
            disabled={isCollegeAdmin}
            dark
            options={colleges.map((c) => ({
              value: c._id,
              label: c.collegeName,
              subtitle: c.district || c.university || '',
              searchTerms: `${c.collegeName} ${c.collegeCode || ''} ${c.district || ''}`,
              original: c,
            }))}
            value={selectedCollege}
            onChange={(opt) => {
              setSelectedCollege(opt?.original || opt || null);
            }}
            typeToSearchText="Type college name (e.g. Nandha, Erode, Kongu)"
            requireQueryToOpen={false}
          />
        </div>

        {/* 2. Select Department */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-2xl px-3 py-2 text-white shadow-inner">
            <Layers className="w-4 h-4 text-teal-400 shrink-0" />
            <select
              value={selectedDept?._id || ''}
              onChange={(e) => {
                const found = departments.find((d) => d._id === e.target.value);
                setSelectedDept(found || null);
              }}
              className="w-full bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {departments.length > 0 ? (
                departments.map((d) => (
                  <option key={d._id} value={d._id} className="bg-slate-900 text-white">
                    {d.departmentName} ({d.departmentCode})
                  </option>
                ))
              ) : (
                <option value="" className="bg-slate-900 text-slate-400">All Departments</option>
              )}
            </select>
          </div>
        </div>

        {/* 3. Select Course */}
        <div className="relative">
          <SearchableSelect
            placeholder="Search course..."
            icon={BookOpen}
            dark
            options={courses.map((c) => ({
              value: c._id,
              label: c.courseName || c.name,
              subtitle: c.courseCode || c.degreeType || '',
              searchTerms: `${c.courseName || c.name} ${c.courseCode || ''} ${c.degreeType || ''}`,
              original: c,
            }))}
            value={selectedCourse}
            onChange={(opt) => {
              setSelectedCourse(opt?.original || opt || null);
            }}
            typeToSearchText="Type course name (e.g. CSE, IT, Information)"
            requireQueryToOpen={false}
          />
        </div>

        {/* 4. Select Batch */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 rounded-2xl px-3 py-2 text-white shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedBatch?._id || ''}
              onChange={(e) => {
                const found = batches.find((b) => b._id === e.target.value);
                setSelectedBatch(found || null);
              }}
              className="w-full bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {batches.length > 0 ? (
                batches.map((b) => (
                  <option key={b._id} value={b._id} className="bg-slate-900 text-white">
                    Batch {b.name}
                  </option>
                ))
              ) : (
                <option value="" className="bg-slate-900 text-slate-400">All Batches</option>
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
