import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SearchableSelect from '../components/ui/SearchableSelect';
import { MASTER_COURSES } from '../data/masterCourses';
import { BookOpen, Plus, Search, Trash2, X, Hash, User, RefreshCw } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    name: '',
    description: '',
    duration: '10 Weeks',
    credits: 3,
    instructor: '',
    department: 'Computer Science',
  });

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getAll(`search=${search}`);
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await courseApi.create(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          courseId: '',
          name: '',
          description: '',
          duration: '10 Weeks',
          credits: 3,
          instructor: '',
          department: 'Computer Science',
        });
        fetchCourses();
      }
    } catch (err) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseApi.delete(id);
      fetchCourses();
    } catch (err) {
      alert(err.message || "Failed to delete course");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                Institutional Academic Catalog
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Academic Courses Catalog
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage curriculum courses available for blockchain credential issuance and verification.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Add New Course
            </Button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by course ID, title, instructor..."
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchCourses}
              isLoading={loading}
              icon={RefreshCw}
            />
          </div>

          {/* Courses Datatable */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">Course ID</th>
                    <th className="p-3.5">Course Title</th>
                    <th className="p-3.5">Instructor</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Credits</th>
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
                  ) : courses.length > 0 ? (
                    courses.map((course) => (
                      <tr key={course._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 pl-5 font-mono text-indigo-600 font-bold">
                          {course.courseId}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{course.courseName || course.name || "Untitled Course"}</td>
                        <td className="p-3.5 text-slate-600">{course.instructor || "N/A"}</td>
                        <td className="p-3.5 text-slate-600">
                          {typeof course.department === 'object' ? (course.department?.departmentName || course.department?.departmentCode || 'N/A') : (course.department || 'N/A')}
                        </td>
                        <td className="p-3.5 text-slate-500">{course.duration}</td>
                        <td className="p-3.5 font-mono font-bold text-indigo-600">
                          {course.credits} Credits
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Course"
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
                          title="No Courses Found"
                          description="No academic courses match your search query."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Academic Course"
        subtitle="Add course entry to university catalog"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Code / ID"
            required
            icon={Hash}
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            placeholder="e.g. CS-405"
            className="font-mono font-bold text-indigo-600"
          />

          <SearchableSelect
            label="Course Title"
            required
            placeholder="Search or type course title (e.g. CSE, IT, Artificial Intelligence)..."
            options={MASTER_COURSES.map((c) => ({
              value: c.name,
              label: c.name,
              subtitle: c.code,
              searchTerms: c.searchTerms,
              code: c.code,
            }))}
            value={formData.name}
            onChange={(opt) => {
              const selectedName = typeof opt === 'string' ? opt : (opt?.label || opt?.value || '');
              const selectedCode = opt?.code || (opt?.value ? `CRS-${opt.value}` : `CRS-${Date.now().toString().slice(-4)}`);
              setFormData({
                ...formData,
                name: selectedName,
                courseId: formData.courseId || selectedCode,
              });
            }}
            typeToSearchText="Type to search courses (e.g. CSE, Information Technology, AI)"
            requireQueryToOpen={true}
          />

          <Input
            label="Instructor Name"
            required
            icon={User}
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            placeholder="e.g. Dr. S. Vignesh"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                'Computer Science',
                'Information Technology',
                'Cyber Security',
                'Data Science',
                'Artificial Intelligence',
              ]}
            />

            <Input
              label="Credits"
              type="number"
              required
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course summary and learning outcomes..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

