# 🎓 CampusAttend - College Faculty Attendance Portal

A full-stack, responsive attendance management web portal built specifically for college faculty to manage students, courses, daily attendance, and export/update Excel registers.

---

## 🌟 Key Features

### 1. 🔐 Faculty Authentication (Sign Up & Sign In)
- **Sign In**: Secure authentication using JWT and bcrypt password encryption.
- **Sign Up**: Faculty registers with:
  - Faculty Full Name
  - College Email Address
  - Faculty ID / Employee Code
  - **12 Engineering Branches**:
    - `Electrical` (Electrical Engineering)
    - `ICT` (Information & Communication Technology)
    - `Chemical` (Chemical Engineering)
    - `EC` (Electronics & Communication)
    - `IC` (Instrumentation & Control)
    - `Civil` (Civil Engineering)
    - `CE` (Computer Engineering)
    - `DS` (Data Science)
    - `Mechanical` (Mechanical Engineering)
    - `PE` (Petroleum Engineering)
    - `IT` (Information Technology)
    - `E&I` (Electronics & Instrumentation)
  - **Division Selection**:
    - Pre-configured division choices for each branch (e.g., **EC-I** and **EC-J** for EC department, ICT-A/B, etc.).
    - Option to enter a **Custom Division** (e.g. `EC-I/J Combined`).

### 2. 📝 Attendance Taking & Updating
- **Date Selector**: Defaults to current date, with instant navigation to previous dates to view or edit historical attendance.
- **Subject Selector**: Switch between courses taught for that branch and division.
- **Strictly Two Buttons**: **Present** (`P`) and **Absent** (`A`) buttons only. No "Late" button as required.
- **Quick Batch Actions**: One-click **"Mark All Present"** and **"Mark All Absent"**.
- **Live Statistics**: Real-time counter of Total Students, Present Count, Absent Count, and Attendance Percentage.
- **Update Mode**: Editing attendance for an existing date automatically updates the record with real-time recalculation of student totals and class percentages.

### 3. 📊 Dynamic Excel Sheet (.xlsx) Export & Instant Add-up
- **Master Attendance Register**:
  - Automatically structures student rows: `[Sr No, Roll No, Enrollment Number, Student Name]`.
  - Dynamically appends every single lecture date as a column: `Lec #1 (2026-10-01)`, `Lec #2 (2026-10-03)`...
  - Summary columns: **Total Present**, **Total Lectures**, **Attendance %**, and **Eligibility Status** (Defaulter `< 75%` vs. Eligible `>= 75%`).
  - Class summary footer calculating attendance counts per lecture and overall class average.
- **Instant Excel Updates**: When you edit or add an attendance date, downloading the Excel file immediately incorporates the updated data and recalculates all percentages!
- **Single-Day Excel Report**: Faculty can also export a daily report for a specific lecture.

### 4. 👥 Student Roster Management
- Add individual students: **Name**, **Enrollment Number**, **Roll Number**, **Branch**, and **Division**.
- Remove students with one click.
- **Bulk Import**: Paste multiple students directly copied from Excel / CSV (`EnrollmentNo, Name, RollNo`).
- Quick **"Add 5 Demo Students"** button for instant testing.

### 5. 📚 Subject / Course Management
- Add subjects with **Subject Name**, **Subject Code** (e.g., `EC501`), **Branch**, and **Semester** (1–8).
- Remove subjects at any time.

---

## 🚀 How to Run the Project

The server is already running in background at:
```
http://localhost:5000
```

To run manually or restart at any time:

### Production Run (Single Command):
```bash
npm start
```
> Starts the server at `http://localhost:5000` (serves both API and frontend).

### Development Run (With Live Reload):
```bash
npm run dev
```
> Runs both the Express backend and the Vite dev server with Hot Module Replacement (HMR).

---

## 🔑 Pre-Configured Demo Faculty Accounts

| Faculty Name | Email | Password | Branch | Division |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Rajesh Sharma** | `rajesh.ec@college.edu` | `faculty123` | **EC** | **EC-I** (also has EC-J students) |
| **Prof. Neha Gupta** | `neha.ict@college.edu` | `faculty123` | **ICT** | **ICT-A** |

*(You can also use the **Quick Test Login** buttons on the login screen for instant 1-click access, or register your own new faculty account via the Sign Up tab).*
