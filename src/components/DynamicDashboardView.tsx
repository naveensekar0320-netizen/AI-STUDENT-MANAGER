import React, { useState } from 'react';
import {
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  BookOpen,
  CreditCard,
  SlidersHorizontal,
  Plus,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  UserRole,
  StudentRecord,
  DashboardMetrics,
  HomeworkAssignment,
  GoogleMeetLecture,
  LibraryBookRequest,
  EssentialSpaceCapture,
  DynamicWidgetId,
  NavigationTab,
} from '../types/studentRecord';
import { calculateAttendanceTarget, getStudentStanding } from '../utils/studentRecordLogic';

interface DynamicDashboardViewProps {
  role: UserRole;
  activeStudent: StudentRecord;
  students: StudentRecord[];
  metrics: DashboardMetrics;
  homeworks: HomeworkAssignment[];
  meetLectures: GoogleMeetLecture[];
  libraryBooks: LibraryBookRequest[];
  essentialCaptures: EssentialSpaceCapture[];
  enabledWidgets: DynamicWidgetId[];
  onToggleWidget: (widgetId: DynamicWidgetId) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenEssentialKey: (prefillPrompt?: string) => void;
  onPunchStudentAttendance: (studentId: number) => void;
  onCheckInMeet: (meetId: number, regno: string) => void;
}

const ALL_WIDGET_META: Array<{ id: DynamicWidgetId; label: string }> = [
  { id: 'attendance_matrix', label: 'Attendance Dot-Matrix' },
  { id: 'next_meet_class', label: 'Google Meet Live' },
  { id: 'homework_radar', label: 'Homework Radar' },
  { id: 'fee_ledger', label: 'Fee Ledger' },
  { id: 'library_due', label: 'Library Queue' },
  { id: 'essential_captures', label: 'Essential Space AI' },
];

export const DynamicDashboardView: React.FC<DynamicDashboardViewProps> = ({
  role,
  activeStudent,
  students,
  metrics,
  homeworks,
  meetLectures,
  libraryBooks,
  essentialCaptures,
  enabledWidgets,
  onToggleWidget,
  onNavigate,
  onOpenEssentialKey,
  onPunchStudentAttendance,
  onCheckInMeet,
}) => {
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const pendingHomeworks = homeworks.filter((h) => h.status === 'Pending');
  const liveOrNextMeet =
    meetLectures.find((m) => m.status === 'Live Now') || meetLectures[0];
  const pinnedCaptures = essentialCaptures.filter((c) => c.pinnedToDashboard);

  // Calculate attendance matrix for active student
  const totalAttended = activeStudent.subjectMarks.reduce(
    (acc, m) => acc + (m.attendedClasses ?? 36),
    0
  );
  const totalConducted = activeStudent.subjectMarks.reduce(
    (acc, m) => acc + (m.totalClasses ?? 40),
    0
  );
  const attStats = calculateAttendanceTarget(totalAttended, totalConducted, 75);

  const studentTuitionDue = Math.max(
    0,
    (activeStudent.tuitionTotal ?? 85000) - (activeStudent.tuitionPaid ?? 85000)
  );

  return (
    <div className="space-y-8">
      {/* Nothing OS Header & Essential Key Trigger Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            NOTHING OS 3.0 WORKSPACE
            <span className="mx-2" aria-hidden="true">·</span>
            ROLE: <span className="text-slate-900 dark:text-slate-100 font-semibold">{role.toUpperCase()}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            DB: <span className="text-slate-900 dark:text-slate-100">studentrecorddb</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {role === 'admin'
              ? 'Institutional Command & Dynamic Widgets'
              : `${activeStudent.fname} ${activeStudent.lname} · Student OS`}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Customize Widgets ({enabledWidgets.length}/6)
          </button>

          <button
            type="button"
            onClick={() =>
              onOpenEssentialKey(
                role === 'admin'
                  ? 'Synthesize today’s cohort attendance warnings, fee dues, and pending library requests'
                  : `Analyze ${activeStudent.fname}'s Semester ${activeStudent.semester} attendance, CGPA, and pending homework deadlines`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Cpu className="w-3.5 h-3.5" />
            Essential Key [AI Capture]
          </button>
        </div>
      </div>

      {/* Interactive Widget Customizer Bar */}
      {customizerOpen && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
              ACTIVE NOTHING OS DYNAMIC WIDGETS
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click any module below to pin or unpin from your live dashboard grid
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ALL_WIDGET_META.map((w) => {
              const active = enabledWidgets.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onToggleWidget(w.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {active ? '■ ' : '□ '}
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4-Column Flat KPI Strip */}
      <section aria-label="Core Telemetry Strip" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'TOTAL ENROLLED (registration)' : 'STUDENT ROLL NO & COURSE'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {role === 'admin' ? metrics.totalStudents : activeStudent.courseShort}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {role === 'admin'
                ? `${metrics.totalCourses} Programs`
                : `${activeStudent.regno} · Sem ${activeStudent.semester}`}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'INSTITUTIONAL MEAN CGPA' : 'CUMULATIVE GPA (10.0)'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {role === 'admin'
                ? metrics.averageCgpa.toFixed(2)
                : activeStudent.cgpa.toFixed(2)}
            </span>
            <span className="text-xs font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
              {role === 'admin'
                ? `${metrics.deanListCount} Dean's List`
                : getStudentStanding(activeStudent)}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'MEAN ATTENDANCE' : 'ATTENDANCE MATRIX'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {role === 'admin'
                ? `${metrics.averageAttendance}%`
                : `${activeStudent.attendancePercent}%`}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {role === 'admin'
                ? `${metrics.attendanceWarningCount} Below 75%`
                : `${totalAttended}/${totalConducted} Classes`}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {role === 'admin' ? 'FEE CLEARANCE RATIO' : 'SEMESTER FEE LEDGER'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {role === 'admin'
                ? `${metrics.paidFeesCount}/${metrics.totalStudents}`
                : activeStudent.feeStatus}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {role === 'admin'
                ? 'Cleared Accounts'
                : studentTuitionDue === 0
                  ? '₹0 Due'
                  : `₹${studentTuitionDue.toLocaleString()} Due`}
            </span>
          </div>
        </div>
      </section>

      {/* Nothing OS Interactive Dynamic Widgets Grid */}
      <section aria-label="Nothing OS Dynamic Widgets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Widget 1: Attendance Dot-Matrix Widget */}
        {enabledWidgets.includes('attendance_matrix') && (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4 nothing-dot-bg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                01 · ATTENDANCE MATRIX
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                75% MIN RULE
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {activeStudent.attendancePercent}%
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {attStats.classesNeededForTarget > 0
                    ? `Need ${attStats.classesNeededForTarget} classes for 75%`
                    : `Safe buffer: ${attStats.classesCanMiss} classes`}
                </span>
              </div>

              {/* 20-dot Nothing OS Matrix Bar */}
              <div
                aria-hidden="true"
                className="mt-3 grid grid-cols-10 gap-1.5"
              >
                {Array.from({ length: 20 }).map((_, i) => {
                  const filledDots = Math.round((activeStudent.attendancePercent / 100) * 20);
                  const isFilled = i < filledDots;
                  return (
                    <div
                      key={i}
                      className={`h-2.5 rounded-xs ${
                        isFilled
                          ? activeStudent.attendancePercent < 75
                            ? 'bg-red-600'
                            : 'bg-slate-900 dark:bg-white'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onPunchStudentAttendance(activeStudent.id)}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                + Mark Present Today
              </button>
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:underline whitespace-nowrap"
              >
                Full Register
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Widget 2: Google Meet Live Classroom Widget */}
        {enabledWidgets.includes('next_meet_class') && liveOrNextMeet && (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                02 · GOOGLE MEET CLASSROOM
              </span>
              <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                {liveOrNextMeet.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {liveOrNextMeet.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {liveOrNextMeet.facultyName} · {liveOrNextMeet.scheduledTime}
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                Room Code: {liveOrNextMeet.meetCode} · Checked-in: {liveOrNextMeet.checkedInRegnos.length}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onCheckInMeet(liveOrNextMeet.id, activeStudent.regno);
                  onNavigate('google_meet');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
              >
                <Video className="w-3.5 h-3.5" />
                Check In &amp; Open Meet
              </button>
              <button
                type="button"
                onClick={() => onNavigate('google_meet')}
                className="text-xs font-mono text-slate-600 dark:text-slate-300 hover:underline whitespace-nowrap"
              >
                All Lectures ({meetLectures.length})
              </button>
            </div>
          </div>
        )}

        {/* Widget 3: Homework & Assignments Radar Widget */}
        {enabledWidgets.includes('homework_radar') && (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                03 · HOMEWORK RADAR
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {pendingHomeworks.length} PENDING
              </span>
            </div>

            <div className="space-y-2">
              {homeworks.slice(0, 2).map((hw) => (
                <div
                  key={hw.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {hw.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Due {hw.dueDate}</span>
                    <span>{hw.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigate('homeworks')}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
              >
                {role === 'admin' ? 'Grade Submissions' : 'Submit Homework'}
              </button>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {homeworks.length} Total Tasks
              </span>
            </div>
          </div>
        )}

        {/* Widget 4: Fee Ledger & Quick Clearance Widget */}
        {enabledWidgets.includes('fee_ledger') && (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                04 · FEE LEDGER
              </span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {role === 'admin'
                  ? `${metrics.paidFeesCount} / ${metrics.totalStudents} Cleared`
                  : `₹${(activeStudent.tuitionPaid ?? 85000).toLocaleString()} Paid`}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {role === 'admin'
                  ? '2 student accounts have pending semester installments'
                  : studentTuitionDue === 0
                    ? `All Semester ${activeStudent.semester} dues cleared · Hall Ticket Active`
                    : `Balance Due: ₹${studentTuitionDue.toLocaleString()}`}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigate('fees')}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                {role === 'admin' ? 'Open Fee Ledger' : 'Receipts & Payment'}
              </button>
              <span className="text-xs font-mono text-slate-500">Session {metrics.activeSession}</span>
            </div>
          </div>
        )}

        {/* Widget 5: Library Requesting Queue Widget */}
        {enabledWidgets.includes('library_due') && (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white">
                05 · LIBRARY CATALOG
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-1.5 text-xs">
              {libraryBooks.slice(0, 2).map((book) => (
                <div key={book.id} className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {book.bookTitle}
                  </span>
                  <span className="font-mono text-slate-500 shrink-0">{book.status}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigate('library')}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                {role === 'admin' ? 'Approve Requests' : 'Request / Issue Book'}
              </button>
              <span className="text-xs font-mono text-slate-500">
                {libraryBooks.reduce((acc, b) => acc + b.availableCopies, 0)} Copies Open
              </span>
            </div>
          </div>
        )}

        {/* Widget 6: Nothing OS Essential Key Pinned Captures Widget */}
        {enabledWidgets.includes('essential_captures') && (
          <div className="p-5 bg-slate-900 text-white border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                06 · ESSENTIAL SPACE [AI]
              </span>
              <span className="text-xs font-mono text-slate-400">
                {pinnedCaptures.length} PINNED
              </span>
            </div>

            {pinnedCaptures[0] ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">{pinnedCaptures[0].title}</span>
                  <span className="text-red-400">{pinnedCaptures[0].metricValue}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {pinnedCaptures[0].summary}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Press the Essential Key to capture live academic insights and pin them here.
              </p>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpenEssentialKey()}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap"
              >
                Trigger Essential Key
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ai_agent')}
                className="text-xs font-mono text-slate-300 hover:underline whitespace-nowrap"
              >
                Open Essential Space
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Role-Specific Primary Academic Table */}
      {role === 'student' ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Semester {activeStudent.semester} Enrolled Subjects &amp; Assessment Standing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student: {activeStudent.fname} {activeStudent.lname} ({activeStudent.regno}) ·{' '}
                {activeStudent.courseFull}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('assessment')}
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              Open Full Assessment Module
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-6">Subject Code &amp; Title</th>
                  <th className="py-3 px-4 text-right">Internal (30)</th>
                  <th className="py-3 px-4 text-right">External (70)</th>
                  <th className="py-3 px-4 text-right">Total (100)</th>
                  <th className="py-3 px-4 text-right">Attendance</th>
                  <th className="py-3 px-6 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {activeStudent.subjectMarks.map((sub, i) => {
                  const attPct = Math.round(
                    ((sub.attendedClasses ?? 36) / (sub.totalClasses ?? 40)) * 100
                  );
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6 font-medium text-slate-900 dark:text-white">
                        {sub.subjectName}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {sub.internalMarks}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {sub.externalMarks}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {sub.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {sub.attendedClasses ?? 36}/{sub.totalClasses ?? 40} ({attPct}%)
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {sub.grade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Student Cohort Directory &amp; Standing (<span className="font-mono">registration</span>)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage students, courses, subjects, and grades across all degree programs
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Manage Courses ({metrics.totalCourses})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Student
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-6">Reg / Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Program &amp; Sem</th>
                  <th className="py-3 px-4 text-right">CGPA</th>
                  <th className="py-3 px-4 text-right">Attendance</th>
                  <th className="py-3 px-4">Standing</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {students.slice(0, 6).map((st) => {
                  const standing = getStudentStanding(st);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6 font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white whitespace-nowrap">
                        {st.regno}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {st.fname} {st.lname}
                        </div>
                        <div className="text-xs text-slate-500">{st.emailid}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {st.courseShort} · Sem {st.semester}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {st.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {st.attendancePercent}%
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        {standing === 'Dean List' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Dean&apos;s List
                          </span>
                        )}
                        {standing === 'Good Standing' && (
                          <span className="text-slate-600 dark:text-slate-400">Good Standing</span>
                        )}
                        {standing === 'Attendance Warning' && (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Attendance Warning
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('students')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
