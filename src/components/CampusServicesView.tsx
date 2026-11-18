import React, { useState } from 'react';
import {
  Mail,
  Send,
  Star,
  CreditCard,
  CheckCircle2,
  Video,
  BookOpen,
  Megaphone,
  Pin,
  Plus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  UserRole,
  AdminCredential,
  StudentRecord,
  CampusMailMessage,
  FeeTransaction,
  GoogleMeetLecture,
  LibraryBookRequest,
  CollegeNotice,
} from '../types/studentRecord';

interface CampusServicesViewProps {
  mode: 'mail' | 'fees' | 'google_meet' | 'library' | 'notice_board';
  role: UserRole;
  admin: AdminCredential;
  activeStudent: StudentRecord;
  students: StudentRecord[];
  mails: CampusMailMessage[];
  feeTransactions: FeeTransaction[];
  meetLectures: GoogleMeetLecture[];
  libraryBooks: LibraryBookRequest[];
  notices: CollegeNotice[];
  onSendMail: (mail: Omit<CampusMailMessage, 'id' | 'timestamp' | 'starred' | 'read'>) => void;
  onToggleStarMail: (id: number) => void;
  onPayStudentFee: (studentId: number, amount: number) => void;
  onCheckInMeet: (meetId: number, regno: string) => void;
  onCreateMeetLecture: (lecture: Omit<GoogleMeetLecture, 'id' | 'checkedInRegnos'>) => void;
  onRequestLibraryBook: (bookId: number, student: StudentRecord) => void;
  onUpdateLibraryBookStatus: (bookId: number, status: 'Issued' | 'Available') => void;
  onAddLibraryBook: (book: Omit<LibraryBookRequest, 'id' | 'requestedByRegno' | 'requestedByName' | 'requestDate' | 'dueDate' | 'status'>) => void;
  onCreateNotice: (notice: Omit<CollegeNotice, 'id' | 'postedDate'>) => void;
  onTogglePinNotice: (noticeId: number) => void;
  onCaptureNoticeToEssentialKey: (prompt: string) => void;
}

export const CampusServicesView: React.FC<CampusServicesViewProps> = ({
  mode,
  role,
  admin,
  activeStudent,
  students,
  mails,
  feeTransactions,
  meetLectures,
  libraryBooks,
  notices,
  onSendMail,
  onToggleStarMail,
  onPayStudentFee,
  onCheckInMeet,
  onCreateMeetLecture,
  onRequestLibraryBook,
  onUpdateLibraryBookStatus,
  onAddLibraryBook,
  onCreateNotice,
  onTogglePinNotice,
  onCaptureNoticeToEssentialKey,
}) => {
  const [banner, setBanner] = useState<string | null>(null);

  // Mail states
  const [mailFilter, setMailFilter] = useState<'all' | 'starred'>('all');
  const [mailTo, setMailTo] = useState(
    role === 'student' ? admin.adminEmail : activeStudent.emailid
  );
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailCategory, setMailCategory] = useState<CampusMailMessage['category']>('Academic');
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isDraftingMail, setIsDraftingMail] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(
    '<SRMS-2026-8410@institute.edu.in>'
  );

  // Meet states
  const [meetTitle, setMeetTitle] = useState('');
  const [meetCourse, setMeetCourse] = useState('B.Tech CS');
  const [meetTime, setMeetTime] = useState('Tomorrow · 11:00 AM – 12:00 PM');
  const [meetCode, setMeetCode] = useState('srm-live-lec');

  // Library states
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('978-0134685991');

  // Notice states
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCat, setNewNoticeCat] = useState<CollegeNotice['category']>('Academic');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // 1. CAMPUS MAIL MODULE
  if (mode === 'mail') {
    const visibleMails = mails.filter((m) => (mailFilter === 'starred' ? m.starred : true));

    const handleSmartDraft = async (topic: string) => {
      setIsDraftingMail(true);
      setBanner(null);
      try {
        const res = await fetch('/api/campus-mail/smart-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            senderName:
              role === 'admin'
                ? `${admin.fullName} (Registrar)`
                : `${activeStudent.fname} ${activeStudent.lname} (${activeStudent.regno})`,
            senderRole: role,
            recipientEmail: mailTo,
            studentInfo: `${activeStudent.courseShort} Sem ${activeStudent.semester}, CGPA ${activeStudent.cgpa}, Attendance ${activeStudent.attendancePercent}%, Fee ${activeStudent.feeStatus}`,
          }),
        });
        const data = await res.json();
        if (res.ok && data.subject && data.body) {
          setMailSubject(data.subject);
          setMailBody(data.body);
          setBanner('AI Smart Draft generated via /api/campus-mail/smart-draft.');
        } else {
          setMailSubject(`[${activeStudent.regno}] ${topic}`);
          setMailBody(
            `Respected Registrar,\n\nI am writing regarding "${topic}" for ${activeStudent.fname} ${activeStudent.lname} (${activeStudent.regno}, ${activeStudent.courseShort} Sem ${activeStudent.semester}).\n\nRegards,\n${activeStudent.fname} ${activeStudent.lname}`
          );
          setBanner('Draft template populated.');
        }
      } catch {
        setMailSubject(`[${activeStudent.regno}] ${topic}`);
        setMailBody(
          `Respected Registrar,\n\nI am writing regarding "${topic}" for ${activeStudent.fname} ${activeStudent.lname} (${activeStudent.regno}, ${activeStudent.courseShort} Sem ${activeStudent.semester}).\n\nRegards,\n${activeStudent.fname} ${activeStudent.lname}`
        );
      } finally {
        setIsDraftingMail(false);
      }
    };

    const handleSendMailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!mailSubject.trim() || !mailBody.trim()) return;
      setIsSendingMail(true);
      const payload = {
        fromName:
          role === 'admin'
            ? `${admin.fullName} (Registrar)`
            : `${activeStudent.fname} ${activeStudent.lname}`,
        fromEmail: role === 'admin' ? admin.adminEmail : activeStudent.emailid,
        toName: mailTo.includes('registrar') ? 'Dr. Arvind Ramanathan' : 'Campus Recipient',
        toEmail: mailTo.trim(),
        subject: mailSubject.trim(),
        body: mailBody.trim(),
        category: mailCategory,
      };
      try {
        const res = await fetch('/api/campus-mail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        onSendMail(payload);
        setMailSubject('');
        setMailBody('');
        if (data?.messageId) {
          setLastMessageId(data.messageId);
          setBanner(
            `Dispatched via /api/campus-mail/send · Message-ID: ${data.messageId} · Relay: ${data.relay}`
          );
        } else {
          setBanner(`Dispatched institutional mail to ${mailTo.trim()}.`);
        }
      } catch {
        onSendMail(payload);
        setMailSubject('');
        setMailBody('');
        setBanner(`Dispatched institutional mail to ${mailTo.trim()}.`);
      } finally {
        setIsSendingMail(false);
      }
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              API: POST /api/campus-mail/send · ACCOUNT:{' '}
              {role === 'admin' ? admin.adminEmail : activeStudent.emailid}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Mail &amp; Internal SMTP API
            </h1>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMailFilter('all')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md ${
                mailFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Inbox &amp; Sent ({mails.length})
            </button>
            <button
              type="button"
              onClick={() => setMailFilter('starred')}
              className={`px-3 py-1.5 text-xs font-mono rounded-md ${
                mailFilter === 'starred'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Starred ({mails.filter((m) => m.starred).length})
            </button>
          </div>
        </div>

        {banner && (
          <div
            role="status"
            className="px-4 py-3 text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg"
          >
            {banner}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Compose Form with Internal Mail API & Smart Draft */}
          <form
            onSubmit={handleSendMailSubmit}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D71921]" />
                Compose Campus Mail
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                API READY
              </span>
            </div>

            {/* AI Smart Draft Quick Topics */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#D71921]" />
                  AI Smart Draft (/api/campus-mail/smart-draft)
                </span>
                {isDraftingMail && <span className="text-[#D71921]">Drafting...</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Attendance Condonation',
                  'Fee Receipt Verification',
                  'Lab Submission Extension',
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    disabled={isDraftingMail}
                    onClick={() => handleSmartDraft(topic)}
                    className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-[#D71921] text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="mail-to"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Recipient Email
                </label>
                <input
                  id="mail-to"
                  type="email"
                  value={mailTo}
                  onChange={(e) => setMailTo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="mail-cat"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Category
                </label>
                <select
                  id="mail-cat"
                  value={mailCategory}
                  onChange={(e) =>
                    setMailCategory(e.target.value as CampusMailMessage['category'])
                  }
                  className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Fee">Fee</option>
                  <option value="Registrar">Registrar</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="mail-subject"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Subject Line
              </label>
              <input
                id="mail-subject"
                type="text"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
                placeholder="e.g. Query regarding Semester 3 RDBMS Lab"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="mail-body"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Message Body
              </label>
              <textarea
                id="mail-body"
                rows={4}
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                placeholder="Write your official communication..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingMail}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-mono font-semibold text-white bg-[#D71921] hover:bg-red-700 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              {isSendingMail ? 'Dispatching via /api/campus-mail/send...' : 'Send via Campus Mail API'}
            </button>
            {lastMessageId && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Last Message-ID:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[230px]">
                  {lastMessageId}
                </span>
              </div>
            )}
          </form>

          {/* Messages List */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800">
            {visibleMails.map((m) => (
              <div
                key={m.id}
                className="p-5 space-y-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {m.fromName} &lt;{m.fromEmail}&gt;
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{m.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMailTo(m.fromEmail);
                        setMailSubject(
                          m.subject.startsWith('Re:') ? m.subject : `Re: ${m.subject}`
                        );
                      }}
                      className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStarMail(m.id)}
                      aria-label={`Star message ${m.subject}`}
                      className={`p-1 rounded ${
                        m.starred ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{m.subject}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {m.body}
                </p>
                <div className="text-[11px] font-mono text-slate-400">
                  To: {m.toName} ({m.toEmail}) · Category: {m.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. FEES MODULE
  if (mode === 'fees') {
    const dueAmount = Math.max(
      0,
      (activeStudent.tuitionTotal ?? 85000) - (activeStudent.tuitionPaid ?? 85000)
    );

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: TUITION &amp; EXAMINATION FEE LEDGER · SESSION 2026-2027
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Fee Accounts &amp; Receipt Ledger
            </h1>
          </div>
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        {/* Active Student Fee Summary Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-500">
              ACCOUNT HOLDER: {activeStudent.fname} {activeStudent.lname} ({activeStudent.regno})
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              Paid: ₹{(activeStudent.tuitionPaid ?? 85000).toLocaleString()} / Total: ₹
              {(activeStudent.tuitionTotal ?? 85000).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              Clearance Status: <strong>{activeStudent.feeStatus}</strong>
            </div>
          </div>

          {dueAmount > 0 ? (
            <button
              type="button"
              onClick={() => {
                onPayStudentFee(activeStudent.id, dueAmount);
                setBanner(
                  `Cleared pending tuition balance of ₹${dueAmount.toLocaleString()} for ${activeStudent.regno}.`
                );
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              Pay Balance Due (₹{dueAmount.toLocaleString()})
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              No Pending Dues · Hall Ticket Cleared
            </span>
          )}
        </div>

        {/* All Student Fee Accounts (for Admin or Transparency Ledger) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Institutional Fee Clearance &amp; Receipts ({feeTransactions.length} Recent Receipts)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500">
                  <th className="py-3 px-6">Student Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course &amp; Sem</th>
                  <th className="py-3 px-4 text-right">Total Fee</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {students.map((st) => {
                  const tot = st.tuitionTotal ?? 80000;
                  const paid = st.tuitionPaid ?? (st.feeStatus === 'Paid' ? tot : 40000);
                  const rem = Math.max(0, tot - paid);
                  return (
                    <tr key={st.id}>
                      <td className="py-3 px-6 font-mono text-xs font-semibold">{st.regno}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {st.fname} {st.lname}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {st.courseShort} · Sem {st.semester}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        ₹{tot.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        ₹{paid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold">
                        {st.feeStatus}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {rem > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onPayStudentFee(st.id, rem);
                              setBanner(
                                `Recorded fee payment of ₹${rem.toLocaleString()} for ${st.fname} ${st.lname}.`
                              );
                            }}
                            className="px-3 py-1 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded whitespace-nowrap"
                          >
                            Mark Paid (₹{rem.toLocaleString()})
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">Receipt Issued</span>
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
    );
  }

  // 3. GOOGLE MEET MODULE
  if (mode === 'google_meet') {
    const handleAddMeetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!meetTitle.trim()) return;
      onCreateMeetLecture({
        title: meetTitle.trim(),
        courseShort: meetCourse,
        semester: 3,
        facultyName: role === 'admin' ? admin.fullName : 'Faculty Coordinator',
        scheduledTime: meetTime,
        durationMinutes: 60,
        meetCode: meetCode.trim() || 'srm-live-room',
        meetUrl: 'https://meet.google.com/new',
        status: 'Live Now',
      });
      setMeetTitle('');
      setBanner('Scheduled new Google Meet virtual classroom session.');
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: GOOGLE MEET VIRTUAL CLASSROOMS &amp; LIVE LABS
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Live Lectures, Meet Links &amp; Attendance Check-In
            </h1>
          </div>
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        {role === 'admin' && (
          <form
            onSubmit={handleAddMeetSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
              + SCHEDULE GOOGLE MEET VIRTUAL LECTURE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="text"
                aria-label="Lecture title"
                value={meetTitle}
                onChange={(e) => setMeetTitle(e.target.value)}
                placeholder="e.g. CS304 · Graph Theory Live Problem Solving"
                className="sm:col-span-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
              <input
                type="text"
                aria-label="Course short code"
                value={meetCourse}
                onChange={(e) => setMeetCourse(e.target.value)}
                placeholder="B.Tech CS"
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
              <input
                type="text"
                aria-label="Meet room code"
                value={meetCode}
                onChange={(e) => setMeetCode(e.target.value)}
                placeholder="srm-graph-lab"
                className="px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Create Google Meet Session
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {meetLectures.map((lec) => {
            const isCheckedIn = lec.checkedInRegnos.includes(activeStudent.regno);
            return (
              <div
                key={lec.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      {lec.courseShort} · Sem {lec.semester}
                    </span>
                    <span
                      className={`font-bold ${
                        lec.status === 'Live Now'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lec.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lec.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Faculty: {lec.facultyName}
                  </p>
                  <p className="text-xs font-mono text-slate-500">
                    {lec.scheduledTime} ({lec.durationMinutes} min)
                  </p>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono">
                    Meet Code: <strong>{lec.meetCode}</strong> · Attendees:{' '}
                    {lec.checkedInRegnos.length}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onCheckInMeet(lec.id, activeStudent.regno);
                      setBanner(
                        `Checked in ${activeStudent.regno} to Google Meet session "${lec.title}".`
                      );
                    }}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors ${
                      isCheckedIn
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    {isCheckedIn ? 'Checked In ✓' : 'Check In Attendance'}
                  </button>

                  <a
                    href={lec.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Launch Meet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. LIBRARY REQUESTING MODULE
  if (mode === 'library') {
    const handleAddBookSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBookTitle.trim() || !newBookAuthor.trim()) return;
      onAddLibraryBook({
        isbn: newBookIsbn.trim() || '978-0134685991',
        bookTitle: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        category: 'Computer Science',
        availableCopies: 5,
      });
      setNewBookTitle('');
      setNewBookAuthor('');
      setBanner('Added new textbook to the Central University Library catalog.');
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              MODULE: CENTRAL LIBRARY CATALOG &amp; BOOK REQUESTING
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Textbook Reservations, Issue Desk &amp; Due Dates
            </h1>
          </div>
        </div>

        {banner && (
          <div role="status" className="px-4 py-3 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            {banner}
          </div>
        )}

        {role === 'admin' && (
          <form
            onSubmit={handleAddBookSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white">
              + ADD TEXTBOOK TO LIBRARY CATALOG
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                aria-label="Book title"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Book Title (e.g. Effective Java 3rd Ed.)"
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
              <input
                type="text"
                aria-label="Book author"
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                placeholder="Author Name (e.g. Joshua Bloch)"
                className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Book ISBN"
                  value={newBookIsbn}
                  onChange={(e) => setNewBookIsbn(e.target.value)}
                  placeholder="ISBN"
                  className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-mono font-semibold text-white bg-blue-600 rounded-lg whitespace-nowrap"
                >
                  Add Book
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-mono text-slate-500">
                  <th className="py-3 px-6">ISBN</th>
                  <th className="py-3 px-4">Book Title &amp; Author</th>
                  <th className="py-3 px-4 text-right">Copies</th>
                  <th className="py-3 px-4">Holder / Requester</th>
                  <th className="py-3 px-4">Status &amp; Due</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {libraryBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {book.isbn}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {book.bookTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {book.author} · {book.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      {book.availableCopies}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {book.requestedByName
                        ? `${book.requestedByName} (${book.requestedByRegno})`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {book.status}
                      </span>
                      {book.dueDate !== '—' && (
                        <span className="block text-slate-500">Due: {book.dueDate}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      {book.status === 'Available' && (
                        <button
                          type="button"
                          onClick={() => {
                            onRequestLibraryBook(book.id, activeStudent);
                            setBanner(
                              `Requested "${book.bookTitle}" for ${activeStudent.fname} (${activeStudent.regno}).`
                            );
                          }}
                          className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded"
                        >
                          Request Book
                        </button>
                      )}
                      {book.status === 'Requested' && role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLibraryBookStatus(book.id, 'Issued');
                            setBanner(`Approved & issued "${book.bookTitle}" to ${book.requestedByName}.`);
                          }}
                          className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-emerald-600 rounded"
                        >
                          Approve Issue
                        </button>
                      )}
                      {book.status === 'Issued' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateLibraryBookStatus(book.id, 'Available');
                            setBanner(`Marked "${book.bookTitle}" as returned to catalog.`);
                          }}
                          className="px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded"
                        >
                          Return Book
                        </button>
                      )}
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

  // 5. NOTICE BOARD (COLLEGE) MODULE
  const visibleNotices = notices.filter((n) =>
    noticeFilter === 'all' ? true : n.category === noticeFilter
  );

  const handleCreateNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    onCreateNotice({
      title: newNoticeTitle.trim(),
      category: newNoticeCat,
      department: 'Office of the Academic Registrar',
      postedBy: admin.fullName,
      pinned: true,
      content: newNoticeContent.trim(),
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setBanner('Published official college circular to the Notice Board.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            MODULE: COLLEGE NOTICE BOARD &amp; CIRCULARS
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Institutional Announcements &amp; Exam Schedules
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'Examination', 'Placement', 'Academic', 'Urgent'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setNoticeFilter(cat)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                noticeFilter === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat === 'all' ? 'All Circulars' : cat}
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
          onSubmit={handleCreateNoticeSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-red-600" />
            PUBLISH OFFICIAL COLLEGE NOTICE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              type="text"
              aria-label="Notice title"
              value={newNoticeTitle}
              onChange={(e) => setNewNoticeTitle(e.target.value)}
              placeholder="Circular headline..."
              className="sm:col-span-3 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
            <select
              aria-label="Notice category"
              value={newNoticeCat}
              onChange={(e) => setNewNoticeCat(e.target.value as CollegeNotice['category'])}
              className="px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            >
              <option value="Examination">Examination</option>
              <option value="Academic">Academic</option>
              <option value="Placement">Placement</option>
              <option value="Events">Events</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              aria-label="Notice content"
              value={newNoticeContent}
              onChange={(e) => setNewNoticeContent(e.target.value)}
              placeholder="Full circular details, dates, and instructions..."
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950"
            />
            <button
              type="submit"
              className="px-5 py-2 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg whitespace-nowrap"
            >
              Post Circular
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {visibleNotices.map((notice) => (
          <div
            key={notice.id}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-600 dark:text-red-400">
                  {notice.category.toUpperCase()}
                </span>
                <span>·</span>
                <span className="text-slate-500">{notice.department}</span>
                <span>·</span>
                <span className="text-slate-500">{notice.postedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onCaptureNoticeToEssentialKey(
                      `Summarize circular "${notice.title}" and create action items for my schedule`
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  <Sparkles className="w-3 h-3" />
                  Essential Key Capture
                </button>
                <button
                  type="button"
                  onClick={() => onTogglePinNotice(notice.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border ${
                    notice.pinned
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                      : 'text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  {notice.pinned ? 'Pinned' : 'Pin'}
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{notice.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {notice.content}
            </p>
            <div className="text-xs font-mono text-slate-400">
              Issued by: {notice.postedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
