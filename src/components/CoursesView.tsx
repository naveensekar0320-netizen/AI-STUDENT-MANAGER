import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Check, X, BookOpen } from 'lucide-react';
import { CourseRecord, StudentRecord } from '../types/studentRecord';
import { validateCourseInput } from '../utils/studentRecordLogic';

interface CoursesViewProps {
  courses: CourseRecord[];
  students: StudentRecord[];
  onAddCourse: (course: Omit<CourseRecord, 'cid' | 'cdate'>) => void;
  onUpdateCourse: (cid: number, course: Omit<CourseRecord, 'cid' | 'cdate'>) => void;
  onDeleteCourse: (cid: number) => void;
  onViewCourseStudents: (cid: number) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  students,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onViewCourseStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCid, setEditingCid] = useState<number | null>(null);
  const [cshort, setCshort] = useState('');
  const [cfull, setCfull] = useState('');
  const [department, setDepartment] = useState('School of Computing & Information Sciences');
  const [durationYears, setDurationYears] = useState<number>(4);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const resetForm = () => {
    setEditingCid(null);
    setCshort('');
    setCfull('');
    setDepartment('School of Computing & Information Sciences');
    setDurationYears(4);
    setErrors({});
  };

  const handleStartEdit = (course: CourseRecord) => {
    setEditingCid(course.cid);
    setCshort(course.cshort);
    setCfull(course.cfull);
    setDepartment(course.department);
    setDurationYears(course.durationYears);
    setErrors({});
    setStatusBanner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCourseInput(
      { cshort, cfull, department, durationYears: Number(durationYears) },
      courses,
      editingCid ?? undefined
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      setStatusBanner(null);
      return;
    }

    if (editingCid !== null) {
      onUpdateCourse(editingCid, {
        cshort: cshort.trim(),
        cfull: cfull.trim(),
        department: department.trim(),
        durationYears: Number(durationYears),
      });
      setStatusBanner(`Updated course "${cshort.trim()}" in tbl_course.`);
    } else {
      onAddCourse({
        cshort: cshort.trim(),
        cfull: cfull.trim(),
        department: department.trim(),
        durationYears: Number(durationYears),
      });
      setStatusBanner(`Added course "${cshort.trim()}" (${cfull.trim()}) to tbl_course.`);
    }
    resetForm();
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.cshort.toLowerCase().includes(q) ||
      c.cfull.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            MySQL Table: <span className="font-mono text-slate-700">studentrecorddb.tbl_course</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Total Programs: <span className="font-mono tabular-nums">{courses.length}</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Academic Courses Management
          </h1>
        </div>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="flex items-center justify-between px-4 py-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            aria-label="Dismiss notification"
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Columns: Add / Edit Course Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 space-y-5"
        >
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              {editingCid !== null ? `Edit Course #${editingCid}` : 'Add New Course'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inserts or updates a degree record in <span className="font-mono">tbl_course</span>
            </p>
          </div>

          <div>
            <label htmlFor="course-short" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Course Short Name <span className="text-red-600">*</span>
            </label>
            <input
              id="course-short"
              type="text"
              value={cshort}
              onChange={(e) => {
                setCshort(e.target.value);
                if (errors.cshort) setErrors({ ...errors, cshort: '' });
              }}
              placeholder="e.g. B.Arch or M.Tech AI"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {errors.cshort && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.cshort}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="course-full" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Course Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="course-full"
              type="text"
              value={cfull}
              onChange={(e) => {
                setCfull(e.target.value);
                if (errors.cfull) setErrors({ ...errors, cfull: '' });
              }}
              placeholder="e.g. Bachelor of Architecture"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {errors.cfull && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.cfull}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="course-dept" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Academic Department <span className="text-red-600">*</span>
            </label>
            <input
              id="course-dept"
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (errors.department) setErrors({ ...errors, department: '' });
              }}
              placeholder="e.g. School of Engineering"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {errors.department && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.department}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="course-duration" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Program Duration (Years) <span className="text-red-600">*</span>
            </label>
            <select
              id="course-duration"
              value={durationYears}
              onChange={(e) => setDurationYears(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value={1}>1 Year (Postgraduate Diploma)</option>
              <option value={2}>2 Years (Master&apos;s Program)</option>
              <option value={3}>3 Years (Undergraduate Degree)</option>
              <option value={4}>4 Years (B.Tech / Honours)</option>
              <option value={5}>5 Years (Integrated / B.Arch)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {editingCid !== null ? 'Update Course' : 'Save Course'}
            </button>
            {editingCid !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Right 8 Columns: Courses Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Registered Courses ({filteredCourses.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by code or title..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">No matching courses found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search query or add a new course on the left.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                    <th className="py-3 px-4">CID</th>
                    <th className="py-3 px-4">Short Name</th>
                    <th className="py-3 px-4">Full Name &amp; Department</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                    <th className="py-3 px-4 text-right">Students</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredCourses.map((course) => {
                    const enrolledCount = students.filter((s) => s.cid === course.cid).length;
                    return (
                      <tr key={course.cid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-500">
                          {course.cid}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {course.cshort}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{course.cfull}</div>
                          <div className="text-xs text-slate-500">{course.department}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-slate-700 whitespace-nowrap">
                          {course.durationYears} {course.durationYears === 1 ? 'Yr' : 'Yrs'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                          <button
                            type="button"
                            onClick={() => onViewCourseStudents(course.cid)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {enrolledCount}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-500 whitespace-nowrap">
                          {course.cdate}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(course)}
                              aria-label={`Edit course ${course.cshort}`}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCourse(course.cid);
                                setStatusBanner(`Removed course "${course.cshort}" from tbl_course.`);
                              }}
                              aria-label={`Delete course ${course.cshort}`}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
