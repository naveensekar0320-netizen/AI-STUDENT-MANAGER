import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Layers } from 'lucide-react';
import { CourseRecord, SubjectRecord } from '../types/studentRecord';
import { validateSubjectInput } from '../utils/studentRecordLogic';

interface SubjectsViewProps {
  courses: CourseRecord[];
  subjects: SubjectRecord[];
  onAddSubject: (subject: Omit<SubjectRecord, 'subid' | 'createdAt'>) => void;
  onDeleteSubject: (subid: number) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  courses,
  subjects,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<number | 'all'>('all');
  const [cid, setCid] = useState<number>(courses[0]?.cid || 1);
  const [semester, setSemester] = useState<number>(3);
  const [sub1, setSub1] = useState('');
  const [sub2, setSub2] = useState('');
  const [sub3, setSub3] = useState('');
  const [sub4, setSub4] = useState('');
  const [totalCredits, setTotalCredits] = useState<number>(18);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSubjectInput(
      {
        cid: Number(cid),
        semester: Number(semester),
        sub1,
        sub2,
        sub3,
        sub4,
        totalCredits: Number(totalCredits),
      },
      courses
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      setStatusBanner(null);
      return;
    }

    const courseObj = courses.find((c) => c.cid === Number(cid));
    if (!courseObj) return;

    onAddSubject({
      cid: courseObj.cid,
      cshort: courseObj.cshort,
      cfull: courseObj.cfull,
      semester: Number(semester),
      sub1: sub1.trim(),
      sub2: sub2.trim(),
      sub3: sub3.trim(),
      sub4: sub4.trim(),
      totalCredits: Number(totalCredits),
    });

    setStatusBanner(
      `Created Semester ${semester} subject combination for ${courseObj.cshort} in tbl_subject.`
    );
    setSub1('');
    setSub2('');
    setSub3('');
    setSub4('');
    setErrors({});
  };

  const filteredSubjects = subjects.filter((s) =>
    selectedCourseFilter === 'all' ? true : s.cid === Number(selectedCourseFilter)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            MySQL Table: <span className="font-mono text-slate-700">studentrecorddb.tbl_subject</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Subject Combinations: <span className="font-mono tabular-nums">{subjects.length}</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Curriculum &amp; Subject Combinations
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
        {/* Left 4 Columns: Add Subject Combination Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-6 space-y-4"
        >
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Assign Subject Combination
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Maps 4 core semester papers to a degree program in <span className="font-mono">tbl_subject</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="subject-course" className="block text-xs font-semibold text-slate-700 mb-1">
                Course <span className="text-red-600">*</span>
              </label>
              <select
                id="subject-course"
                value={cid}
                onChange={(e) => setCid(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courses.map((c) => (
                  <option key={c.cid} value={c.cid}>
                    {c.cshort}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject-semester" className="block text-xs font-semibold text-slate-700 mb-1">
                Semester <span className="text-red-600">*</span>
              </label>
              <select
                id="subject-semester"
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="sub-1" className="block text-xs font-semibold text-slate-700 mb-1">
              Subject 1 (Code &amp; Title) <span className="text-red-600">*</span>
            </label>
            <input
              id="sub-1"
              type="text"
              value={sub1}
              onChange={(e) => {
                setSub1(e.target.value);
                if (errors.sub1) setErrors({ ...errors, sub1: '' });
              }}
              placeholder="e.g. CS401 · Design & Analysis of Algorithms"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.sub1 && <p className="mt-1 text-xs text-red-600">{errors.sub1}</p>}
          </div>

          <div>
            <label htmlFor="sub-2" className="block text-xs font-semibold text-slate-700 mb-1">
              Subject 2 (Code &amp; Title) <span className="text-red-600">*</span>
            </label>
            <input
              id="sub-2"
              type="text"
              value={sub2}
              onChange={(e) => {
                setSub2(e.target.value);
                if (errors.sub2) setErrors({ ...errors, sub2: '' });
              }}
              placeholder="e.g. CS402 · Microprocessors & Embedded Systems"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.sub2 && <p className="mt-1 text-xs text-red-600">{errors.sub2}</p>}
          </div>

          <div>
            <label htmlFor="sub-3" className="block text-xs font-semibold text-slate-700 mb-1">
              Subject 3 (Code &amp; Title) <span className="text-red-600">*</span>
            </label>
            <input
              id="sub-3"
              type="text"
              value={sub3}
              onChange={(e) => {
                setSub3(e.target.value);
                if (errors.sub3) setErrors({ ...errors, sub3: '' });
              }}
              placeholder="e.g. CS403 · Theory of Computation"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.sub3 && <p className="mt-1 text-xs text-red-600">{errors.sub3}</p>}
          </div>

          <div>
            <label htmlFor="sub-4" className="block text-xs font-semibold text-slate-700 mb-1">
              Subject 4 (Code &amp; Title) <span className="text-red-600">*</span>
            </label>
            <input
              id="sub-4"
              type="text"
              value={sub4}
              onChange={(e) => {
                setSub4(e.target.value);
                if (errors.sub4) setErrors({ ...errors, sub4: '' });
              }}
              placeholder="e.g. CS404 · Probability & Queueing Theory"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.sub4 && <p className="mt-1 text-xs text-red-600">{errors.sub4}</p>}
          </div>

          <div>
            <label htmlFor="sub-credits" className="block text-xs font-semibold text-slate-700 mb-1">
              Total Semester Credits
            </label>
            <input
              id="sub-credits"
              type="number"
              min={4}
              max={36}
              value={totalCredits}
              onChange={(e) => setTotalCredits(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Save Subject Combination
          </button>
        </form>

        {/* Right 8 Columns: Subject Combinations List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Course Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedCourseFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedCourseFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Courses ({subjects.length})
              </button>
              {courses.map((course) => (
                <button
                  key={course.cid}
                  type="button"
                  onClick={() => setSelectedCourseFilter(course.cid)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedCourseFilter === course.cid
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {course.cshort}
                </button>
              ))}
            </div>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">
                No subject combinations registered for this filter
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Use the form on the left to assign semester papers to this course.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Program &amp; Sem</th>
                      <th className="py-3 px-4">Assigned Core Papers (sub1 – sub4)</th>
                      <th className="py-3 px-4 text-right">Credits</th>
                      <th className="py-3 px-4 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredSubjects.map((sub) => (
                      <tr key={sub.subid} className="hover:bg-slate-50/80 transition-colors align-top">
                        <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500">
                          #{sub.subid}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{sub.cshort}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Semester {sub.semester}
                            <span className="mx-1" aria-hidden="true">·</span>
                            <span className="font-mono">{sub.createdAt}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <ul className="space-y-1 text-xs text-slate-700">
                            <li>1. {sub.sub1}</li>
                            <li>2. {sub.sub2}</li>
                            <li>3. {sub.sub3}</li>
                            <li>4. {sub.sub4}</li>
                          </ul>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs tabular-nums text-slate-900 whitespace-nowrap">
                          {sub.totalCredits} Cr
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteSubject(sub.subid);
                              setStatusBanner(`Deleted subject combination #${sub.subid}.`);
                            }}
                            aria-label={`Delete subject combination ${sub.cshort} Semester ${sub.semester}`}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
