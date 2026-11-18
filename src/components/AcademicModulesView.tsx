import React, { useState } from 'react';
import {
  Check,
  Plus,
  Send,
  Award,
  Calendar,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  UserRole,
  AdminCredential,
  StudentRecord,
  HomeworkAssignment,
  LeaveApplication,
  NavigationTab,
} from '../types/studentRecord';
import {
  calculateAttendanceTarget,
  computeLetterGrade,
} from '../utils/studentRecordLogic';

interface AcademicModulesViewProps {
  mode: 'profile' | 'assessment' | 'attendance' | 'homeworks';
  role: UserRole;
  admin: AdminCredential;
  activeStudent: StudentRecord;
  students: StudentRecord[];
  homeworks: HomeworkAssignment[];
  leaveApplications: LeaveApplication[];
  onSelectActiveStudent: (studentId: number) => void;
  onUpdateStudent: (updated: StudentRecord) => void;
  onSubmitHomework: (homeworkId: number, submissionText: string, studentRegno: string) => void;
  onCreateHomework: (hw: Omit<HomeworkAssignment, 'id' | 'status'>) => void;
  onGradeHomework: (homeworkId: number, marks: number, feedback: string) => void;
  onSubmitLeave: (leave: Omit<LeaveApplication, 'id' | 'status'>) => void;
  onUpdateLeaveStatus: (leaveId: number, status: 'Approved' | 'Rejected') => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const AcademicModulesView: React.FC<AcademicModulesViewProps> = ({
  mode,
  role,
  admin,
  activeStudent,
  students,
  homeworks,
  leaveApplications,
  onSelectActiveStudent,
  onUpdateStudent,
  onSubmitHomework,
  onCreateHomework,
  onGradeHomework,
  onSubmitLeave,
  onUpdateLeaveStatus,
  onNavigate,
}) => {
  const [banner, setBanner] = useState<string | null>(null);

  // Profile edit state
  const [mobInput, setMobInput] = useState(activeStudent.mobno);
  const [emailInput, setEmailInput] = useState(activeStudent.emailid);
  const [caddInput, setCaddInput] = useState(activeStudent.cadd);

  React.useEffect(() => {
    setMobInput(activeStudent.mobno);
    setEmailInput(activeStudent.emailid);
    setCaddInput(activeStudent.cadd);
  }, [activeStudent]);

  // Homework states
  const [hwFilter, setHwFilter] = useState<'all' | 'Pending' | 'Submitted' | 'Graded'>('all');
  const [submissionInputs, setSubmissionInputs] = useState<Record<number, string>>({});
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwCourse, setNewHwCourse] = useState('B.Tech CS');
  const [newHwSubject, setNewHwSubject] = useState('CS302 · Relational Database Management Systems');
  const [newHwDue, setNewHwDue] = useState('2026-11-30');
  const [newHwDesc, setNewHwDesc] = useState('');
  const [gradeInputs, setGradeInputs] = useState<Record<number, { marks: number; feedback: string }>>({});

  // Leave request state
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('2026-11-20');
  const [leaveTo, setLeaveTo] = useState('2026-11-21');

  // 1. PROFILE MODULE
  if (mode === 'profile') {
    const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateStudent({
        ...activeStudent,
        mobno: mobInput.trim() || activeStudent.mobno,
        emailid: emailInput.trim() || activeStudent.emailid,
        cadd: caddInput.trim() || activeStudent.cadd,
      });
      setBanner(`Updated profile dossier for ${activeStudent.fname} ${activeStudent.lname} (${activeStudent.regno}).`);
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: PROFILE &amp; ACADEMIC DOSSIER · ROLE: {role.toUpperCase()}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {role === 'admin' ? 'Registrar & Student Dossier Inspector' : 'Student Identity & Academic Dossier'}
            </h1>
          </div>
          {role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="px-3.5 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
              >
                Full Directory ({students.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="px-3.5 py-2 text-xs font-mono font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                + Register New Student
              </button>
            </div>
          )}
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        {role === 'admin' && (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-mono text-slate-500">ACTIVE REGISTRAR ACCOUNT: </span>
              <strong className="text-slate-900 dark:text-white">{admin.fullName}</strong> ({admin.username} · {admin.adminEmail})
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="inspect-student-select" className="text-xs font-mono text-slate-500">
                Inspect Student Profile:
              </label>
              <select
                id="inspect-student-select"
                value={activeStudent.id}
                onChange={(e) => onSelectActiveStudent(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.regno} — {s.fname} {s.lname} ({s.courseShort})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Digital Campus ID Card */}
          <div className="lg:col-span-5 bg-slate-900 text-white border border-slate-800 rounded-xl p-6 space-y-5 nothing-dot-bg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-red-400 font-bold">
                STUDENTRECORDMS · DIGITAL ID
              </span>
              <span className="text-xs font-mono text-slate-400">
                SESSION {activeStudent.session}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-bold tracking-tight">
                {activeStudent.fname} {activeStudent.mname ? `${activeStudent.mname} ` : ''}
                {activeStudent.lname}
              </div>
              <div className="text-xs font-mono text-slate-300">
                Reg No: {activeStudent.regno} · {activeStudent.courseShort} (Sem {activeStudent.semester})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[10px]">CUMULATIVE GPA</span>
                <span className="text-base font-bold text-white">{activeStudent.cgpa.toFixed(2)} / 10.0</span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[10px]">ATTENDANCE</span>
                <span className="text-base font-bold text-white">{activeStudent.attendancePercent}%</span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[10px]">GUARDIAN</span>
                <span className="text-xs font-semibold text-white">{activeStudent.gname}</span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block text-[10px]">CATEGORY &amp; NATIONALITY</span>
                <span className="text-xs font-semibold text-white">
                  {activeStudent.category} · {activeStudent.nationality}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Class X: {activeStudent.marks1Percent}% ({activeStudent.board1})</span>
              <span>Class XII: {activeStudent.marks2Percent}% ({activeStudent.board2})</span>
            </div>
          </div>

          {/* Editable Contact & Residential Record */}
          <form
            onSubmit={handleSaveProfile}
            className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Contact &amp; Residential Information (<span className="font-mono">registration</span>)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update verified phone, institutional email, and correspondence address
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-mob" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  id="prof-mob"
                  type="text"
                  value={mobInput}
                  onChange={(e) => setMobInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="prof-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email
                </label>
                <input
                  id="prof-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prof-cadd" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correspondence / Hostel Address
              </label>
              <textarea
                id="prof-cadd"
                rows={2}
                value={caddInput}
                onChange={(e) => setCaddInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                Permanent Address ({activeStudent.dist}, {activeStudent.state}):
              </div>
              <div>{activeStudent.padd}</div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. ASSESSMENT MODULE
  if (mode === 'assessment') {
    const handleMarkEdit = (idx: number, field: 'internalMarks' | 'externalMarks', value: number) => {
      const nextMarks = activeStudent.subjectMarks.map((m, i) => {
        if (i !== idx) return m;
        const internal =
          field === 'internalMarks' ? Math.min(30, Math.max(0, Math.round(value))) : m.internalMarks;
        const external =
          field === 'externalMarks' ? Math.min(70, Math.max(0, Math.round(value))) : m.externalMarks;
        const total = internal + external;
        return {
          ...m,
          internalMarks: internal,
          externalMarks: external,
          totalMarks: total,
          grade: computeLetterGrade(total),
        };
      });

      const avgTotal =
        nextMarks.reduce((acc, m) => acc + m.totalMarks, 0) / (nextMarks.length || 1);
      const nextCgpa = Number((avgTotal / 10).toFixed(2));

      onUpdateStudent({
        ...activeStudent,
        subjectMarks: nextMarks,
        cgpa: nextCgpa,
      });
      setBanner(`Updated assessment marks & recalculated CGPA (${nextCgpa.toFixed(2)}) for ${activeStudent.fname}.`);
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: ASSESSMENT &amp; EXAM GRADING · {activeStudent.courseShort} SEM {activeStudent.semester}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Internal &amp; End-Semester Assessment Matrix
            </h1>
          </div>

          {role === 'admin' && (
            <div className="flex items-center gap-2">
              <label htmlFor="assess-student-select" className="text-xs font-mono text-slate-500">
                Select Student:
              </label>
              <select
                id="assess-student-select"
                value={activeStudent.id}
                onChange={(e) => onSelectActiveStudent(Number(e.target.value))}
                className="px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.regno} — {s.fname} {s.lname} (CGPA {s.cgpa.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {activeStudent.fname} {activeStudent.lname} ({activeStudent.regno}) · Official Marksheet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {role === 'admin'
                  ? 'Admin Mode: Edit Internal (Max 30) or External (Max 70) marks directly to recalculate grades & CGPA'
                  : 'Student Mode: Verified Continuous Internal Evaluation (CIE) and Semester End Exam (SEE) scores'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-900 dark:text-white">
              <Award className="w-4 h-4 text-blue-600" />
              CGPA: {activeStudent.cgpa.toFixed(2)} / 10.0
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-6">Subject Code &amp; Title</th>
                  <th className="py-3 px-4 text-right">Internal (Max 30)</th>
                  <th className="py-3 px-4 text-right">External (Max 70)</th>
                  <th className="py-3 px-4 text-right">Total (100)</th>
                  <th className="py-3 px-6 text-right">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {activeStudent.subjectMarks.map((mark, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                      {mark.subjectName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      {role === 'admin' ? (
                        <input
                          type="number"
                          min={0}
                          max={30}
                          aria-label={`Internal marks for ${mark.subjectName}`}
                          value={mark.internalMarks}
                          onChange={(e) =>
                            handleMarkEdit(idx, 'internalMarks', Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950"
                        />
                      ) : (
                        <span>{mark.internalMarks}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      {role === 'admin' ? (
                        <input
                          type="number"
                          min={0}
                          max={70}
                          aria-label={`External marks for ${mark.subjectName}`}
                          value={mark.externalMarks}
                          onChange={(e) =>
                            handleMarkEdit(idx, 'externalMarks', Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950"
                        />
                      ) : (
                        <span>{mark.externalMarks}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {mark.totalMarks}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {mark.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 3. ATTENDANCE MODULE
  if (mode === 'attendance') {
    const handleSubjectAttendanceChange = (idx: number, delta: number) => {
      const nextMarks = activeStudent.subjectMarks.map((m, i) => {
        if (i !== idx) return m;
        const total = (m.totalClasses ?? 40) + 1;
        const attended = Math.min(total, Math.max(0, (m.attendedClasses ?? 36) + (delta > 0 ? 1 : 0)));
        return { ...m, attendedClasses: attended, totalClasses: total };
      });

      const sumAtt = nextMarks.reduce((acc, m) => acc + (m.attendedClasses ?? 36), 0);
      const sumTot = nextMarks.reduce((acc, m) => acc + (m.totalClasses ?? 40), 0);
      const overallPct = Math.round((sumAtt / (sumTot || 1)) * 100);

      onUpdateStudent({
        ...activeStudent,
        subjectMarks: nextMarks,
        attendancePercent: overallPct,
      });
      setBanner(`Recorded lecture attendance for ${activeStudent.fname}. Overall attendance: ${overallPct}%.`);
    };

    const handleLeaveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!leaveReason.trim()) return;
      onSubmitLeave({
        studentRegno: activeStudent.regno,
        studentName: `${activeStudent.fname} ${activeStudent.lname}`,
        reason: leaveReason.trim(),
        fromDate: leaveFrom,
        toDate: leaveTo,
      });
      setLeaveReason('');
      setBanner('Submitted medical/academic leave application to the Registrar.');
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: ATTENDANCE REGISTER &amp; CONDONATION · 75% STATUTORY RULE
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Subject Attendance Matrix &amp; Leave Desk
            </h1>
          </div>

          {role === 'admin' && (
            <select
              aria-label="Select student for attendance register"
              value={activeStudent.id}
              onChange={(e) => onSelectActiveStudent(Number(e.target.value))}
              className="px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.regno} — {s.fname} {s.lname} ({s.attendancePercent}%)
                </option>
              ))}
            </select>
          )}
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {activeStudent.fname} {activeStudent.lname} · Subject-Wise Attendance Ledger
            </h2>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
              Aggregate: {activeStudent.attendancePercent}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500">
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-4 text-right">Attended / Total</th>
                  <th className="py-3 px-4 text-right">Percentage</th>
                  <th className="py-3 px-4">75% Threshold Calculator</th>
                  <th className="py-3 px-6 text-right">Punch Lecture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {activeStudent.subjectMarks.map((sub, idx) => {
                  const att = sub.attendedClasses ?? 36;
                  const tot = sub.totalClasses ?? 40;
                  const calc = calculateAttendanceTarget(att, tot, 75);
                  return (
                    <tr key={idx}>
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        {sub.subjectName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {att} / {tot}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        {calc.currentPct}%
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {calc.classesNeededForTarget > 0 ? (
                          <span className="text-amber-700 dark:text-amber-400 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Attend next {calc.classesNeededForTarget} classes for 75%
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Safe · Can miss {calc.classesCanMiss} classes
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSubjectAttendanceChange(idx, 1)}
                            className="px-2.5 py-1 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded hover:opacity-90"
                          >
                            + Present
                          </button>
                          {role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleSubjectAttendanceChange(idx, 0)}
                              className="px-2.5 py-1 text-xs font-mono text-red-700 bg-red-50 hover:bg-red-100 rounded"
                            >
                              + Absent
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Applications Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleLeaveSubmit}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Submit Medical / Academic Leave Request
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="leave-from" className="block text-xs text-slate-500 mb-1">
                  From Date
                </label>
                <input
                  id="leave-from"
                  type="date"
                  value={leaveFrom}
                  onChange={(e) => setLeaveFrom(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="leave-to" className="block text-xs text-slate-500 mb-1">
                  To Date
                </label>
                <input
                  id="leave-to"
                  type="date"
                  value={leaveTo}
                  onChange={(e) => setLeaveTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
                />
              </div>
            </div>
            <div>
              <label htmlFor="leave-reason" className="block text-xs text-slate-500 mb-1">
                Reason &amp; Supporting Reference
              </label>
              <input
                id="leave-reason"
                type="text"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="e.g. Medical certificate or Hackathon participation"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Submit Leave Application
            </button>
          </form>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Leave &amp; Condonation Requests ({leaveApplications.length})
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {leaveApplications.map((lv) => (
                <div key={lv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {lv.studentName} ({lv.studentRegno}) · {lv.fromDate} to {lv.toDate}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">{lv.reason}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold">{lv.status}</span>
                    {role === 'admin' && lv.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onUpdateLeaveStatus(lv.id, 'Approved')}
                          className="px-2.5 py-1 text-white bg-emerald-600 rounded font-mono"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateLeaveStatus(lv.id, 'Rejected')}
                          className="px-2.5 py-1 text-red-700 bg-red-50 rounded font-mono"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. HOMEWORKS MODULE
  const filteredHomeworks = homeworks.filter((h) =>
    hwFilter === 'all' ? true : h.status === hwFilter
  );

  const handleCreateHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;
    onCreateHomework({
      title: newHwTitle.trim(),
      courseShort: newHwCourse,
      subjectName: newHwSubject,
      dueDate: newHwDue,
      maxMarks: 25,
      description: newHwDesc.trim() || 'Complete the lab implementation and upload repository/report link.',
    });
    setNewHwTitle('');
    setNewHwDesc('');
    setBanner('Published new homework assignment to course cohort.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            MODULE: HOMEWORKS &amp; LAB SUBMISSIONS · {homeworks.length} ASSIGNMENTS
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Coursework, Lab Repositories &amp; Faculty Grading
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'Pending', 'Submitted', 'Graded'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setHwFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                hwFilter === st
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {st === 'all' ? 'All Tasks' : st}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          {banner}
        </div>
      )}

      {role === 'admin' && (
        <form
          onSubmit={handleCreateHwSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
            + ASSIGN NEW HOMEWORK (ADMIN / FACULTY)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              aria-label="Homework title"
              value={newHwTitle}
              onChange={(e) => setNewHwTitle(e.target.value)}
              placeholder="Assignment title..."
              className="sm:col-span-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
            <input
              type="text"
              aria-label="Subject name"
              value={newHwSubject}
              onChange={(e) => setNewHwSubject(e.target.value)}
              placeholder="Subject code & name"
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
            <input
              type="date"
              aria-label="Due date"
              value={newHwDue}
              onChange={(e) => setNewHwDue(e.target.value)}
              className="px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              aria-label="Homework description"
              value={newHwDesc}
              onChange={(e) => setNewHwDesc(e.target.value)}
              placeholder="Problem statement and deliverables..."
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
            <button
              type="submit"
              className="px-5 py-2 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHomeworks.map((hw) => (
          <div
            key={hw.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {hw.courseShort} · {hw.subjectName}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{hw.status}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{hw.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {hw.description}
              </p>
              <div className="text-xs font-mono text-slate-500 pt-1">
                Due Date: {hw.dueDate} · Max Marks: {hw.maxMarks}
              </div>

              {hw.studentSubmissionText && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                  <div className="font-mono text-slate-500">
                    Submitted by {hw.submittedByRegno || activeStudent.regno} ({hw.submittedAt || 'Verified'}):
                  </div>
                  <div className="font-mono text-slate-900 dark:text-white break-all">
                    {hw.studentSubmissionText}
                  </div>
                  {hw.awardedMarks !== undefined && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                      Score: {hw.awardedMarks} / {hw.maxMarks} · {hw.facultyFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>

            {role === 'student' && hw.status !== 'Graded' && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  aria-label={`Submission link or answer for ${hw.title}`}
                  value={submissionInputs[hw.id] ?? ''}
                  onChange={(e) =>
                    setSubmissionInputs({ ...submissionInputs, [hw.id]: e.target.value })
                  }
                  placeholder="Paste GitHub repo URL or solution summary..."
                  className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => {
                    const text =
                      (submissionInputs[hw.id] ?? '').trim() ||
                      `https://github.com/${activeStudent.fname.toLowerCase()}/solution-${hw.id}`;
                    onSubmitHomework(hw.id, text, activeStudent.regno);
                    setBanner(`Submitted homework "${hw.title}" for ${activeStudent.regno}.`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg whitespace-nowrap"
                >
                  <Send className="w-3 h-3" />
                  Submit Work
                </button>
              </div>
            )}

            {role === 'admin' && hw.status !== 'Graded' && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={hw.maxMarks}
                  aria-label={`Awarded marks for ${hw.title}`}
                  value={gradeInputs[hw.id]?.marks ?? hw.maxMarks - 2}
                  onChange={(e) =>
                    setGradeInputs({
                      ...gradeInputs,
                      [hw.id]: {
                        marks: Number(e.target.value),
                        feedback: gradeInputs[hw.id]?.feedback ?? 'Verified lab submission.',
                      },
                    })
                  }
                  className="w-20 px-2 py-1.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950"
                />
                <input
                  type="text"
                  aria-label={`Faculty feedback for ${hw.title}`}
                  value={gradeInputs[hw.id]?.feedback ?? 'Verified lab submission.'}
                  onChange={(e) =>
                    setGradeInputs({
                      ...gradeInputs,
                      [hw.id]: {
                        marks: gradeInputs[hw.id]?.marks ?? hw.maxMarks - 2,
                        feedback: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => {
                    const g = gradeInputs[hw.id] ?? {
                      marks: hw.maxMarks - 1,
                      feedback: 'Verified lab submission.',
                    };
                    onGradeHomework(hw.id, g.marks, g.feedback);
                    setBanner(`Graded assignment "${hw.title}" (${g.marks}/${hw.maxMarks}).`);
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-emerald-600 rounded whitespace-nowrap"
                >
                  Publish Grade
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
