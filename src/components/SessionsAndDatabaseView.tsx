import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Calendar,
  Plus,
  KeyRound,
  Lock,
  RotateCcw,
  FileText,
  BookOpen,
} from 'lucide-react';
import {
  AdminCredential,
  CourseRecord,
  SubjectRecord,
  AcademicSession,
  StudentRecord,
} from '../types/studentRecord';
import { generateStudentRecordSqlDump } from '../utils/studentRecordLogic';

interface SessionsAndDatabaseViewProps {
  mode: 'sessions' | 'database';
  admin: AdminCredential;
  courses: CourseRecord[];
  subjects: SubjectRecord[];
  sessions: AcademicSession[];
  students: StudentRecord[];
  onAddSession: (sessionLabel: string) => void;
  onSetActiveSession: (id: number) => void;
  onUpdateAdminPassword: (newPassword: string) => void;
  onResetDatabaseToSeed: () => void;
  onLockAdminSession: () => void;
}

const PROJECT_DOCUMENTATION_MD = `# NOTHING·SRMS — Student Record Management System (studentrecordms / studentrecorddb)
Nothing OS 3.0 Inspired Campus Operating System with Dynamic Interactive Widgets & Essential Key AI Agent

## 1. System Overview
NOTHING·SRMS unifies the traditional relational database schema of studentrecordms (studentrecorddb) with a Nothing OS 3.0 interface featuring radial dot-matrix telemetry surfaces, 6 customizable Dynamic Widgets, dual Student & Admin Portals, and an interactive Nothing OS Essential Key AI Agent (Alt+E).

## 2. Authentication & Default Credentials
- Student Login: Roll No "SRMS-2026-1001" (or Email "aarav.deshmukh@institute.edu.in") | Password: "Student@123"
- Additional Students: "SRMS-2026-1002" through "SRMS-2026-1008" | Password: "Student@123"
- Admin Registrar Login: Username "admin" | Password: "Test@12345"
- Role Switcher: Instant "Student View ⇄ Admin View" toggle in the top-left sidebar.

## 3. All 12 Integrated Campus OS Modules
01. Overall Dashboard (dashboard) — 6 toggleable Nothing OS Dynamic Widgets + KPI strip + Semester Subject Standing.
02. Profile (profile) — Student personal/guardian/address editor & Admin tbl_login manager.
03. Assessment Module (assessment) — Internal (30) + External (70) marks, automatic grade & CGPA engine, Admin grading sliders.
04. Attendance (attendance) — 75% statutory target calculator, subject attendance bars (+1 Present), & Leave Approval Desk.
05. Homeworks (homeworks) — Course assignment tracker, student repository submission, & faculty inline grading.
06. Mail (mail) — Institutional Inbox, Sent, Starred filter, & Compose Campus Mail modal.
07. Fees (fees) — Semester tuition ledger, instant online balance payment, receipt generator, & Admin clearance toggles.
08. AI Agent [Essential Key] (ai_agent) — Global Alt+E hardware key simulation powered by Gemini (/api/essential-agent) with pinnable Essential Space cards.
09. Google Meet Module (google_meet) — Live & upcoming virtual classrooms, attendance check-in, & Admin lecture scheduler.
10. Library Requesting (library) — ISBN catalog search, book request/return workflow, & Admin issue approval.
11. Notice Board (notice_board) — Pinned institutional circulars with category filters & Essential Key AI summarization.
12. Settings & MySQL (settings) — Academic session governance (session), live studentrecorddb.sql export, & Project Documentation.

## 4. Relational MySQL Schema (studentrecorddb)
1. tbl_login (id, username, password, admin_email, last_login)
2. tbl_course (cid, cshort, cfull, cdate)
3. tbl_subject (subid, cshort, cfull, sub1, sub2, sub3, sub4, created_at)
4. session (id, session, status, posting_date)
5. registration (id, regno, course, course_short, subject_combo, fname, mname, lname, gender, dob, category, mobno, emailid, gname, ocp, income, padd, pcity, pstate, pcountry, board1, roll1, pyear1, marks1, board2, roll2, pyear2, marks2, session, semester, cgpa, attendance_pct, fee_status, standing, regdate)
`;

export const SessionsAndDatabaseView: React.FC<SessionsAndDatabaseViewProps> = ({
  mode,
  admin,
  courses,
  subjects,
  sessions,
  students,
  onAddSession,
  onSetActiveSession,
  onUpdateAdminPassword,
  onResetDatabaseToSeed,
  onLockAdminSession,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'sessions' | 'docs'>(
    mode === 'sessions' ? 'sessions' : 'database'
  );
  const [newSessionLabel, setNewSessionLabel] = useState('');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedDocs, setCopiedDocs] = useState(false);

  // Password update form state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const sqlDump = generateStudentRecordSqlDump({
    admin,
    courses,
    subjects,
    sessions,
    students,
  });

  const handleAddSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSessionLabel.trim();
    if (!/^\d{4}-\d{4}$/.test(trimmed)) {
      setSessionError('Academic session must follow YYYY-YYYY format (e.g. 2028-2029).');
      return;
    }
    if (sessions.some((s) => s.session === trimmed)) {
      setSessionError(`Session "${trimmed}" already exists in studentrecorddb.session.`);
      return;
    }
    onAddSession(trimmed);
    setNewSessionLabel('');
    setSessionError(null);
    setStatusToast(`Added academic session ${trimmed} to studentrecorddb.session.`);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlDump], { type: 'application/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studentrecorddb.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusToast('Downloaded studentrecorddb.sql for phpMyAdmin / MySQL import.');
  };

  const handleDownloadDocs = () => {
    const blob = new Blob([PROJECT_DOCUMENTATION_MD], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DOCUMENTATION.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusToast('Downloaded DOCUMENTATION.md.');
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(sqlDump);
      setCopiedSql(true);
      setStatusToast('Copied studentrecorddb.sql DDL & INSERT statements to clipboard.');
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      setStatusToast('SQL script ready below for manual copy.');
    }
  };

  const handleCopyDocs = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_DOCUMENTATION_MD);
      setCopiedDocs(true);
      setStatusToast('Copied Project Documentation markdown to clipboard.');
      setTimeout(() => setCopiedDocs(false), 2500);
    } catch {
      setStatusToast('Documentation ready below for manual copy.');
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasswordInput !== admin.password) {
      setPasswordError(`Current password does not match active admin password (${admin.password}).`);
      return;
    }
    if (newPasswordInput.trim().length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    onUpdateAdminPassword(newPasswordInput.trim());
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setPasswordError(null);
    setStatusToast('Updated admin password in tbl_login.');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
            MODULE: SYSTEM SETTINGS · MYSQL SCHEMA (studentrecorddb) · DOCUMENTATION
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Settings, MySQL Export &amp; Documentation
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveSubTab('database')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'database'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              MySQL &amp; Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sessions')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'sessions'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Sessions ({sessions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('docs')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeSubTab === 'docs'
                  ? 'bg-[#D71921] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Documentation
            </button>
          </div>
          <button
            type="button"
            onClick={handleDownloadSql}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            studentrecorddb.sql
          </button>
        </div>
      </div>

      {statusToast && (
        <div
          role="status"
          className="px-4 py-3 text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg"
        >
          {statusToast}
        </div>
      )}

      {/* SUB-TAB 1: SESSIONS */}
      {activeSubTab === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddSessionSubmit}
            noValidate
            className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                Create Academic Session
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adds a new academic year to <span className="font-mono">studentrecorddb.session</span>
              </p>
            </div>

            <div>
              <label
                htmlFor="session-input"
                className="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1.5"
              >
                Session Year Range (YYYY-YYYY) <span className="text-[#D71921]">*</span>
              </label>
              <input
                id="session-input"
                type="text"
                value={newSessionLabel}
                onChange={(e) => {
                  setNewSessionLabel(e.target.value);
                  if (sessionError) setSessionError(null);
                }}
                placeholder="e.g. 2028-2029"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {sessionError && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {sessionError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Academic Session
            </button>
          </form>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                Configured Academic Sessions ({sessions.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-6">Session ID</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Enrolled Students</th>
                    <th className="py-3 px-4">Posting Date</th>
                    <th className="py-3 px-6 text-right">Set Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {sessions.map((ses) => {
                    const count = students.filter((s) => s.session === ses.session).length;
                    return (
                      <tr
                        key={ses.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-6 font-mono text-xs tabular-nums text-slate-500">
                          #{ses.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                          {ses.session}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {ses.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                              <Calendar className="w-3.5 h-3.5" />
                              Active Session
                            </span>
                          ) : (
                            <span className="text-slate-500">{ses.status}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white">
                          {count}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500">
                          {ses.postingDate}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {ses.status === 'Active' ? (
                            <span className="text-xs font-mono text-slate-400">Current Active</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSetActiveSession(ses.id);
                                setStatusToast(`Switched active session to ${ses.session}.`);
                              }}
                              className="px-3 py-1.5 text-xs font-mono font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                            >
                              Make Active
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DOCUMENTATION */}
      {activeSubTab === 'docs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D71921]" />
              <span className="text-xs font-mono font-bold text-slate-950 dark:text-white">
                DOCUMENTATION.md — Full System &amp; Architecture Specification
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {copiedDocs ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied Docs
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Markdown
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadDocs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-white bg-[#D71921] rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Download DOCUMENTATION.md
              </button>
            </div>
          </div>
          <pre className="p-6 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto max-h-[560px] leading-relaxed whitespace-pre-wrap">
            <code>{PROJECT_DOCUMENTATION_MD}</code>
          </pre>
        </div>
      )}

      {/* SUB-TAB 3: DATABASE & CREDENTIALS */}
      {activeSubTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 5 Columns: Admin Credential Manager & XAMPP/WAMP Setup Reference */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Admin Credential (<span className="font-mono">tbl_login</span>)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configured per project README specification
                  </p>
                </div>
                <KeyRound className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Admin Username:</span>
                  <code className="font-mono font-semibold text-slate-900 dark:text-white">
                    {admin.username}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Active Password:</span>
                  <code className="font-mono font-semibold text-slate-900 dark:text-white">
                    {admin.password}
                  </code>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-slate-500 dark:text-slate-400">Student Default Pass:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    Student@123
                  </span>
                </div>
              </div>

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-800 dark:text-slate-200">
                  Update Admin Password
                </h3>
                <div>
                  <label
                    htmlFor="curr-pass"
                    className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    id="curr-pass"
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => {
                      setCurrentPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter current password (Test@12345)"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-pass"
                    className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="new-pass"
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => {
                      setNewPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-600" role="alert">
                    {passwordError}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-950 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={onLockAdminSession}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Test Login Screen
                  </button>
                  <button
                    type="button"
                    onClick={onResetDatabaseToSeed}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Seed Data
                  </button>
                </div>
              </form>
            </div>

            {/* Attached README Reference Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                PHP &amp; MySQL Deployment Guide (<span className="font-mono">studentrecordms</span>)
              </h2>
              <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <li>
                  Copy the <code className="font-mono text-slate-900 dark:text-white">studentrecordms</code> folder inside your root directory (<code className="font-mono">xampp/htdocs</code>, <code className="font-mono">wamp/www</code>, or <code className="font-mono">/var/www/html</code>).
                </li>
                <li>
                  Open <strong>phpMyAdmin</strong> (<code className="font-mono">http://localhost/phpmyadmin</code>) and create a database named <code className="font-mono font-semibold text-slate-900 dark:text-white">studentrecorddb</code>.
                </li>
                <li>
                  Import the live-generated <code className="font-mono font-semibold text-slate-900 dark:text-white">studentrecorddb.sql</code> file (downloadable on the right).
                </li>
                <li>
                  Authenticate as Admin (<code className="font-mono font-semibold text-slate-900 dark:text-white">admin</code> / <code className="font-mono font-semibold text-slate-900 dark:text-white">Test@12345</code>) or Student (<code className="font-mono font-semibold text-slate-900 dark:text-white">SRMS-2026-1001</code> / <code className="font-mono font-semibold text-slate-900 dark:text-white">Student@123</code>).
                </li>
              </ol>
            </div>
          </div>

          {/* Right 7 Columns: Live SQL Schema & Data Dump Viewer */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                  studentrecorddb.sql (Live Synchronized Dump)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied SQL
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL Script
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto max-h-[540px] leading-relaxed">
              <code>{sqlDump}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
