import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminCredentials,
  validateStudentCredentials,
  calculateAttendanceTarget,
  validateCourseInput,
  validateSubjectInput,
  validateStudentRegistration,
  filterStudents,
  calculateDashboardMetrics,
  getStudentStanding,
  generateStudentRecordSqlDump,
} from './studentRecordLogic';
import {
  INITIAL_ADMIN_CREDENTIAL,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  INITIAL_STUDENTS,
} from '../data/seedStudentRecordDb';

test('validateAdminCredentials accepts README admin / Test@12345 and rejects invalid credentials', () => {
  const ok = validateAdminCredentials('admin', 'Test@12345', INITIAL_ADMIN_CREDENTIAL);
  assert.equal(ok.valid, true);

  const emptyUser = validateAdminCredentials('', 'Test@12345', INITIAL_ADMIN_CREDENTIAL);
  assert.equal(emptyUser.valid, false);
  assert.ok(emptyUser.error?.includes('Username'));

  const wrongPass = validateAdminCredentials('admin', 'WrongPass', INITIAL_ADMIN_CREDENTIAL);
  assert.equal(wrongPass.valid, false);
  assert.ok(wrongPass.error?.includes('Test@12345'));
});

test('validateStudentCredentials authenticates student by Roll No or Email', () => {
  const okRoll = validateStudentCredentials('SRMS-2026-1001', 'Student@123', INITIAL_STUDENTS);
  assert.equal(okRoll.valid, true);
  assert.equal(okRoll.student?.fname, 'Aarav');

  const okEmail = validateStudentCredentials(
    'meera.krishnan@studentrecordms.edu',
    'Student@123',
    INITIAL_STUDENTS
  );
  assert.equal(okEmail.valid, true);
  assert.equal(okEmail.student?.regno, 'SRMS-2026-1002');

  const fail = validateStudentCredentials('SRMS-2026-9999', 'Student@123', INITIAL_STUDENTS);
  assert.equal(fail.valid, false);
});

test('calculateAttendanceTarget computes classes needed for 75% and classes that can be missed', () => {
  const warning = calculateAttendanceTarget(27, 40, 75);
  assert.equal(warning.currentPct, 68);
  assert.equal(warning.classesNeededForTarget, 12);
  assert.equal(warning.classesCanMiss, 0);

  const safe = calculateAttendanceTarget(38, 40, 75);
  assert.equal(safe.currentPct, 95);
  assert.equal(safe.classesNeededForTarget, 0);
  assert.equal(safe.classesCanMiss, 10);
});

test('validateCourseInput prevents duplicate course short names and enforces required fields', () => {
  const duplicate = validateCourseInput(
    {
      cshort: 'b.tech cs',
      cfull: 'Duplicate Course Name',
      department: 'Engineering',
      durationYears: 4,
    },
    INITIAL_COURSES
  );
  assert.equal(duplicate.valid, false);
  assert.ok(duplicate.errors.cshort);

  const validCourse = validateCourseInput(
    {
      cshort: 'B.Arch',
      cfull: 'Bachelor of Architecture',
      department: 'School of Planning & Architecture',
      durationYears: 5,
    },
    INITIAL_COURSES
  );
  assert.equal(validCourse.valid, true);
  assert.deepEqual(validCourse.errors, {});
});

test('validateSubjectInput validates course reference and four subject names', () => {
  const invalid = validateSubjectInput(
    {
      cid: 999,
      semester: 3,
      sub1: 'Sub 1',
      sub2: '',
      sub3: 'Sub 3',
      sub4: 'Sub 4',
      totalCredits: 16,
    },
    INITIAL_COURSES
  );
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.cid);
  assert.ok(invalid.errors.sub2);

  const valid = validateSubjectInput(
    {
      cid: 1,
      semester: 4,
      sub1: 'CS401 · Algorithms II',
      sub2: 'CS402 · Microprocessors',
      sub3: 'CS403 · Theory of Computation',
      sub4: 'CS404 · Linear Optimization',
      totalCredits: 18,
    },
    INITIAL_COURSES
  );
  assert.equal(valid.valid, true);
});

test('validateStudentRegistration checks roll number uniqueness, mobile digits, email, and CGPA range', () => {
  const dupRoll = validateStudentRegistration(
    {
      regno: 'SRMS-2026-1001',
      cid: 1,
      session: '2026-2027',
      semester: 3,
      fname: 'Test',
      mname: '',
      lname: 'Student',
      gender: 'Male',
      gname: 'Parent Name',
      grelation: 'Father',
      ocp: 'Engineer',
      income: '500000',
      category: 'General',
      pchal: 'No',
      nationality: 'Indian',
      mobno: '9876543210',
      emailid: 'test@studentrecordms.edu',
      country: 'India',
      state: 'Tamil Nadu',
      dist: 'Chennai',
      padd: '10 Main St',
      cadd: '10 Main St',
      board1: 'CBSE',
      roll1: '101',
      pyear1: '2022',
      marks1Percent: 90,
      board2: 'CBSE',
      roll2: '102',
      pyear2: '2024',
      marks2Percent: 91,
      cgpa: 8.8,
      attendancePercent: 90,
      feeStatus: 'Paid',
    },
    INITIAL_STUDENTS
  );
  assert.equal(dupRoll.valid, false);
  assert.ok(dupRoll.errors.regno);
});

test('filterStudents and calculateDashboardMetrics compute accurate counts and standings', () => {
  const metrics = calculateDashboardMetrics(
    INITIAL_STUDENTS,
    INITIAL_COURSES,
    INITIAL_SUBJECTS,
    INITIAL_SESSIONS
  );
  assert.equal(metrics.totalStudents, INITIAL_STUDENTS.length);
  assert.equal(metrics.totalCourses, INITIAL_COURSES.length);
  assert.equal(metrics.activeSession, '2026-2027');
  assert.ok(metrics.deanListCount >= 4);
  assert.equal(metrics.attendanceWarningCount, 1);

  const bcaStudents = filterStudents(INITIAL_STUDENTS, '', 3, 'all', 'all');
  assert.equal(bcaStudents.length, 2);

  const warningStudents = filterStudents(INITIAL_STUDENTS, '', 'all', 'all', 'Attendance Warning');
  assert.equal(warningStudents.length, 1);
  assert.equal(warningStudents[0].fname, 'Karthik');
  assert.equal(getStudentStanding(warningStudents[0]), 'Attendance Warning');
});

test('generateStudentRecordSqlDump produces valid MySQL DDL and INSERT statements for studentrecorddb', () => {
  const sql = generateStudentRecordSqlDump({
    admin: INITIAL_ADMIN_CREDENTIAL,
    courses: INITIAL_COURSES,
    subjects: INITIAL_SUBJECTS,
    sessions: INITIAL_SESSIONS,
    students: INITIAL_STUDENTS,
  });
  assert.ok(sql.includes('CREATE DATABASE IF NOT EXISTS `studentrecorddb`'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS `tbl_login`'));
  assert.ok(sql.includes("'admin', 'Test@12345'"));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS `tbl_course`'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS `registration`'));
  assert.ok(sql.includes('SRMS-2026-1001'));
});
