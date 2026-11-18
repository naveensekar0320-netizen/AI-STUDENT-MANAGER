import React from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Database,
  FileText,
} from 'lucide-react';
import {
  CourseRecord,
  StudentRecord,
  DashboardMetrics,
  NavigationTab,
} from '../types/studentRecord';
import { getStudentStanding } from '../utils/studentRecordLogic';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  courses: CourseRecord[];
  students: StudentRecord[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectCourseFilter: (cid: number) => void;
  onInspectStudent: (student: StudentRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  students,
  onNavigate,
  onSelectCourseFilter,
  onInspectStudent,
}) => {
  const recentStudents = [...students].slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Database: <span className="font-mono text-slate-700">studentrecorddb</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Active Session: <span className="font-mono text-slate-700">{metrics.activeSession}</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Academic Registrar Overview
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('database')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            Export studentrecorddb.sql
          </button>
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Register New Student
          </button>
        </div>
      </div>

      {/* 4-Column Flat KPI Strip */}
      <section aria-label="Key academic metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Enrolled Students (registration)</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.totalStudents}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {metrics.paidFeesCount}/{metrics.totalStudents} Fees Cleared
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Session {metrics.activeSession}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="text-blue-600 hover:underline font-medium"
            >
              View directory
            </button>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Degree Programs (tbl_course)</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.totalCourses}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {metrics.totalSubjects} Subject Sets
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>UG &amp; PG Curricula</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('courses')}
              className="text-blue-600 hover:underline font-medium"
            >
              Manage courses
            </button>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Mean Cumulative GPA</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.averageCgpa.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
              {metrics.deanListCount} Dean&apos;s List (≥8.5)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>10.0 Grading Scale</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Verified Transcripts</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Attendance Compliance</span>
            {metrics.attendanceWarningCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.averageAttendance}%
            </span>
            <span className="text-xs text-amber-700 font-medium font-mono tabular-nums">
              {metrics.attendanceWarningCount} Below 75% Min
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>75% Statutory Threshold</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="text-blue-600 hover:underline font-medium"
            >
              Audit attendance
            </button>
          </div>
        </div>
      </section>

      {/* Course-Wise Enrollment & Academic Performance Breakdown */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Course-Wise Enrollment &amp; Performance Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated live from <span className="font-mono">tbl_course</span> and{' '}
              <span className="font-mono">registration</span> tables
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            Add or Edit Courses
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Course ID</th>
                <th className="py-3 px-4">Short Code</th>
                <th className="py-3 px-4">Program Full Title</th>
                <th className="py-3 px-4 text-right">Enrolled</th>
                <th className="py-3 px-4 text-right">Mean CGPA</th>
                <th className="py-3 px-4 text-right">Mean Attendance</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {metrics.courseBreakdown.map((row) => (
                <tr key={row.cid} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6 font-mono text-xs tabular-nums text-slate-500">
                    #{row.cid}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {row.cshort}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                    {row.cfull}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {row.studentCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {row.studentCount > 0 ? row.avgCgpa.toFixed(2) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {row.studentCount > 0 ? `${row.avgAttendance}%` : '—'}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectCourseFilter(row.cid)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      Filter Students ({row.studentCount})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Student Registrations */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Recent Student Registrations
            </h2>
            <p className="text-xs text-slate-500">
              Click any student record to inspect full biodata, guardian record, and semester marksheet
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('students')}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            View All {students.length} Students
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Reg / Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program &amp; Sem</th>
                <th className="py-3 px-4">City &amp; State</th>
                <th className="py-3 px-4 text-right">CGPA</th>
                <th className="py-3 px-4 text-right">Attendance</th>
                <th className="py-3 px-4">Academic Standing</th>
                <th className="py-3 px-6 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {recentStudents.map((student) => {
                const standing = getStudentStanding(student);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs font-medium tabular-nums text-slate-900 whitespace-nowrap">
                      {student.regno}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {student.fname} {student.mname ? `${student.mname} ` : ''}
                        {student.lname}
                      </div>
                      <div className="text-xs text-slate-500">{student.emailid}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-900">{student.courseShort}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>Sem {student.semester}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-mono">{student.session}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {student.dist}, {student.state}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                      {student.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {student.attendancePercent}%
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {standing === 'Dean List' && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Dean&apos;s List
                        </span>
                      )}
                      {standing === 'Good Standing' && (
                        <span className="text-slate-600">Good Standing</span>
                      )}
                      {standing === 'Attendance Warning' && (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Attendance Warning
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectStudent(student)}
                        aria-label={`View transcript for ${student.fname} ${student.lname}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Transcript
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
