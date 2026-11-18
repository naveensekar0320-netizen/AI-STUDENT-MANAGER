export type UserRole = 'admin' | 'student';

export interface AdminCredential {
  id: number;
  username: string;
  password: string;
  adminEmail: string;
  fullName: string;
  role: string;
  lastLogin: string;
}

export interface CourseRecord {
  cid: number;
  cshort: string;
  cfull: string;
  cdate: string;
  department: string;
  durationYears: number;
}

export interface SubjectRecord {
  subid: number;
  cid: number;
  cshort: string;
  cfull: string;
  semester: number;
  sub1: string;
  sub2: string;
  sub3: string;
  sub4: string;
  totalCredits: number;
  createdAt: string;
}

export interface AcademicSession {
  id: number;
  session: string;
  status: 'Active' | 'Archived' | 'Upcoming';
  postingDate: string;
}

export type AcademicStanding = 'Good Standing' | 'Dean List' | 'Attendance Warning';

export interface SubjectMark {
  subjectName: string;
  internalMarks: number; // out of 30
  externalMarks: number; // out of 70
  totalMarks: number;    // out of 100
  grade: string;
  attendedClasses?: number;
  totalClasses?: number;
}

export interface StudentRecord {
  id: number;
  regno: string;
  password?: string;
  cid: number;
  courseShort: string;
  courseFull: string;
  subjectCombination: string;
  session: string;
  semester: number;
  fname: string;
  mname: string;
  lname: string;
  gender: 'Male' | 'Female' | 'Other';
  gname: string;
  grelation: string;
  ocp: string;
  income: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  pchal: 'No' | 'Yes';
  nationality: string;
  mobno: string;
  emailid: string;
  country: string;
  state: string;
  dist: string;
  padd: string;
  cadd: string;
  board1: string;
  roll1: string;
  pyear1: string;
  marks1Percent: number;
  board2: string;
  roll2: string;
  pyear2: string;
  marks2Percent: number;
  cgpa: number;
  attendancePercent: number;
  feeStatus: 'Paid' | 'Partial' | 'Pending';
  tuitionTotal?: number;
  tuitionPaid?: number;
  regdate: string;
  subjectMarks: SubjectMark[];
}

export interface HomeworkAssignment {
  id: number;
  title: string;
  courseShort: string;
  subjectName: string;
  dueDate: string;
  maxMarks: number;
  description: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  studentSubmissionText?: string;
  submittedByRegno?: string;
  submittedAt?: string;
  awardedMarks?: number;
  facultyFeedback?: string;
}

export interface CampusMailMessage {
  id: number;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  starred: boolean;
  read: boolean;
  category: 'Academic' | 'Finance' | 'Library' | 'General';
}

export interface FeeTransaction {
  id: string;
  studentRegno: string;
  studentName: string;
  semester: number;
  head: 'Tuition & Lab Fee' | 'Examination Fee' | 'Hostel & Mess' | 'Library Security';
  amount: number;
  status: 'Paid' | 'Pending';
  paidDate?: string;
  paymentMode?: string;
}

export interface GoogleMeetLecture {
  id: number;
  title: string;
  courseShort: string;
  semester: number;
  facultyName: string;
  scheduledTime: string;
  durationMinutes: number;
  meetCode: string;
  meetUrl: string;
  status: 'Live Now' | 'Upcoming' | 'Completed';
  checkedInRegnos: string[];
}

export interface LibraryBookRequest {
  id: number;
  isbn: string;
  bookTitle: string;
  author: string;
  category: string;
  availableCopies: number;
  requestedByRegno: string;
  requestedByName: string;
  requestDate: string;
  dueDate: string;
  status: 'Available' | 'Requested' | 'Issued' | 'Returned';
}

export interface CollegeNotice {
  id: number;
  title: string;
  category: 'Examination' | 'Academic' | 'Placement' | 'Events' | 'Urgent';
  department: string;
  postedBy: string;
  postedDate: string;
  pinned: boolean;
  content: string;
}

export interface EssentialSpaceCapture {
  id: string;
  title: string;
  summary: string;
  category: 'ACADEMIC' | 'ATTENDANCE' | 'FINANCE' | 'SCHEDULE' | 'SYSTEM';
  metricLabel: string;
  metricValue: string;
  actionItems: string[];
  suggestedTab: NavigationTab;
  createdAt: string;
  pinnedToDashboard: boolean;
  sourcePrompt: string;
}

export interface LeaveApplication {
  id: number;
  studentRegno: string;
  studentName: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export type DynamicWidgetId =
  | 'attendance_matrix'
  | 'next_meet_class'
  | 'homework_radar'
  | 'fee_ledger'
  | 'library_due'
  | 'essential_captures';

export type NavigationTab =
  | 'dashboard'
  | 'profile'
  | 'assessment'
  | 'attendance'
  | 'homeworks'
  | 'mail'
  | 'fees'
  | 'ai_agent'
  | 'google_meet'
  | 'library'
  | 'notice_board'
  | 'settings'
  | 'courses'
  | 'subjects'
  | 'register'
  | 'students'
  | 'sessions'
  | 'database'
  | 'login';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalCourses: number;
  totalSubjects: number;
  activeSession: string;
  averageCgpa: number;
  averageAttendance: number;
  deanListCount: number;
  attendanceWarningCount: number;
  paidFeesCount: number;
  courseBreakdown: Array<{
    cid: number;
    cshort: string;
    cfull: string;
    studentCount: number;
    avgCgpa: number;
    avgAttendance: number;
  }>;
}
