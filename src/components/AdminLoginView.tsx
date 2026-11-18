import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  GraduationCap,
} from 'lucide-react';
import { AdminCredential, StudentRecord, UserRole } from '../types/studentRecord';
import {
  validateAdminCredentials,
  validateStudentCredentials,
  getStudentStanding,
} from '../utils/studentRecordLogic';

interface AdminLoginViewProps {
  admin: AdminCredential;
  students: StudentRecord[];
  onLoginSuccess: (role: UserRole, student?: StudentRecord) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  admin,
  students,
  onLoginSuccess,
}) => {
  const [loginMode, setLoginMode] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('SRMS-2026-1001');
  const [password, setPassword] = useState('Student@123');
  const [authError, setAuthError] = useState<string | null>(null);

  // Public student verification lookup on left column
  const [lookupRoll, setLookupRoll] = useState('SRMS-2026-1001');
  const matchedStudent = students.find(
    (s) => s.regno.toLowerCase() === lookupRoll.trim().toLowerCase()
  );

  const handleSwitchMode = (nextRole: UserRole) => {
    setLoginMode(nextRole);
    setAuthError(null);
    if (nextRole === 'admin') {
      setIdentifier('admin');
      setPassword('Test@12345');
    } else {
      setIdentifier('SRMS-2026-1001');
      setPassword('Student@123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMode === 'admin') {
      const res = validateAdminCredentials(identifier, password, admin);
      if (!res.valid) {
        setAuthError(res.error || 'Admin authentication failed.');
        return;
      }
      setAuthError(null);
      onLoginSuccess('admin');
    } else {
      const res = validateStudentCredentials(identifier, password, students);
      if (!res.valid || !res.student) {
        setAuthError(res.error || 'Student authentication failed.');
        return;
      }
      setAuthError(null);
      onLoginSuccess('student', res.student);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center py-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 7 Columns: Nothing OS Institutional Portal & Public Student Verification Lookup */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col justify-between space-y-6 nothing-dot-bg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-red-600" />
              <span>NOTHING OS 3.0</span>
              <span aria-hidden="true">·</span>
              <span>studentrecordms</span>
              <span aria-hidden="true">·</span>
              <span>studentrecorddb</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student &amp; Admin Campus OS Portal
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Unified academic operating system with 12 integrated modules: Overall Dynamic Widget
              Dashboard, Profile, Assessment, Attendance, Homeworks, Campus Mail, Fees, Nothing OS{' '}
              <strong>Essential Key AI Agent</strong>, Google Meet Classrooms, Library Requesting,
              Notice Board, and MySQL Settings.
            </p>
          </div>

          {/* Public Roll Number Lookup Box */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label htmlFor="public-roll-lookup" className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                PUBLIC ENROLLMENT &amp; STANDING VERIFICATION
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Sample IDs:</span>
                {['SRMS-2026-1001', 'SRMS-2026-1002', 'SRMS-2026-1008'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setLookupRoll(sample)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="public-roll-lookup"
                type="text"
                value={lookupRoll}
                onChange={(e) => setLookupRoll(e.target.value)}
                placeholder="Enter Registration No (e.g. SRMS-2026-1001)"
                className="w-full pl-9 pr-4 py-2 text-sm font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {matchedStudent ? (
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {matchedStudent.fname} {matchedStudent.mname ? `${matchedStudent.mname} ` : ''}
                      {matchedStudent.lname}
                    </span>
                    <span className="ml-2 font-mono text-slate-500">({matchedStudent.regno})</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Enrollment
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">PROGRAM</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{matchedStudent.courseShort}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SESSION &amp; SEM</span>
                    <span className="text-slate-900 dark:text-white">
                      {matchedStudent.session} · S{matchedStudent.semester}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CGPA</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {matchedStudent.cgpa.toFixed(2)} / 10.0
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">STANDING</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {getStudentStanding(matchedStudent)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No student record found matching{' '}
                <code className="font-mono text-slate-700">{lookupRoll || 'empty query'}</code>.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
            <span>Total Enrolled Students: {students.length}</span>
            <span>Database Engine: MySQL / studentrecorddb</span>
          </div>
        </div>

        {/* Right 5 Columns: Dual Student & Admin Login Gate */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Role Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => handleSwitchMode('student')}
                className={`py-2 px-3 text-xs font-mono font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  loginMode === 'student'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student Login
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('admin')}
                className={`py-2 px-3 text-xs font-mono font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  loginMode === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Login
              </button>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {loginMode === 'admin' ? 'Admin Registrar Sign In' : 'Student Portal Sign In'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {loginMode === 'admin'
                  ? 'Authenticate against studentrecorddb.tbl_login'
                  : 'Authenticate against studentrecorddb.registration'}
              </p>
            </div>

            {authError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="portal-identifier" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {loginMode === 'admin' ? 'Admin Username *' : 'Student Roll No or Email *'}
                </label>
                <input
                  id="portal-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder={loginMode === 'admin' ? 'admin' : 'SRMS-2026-1001'}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label htmlFor="portal-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="portal-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder={loginMode === 'admin' ? 'Test@12345' : 'Student@123'}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
              >
                {loginMode === 'admin' ? 'Sign In as Admin Registrar' : 'Sign In as Student'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Credentials Helper Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                DEMO CREDENTIALS
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('student')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Fill Student
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('admin')}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Fill Admin
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
                <span className="text-slate-400 block text-[10px]">Student Login</span>
                <span className="text-slate-900 dark:text-white font-semibold block">SRMS-2026-1001</span>
                <span className="text-slate-500 text-[11px]">Pass: Student@123</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
                <span className="text-slate-400 block text-[10px]">Admin (README)</span>
                <span className="text-slate-900 dark:text-white font-semibold block">{admin.username}</span>
                <span className="text-slate-500 text-[11px]">Pass: {admin.password}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
