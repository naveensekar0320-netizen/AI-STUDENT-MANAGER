# NOTHING·SRMS — Student Record Management System (`studentrecordms` / `studentrecorddb`)
**Nothing OS 3.0 Inspired Campus Operating System with Dynamic Interactive Widgets & Essential Key AI Agent**

---

## 1. Project Overview

**NOTHING·SRMS** is a full-stack academic and institutional operating system built around the `studentrecordms` / `studentrecorddb` relational schema. It combines traditional registrar database management (`tbl_login`, `tbl_course`, `tbl_subject`, `session`, `registration`) with a **Nothing OS 3.0** interface featuring radial dot-matrix telemetry surfaces, customizable **Dynamic Widgets**, dual **Student & Admin Portals**, and an interactive **Nothing OS Essential Key AI Agent** (`Alt+E`).

### Key Highlights
- **Dual Authentication & Instant Role Switching**: Supports both **Student Portal Login** (Roll No / Email + Password) and **Admin Registrar Login** (`admin` / `Test@12345`), plus an in-app **Student View ⇄ Admin View** role switcher in the sidebar.
- **Nothing OS 3.0 Aesthetic**: Engineered with high-contrast Light Daylight and Carbon Obsidian Dark modes, dot-matrix telemetry headers (`Space Grotesk` + `JetBrains Mono`), tabular numerals, and Nothing Red (`#D71921`) hardware accents.
- **6 Interactive Dynamic Widgets**: Toggleable live widgets on the Overall Dashboard for Attendance Dot-Matrix, Google Meet Classroom, Homework Radar, Fee Ledger, Library Catalog, and Essential Space AI.
- **Nothing OS Essential Key AI Agent**: Hardware-inspired AI capture (`Alt+E` or dedicated button) that snapshots active screen context, accepts voice/text notes, synthesizes structured action cards via the server-side Gemini API (`/api/essential-agent`), and pins interactive memory cards to the dashboard.
- **Live MySQL Schema & Dump Generator**: Real-time export of `studentrecorddb.sql` (DDL + `INSERT` statements) compatible with XAMPP, WAMP, LAMP, and phpMyAdmin.

---

## 2. Login Credentials & Access Control

| Portal Role | Identifier / Username | Default Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Student Login** | `SRMS-2026-1001` *(or `aarav.deshmukh@institute.edu.in`)* | `Student@123` | Personal Dashboard, Profile Edit, Assessments, Attendance & Leave Filing, Homework Submission, Campus Mail, Fee Payment, Essential Key AI, Google Meet Check-In, Library Book Requests, Notice Board, SQL Export |
| **Other Enrolled Students** | `SRMS-2026-1002` through `SRMS-2026-1008` | `Student@123` | Individual student records across B.Tech CS, BCA, BBA, MBA, B.Sc DS, and M.Tech AI |
| **Admin Registrar Login** | `admin` | `Test@12345` | Full institutional command across all 12 Campus OS modules + 4 Admin Registry tables (`Student Directory`, `Register Student`, `Courses`, `Subjects`), grading, leave & library approvals, notice publishing, and session governance |

---

## 3. Complete 12-Module Functional Specification

### 01. Overall Dashboard (`dashboard`)
- **Core Telemetry Strip**: Displays Student Roll No & Program, Cumulative GPA (`10.0` scale), Attendance Matrix percentage, and Semester Fee Ledger status (or institutional aggregates in Admin View).
- **Customize Widgets Drawer**: Allows toggling any of the 6 Nothing OS Dynamic Widgets (`Attendance Matrix`, `Google Meet Classroom`, `Homework Radar`, `Fee Ledger`, `Library Catalog`, `Essential Space [AI]`).
- **Interactive Widget Actions**: Mark attendance (`+ Mark Present Today`), check into a live Google Meet lab, jump to homework submission, pay fee dues, request library books, or trigger Essential Key.

### 02. Profile (`profile`)
- **Student View**: Displays full identity, academic enrollment (`regno`, `course`, `semester`, `session`), guardian & family records (`fname`, `mname`, `gname`, `ocp`, `income`), and permanent/correspondence addresses, with a **Self-Service Contact & Address Editor**.
- **Admin View**: Includes the **Admin Credential (`tbl_login`)** card and student selector to inspect or edit any student's profile.

### 03. Assessment Module (`assessment`)
- **Student View**: Displays Semester Enrolled Subjects with **Internal Marks (30)**, **External Marks (70)**, **Total Score (100)**, automatic letter grade (`O`, `A+`, `A`, `B+`, `B`, `C`), and automatic **Cumulative GPA (CGPA)** recalculation.
- **Admin View**: Provides interactive **Internal & External Mark Sliders** for each subject to grade students in real time.

### 04. Attendance (`attendance`)
- **75% Statutory Calculator**: Pure logic engine (`calculateAttendanceTarget`) that computes either the **safe class buffer** (how many classes a student can miss while remaining `>= 75%`) or the exact **classes needed** to recover to `75%`.
- **Subject-Wise Register**: Visual progress bars per subject with `+1 Present` and `+1 Absent` controls.
- **Medical & Duty Leave Desk**: Students can submit leave requests with date ranges and reasons; Admins can **Approve** or **Reject** pending leave applications.

### 05. Homeworks (`homeworks`)
- **Student View**: Lists course assignments with due dates, max marks, faculty instructions, and an inline submission box for GitHub links or lab notes.
- **Admin View**: Includes a **Publish New Course Assignment** form and inline **Grade (`Marks` + `Feedback`)** controls for student submissions.

### 06. Mail (`mail`)
- **Campus Inbox / Sent / Starred**: Internal institutional messaging between Registrar, Faculty, Computer Center, Library, and Students.
- **Compose Campus Mail Modal**: Send official messages to any recipient with category tagging (`Academic`, `Fee`, `Registrar`, `General`).

### 07. Fees (`fees`)
- **Student View**: Shows Total Semester Tuition, Amount Paid, Remaining Balance Due, and a **Pay Remaining Balance** button that generates an instant official receipt (`RCPT-2026-XXX`).
- **Admin View**: Displays the **Cohort Fee Clearance Directory** with one-click Paid/Pending status toggles and the full receipt transaction ledger.

### 08. AI Agent — Nothing OS Essential Key (`ai_agent`)
- **Global Shortcut (`Alt+E`) & Dedicated View**: Captures live screen context (active student/cohort metrics, current module, attendance, CGPA, fee status) and sends it with the user's prompt to `POST /api/essential-agent`.
- **Structured AI Synthesis**: Uses `@google/genai` (`gemini-4-hydrogen`) with strict JSON schema output (`title`, `category`, `summary`, `actionItems`, `metricHighlight`, `suggestedModule`).
- **Pin to Dashboard**: Any Essential Space memory card can be pinned or unpinned from the Overall Dashboard.

### 09. Google Meet Module (`google_meet`)
- **Virtual Classrooms & Live Labs**: Displays `LIVE NOW`, `UPCOMING`, and `COMPLETED` Google Meet sessions with room codes (e.g., `srm-dbms-lab`), faculty hosts, schedules, and attendee counts.
- **Check-In & Launch**: Students click **Check In & Open Meet** to log attendance and open the Google Meet room; Admins can schedule new virtual lectures.

### 10. Library Requesting (`library`)
- **Catalog & ISBN Search**: Search textbooks by title, author, or ISBN.
- **Issue & Return Workflow**: Students can **Request Book** or **Return Book**; Admins can **Approve Issue** for requested books or add new titles to the catalog.

### 11. Notice Board (College) (`notice_board`)
- **Institutional Circulars**: Filterable by `All`, `Examination`, `Event`, `Scholarship`, `Placement`, and `Holiday`.
- **AI Summary Integration**: Every notice includes an **Ask Essential Key** button to summarize deadlines and action items into Essential Space.
- **Admin Notice Publisher**: Admins can post and pin new college circulars.

### 12. Settings & MySQL (`settings`)
- **Academic Session Governance (`session`)**: Create new academic year sessions (`YYYY-YYYY`) and switch the active session.
- **Admin Password Update (`tbl_login`)**: Change the active registrar password.
- **Live `studentrecorddb.sql` Export**: Copy or download the complete MySQL DDL & `INSERT` script reflecting all live changes made in the app.
- **System Documentation**: Built-in documentation viewer and downloadable `DOCUMENTATION.md`.

---

## 4. Relational Database Schema (`studentrecorddb`)

The application maintains strict compatibility with the 5 core MySQL tables of `studentrecorddb`:

1. **`tbl_login`**: `id` (PK), `username`, `password`, `admin_email`, `last_login`
2. **`tbl_course`**: `cid` (PK), `cshort`, `cfull`, `cdate`
3. **`tbl_subject`**: `subid` (PK), `cshort`, `cfull`, `sub1`, `sub2`, `sub3`, `sub4`, `created_at`
4. **`session`**: `id` (PK), `session`, `status` (`Active` | `Archived` | `Upcoming`), `posting_date`
5. **`registration`**: `id` (PK), `regno` (Unique), `course`, `course_short`, `subject_combo`, `fname`, `mname`, `lname`, `gender`, `dob`, `category`, `physically_challenged`, `nationality`, `mobno`, `emailid`, `gname`, `ocp`, `income`, `padd`, `pcity`, `pstate`, `pcountry`, `cadd`, `ccity`, `cstate`, `ccountry`, `board1`, `roll1`, `pyear1`, `marks1`, `board2`, `roll2`, `pyear2`, `marks2`, `session`, `semester`, `cgpa`, `attendance_pct`, `fee_status`, `standing`, `regdate`

---

## 5. System Architecture & Tech Stack

```
/
├── server.ts                              # Express + Vite middleware server & POST /api/essential-agent (Gemini API)
├── DOCUMENTATION.md                       # Complete Project & Architecture Documentation
├── src/
│   ├── App.tsx                            # Root Campus OS shell, role switcher, theme manager, & state persistence
│   ├── index.css                          # Tailwind CSS v4 + Nothing OS dot-matrix utilities & dark mode variant
│   ├── types/
│   │   └── studentRecord.ts               # TypeScript interfaces for all 12 modules & MySQL tables
│   ├── data/
│   │   └── seedStudentRecordDb.ts         # Initial seed dataset for students, courses, subjects, sessions, & campus modules
│   ├── utils/
│   │   ├── studentRecordLogic.ts          # Pure validation, attendance target calculator, KPI engine, & SQL dump generator
│   │   └── studentRecordLogic.test.ts     # 8 automated Node.js unit tests (node:test)
│   └── components/
│       ├── DynamicDashboardView.tsx       # Overall Dashboard with 6 customizable Nothing OS Dynamic Widgets
│       ├── EssentialKeyAgentView.tsx      # Nothing OS Essential Key AI Agent view & global Alt+E modal
│       ├── AcademicModulesView.tsx        # Profile, Assessment Module, Attendance, & Homeworks views
│       ├── CampusServicesView.tsx         # Mail, Fees, Google Meet Module, Library Requesting, & Notice Board views
│       ├── AdminLoginView.tsx             # Dual Student & Admin Login Portal + Public Enrollment Verification
│       ├── CoursesView.tsx                # Admin Course Registry (tbl_course)
│       ├── SubjectsView.tsx               # Admin Subject Mapping (tbl_subject)
│       ├── RegisterStudentView.tsx        # Multi-section Student Enrollment Form (registration)
│       ├── ManageStudentsView.tsx         # Admin Cohort Directory & Printable Academic Transcript Modal
│       └── SessionsAndDatabaseView.tsx    # Settings, Academic Sessions, Live SQL Export, & Documentation Viewer
```

---

## 6. Installation, Commands & MySQL Deployment

### Running Locally (Node.js + Express + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack development server on http://localhost:3000
npm run dev

# 3. Run the automated pure-logic unit test suite (8 tests)
npx tsx --test src/utils/studentRecordLogic.test.ts

# 4. Type-check and build for production
npm run lint
npm run build
```

### Importing `studentrecorddb.sql` into XAMPP / WAMP / phpMyAdmin
1. Open the **Settings & MySQL** module inside the application and click **Download `studentrecorddb.sql`**.
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Create a new database named **`studentrecorddb`**.
4. Select the **Import** tab, choose the downloaded `studentrecorddb.sql` file, and click **Go**.
5. All 5 relational tables (`tbl_login`, `tbl_course`, `tbl_subject`, `session`, `registration`) and current records will be created automatically.
