import React, { useState } from 'react';
import { UserPlus, Check, AlertCircle, Wand2, RotateCcw } from 'lucide-react';
import {
  CourseRecord,
  SubjectRecord,
  AcademicSession,
  StudentRecord,
} from '../types/studentRecord';
import {
  StudentRegistrationFormInput,
  validateStudentRegistration,
  buildDefaultSubjectMarks,
} from '../utils/studentRecordLogic';

interface RegisterStudentViewProps {
  courses: CourseRecord[];
  subjects: SubjectRecord[];
  sessions: AcademicSession[];
  students: StudentRecord[];
  onRegisterStudent: (newStudent: Omit<StudentRecord, 'id'>) => void;
  onViewDirectory: () => void;
}

export const RegisterStudentView: React.FC<RegisterStudentViewProps> = ({
  courses,
  subjects,
  sessions,
  students,
  onRegisterStudent,
  onViewDirectory,
}) => {
  const activeSession =
    sessions.find((s) => s.status === 'Active')?.session || sessions[0]?.session || '2026-2027';

  const nextRollNumber = () => {
    const base = 1001 + students.length;
    return `SRMS-2026-${base}`;
  };

  const [formData, setFormData] = useState<StudentRegistrationFormInput>({
    regno: nextRollNumber(),
    cid: courses[0]?.cid || 1,
    session: activeSession,
    semester: 3,
    fname: '',
    mname: '',
    lname: '',
    gender: 'Male',
    gname: '',
    grelation: 'Father',
    ocp: '',
    income: '7,50,000',
    category: 'General',
    pchal: 'No',
    nationality: 'Indian',
    mobno: '',
    emailid: '',
    country: 'India',
    state: 'Tamil Nadu',
    dist: 'Chennai',
    padd: '',
    cadd: '',
    board1: 'CBSE Class X',
    roll1: 'CB10-509211',
    pyear1: '2022',
    marks1Percent: 91.0,
    board2: 'CBSE Class XII',
    roll2: 'CB12-710294',
    pyear2: '2024',
    marks2Percent: 89.5,
    cgpa: 8.65,
    attendancePercent: 92,
    feeStatus: 'Paid',
  });

  const [sameAddress, setSameAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedStudentName, setSubmittedStudentName] = useState<string | null>(null);

  const matchedSubjectObj =
    subjects.find((s) => s.cid === Number(formData.cid) && s.semester === Number(formData.semester)) ||
    subjects.find((s) => s.cid === Number(formData.cid));

  const subjectCombinationPreview = matchedSubjectObj
    ? `${matchedSubjectObj.sub1}, ${matchedSubjectObj.sub2}, ${matchedSubjectObj.sub3}, ${matchedSubjectObj.sub4}`
    : 'Standard Core Curriculum Papers I – IV';

  const handleFieldChange = <K extends keyof StudentRegistrationFormInput>(
    key: K,
    value: StudentRegistrationFormInput[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'padd' && sameAddress) {
        updated.cadd = String(value);
      }
      return updated;
    });
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFillSampleCandidate = () => {
    const newRoll = `SRMS-2026-${1001 + students.length}`;
    const samplePadd = '24 Besant Avenue, Besant Nagar, Chennai 600090';
    setFormData({
      regno: newRoll,
      cid: courses[0]?.cid || 1,
      session: activeSession,
      semester: 3,
      fname: 'Ananya',
      mname: 'Raghavan',
      lname: 'Iyer',
      gender: 'Female',
      gname: 'Raghavan Iyer',
      grelation: 'Father',
      ocp: 'Systems Architect',
      income: '9,40,000',
      category: 'General',
      pchal: 'No',
      nationality: 'Indian',
      mobno: '9840112233',
      emailid: 'ananya.iyer@studentrecordms.edu',
      country: 'India',
      state: 'Tamil Nadu',
      dist: 'Chennai',
      padd: samplePadd,
      cadd: samplePadd,
      board1: 'CBSE Class X',
      roll1: 'CB10-661209',
      pyear1: '2022',
      marks1Percent: 95.2,
      board2: 'CBSE Class XII',
      roll2: 'CB12-884019',
      pyear2: '2024',
      marks2Percent: 93.8,
      cgpa: 9.25,
      attendancePercent: 95,
      feeStatus: 'Paid',
    });
    setErrors({});
    setSubmittedStudentName(null);
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      regno: nextRollNumber(),
      fname: '',
      mname: '',
      lname: '',
      gname: '',
      ocp: '',
      mobno: '',
      emailid: '',
      padd: '',
      cadd: '',
    }));
    setErrors({});
    setSubmittedStudentName(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: StudentRegistrationFormInput = {
      ...formData,
      cadd: sameAddress ? formData.padd : formData.cadd,
    };

    const validation = validateStudentRegistration(payload, students);
    if (!validation.valid) {
      setErrors(validation.errors);
      setSubmittedStudentName(null);
      return;
    }

    const courseObj = courses.find((c) => c.cid === Number(payload.cid)) || courses[0];
    const today = new Date().toISOString().slice(0, 10);

    onRegisterStudent({
      regno: payload.regno.trim(),
      cid: courseObj.cid,
      courseShort: courseObj.cshort,
      courseFull: courseObj.cfull,
      subjectCombination: subjectCombinationPreview,
      session: payload.session,
      semester: Number(payload.semester),
      fname: payload.fname.trim(),
      mname: payload.mname.trim(),
      lname: payload.lname.trim(),
      gender: payload.gender,
      gname: payload.gname.trim(),
      grelation: payload.grelation,
      ocp: payload.ocp.trim() || 'Private Sector',
      income: payload.income.trim() || '6,00,000',
      category: payload.category,
      pchal: payload.pchal,
      nationality: payload.nationality.trim() || 'Indian',
      mobno: payload.mobno.replace(/[\s-]/g, ''),
      emailid: payload.emailid.trim(),
      country: payload.country.trim() || 'India',
      state: payload.state.trim(),
      dist: payload.dist.trim(),
      padd: payload.padd.trim(),
      cadd: (sameAddress ? payload.padd : payload.cadd).trim(),
      board1: payload.board1.trim(),
      roll1: payload.roll1.trim(),
      pyear1: payload.pyear1.trim(),
      marks1Percent: Number(payload.marks1Percent),
      board2: payload.board2.trim(),
      roll2: payload.roll2.trim(),
      pyear2: payload.pyear2.trim(),
      marks2Percent: Number(payload.marks2Percent),
      cgpa: Number(payload.cgpa),
      attendancePercent: Number(payload.attendancePercent),
      feeStatus: payload.feeStatus,
      regdate: today,
      subjectMarks: buildDefaultSubjectMarks(matchedSubjectObj, Number(payload.cgpa)),
    });

    setSubmittedStudentName(`${payload.fname.trim()} ${payload.lname.trim()} (${payload.regno.trim()})`);
    setErrors({});
    // Advance roll number for next registration
    setFormData((prev) => ({
      ...prev,
      regno: `SRMS-2026-${1002 + students.length}`,
      fname: '',
      mname: '',
      lname: '',
      gname: '',
      mobno: '',
      emailid: '',
      padd: '',
      cadd: '',
    }));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            MySQL Table: <span className="font-mono text-slate-700">studentrecorddb.registration</span>
            <span className="mx-2" aria-hidden="true">·</span>
            Active Session: <span className="font-mono">{activeSession}</span>
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            New Student Admission &amp; Record Registration
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleFillSampleCandidate}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-600" />
            Populate Sample Candidate
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Form
          </button>
        </div>
      </div>

      {submittedStudentName && (
        <div
          role="status"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-900"
        >
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Student record <strong>{submittedStudentName}</strong> committed to{' '}
              <span className="font-mono">studentrecorddb.registration</span>.
            </span>
          </div>
          <button
            type="button"
            onClick={onViewDirectory}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Open Student Directory
          </button>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="px-5 py-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1"
        >
          <div className="flex items-center gap-2 font-semibold text-sm text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Please resolve {Object.keys(errors).length} validation error(s) before submitting:</span>
          </div>
          <ul className="list-disc list-inside pl-1 space-y-0.5">
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Section 1: Program & Curriculum Mapping */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              01. Academic Program &amp; Session Mapping
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select degree course, academic session, and registration number
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label htmlFor="reg-no" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registration / Roll Number <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-no"
                type="text"
                value={formData.regno}
                onChange={(e) => handleFieldChange('regno', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.regno && <p className="mt-1 text-xs text-red-600">{errors.regno}</p>}
            </div>

            <div>
              <label htmlFor="reg-course" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Course <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-course"
                value={formData.cid}
                onChange={(e) => handleFieldChange('cid', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {courses.map((c) => (
                  <option key={c.cid} value={c.cid}>
                    {c.cshort} — {c.cfull}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reg-session" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Session <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-session"
                value={formData.session}
                onChange={(e) => handleFieldChange('session', e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.session}>
                    {s.session} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reg-semester" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Semester <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-semester"
                value={formData.semester}
                onChange={(e) => handleFieldChange('semester', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Assigned Subject Combination: </span>
            <span>{subjectCombinationPreview}</span>
          </div>
        </section>

        {/* Section 2: Personal & Guardian Information */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              02. Personal &amp; Guardian Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Student full legal name, demographic category, and parent/guardian details
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="reg-fname" className="block text-xs font-semibold text-slate-700 mb-1.5">
                First Name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-fname"
                type="text"
                value={formData.fname}
                onChange={(e) => handleFieldChange('fname', e.target.value)}
                placeholder="First Name"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.fname && <p className="mt-1 text-xs text-red-600">{errors.fname}</p>}
            </div>

            <div>
              <label htmlFor="reg-mname" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Middle Name
              </label>
              <input
                id="reg-mname"
                type="text"
                value={formData.mname}
                onChange={(e) => handleFieldChange('mname', e.target.value)}
                placeholder="Middle Name (optional)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label htmlFor="reg-lname" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-lname"
                type="text"
                value={formData.lname}
                onChange={(e) => handleFieldChange('lname', e.target.value)}
                placeholder="Last Name / Surname"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.lname && <p className="mt-1 text-xs text-red-600">{errors.lname}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label htmlFor="reg-gender" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-gender"
                value={formData.gender}
                onChange={(e) =>
                  handleFieldChange('gender', e.target.value as 'Male' | 'Female' | 'Other')
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-category" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admission Category <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-category"
                value={formData.category}
                onChange={(e) =>
                  handleFieldChange(
                    'category',
                    e.target.value as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
                  )
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-gname" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Guardian Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-gname"
                type="text"
                value={formData.gname}
                onChange={(e) => handleFieldChange('gname', e.target.value)}
                placeholder="Parent / Guardian Name"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.gname && <p className="mt-1 text-xs text-red-600">{errors.gname}</p>}
            </div>

            <div>
              <label htmlFor="reg-ocp" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Guardian Occupation
              </label>
              <input
                id="reg-ocp"
                type="text"
                value={formData.ocp}
                onChange={(e) => handleFieldChange('ocp', e.target.value)}
                placeholder="e.g. Civil Engineer"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Contact & Address Details */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              03. Contact &amp; Residential Address
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Student mobile number, institutional email, state/district, and permanent address
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label htmlFor="reg-mobno" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number (10 digits) <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-mobno"
                type="tel"
                value={formData.mobno}
                onChange={(e) => handleFieldChange('mobno', e.target.value)}
                placeholder="9840112233"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.mobno && <p className="mt-1 text-xs text-red-600">{errors.mobno}</p>}
            </div>

            <div>
              <label htmlFor="reg-emailid" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-emailid"
                type="email"
                value={formData.emailid}
                onChange={(e) => handleFieldChange('emailid', e.target.value)}
                placeholder="student@studentrecordms.edu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.emailid && <p className="mt-1 text-xs text-red-600">{errors.emailid}</p>}
            </div>

            <div>
              <label htmlFor="reg-state" className="block text-xs font-semibold text-slate-700 mb-1.5">
                State <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-state"
                type="text"
                value={formData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
            </div>

            <div>
              <label htmlFor="reg-dist" className="block text-xs font-semibold text-slate-700 mb-1.5">
                City / District <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-dist"
                type="text"
                value={formData.dist}
                onChange={(e) => handleFieldChange('dist', e.target.value)}
                placeholder="e.g. Chennai"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.dist && <p className="mt-1 text-xs text-red-600">{errors.dist}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label htmlFor="reg-padd" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Permanent Address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="reg-padd"
                rows={2}
                value={formData.padd}
                onChange={(e) => handleFieldChange('padd', e.target.value)}
                placeholder="Street address, locality, city, and PIN code"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.padd && <p className="mt-1 text-xs text-red-600">{errors.padd}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-cadd" className="block text-xs font-semibold text-slate-700">
                  Correspondence Address
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => {
                      setSameAddress(e.target.checked);
                      if (e.target.checked) {
                        handleFieldChange('cadd', formData.padd);
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Same as Permanent
                </label>
              </div>
              <textarea
                id="reg-cadd"
                rows={2}
                disabled={sameAddress}
                value={sameAddress ? formData.padd : formData.cadd}
                onChange={(e) => handleFieldChange('cadd', e.target.value)}
                placeholder="Correspondence or hostel address"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Academic Standing & Fee Status */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              04. Academic Standing, Attendance &amp; Fee Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Initial cumulative GPA, attendance percentage, and semester fee clearance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="reg-cgpa" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current CGPA (0.00 – 10.00) <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-cgpa"
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={formData.cgpa}
                onChange={(e) => handleFieldChange('cgpa', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.cgpa && <p className="mt-1 text-xs text-red-600">{errors.cgpa}</p>}
            </div>

            <div>
              <label htmlFor="reg-attendance" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attendance Percentage (0 – 100%) <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-attendance"
                type="number"
                min={0}
                max={100}
                value={formData.attendancePercent}
                onChange={(e) => handleFieldChange('attendancePercent', Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {errors.attendancePercent && (
                <p className="mt-1 text-xs text-red-600">{errors.attendancePercent}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-feestatus" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Semester Tuition Fee Status
              </label>
              <select
                id="reg-feestatus"
                value={formData.feeStatus}
                onChange={(e) =>
                  handleFieldChange('feeStatus', e.target.value as 'Paid' | 'Partial' | 'Pending')
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Paid">Paid (Cleared)</option>
                <option value="Partial">Partial Installment</option>
                <option value="Pending">Pending Dues</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              Register Student Record
            </button>
          </div>
        </section>
      </form>
    </div>
  );
};
