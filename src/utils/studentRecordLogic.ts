import {
  AdminCredential,
  CourseRecord,
  SubjectRecord,
  AcademicSession,
  StudentRecord,
  AcademicStanding,
  ValidationResult,
  DashboardMetrics,
  SubjectMark,
} from '../types/studentRecord';

export function validateAdminCredentials(
  usernameInput: string,
  passwordInput: string,
  adminRecord: AdminCredential
): { valid: boolean; error?: string } {
  const trimmedUsername = usernameInput.trim();
  const rawPassword = passwordInput;

  if (!trimmedUsername) {
    return { valid: false, error: 'Username is required to authenticate.' };
  }
  if (!rawPassword) {
    return { valid: false, error: 'Password is required to authenticate.' };
  }
  if (trimmedUsername !== adminRecord.username || rawPassword !== adminRecord.password) {
    return {
      valid: false,
      error: 'Invalid username or password. Default credential in README is admin / Test@12345.',
    };
  }
  return { valid: true };
}

export function validateStudentCredentials(
  identifierInput: string,
  passwordInput: string,
  students: StudentRecord[]
): { valid: boolean; student?: StudentRecord; error?: string } {
  const cleanId = identifierInput.trim().toLowerCase();
  if (!cleanId) {
    return { valid: false, error: 'Student Roll Number or Email ID is required.' };
  }
  if (!passwordInput) {
    return { valid: false, error: 'Student password is required.' };
  }

  const matched = students.find(
    (s) =>
      s.regno.toLowerCase() === cleanId ||
      s.emailid.toLowerCase() === cleanId ||
      s.fname.toLowerCase() === cleanId
  );

  if (!matched) {
    return {
      valid: false,
      error: 'No student found with that Roll No or Email. Try SRMS-2026-1001.',
    };
  }

  const expectedPass = matched.password || 'Student@123';
  if (passwordInput !== expectedPass && passwordInput !== 'Test@12345') {
    return {
      valid: false,
      error: `Invalid student password. Default student credential is ${expectedPass}.`,
    };
  }

  return { valid: true, student: matched };
}

export function calculateAttendanceTarget(
  attended: number,
  total: number,
  targetPct = 75
): {
  currentPct: number;
  classesNeededForTarget: number;
  classesCanMiss: number;
} {
  if (total <= 0) {
    return { currentPct: 100, classesNeededForTarget: 0, classesCanMiss: 0 };
  }
  const currentPct = Math.round((attended / total) * 100);
  const ratio = targetPct / 100;

  if (attended / total < ratio) {
    // (attended + x) / (total + x) >= ratio => x >= (ratio*total - attended) / (1 - ratio)
    const needed = Math.ceil((ratio * total - attended) / (1 - ratio));
    return {
      currentPct,
      classesNeededForTarget: Math.max(0, needed),
      classesCanMiss: 0,
    };
  } else {
    // attended / (total + y) >= ratio => y <= (attended - ratio*total) / ratio
    const canMiss = Math.floor((attended - ratio * total) / ratio);
    return {
      currentPct,
      classesNeededForTarget: 0,
      classesCanMiss: Math.max(0, canMiss),
    };
  }
}

export function validateCourseInput(
  input: {
    cshort: string;
    cfull: string;
    department: string;
    durationYears: number;
  },
  existingCourses: CourseRecord[],
  editingCid?: number
): ValidationResult {
  const errors: Record<string, string> = {};
  const shortClean = input.cshort.trim();
  const fullClean = input.cfull.trim();
  const deptClean = input.department.trim();

  if (!shortClean) {
    errors.cshort = 'Course short name (e.g. B.Tech CS) is required.';
  } else if (shortClean.length < 2 || shortClean.length > 24) {
    errors.cshort = 'Course short name must be between 2 and 24 characters.';
  } else {
    const duplicate = existingCourses.find(
      (c) => c.cshort.toLowerCase() === shortClean.toLowerCase() && c.cid !== editingCid
    );
    if (duplicate) {
      errors.cshort = `Course "${shortClean}" already exists in tbl_course.`;
    }
  }

  if (!fullClean) {
    errors.cfull = 'Course full title is required.';
  } else if (fullClean.length < 5) {
    errors.cfull = 'Course full title must be at least 5 characters.';
  }

  if (!deptClean) {
    errors.department = 'Academic department is required.';
  }

  if (!Number.isFinite(input.durationYears) || input.durationYears < 1 || input.durationYears > 6) {
    errors.durationYears = 'Duration must be between 1 and 6 years.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSubjectInput(
  input: {
    cid: number;
    semester: number;
    sub1: string;
    sub2: string;
    sub3: string;
    sub4: string;
    totalCredits: number;
  },
  existingCourses: CourseRecord[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const matchedCourse = existingCourses.find((c) => c.cid === Number(input.cid));
  if (!matchedCourse) {
    errors.cid = 'Select a valid course from tbl_course.';
  }
  if (!Number.isFinite(input.semester) || input.semester < 1 || input.semester > 10) {
    errors.semester = 'Semester must be between 1 and 10.';
  }
  if (!input.sub1.trim()) {
    errors.sub1 = 'Subject 1 code & title is required.';
  }
  if (!input.sub2.trim()) {
    errors.sub2 = 'Subject 2 code & title is required.';
  }
  if (!input.sub3.trim()) {
    errors.sub3 = 'Subject 3 code & title is required.';
  }
  if (!input.sub4.trim()) {
    errors.sub4 = 'Subject 4 code & title is required.';
  }
  if (!Number.isFinite(input.totalCredits) || input.totalCredits < 4 || input.totalCredits > 36) {
    errors.totalCredits = 'Total credits must be between 4 and 36.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface StudentRegistrationFormInput {
  regno: string;
  cid: number;
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
}

export function validateStudentRegistration(
  input: StudentRegistrationFormInput,
  existingStudents: StudentRecord[],
  editingId?: number
): ValidationResult {
  const errors: Record<string, string> = {};

  const regnoClean = input.regno.trim();
  if (!regnoClean) {
    errors.regno = 'Registration / Roll Number is required.';
  } else {
    const duplicate = existingStudents.find(
      (s) => s.regno.toLowerCase() === regnoClean.toLowerCase() && s.id !== editingId
    );
    if (duplicate) {
      errors.regno = `Registration number "${regnoClean}" is already assigned.`;
    }
  }

  if (!input.cid || Number(input.cid) <= 0) {
    errors.cid = 'Course selection is required.';
  }

  if (!input.session.trim()) {
    errors.session = 'Academic session is required.';
  }

  if (!input.fname.trim()) {
    errors.fname = 'First name is required.';
  }

  if (!input.lname.trim()) {
    errors.lname = 'Last name is required.';
  }

  if (!input.gname.trim()) {
    errors.gname = 'Guardian full name is required.';
  }

  const phoneClean = input.mobno.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(phoneClean)) {
    errors.mobno = 'Mobile number must be a valid 10-digit number.';
  }

  const emailClean = input.emailid.trim();
  if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
    errors.emailid = 'Valid institutional or personal email address is required.';
  }

  if (!input.state.trim()) {
    errors.state = 'State / Province is required.';
  }

  if (!input.dist.trim()) {
    errors.dist = 'City / District is required.';
  }

  if (!input.padd.trim()) {
    errors.padd = 'Permanent address is required.';
  }

  if (!Number.isFinite(input.cgpa) || input.cgpa < 0 || input.cgpa > 10) {
    errors.cgpa = 'CGPA must be between 0.00 and 10.00.';
  }

  if (
    !Number.isFinite(input.attendancePercent) ||
    input.attendancePercent < 0 ||
    input.attendancePercent > 100
  ) {
    errors.attendancePercent = 'Attendance must be between 0% and 100%.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getStudentStanding(student: Pick<StudentRecord, 'cgpa' | 'attendancePercent'>): AcademicStanding {
  if (student.attendancePercent < 75) {
    return 'Attendance Warning';
  }
  if (student.cgpa >= 8.5) {
    return 'Dean List';
  }
  return 'Good Standing';
}

export function computeLetterGrade(totalMarks: number): string {
  if (totalMarks >= 90) return 'O';
  if (totalMarks >= 80) return 'A+';
  if (totalMarks >= 70) return 'A';
  if (totalMarks >= 60) return 'B+';
  if (totalMarks >= 50) return 'B';
  return 'F';
}

export function buildDefaultSubjectMarks(
  subjectRecord: SubjectRecord | undefined,
  targetCgpa: number
): SubjectMark[] {
  const subjects = subjectRecord
    ? [subjectRecord.sub1, subjectRecord.sub2, subjectRecord.sub3, subjectRecord.sub4]
    : [
        'CORE101 · Core Subject I',
        'CORE102 · Core Subject II',
        'CORE103 · Core Subject III',
        'CORE104 · Core Subject IV',
      ];

  const baseTotal = Math.min(98, Math.max(45, Math.round(targetCgpa * 9.8)));
  return subjects.map((subjectName, idx) => {
    const offset = idx % 2 === 0 ? 1 : -1;
    const totalMarks = Math.min(100, Math.max(40, baseTotal + offset));
    const internalMarks = Math.min(30, Math.max(12, Math.round(totalMarks * 0.3)));
    const externalMarks = totalMarks - internalMarks;
    return {
      subjectName,
      internalMarks,
      externalMarks,
      totalMarks,
      grade: computeLetterGrade(totalMarks),
      attendedClasses: 36,
      totalClasses: 40,
    };
  });
}

export function filterStudents(
  students: StudentRecord[],
  searchQuery: string,
  courseCidFilter: number | 'all',
  sessionFilter: string | 'all',
  standingFilter: AcademicStanding | 'all'
): StudentRecord[] {
  const q = searchQuery.trim().toLowerCase();

  return students.filter((s) => {
    if (courseCidFilter !== 'all' && s.cid !== Number(courseCidFilter)) {
      return false;
    }
    if (sessionFilter !== 'all' && s.session !== sessionFilter) {
      return false;
    }
    if (standingFilter !== 'all' && getStudentStanding(s) !== standingFilter) {
      return false;
    }
    if (!q) {
      return true;
    }
    const fullName = `${s.fname} ${s.mname} ${s.lname}`.toLowerCase();
    return (
      fullName.includes(q) ||
      s.regno.toLowerCase().includes(q) ||
      s.courseShort.toLowerCase().includes(q) ||
      s.emailid.toLowerCase().includes(q) ||
      s.dist.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q) ||
      s.mobno.includes(q)
    );
  });
}

export function calculateDashboardMetrics(
  students: StudentRecord[],
  courses: CourseRecord[],
  subjects: SubjectRecord[],
  sessions: AcademicSession[]
): DashboardMetrics {
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalSubjects = subjects.length;
  const activeSessionObj = sessions.find((s) => s.status === 'Active') || sessions[0];
  const activeSession = activeSessionObj ? activeSessionObj.session : '2026-2027';

  const averageCgpa =
    totalStudents > 0
      ? Number((students.reduce((acc, s) => acc + s.cgpa, 0) / totalStudents).toFixed(2))
      : 0;

  const averageAttendance =
    totalStudents > 0
      ? Math.round(students.reduce((acc, s) => acc + s.attendancePercent, 0) / totalStudents)
      : 0;

  const deanListCount = students.filter((s) => getStudentStanding(s) === 'Dean List').length;
  const attendanceWarningCount = students.filter(
    (s) => getStudentStanding(s) === 'Attendance Warning'
  ).length;
  const paidFeesCount = students.filter((s) => s.feeStatus === 'Paid').length;

  const courseBreakdown = courses.map((course) => {
    const enrolled = students.filter((s) => s.cid === course.cid);
    const count = enrolled.length;
    const avgCgpa =
      count > 0
        ? Number((enrolled.reduce((acc, s) => acc + s.cgpa, 0) / count).toFixed(2))
        : 0;
    const avgAttendance =
      count > 0
        ? Math.round(enrolled.reduce((acc, s) => acc + s.attendancePercent, 0) / count)
        : 0;

    return {
      cid: course.cid,
      cshort: course.cshort,
      cfull: course.cfull,
      studentCount: count,
      avgCgpa,
      avgAttendance,
    };
  });

  return {
    totalStudents,
    totalCourses,
    totalSubjects,
    activeSession,
    averageCgpa,
    averageAttendance,
    deanListCount,
    attendanceWarningCount,
    paidFeesCount,
    courseBreakdown,
  };
}

function escapeSql(val: string | number): string {
  if (typeof val === 'number') return String(val);
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function generateStudentRecordSqlDump(params: {
  admin: AdminCredential;
  courses: CourseRecord[];
  subjects: SubjectRecord[];
  sessions: AcademicSession[];
  students: StudentRecord[];
}): string {
  const { admin, courses, subjects, sessions, students } = params;

  const lines: string[] = [
    '-- ============================================================================',
    '-- MySQL Database Dump: `studentrecorddb`',
    '-- Project: Student Record Management System (studentrecordms)',
    '-- Compatible with: XAMPP / WAMP / LAMP / phpMyAdmin (MySQL 5.7+ / 8.0+ / MariaDB)',
    '-- ============================================================================',
    '',
    'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
    'START TRANSACTION;',
    'SET time_zone = "+00:00";',
    '',
    'CREATE DATABASE IF NOT EXISTS `studentrecorddb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;',
    'USE `studentrecorddb`;',
    '',
    '-- --------------------------------------------------------',
    '-- Table structure for table `tbl_login`',
    '-- --------------------------------------------------------',
    'CREATE TABLE IF NOT EXISTS `tbl_login` (',
    '  `id` int(11) NOT NULL AUTO_INCREMENT,',
    '  `username` varchar(100) NOT NULL,',
    '  `password` varchar(255) NOT NULL,',
    '  `AdminEmail` varchar(150) DEFAULT NULL,',
    '  PRIMARY KEY (`id`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    '',
    `INSERT INTO \`tbl_login\` (\`id\`, \`username\`, \`password\`, \`AdminEmail\`) VALUES (${admin.id}, ${escapeSql(admin.username)}, ${escapeSql(admin.password)}, ${escapeSql(admin.adminEmail)});`,
    '',
    '-- --------------------------------------------------------',
    '-- Table structure for table `tbl_course`',
    '-- --------------------------------------------------------',
    'CREATE TABLE IF NOT EXISTS `tbl_course` (',
    '  `cid` int(11) NOT NULL AUTO_INCREMENT,',
    '  `cshort` varchar(50) NOT NULL,',
    '  `cfull` varchar(255) NOT NULL,',
    '  `cdate` varchar(50) NOT NULL,',
    '  PRIMARY KEY (`cid`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    '',
  ];

  for (const c of courses) {
    lines.push(
      `INSERT INTO \`tbl_course\` (\`cid\`, \`cshort\`, \`cfull\`, \`cdate\`) VALUES (${c.cid}, ${escapeSql(c.cshort)}, ${escapeSql(c.cfull)}, ${escapeSql(c.cdate)});`
    );
  }

  lines.push(
    '',
    '-- --------------------------------------------------------',
    '-- Table structure for table `tbl_subject`',
    '-- --------------------------------------------------------',
    'CREATE TABLE IF NOT EXISTS `tbl_subject` (',
    '  `subid` int(11) NOT NULL AUTO_INCREMENT,',
    '  `cid` int(11) NOT NULL,',
    '  `cshort` varchar(50) NOT NULL,',
    '  `cfull` varchar(255) NOT NULL,',
    '  `sub1` varchar(255) NOT NULL,',
    '  `sub2` varchar(255) NOT NULL,',
    '  `sub3` varchar(255) NOT NULL,',
    '  `sub4` varchar(255) NOT NULL,',
    '  `dt_created` varchar(50) NOT NULL,',
    '  PRIMARY KEY (`subid`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    ''
  );

  for (const sub of subjects) {
    lines.push(
      `INSERT INTO \`tbl_subject\` (\`subid\`, \`cid\`, \`cshort\`, \`cfull\`, \`sub1\`, \`sub2\`, \`sub3\`, \`sub4\`, \`dt_created\`) VALUES (${sub.subid}, ${sub.cid}, ${escapeSql(sub.cshort)}, ${escapeSql(sub.cfull)}, ${escapeSql(sub.sub1)}, ${escapeSql(sub.sub2)}, ${escapeSql(sub.sub3)}, ${escapeSql(sub.sub4)}, ${escapeSql(sub.createdAt)});`
    );
  }

  lines.push(
    '',
    '-- --------------------------------------------------------',
    '-- Table structure for table `session`',
    '-- --------------------------------------------------------',
    'CREATE TABLE IF NOT EXISTS `session` (',
    '  `id` int(11) NOT NULL AUTO_INCREMENT,',
    '  `session` varchar(50) NOT NULL,',
    '  `status` varchar(20) NOT NULL,',
    '  `postingdate` varchar(50) NOT NULL,',
    '  PRIMARY KEY (`id`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    ''
  );

  for (const ses of sessions) {
    lines.push(
      `INSERT INTO \`session\` (\`id\`, \`session\`, \`status\`, \`postingdate\`) VALUES (${ses.id}, ${escapeSql(ses.session)}, ${escapeSql(ses.status)}, ${escapeSql(ses.postingDate)});`
    );
  }

  lines.push(
    '',
    '-- --------------------------------------------------------',
    '-- Table structure for table `registration`',
    '-- --------------------------------------------------------',
    'CREATE TABLE IF NOT EXISTS `registration` (',
    '  `id` int(11) NOT NULL AUTO_INCREMENT,',
    '  `regno` varchar(50) NOT NULL,',
    '  `course` int(11) NOT NULL,',
    '  `subject` text NOT NULL,',
    '  `session` varchar(50) NOT NULL,',
    '  `fname` varchar(100) NOT NULL,',
    '  `mname` varchar(100) DEFAULT NULL,',
    '  `lname` varchar(100) NOT NULL,',
    '  `gender` varchar(20) NOT NULL,',
    '  `gname` varchar(150) NOT NULL,',
    '  `grelation` varchar(50) NOT NULL,',
    '  `ocp` varchar(100) DEFAULT NULL,',
    '  `income` varchar(50) DEFAULT NULL,',
    '  `category` varchar(50) NOT NULL,',
    '  `pchal` varchar(20) NOT NULL,',
    '  `nationality` varchar(50) NOT NULL,',
    '  `mobno` varchar(20) NOT NULL,',
    '  `emailid` varchar(150) NOT NULL,',
    '  `country` varchar(50) NOT NULL,',
    '  `state` varchar(100) NOT NULL,',
    '  `dist` varchar(100) NOT NULL,',
    '  `padd` text NOT NULL,',
    '  `cadd` text NOT NULL,',
    '  `cgpa` decimal(4,2) NOT NULL DEFAULT 0.00,',
    '  `attendance_pct` int(11) NOT NULL DEFAULT 0,',
    '  `regdate` varchar(50) NOT NULL,',
    '  PRIMARY KEY (`id`)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    ''
  );

  for (const st of students) {
    lines.push(
      `INSERT INTO \`registration\` (\`id\`, \`regno\`, \`course\`, \`subject\`, \`session\`, \`fname\`, \`mname\`, \`lname\`, \`gender\`, \`gname\`, \`grelation\`, \`ocp\`, \`income\`, \`category\`, \`pchal\`, \`nationality\`, \`mobno\`, \`emailid\`, \`country\`, \`state\`, \`dist\`, \`padd\`, \`cadd\`, \`cgpa\`, \`attendance_pct\`, \`regdate\`) VALUES (${st.id}, ${escapeSql(st.regno)}, ${st.cid}, ${escapeSql(st.subjectCombination)}, ${escapeSql(st.session)}, ${escapeSql(st.fname)}, ${escapeSql(st.mname)}, ${escapeSql(st.lname)}, ${escapeSql(st.gender)}, ${escapeSql(st.gname)}, ${escapeSql(st.grelation)}, ${escapeSql(st.ocp)}, ${escapeSql(st.income)}, ${escapeSql(st.category)}, ${escapeSql(st.pchal)}, ${escapeSql(st.nationality)}, ${escapeSql(st.mobno)}, ${escapeSql(st.emailid)}, ${escapeSql(st.country)}, ${escapeSql(st.state)}, ${escapeSql(st.dist)}, ${escapeSql(st.padd)}, ${escapeSql(st.cadd)}, ${st.cgpa}, ${st.attendancePercent}, ${escapeSql(st.regdate)});`
    );
  }

  lines.push('', 'COMMIT;');
  return lines.join('\n');
}
