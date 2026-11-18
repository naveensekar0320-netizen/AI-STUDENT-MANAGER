import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Award,
  CalendarCheck,
  FileCode2,
  Mail,
  CreditCard,
  Cpu,
  Video,
  BookOpen,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  Layers,
  UserPlus,
} from 'lucide-react';
import {
  UserRole,
  AdminCredential,
  CourseRecord,
  SubjectRecord,
  AcademicSession,
  StudentRecord,
  HomeworkAssignment,
  CampusMailMessage,
  FeeTransaction,
  GoogleMeetLecture,
  LibraryBookRequest,
  CollegeNotice,
  EssentialSpaceCapture,
  LeaveApplication,
  DynamicWidgetId,
  NavigationTab,
} from './types/studentRecord';
import {
  INITIAL_ADMIN_CREDENTIAL,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  INITIAL_STUDENTS,
  INITIAL_HOMEWORKS,
  INITIAL_MAILS,
  INITIAL_FEE_TRANSACTIONS,
  INITIAL_MEET_LECTURES,
  INITIAL_LIBRARY_BOOKS,
  INITIAL_NOTICES,
  INITIAL_ESSENTIAL_CAPTURES,
  INITIAL_LEAVE_APPLICATIONS,
} from './data/seedStudentRecordDb';
import { calculateDashboardMetrics } from './utils/studentRecordLogic';
import { DynamicDashboardView } from './components/DynamicDashboardView';
import { EssentialKeyAgentView } from './components/EssentialKeyAgentView';
import { AcademicModulesView } from './components/AcademicModulesView';
import { CampusServicesView } from './components/CampusServicesView';
import { CoursesView } from './components/CoursesView';
import { SubjectsView } from './components/SubjectsView';
import { RegisterStudentView } from './components/RegisterStudentView';
import { ManageStudentsView } from './components/ManageStudentsView';
import { SessionsAndDatabaseView } from './components/SessionsAndDatabaseView';
import { AdminLoginView } from './components/AdminLoginView';

const STORAGE_KEY = 'studentrecordms_nothing_os_v2';

interface PersistedState {
  admin: AdminCredential;
  courses: CourseRecord[];
  subjects: SubjectRecord[];
  sessions: AcademicSession[];
  students: StudentRecord[];
  homeworks: HomeworkAssignment[];
  mails: CampusMailMessage[];
  feeTransactions: FeeTransaction[];
  meetLectures: GoogleMeetLecture[];
  libraryBooks: LibraryBookRequest[];
  notices: CollegeNotice[];
  essentialCaptures: EssentialSpaceCapture[];
  leaveApplications: LeaveApplication[];
  enabledWidgets: DynamicWidgetId[];
}

const DEFAULT_WIDGETS: DynamicWidgetId[] = [
  'attendance_matrix',
  'next_meet_class',
  'homework_radar',
  'fee_ledger',
  'library_due',
  'essential_captures',
];

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.homeworks)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data
  }
  return {
    admin: INITIAL_ADMIN_CREDENTIAL,
    courses: INITIAL_COURSES,
    subjects: INITIAL_SUBJECTS,
    sessions: INITIAL_SESSIONS,
    students: INITIAL_STUDENTS,
    homeworks: INITIAL_HOMEWORKS,
    mails: INITIAL_MAILS,
    feeTransactions: INITIAL_FEE_TRANSACTIONS,
    meetLectures: INITIAL_MEET_LECTURES,
    libraryBooks: INITIAL_LIBRARY_BOOKS,
    notices: INITIAL_NOTICES,
    essentialCaptures: INITIAL_ESSENTIAL_CAPTURES,
    leaveApplications: INITIAL_LEAVE_APPLICATIONS,
    enabledWidgets: DEFAULT_WIDGETS,
  };
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [role, setRole] = useState<UserRole>('student');
  const [activeStudentId, setActiveStudentId] = useState<number>(INITIAL_STUDENTS[0].id);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Essential Key Modal state
  const [essentialModalOpen, setEssentialModalOpen] = useState<boolean>(false);
  const [essentialModalPrompt, setEssentialModalPrompt] = useState<string>('');

  // Directory sub-states
  const [courseFilterForDirectory, setCourseFilterForDirectory] = useState<number | 'all'>('all');
  const [selectedStudentForTranscript, setSelectedStudentForTranscript] =
    useState<StudentRecord | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage error
    }
  }, [state]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut Alt+E for Nothing OS Essential Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setEssentialModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeStudent =
    state.students.find((s) => s.id === activeStudentId) || state.students[0];

  const metrics = calculateDashboardMetrics(
    state.students,
    state.courses,
    state.subjects,
    state.sessions
  );

  // Widget toggle
  const handleToggleWidget = (widgetId: DynamicWidgetId) => {
    setState((prev) => {
      const exists = prev.enabledWidgets.includes(widgetId);
      return {
        ...prev,
        enabledWidgets: exists
          ? prev.enabledWidgets.filter((id) => id !== widgetId)
          : [...prev.enabledWidgets, widgetId],
      };
    });
  };

  // Student & Course CRUD handlers
  const handleUpdateStudent = (updated: StudentRecord) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handlePunchStudentAttendance = (studentId: number) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const nextMarks = s.subjectMarks.map((m) => ({
          ...m,
          attendedClasses: (m.attendedClasses ?? 36) + 1,
          totalClasses: (m.totalClasses ?? 40) + 1,
        }));
        const sumAtt = nextMarks.reduce((a, m) => a + (m.attendedClasses ?? 37), 0);
        const sumTot = nextMarks.reduce((a, m) => a + (m.totalClasses ?? 41), 0);
        return {
          ...s,
          subjectMarks: nextMarks,
          attendancePercent: Math.min(100, Math.round((sumAtt / sumTot) * 100)),
        };
      }),
    }));
  };

  const handleAddCourse = (newCourse: Omit<CourseRecord, 'cid' | 'cdate'>) => {
    setState((prev) => {
      const nextCid = prev.courses.reduce((max, c) => Math.max(max, c.cid), 0) + 1;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...prev,
        courses: [...prev.courses, { ...newCourse, cid: nextCid, cdate: today }],
      };
    });
  };

  const handleUpdateCourse = (cid: number, updated: Omit<CourseRecord, 'cid' | 'cdate'>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.cid === cid ? { ...c, ...updated } : c)),
    }));
  };

  const handleDeleteCourse = (cid: number) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.cid !== cid),
    }));
  };

  const handleAddSubject = (newSub: Omit<SubjectRecord, 'subid' | 'createdAt'>) => {
    setState((prev) => {
      const nextId = prev.subjects.reduce((max, s) => Math.max(max, s.subid), 100) + 1;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...prev,
        subjects: [...prev.subjects, { ...newSub, subid: nextId, createdAt: today }],
      };
    });
  };

  const handleDeleteSubject = (subid: number) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.subid !== subid),
    }));
  };

  const handleRegisterStudent = (newStudent: Omit<StudentRecord, 'id'>) => {
    setState((prev) => {
      const nextId = prev.students.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      return {
        ...prev,
        students: [{ ...newStudent, id: nextId, password: 'Student@123' }, ...prev.students],
      };
    });
  };

  const handleDeleteStudent = (id: number) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
    }));
  };

  // Homework handlers
  const handleSubmitHomework = (hwId: number, submissionText: string, regno: string) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => ({
      ...prev,
      homeworks: prev.homeworks.map((h) =>
        h.id === hwId
          ? {
              ...h,
              status: 'Submitted',
              studentSubmissionText: submissionText,
              submittedByRegno: regno,
              submittedAt: now,
            }
          : h
      ),
    }));
  };

  const handleCreateHomework = (hw: Omit<HomeworkAssignment, 'id' | 'status'>) => {
    setState((prev) => ({
      ...prev,
      homeworks: [{ ...hw, id: Date.now(), status: 'Pending' }, ...prev.homeworks],
    }));
  };

  const handleGradeHomework = (hwId: number, marks: number, feedback: string) => {
    setState((prev) => ({
      ...prev,
      homeworks: prev.homeworks.map((h) =>
        h.id === hwId
          ? { ...h, status: 'Graded', awardedMarks: marks, facultyFeedback: feedback }
          : h
      ),
    }));
  };

  // Leave handlers
  const handleSubmitLeave = (leave: Omit<LeaveApplication, 'id' | 'status'>) => {
    setState((prev) => ({
      ...prev,
      leaveApplications: [
        { ...leave, id: Date.now(), status: 'Pending' },
        ...prev.leaveApplications,
      ],
    }));
  };

  const handleUpdateLeaveStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setState((prev) => ({
      ...prev,
      leaveApplications: prev.leaveApplications.map((l) =>
        l.id === id ? { ...l, status } : l
      ),
    }));
  };

  // Mail handlers
  const handleSendMail = (
    mail: Omit<CampusMailMessage, 'id' | 'timestamp' | 'starred' | 'read'>
  ) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setState((prev) => ({
      ...prev,
      mails: [
        { ...mail, id: Date.now(), timestamp: now, starred: false, read: true },
        ...prev.mails,
      ],
    }));
  };

  const handleToggleStarMail = (id: number) => {
    setState((prev) => ({
      ...prev,
      mails: prev.mails.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)),
    }));
  };

  // Fee payment handler
  const handlePayStudentFee = (studentId: number, amount: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => {
      const target = prev.students.find((s) => s.id === studentId);
      const nextStudents = prev.students.map((s) => {
        if (s.id !== studentId) return s;
        const tot = s.tuitionTotal ?? 85000;
        return {
          ...s,
          tuitionPaid: tot,
          feeStatus: 'Paid' as const,
        };
      });
      const newReceipt: FeeTransaction = {
        id: `RCPT-2026-${Math.floor(100 + Math.random() * 899)}`,
        studentRegno: target?.regno || 'SRMS-2026-1001',
        studentName: target ? `${target.fname} ${target.lname}` : 'Student',
        semester: target?.semester || 3,
        head: 'Tuition & Lab Fee',
        amount,
        status: 'Paid',
        paidDate: today,
        paymentMode: 'Campus OS Portal',
      };
      return {
        ...prev,
        students: nextStudents,
        feeTransactions: [newReceipt, ...prev.feeTransactions],
      };
    });
  };

  // Google Meet handlers
  const handleCheckInMeet = (meetId: number, regno: string) => {
    setState((prev) => ({
      ...prev,
      meetLectures: prev.meetLectures.map((m) => {
        if (m.id !== meetId) return m;
        if (m.checkedInRegnos.includes(regno)) return m;
        return { ...m, checkedInRegnos: [...m.checkedInRegnos, regno] };
      }),
    }));
  };

  const handleCreateMeetLecture = (
    lecture: Omit<GoogleMeetLecture, 'id' | 'checkedInRegnos'>
  ) => {
    setState((prev) => ({
      ...prev,
      meetLectures: [{ ...lecture, id: Date.now(), checkedInRegnos: [] }, ...prev.meetLectures],
    }));
  };

  // Library handlers
  const handleRequestLibraryBook = (bookId: number, student: StudentRecord) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      libraryBooks: prev.libraryBooks.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: 'Requested',
              requestedByRegno: student.regno,
              requestedByName: `${student.fname} ${student.lname}`,
              requestDate: today,
              dueDate: '2026-12-05',
              availableCopies: Math.max(0, b.availableCopies - 1),
            }
          : b
      ),
    }));
  };

  const handleUpdateLibraryBookStatus = (bookId: number, status: 'Issued' | 'Available') => {
    setState((prev) => ({
      ...prev,
      libraryBooks: prev.libraryBooks.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status,
              requestedByRegno: status === 'Available' ? '' : b.requestedByRegno,
              requestedByName: status === 'Available' ? '' : b.requestedByName,
              dueDate: status === 'Available' ? '—' : b.dueDate,
              availableCopies:
                status === 'Available' ? b.availableCopies + 1 : b.availableCopies,
            }
          : b
      ),
    }));
  };

  const handleAddLibraryBook = (
    book: Omit<
      LibraryBookRequest,
      'id' | 'requestedByRegno' | 'requestedByName' | 'requestDate' | 'dueDate' | 'status'
    >
  ) => {
    setState((prev) => ({
      ...prev,
      libraryBooks: [
        {
          ...book,
          id: Date.now(),
          requestedByRegno: '',
          requestedByName: '',
          requestDate: '—',
          dueDate: '—',
          status: 'Available',
        },
        ...prev.libraryBooks,
      ],
    }));
  };

  // Notice Board handlers
  const handleCreateNotice = (notice: Omit<CollegeNotice, 'id' | 'postedDate'>) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      notices: [{ ...notice, id: Date.now(), postedDate: today }, ...prev.notices],
    }));
  };

  const handleTogglePinNotice = (id: number) => {
    setState((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  // Essential Space AI Captures handlers
  const handleAddCapture = (capture: EssentialSpaceCapture) => {
    setState((prev) => ({
      ...prev,
      essentialCaptures: [capture, ...prev.essentialCaptures],
    }));
  };

  const handleTogglePinCapture = (id: string) => {
    setState((prev) => ({
      ...prev,
      essentialCaptures: prev.essentialCaptures.map((c) =>
        c.id === id ? { ...c, pinnedToDashboard: !c.pinnedToDashboard } : c
      ),
    }));
  };

  const handleDeleteCapture = (id: string) => {
    setState((prev) => ({
      ...prev,
      essentialCaptures: prev.essentialCaptures.filter((c) => c.id !== id),
    }));
  };

  // Primary 12 Modules requested by the user
  const primaryModules: Array<{
    id: NavigationTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string | number;
  }> = [
    { id: 'dashboard', label: 'Overall Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'assessment', label: 'Assessment Module', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, badge: `${activeStudent.attendancePercent}%` },
    { id: 'homeworks', label: 'Homeworks', icon: FileCode2, badge: state.homeworks.length },
    { id: 'mail', label: 'Mail', icon: Mail, badge: state.mails.length },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'ai_agent', label: 'AI Agent [Essential Key]', icon: Cpu, badge: state.essentialCaptures.length },
    { id: 'google_meet', label: 'Google Meet Module', icon: Video, badge: state.meetLectures.length },
    { id: 'library', label: 'Library Requesting', icon: BookOpen, badge: state.libraryBooks.length },
    { id: 'notice_board', label: 'Notice Board (College)', icon: Megaphone, badge: state.notices.length },
    { id: 'settings', label: 'Settings & MySQL', icon: Settings },
  ];

  // Admin database table management shortcuts
  const adminRegistryModules: Array<{
    id: NavigationTab;
    label: string;
    icon: typeof Users;
  }> = [
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'register', label: 'Register Student', icon: UserPlus },
    { id: 'courses', label: 'Courses (tbl_course)', icon: BookOpen },
    { id: 'subjects', label: 'Subjects (tbl_subject)', icon: Layers },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              if (isAuthenticated) setActiveTab('dashboard');
            }}
            className="text-base sm:text-lg font-bold tracking-tight font-mono text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            NOTHING·SRMS
          </a>
        </div>

        {/* Zone 2: 5 concise single-line text navigation links */}
        {isAuthenticated ? (
          <nav
            aria-label="Primary Header Navigation"
            className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-600 dark:text-slate-300"
          >
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'dashboard' ? 'text-red-600 dark:text-red-400 font-bold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assessment')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'assessment' ? 'text-red-600 dark:text-red-400 font-bold' : ''
              }`}
            >
              Assessment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'attendance' ? 'text-red-600 dark:text-red-400 font-bold' : ''
              }`}
            >
              Attendance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai_agent')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'ai_agent' ? 'text-red-600 dark:text-red-400 font-bold' : ''
              }`}
            >
              Essential AI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('google_meet')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'google_meet' ? 'text-red-600 dark:text-red-400 font-bold' : ''
              }`}
            >
              Google Meet
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-500">
            <span className="whitespace-nowrap">MySQL Schema: studentrecorddb</span>
          </div>
        )}

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                setActiveTab('login');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out ({role === 'admin' ? state.admin.username : activeStudent.regno})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(true);
                setActiveTab('dashboard');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Resume Session
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      {!isAuthenticated || activeTab === 'login' ? (
        <main className="flex-1 px-4 sm:px-6 lg:px-8">
          <AdminLoginView
            admin={state.admin}
            students={state.students}
            onLoginSuccess={(nextRole, matchedStudent) => {
              setRole(nextRole);
              if (matchedStudent) {
                setActiveStudentId(matchedStudent.id);
              }
              setIsAuthenticated(true);
              setActiveTab('dashboard');
            }}
          />
        </main>
      ) : (
        <div className="flex-1 flex">
          {/* Desktop Sidebar Navigation (12 Modules + Role Switcher) */}
          <aside
            aria-label="Sidebar Workspace Navigation"
            className="hidden lg:flex lg:w-68 lg:flex-col lg:justify-between lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 overflow-y-auto"
          >
            <div className="space-y-5">
              {/* Instant Student / Admin Role Switcher inside Workspace Sidebar */}
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
                  <span>ACTIVE PORTAL ROLE</span>
                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    aria-label="Toggle Nothing OS dark or light mode"
                    className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:underline"
                  >
                    {darkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                    {darkMode ? 'Light' : 'Dark'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                      role === 'student'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Student View
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-1.5 px-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                      role === 'admin'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Admin View
                  </button>
                </div>
              </div>

              {/* 12 Primary Campus OS Modules */}
              <div>
                <p className="px-3 text-[10px] font-mono font-semibold text-slate-400 mb-1.5">
                  CAMPUS OS MODULES (12)
                </p>
                <nav className="space-y-0.5">
                  {primaryModules.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isEssential = item.id === 'ai_agent';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                          isActive
                            ? isEssential
                              ? 'bg-red-600 text-white font-semibold'
                              : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive
                                ? 'text-current'
                                : isEssential
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={`font-mono text-[10px] tabular-nums ${
                              isActive ? 'text-current opacity-90' : 'text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Admin Database Registry Tables */}
              {role === 'admin' && (
                <div>
                  <p className="px-3 text-[10px] font-mono font-semibold text-slate-400 mb-1.5">
                    ADMIN REGISTRY TABLES
                  </p>
                  <nav className="space-y-0.5">
                    {adminRegistryModules.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>

            {/* Hardware Essential Key Trigger in Sidebar Footer */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setEssentialModalOpen(true)}
                className="w-full py-2.5 px-3 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-between transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  ESSENTIAL KEY
                </span>
                <span className="text-[10px] opacity-80">ALT+E</span>
              </button>
              <div className="px-2 text-[11px] font-mono text-slate-500 truncate">
                {role === 'admin'
                  ? `Admin: ${state.admin.username} · ${metrics.activeSession}`
                  : `${activeStudent.fname} · ${activeStudent.regno}`}
              </div>
            </div>
          </aside>

          {/* Mobile Slide-Over Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <aside className="relative z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-mono font-bold">NOTHING·SRMS</span>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                      className="p-1 text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-1.5 text-xs font-mono rounded ${
                        role === 'student' ? 'bg-white dark:bg-slate-900 font-bold' : ''
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-1.5 text-xs font-mono rounded ${
                        role === 'admin' ? 'bg-white dark:bg-slate-900 font-bold' : ''
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {primaryModules.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg ${
                            activeTab === item.id
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </div>
          )}

          {/* Main Workspace Viewport */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DynamicDashboardView
                role={role}
                activeStudent={activeStudent}
                students={state.students}
                metrics={metrics}
                homeworks={state.homeworks}
                meetLectures={state.meetLectures}
                libraryBooks={state.libraryBooks}
                essentialCaptures={state.essentialCaptures}
                enabledWidgets={state.enabledWidgets}
                onToggleWidget={handleToggleWidget}
                onNavigate={setActiveTab}
                onOpenEssentialKey={(prefill) => {
                  if (prefill) setEssentialModalPrompt(prefill);
                  setEssentialModalOpen(true);
                }}
                onPunchStudentAttendance={handlePunchStudentAttendance}
                onCheckInMeet={handleCheckInMeet}
              />
            )}

            {(activeTab === 'profile' ||
              activeTab === 'assessment' ||
              activeTab === 'attendance' ||
              activeTab === 'homeworks') && (
              <AcademicModulesView
                mode={activeTab}
                role={role}
                admin={state.admin}
                activeStudent={activeStudent}
                students={state.students}
                homeworks={state.homeworks}
                leaveApplications={state.leaveApplications}
                onSelectActiveStudent={setActiveStudentId}
                onUpdateStudent={handleUpdateStudent}
                onSubmitHomework={handleSubmitHomework}
                onCreateHomework={handleCreateHomework}
                onGradeHomework={handleGradeHomework}
                onSubmitLeave={handleSubmitLeave}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                onNavigate={setActiveTab}
              />
            )}

            {(activeTab === 'mail' ||
              activeTab === 'fees' ||
              activeTab === 'google_meet' ||
              activeTab === 'library' ||
              activeTab === 'notice_board') && (
              <CampusServicesView
                mode={activeTab}
                role={role}
                admin={state.admin}
                activeStudent={activeStudent}
                students={state.students}
                mails={state.mails}
                feeTransactions={state.feeTransactions}
                meetLectures={state.meetLectures}
                libraryBooks={state.libraryBooks}
                notices={state.notices}
                onSendMail={handleSendMail}
                onToggleStarMail={handleToggleStarMail}
                onPayStudentFee={handlePayStudentFee}
                onCheckInMeet={handleCheckInMeet}
                onCreateMeetLecture={handleCreateMeetLecture}
                onRequestLibraryBook={handleRequestLibraryBook}
                onUpdateLibraryBookStatus={handleUpdateLibraryBookStatus}
                onAddLibraryBook={handleAddLibraryBook}
                onCreateNotice={handleCreateNotice}
                onTogglePinNotice={handleTogglePinNotice}
                onCaptureNoticeToEssentialKey={(prompt) => {
                  setEssentialModalPrompt(prompt);
                  setEssentialModalOpen(true);
                }}
              />
            )}

            {activeTab === 'ai_agent' && (
              <EssentialKeyAgentView
                role={role}
                activeStudent={activeStudent}
                metrics={metrics}
                activeModule={activeTab}
                captures={state.essentialCaptures}
                onAddCapture={handleAddCapture}
                onTogglePinCapture={handleTogglePinCapture}
                onDeleteCapture={handleDeleteCapture}
                onNavigate={setActiveTab}
              />
            )}

            {(activeTab === 'settings' || activeTab === 'database' || activeTab === 'sessions') && (
              <SessionsAndDatabaseView
                mode={activeTab === 'sessions' ? 'sessions' : 'database'}
                admin={state.admin}
                courses={state.courses}
                subjects={state.subjects}
                sessions={state.sessions}
                students={state.students}
                onAddSession={(label) =>
                  setState((prev) => ({
                    ...prev,
                    sessions: [
                      ...prev.sessions,
                      {
                        id: Date.now(),
                        session: label,
                        status: 'Upcoming',
                        postingDate: new Date().toISOString().slice(0, 10),
                      },
                    ],
                  }))
                }
                onSetActiveSession={(id) =>
                  setState((prev) => ({
                    ...prev,
                    sessions: prev.sessions.map((s) => ({
                      ...s,
                      status: s.id === id ? 'Active' : 'Archived',
                    })),
                  }))
                }
                onUpdateAdminPassword={(newPassword) =>
                  setState((prev) => ({
                    ...prev,
                    admin: { ...prev.admin, password: newPassword },
                  }))
                }
                onResetDatabaseToSeed={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setState(loadInitialState());
                }}
                onLockAdminSession={() => {
                  setIsAuthenticated(false);
                  setActiveTab('login');
                }}
              />
            )}

            {activeTab === 'courses' && (
              <CoursesView
                courses={state.courses}
                students={state.students}
                onAddCourse={handleAddCourse}
                onUpdateCourse={handleUpdateCourse}
                onDeleteCourse={handleDeleteCourse}
                onViewCourseStudents={(cid) => {
                  setCourseFilterForDirectory(cid);
                  setActiveTab('students');
                }}
              />
            )}

            {activeTab === 'subjects' && (
              <SubjectsView
                courses={state.courses}
                subjects={state.subjects}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
              />
            )}

            {activeTab === 'register' && (
              <RegisterStudentView
                courses={state.courses}
                subjects={state.subjects}
                sessions={state.sessions}
                students={state.students}
                onRegisterStudent={handleRegisterStudent}
                onViewDirectory={() => setActiveTab('students')}
              />
            )}

            {activeTab === 'students' && (
              <ManageStudentsView
                students={state.students}
                courses={state.courses}
                sessions={state.sessions}
                initialCourseFilter={courseFilterForDirectory}
                selectedStudent={selectedStudentForTranscript}
                onSelectStudent={setSelectedStudentForTranscript}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onNavigateRegister={() => setActiveTab('register')}
              />
            )}
          </main>
        </div>
      )}

      {/* Global Nothing OS Essential Key Modal */}
      {essentialModalOpen && (
        <EssentialKeyAgentView
          role={role}
          activeStudent={activeStudent}
          metrics={metrics}
          activeModule={activeTab}
          captures={state.essentialCaptures}
          initialPrompt={essentialModalPrompt}
          isModal={true}
          onCloseModal={() => setEssentialModalOpen(false)}
          onAddCapture={handleAddCapture}
          onTogglePinCapture={handleTogglePinCapture}
          onDeleteCapture={handleDeleteCapture}
          onNavigate={setActiveTab}
        />
      )}
    </div>
  );
}
