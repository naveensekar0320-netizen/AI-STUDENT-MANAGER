import React, { useState } from 'react';
import {
  Search,
  FileText,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Users,
  Plus,
} from 'lucide-react';
import {
  CourseRecord,
  AcademicSession,
  StudentRecord,
  AcademicStanding,
  SubjectMark,
} from '../types/studentRecord';
import {
  filterStudents,
  getStudentStanding,
  computeLetterGrade,
} from '../utils/studentRecordLogic';

interface ManageStudentsViewProps {
  students: StudentRecord[];
  courses: CourseRecord[];
  sessions: AcademicSession[];
  initialCourseFilter: number | 'all';
  selectedStudent: StudentRecord | null;
  onSelectStudent: (student: StudentRecord | null) => void;
  onUpdateStudent: (updated: StudentRecord) => void;
  onDeleteStudent: (id: number) => void;
  onNavigateRegister: () => void;
}

export const ManageStudentsView: React.FC<ManageStudentsViewProps> = ({
  students,
  courses,
  sessions,
  initialCourseFilter,
  selectedStudent,
  onSelectStudent,
  onUpdateStudent,
  onDeleteStudent,
  onNavigateRegister,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | 'all'>(initialCourseFilter);
  const [sessionFilter, setSessionFilter] = useState<string | 'all'>('all');
  const [standingFilter, setStandingFilter] = useState<AcademicStanding | 'all'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync if initialCourseFilter changes from parent
  React.useEffect(() => {
    setCourseFilter(initialCourseFilter);
  }, [initialCourseFilter]);

  // Modal editing state
  const [editCgpa, setEditCgpa] = useState<number>(0);
  const [editAttendance, setEditAttendance] = useState<number>(0);
  const [editFeeStatus, setEditFeeStatus] = useState<'Paid' | 'Partial' | 'Pending'>('Paid');
  const [editMarks, setEditMarks] = useState<SubjectMark[]>([]);

  React.useEffect(() => {
    if (selectedStudent) {
      setEditCgpa(selectedStudent.cgpa);
      setEditAttendance(selectedStudent.attendancePercent);
      setEditFeeStatus(selectedStudent.feeStatus);
      setEditMarks(selectedStudent.subjectMarks.map((m) => ({ ...m })));
    }
  }, [selectedStudent]);

  const filtered = filterStudents(
    students,
    searchQuery,
    courseFilter,
    sessionFilter,
    standingFilter
  );

  const handleSaveTranscriptChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const clampedCgpa = Math.min(10, Math.max(0, Number(editCgpa)));
    const clampedAtt = Math.min(100, Math.max(0, Math.round(Number(editAttendance))));

    const updatedStudent: StudentRecord = {
      ...selectedStudent,
      cgpa: clampedCgpa,
      attendancePercent: clampedAtt,
      feeStatus: editFeeStatus,
      subjectMarks: editMarks,
    };

    onUpdateStudent(updatedStudent);
    onSelectStudent(updatedStudent);
    setStatusMessage(
      `Updated academic record & transcript for ${updatedStudent.fname} ${updatedStudent.lname} (${updatedStudent.regno}).`
    );
  };

  const handleMarkChange = (idx: number, field: 'internalMarks' | 'externalMarks', val: number) => {
    setEditMarks((prev) => {
      const next = [...prev];
      const item = { ...next[idx] };
      if (field === 'internalMarks') {
        item.internalMarks = Math.min(30, Math.max(0, Math.round(val)));
      } else {
        item.externalMarks = Math.min(70, Math.max(0, Math.round(val)));
      }
      item.totalMarks = item.internalMarks + item.externalMarks;
      item.grade = computeLetterGrade(item.totalMarks);
      next[idx] = item;

      // Also recalculate approximate CGPA from subject totals
      const avgTotal = next.reduce((acc, m) => acc + m.totalMarks, 0) / (next.length || 1);
      setEditCgpa(Number((avgTotal / 10).toFixed(2)));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            MySQL Table: <span className="font-mono text-slate-700">studentrecorddb.registration</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Showing <span className="font-mono tabular-nums">{filtered.length}</span> of{' '}
            <span className="font-mono tabular-nums">{students.length}</span> Records
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Student Records &amp; Academic Transcripts
          </h1>
        </div>
        <button
          type="button"
          onClick={onNavigateRegister}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Student
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="flex items-center justify-between px-4 py-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            aria-label="Dismiss notification"
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Multi-Facet Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search students by name, roll number, email, or city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, Reg No (SRMS-2026-1001), city..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-4">
            <select
              aria-label="Filter by course"
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Degree Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.cid} value={c.cid}>
                  {c.cshort} — {c.cfull}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by academic session"
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Academic Sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.session}>
                  Session {s.session}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Standing Segmented Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'Dean List', 'Good Standing', 'Attendance Warning'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStandingFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  standingFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Standings' : st}
              </button>
            ))}
          </div>

          {(searchQuery ||
            courseFilter !== 'all' ||
            sessionFilter !== 'all' ||
            standingFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCourseFilter('all');
                setSessionFilter('all');
                setStandingFilter('all');
              }}
              className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Student Records Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-900">
            No student records match your current filter criteria
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Clear your search filters or register a new student into studentrecorddb.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCourseFilter('all');
                setSessionFilter('all');
                setStandingFilter('all');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onNavigateRegister}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register New Student
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                  <th className="py-3 px-4">Reg / Roll No</th>
                  <th className="py-3 px-4">Student Full Name</th>
                  <th className="py-3 px-4">Course &amp; Session</th>
                  <th className="py-3 px-4">Contact &amp; Location</th>
                  <th className="py-3 px-4 text-right">CGPA</th>
                  <th className="py-3 px-4 text-right">Attendance</th>
                  <th className="py-3 px-4">Standing &amp; Fees</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filtered.map((student) => {
                  const standing = getStudentStanding(student);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                        {student.regno}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {student.fname} {student.mname ? `${student.mname} ` : ''}
                          {student.lname}
                        </div>
                        <div className="text-xs text-slate-500">
                          {student.gender}
                          <span className="mx-1" aria-hidden="true">·</span>
                          Guardian: {student.gname}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-900">
                          {student.courseShort} · Sem {student.semester}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          Session {student.session}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <div className="font-mono tabular-nums">{student.mobno}</div>
                        <div className="text-slate-500">
                          {student.dist}, {student.state}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {student.attendancePercent}%
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        <div>
                          {standing === 'Dean List' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Dean&apos;s List
                            </span>
                          )}
                          {standing === 'Good Standing' && (
                            <span className="text-slate-700">Good Standing</span>
                          )}
                          {standing === 'Attendance Warning' && (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Attendance Warning
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Fees: {student.feeStatus}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectStudent(student)}
                            aria-label={`Inspect and edit transcript for ${student.fname} ${student.lname}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Transcript / Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteStudent(student.id);
                              setStatusMessage(
                                `Deleted student record ${student.regno} (${student.fname} ${student.lname}).`
                              );
                            }}
                            aria-label={`Delete student ${student.fname} ${student.lname}`}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
        </div>
      )}

      {/* Student Transcript & Record Editor Modal */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transcript-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  Official Academic Dossier · {selectedStudent.regno}
                </p>
                <h2 id="transcript-modal-title" className="text-lg font-bold text-slate-900">
                  {selectedStudent.fname} {selectedStudent.mname ? `${selectedStudent.mname} ` : ''}
                  {selectedStudent.lname}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectStudent(null)}
                aria-label="Close transcript modal"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTranscriptChanges} className="p-6 space-y-6">
              {/* Biodata & Registration Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 block">Degree Program</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {selectedStudent.courseShort} — Semester {selectedStudent.semester}
                  </span>
                  <span className="text-slate-600 block">{selectedStudent.courseFull}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Guardian &amp; Category</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {selectedStudent.gname} ({selectedStudent.grelation})
                  </span>
                  <span className="text-slate-600 block">
                    Category: {selectedStudent.category} · {selectedStudent.ocp}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact &amp; Permanent Address</span>
                  <span className="font-mono text-slate-900 mt-0.5 block">
                    {selectedStudent.mobno} · {selectedStudent.emailid}
                  </span>
                  <span className="text-slate-600 block">{selectedStudent.padd}</span>
                </div>
              </div>

              {/* Prior Board Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium">Secondary Board (Class X)</span>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedStudent.board1} · Roll: <span className="font-mono">{selectedStudent.roll1}</span> ({selectedStudent.pyear1})
                  </div>
                  <div className="mt-0.5 font-mono text-slate-700">
                    Score: {selectedStudent.marks1Percent}%
                  </div>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium">Senior Secondary Board (Class XII)</span>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedStudent.board2} · Roll: <span className="font-mono">{selectedStudent.roll2}</span> ({selectedStudent.pyear2})
                  </div>
                  <div className="mt-0.5 font-mono text-slate-700">
                    Score: {selectedStudent.marks2Percent}%
                  </div>
                </div>
              </div>

              {/* Editable Semester Subject Marksheet */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-900">
                    Semester {selectedStudent.semester} Subject Assessment Marks (Interactive Grading)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Internal (Max 30) + External (Max 70) = Total (100)
                  </span>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 px-4">Subject Code &amp; Title</th>
                      <th className="py-2.5 px-3 text-right">Internal (30)</th>
                      <th className="py-2.5 px-3 text-right">External (70)</th>
                      <th className="py-2.5 px-3 text-right">Total (100)</th>
                      <th className="py-2.5 px-4 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {editMarks.map((mark, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-medium text-slate-900">
                          {mark.subjectName}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            aria-label={`Internal marks for ${mark.subjectName}`}
                            value={mark.internalMarks}
                            onChange={(e) =>
                              handleMarkChange(idx, 'internalMarks', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 text-right font-mono tabular-nums border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min={0}
                            max={70}
                            aria-label={`External marks for ${mark.subjectName}`}
                            value={mark.externalMarks}
                            onChange={(e) =>
                              handleMarkChange(idx, 'externalMarks', Number(e.target.value))
                            }
                            className="w-16 px-2 py-1 text-right font-mono tabular-nums border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {mark.totalMarks}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {mark.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Editable Summary Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="modal-cgpa" className="block text-xs font-semibold text-slate-700 mb-1">
                    Cumulative GPA (CGPA)
                  </label>
                  <input
                    id="modal-cgpa"
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="modal-att" className="block text-xs font-semibold text-slate-700 mb-1">
                    Attendance Percentage (%)
                  </label>
                  <input
                    id="modal-att"
                    type="number"
                    min={0}
                    max={100}
                    value={editAttendance}
                    onChange={(e) => setEditAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="modal-fee" className="block text-xs font-semibold text-slate-700 mb-1">
                    Fee Clearance Status
                  </label>
                  <select
                    id="modal-fee"
                    value={editFeeStatus}
                    onChange={(e) =>
                      setEditFeeStatus(e.target.value as 'Paid' | 'Partial' | 'Pending')
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Paid">Paid (Cleared)</option>
                    <option value="Partial">Partial Installment</option>
                    <option value="Pending">Pending Dues</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onSelectStudent(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Transcript &amp; Standing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
