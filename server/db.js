import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create DATA_DIR, using fallback:', e.message);
}

// Initial seed data
const getInitialSeed = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('faculty123', salt);

  const initialFaculty = [
    {
      id: 'fac-1',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.ec@college.edu',
      facultyId: 'FAC-EC-101',
      passwordHash: hashedPassword,
      branch: 'EC',
      division: 'EC-I',
      createdAt: new Date().toISOString()
    },
    {
      id: 'fac-2',
      name: 'Prof. Neha Gupta',
      email: 'neha.ict@college.edu',
      facultyId: 'FAC-ICT-202',
      passwordHash: hashedPassword,
      branch: 'ICT',
      division: 'ICT-A',
      createdAt: new Date().toISOString()
    }
  ];

  // Pre-seed sample students for EC (EC-I and EC-J) and ICT
  const initialStudents = [
    // EC - Division EC-I
    { id: 'stu-101', enrollmentNo: '210020107001', name: 'Aarav Patel', rollNo: '01', branch: 'EC', division: 'EC-I' },
    { id: 'stu-102', enrollmentNo: '210020107002', name: 'Diya Sharma', rollNo: '02', branch: 'EC', division: 'EC-I' },
    { id: 'stu-103', enrollmentNo: '210020107003', name: 'Kabir Mehta', rollNo: '03', branch: 'EC', division: 'EC-I' },
    { id: 'stu-104', enrollmentNo: '210020107004', name: 'Ananya Desai', rollNo: '04', branch: 'EC', division: 'EC-I' },
    { id: 'stu-105', enrollmentNo: '210020107005', name: 'Rohan Joshi', rollNo: '05', branch: 'EC', division: 'EC-I' },
    { id: 'stu-106', enrollmentNo: '210020107006', name: 'Isha Shah', rollNo: '06', branch: 'EC', division: 'EC-I' },
    { id: 'stu-107', enrollmentNo: '210020107007', name: 'Yash Verma', rollNo: '07', branch: 'EC', division: 'EC-I' },
    { id: 'stu-108', enrollmentNo: '210020107008', name: 'Pooja Trivedi', rollNo: '08', branch: 'EC', division: 'EC-I' },
    { id: 'stu-109', enrollmentNo: '210020107009', name: 'Siddharth Dave', rollNo: '09', branch: 'EC', division: 'EC-I' },
    { id: 'stu-110', enrollmentNo: '210020107010', name: 'Meera Rajput', rollNo: '10', branch: 'EC', division: 'EC-I' },

    // EC - Division EC-J
    { id: 'stu-201', enrollmentNo: '210020107051', name: 'Tanvi Pandya', rollNo: '51', branch: 'EC', division: 'EC-J' },
    { id: 'stu-202', enrollmentNo: '210020107052', name: 'Harshil Vora', rollNo: '52', branch: 'EC', division: 'EC-J' },
    { id: 'stu-203', enrollmentNo: '210020107053', name: 'Kavya Soni', rollNo: '53', branch: 'EC', division: 'EC-J' },
    { id: 'stu-204', enrollmentNo: '210020107054', name: 'Dev Patel', rollNo: '54', branch: 'EC', division: 'EC-J' },
    { id: 'stu-205', enrollmentNo: '210020107055', name: 'Riddhi Vyas', rollNo: '55', branch: 'EC', division: 'EC-J' },

    // ICT - Division ICT-A
    { id: 'stu-301', enrollmentNo: '210020116001', name: 'Ayush Parmar', rollNo: '01', branch: 'ICT', division: 'ICT-A' },
    { id: 'stu-302', enrollmentNo: '210020116002', name: 'Bhavya Bhatt', rollNo: '02', branch: 'ICT', division: 'ICT-A' },
    { id: 'stu-303', enrollmentNo: '210020116003', name: 'Chirag Chauhan', rollNo: '03', branch: 'ICT', division: 'ICT-A' },
  ];

  // Pre-seed subjects
  const initialSubjects = [
    { id: 'sub-101', code: 'EC501', name: 'Digital Signal Processing', branch: 'EC', division: 'EC-I', semester: '5' },
    { id: 'sub-102', code: 'EC502', name: 'VLSI Design & Technology', branch: 'EC', division: 'EC-I', semester: '5' },
    { id: 'sub-103', code: 'EC503', name: 'Microcontroller & Interfacing', branch: 'EC', division: 'EC-I', semester: '5' },
    { id: 'sub-104', code: 'EC501', name: 'Digital Signal Processing', branch: 'EC', division: 'EC-J', semester: '5' },
    { id: 'sub-105', code: 'EC504', name: 'Wireless Communication', branch: 'EC', division: 'EC-J', semester: '5' },
    { id: 'sub-201', code: 'ICT301', name: 'Object Oriented Programming with Java', branch: 'ICT', division: 'ICT-A', semester: '3' },
    { id: 'sub-202', code: 'ICT302', name: 'Data Structures & Algorithms', branch: 'ICT', division: 'ICT-A', semester: '3' },
  ];

  // Sample attendance record for EC-I (DSP)
  const initialAttendance = [
    {
      id: 'att-001',
      branch: 'EC',
      division: 'EC-I',
      subjectId: 'sub-101',
      subjectName: 'Digital Signal Processing',
      subjectCode: 'EC501',
      date: '2026-10-01',
      facultyId: 'fac-1',
      facultyName: 'Dr. Rajesh Sharma',
      records: {
        'stu-101': 'P',
        'stu-102': 'P',
        'stu-103': 'A',
        'stu-104': 'P',
        'stu-105': 'P',
        'stu-106': 'P',
        'stu-107': 'A',
        'stu-108': 'P',
        'stu-109': 'P',
        'stu-110': 'P'
      },
      createdAt: new Date('2026-10-01T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-10-01T10:30:00Z').toISOString()
    },
    {
      id: 'att-002',
      branch: 'EC',
      division: 'EC-I',
      subjectId: 'sub-101',
      subjectName: 'Digital Signal Processing',
      subjectCode: 'EC501',
      date: '2026-10-03',
      facultyId: 'fac-1',
      facultyName: 'Dr. Rajesh Sharma',
      records: {
        'stu-101': 'P',
        'stu-102': 'P',
        'stu-103': 'P',
        'stu-104': 'P',
        'stu-105': 'A',
        'stu-106': 'P',
        'stu-107': 'P',
        'stu-108': 'P',
        'stu-109': 'A',
        'stu-110': 'P'
      },
      createdAt: new Date('2026-10-03T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-10-03T11:00:00Z').toISOString()
    }
  ];

  return {
    users: initialFaculty,
    students: initialStudents,
    subjects: initialSubjects,
    attendance: initialAttendance,
  };
};

class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialSeed();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh:', err);
      this.data = getInitialSeed();
      this.save();
    }
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // --- Users / Faculty ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: 'fac-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Students ---
  getStudents({ branch, division } = {}) {
    let result = this.data.students;
    if (branch) result = result.filter(s => s.branch === branch);
    if (division) result = result.filter(s => s.division === division);
    // Sort by Roll No / Enrollment No
    return result.sort((a, b) => {
      const rollA = parseInt(a.rollNo) || 0;
      const rollB = parseInt(b.rollNo) || 0;
      if (rollA !== rollB) return rollA - rollB;
      return (a.enrollmentNo || '').localeCompare(b.enrollmentNo || '');
    });
  }

  addStudent(studentData) {
    // Check if enrollment number already exists in branch/division
    const exists = this.data.students.find(s => 
      s.enrollmentNo.trim() === studentData.enrollmentNo.trim() && 
      s.branch === studentData.branch && 
      s.division === studentData.division
    );
    if (exists) {
      throw new Error(`Student with enrollment number ${studentData.enrollmentNo} already exists in ${studentData.branch} (${studentData.division})`);
    }

    const newStudent = {
      id: 'stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: studentData.name.trim(),
      enrollmentNo: studentData.enrollmentNo.trim(),
      rollNo: (studentData.rollNo || '').trim(),
      branch: studentData.branch,
      division: studentData.division,
      createdAt: new Date().toISOString()
    };
    this.data.students.push(newStudent);
    this.save();
    return newStudent;
  }

  removeStudent(studentId) {
    const idx = this.data.students.findIndex(s => s.id === studentId);
    if (idx === -1) return false;
    const removed = this.data.students.splice(idx, 1)[0];
    this.save();
    return removed;
  }

  // --- Subjects ---
  getSubjects({ branch, division } = {}) {
    let list = this.data.subjects;
    if (branch) list = list.filter(s => s.branch === branch);
    if (division) list = list.filter(s => s.division === division || !s.division || s.division === 'All');
    return list;
  }

  addSubject(subjectData) {
    const newSubject = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      code: (subjectData.code || '').trim().toUpperCase(),
      name: subjectData.name.trim(),
      branch: subjectData.branch,
      division: subjectData.division,
      semester: subjectData.semester || '1',
      createdAt: new Date().toISOString()
    };
    this.data.subjects.push(newSubject);
    this.save();
    return newSubject;
  }

  removeSubject(subjectId) {
    const idx = this.data.subjects.findIndex(s => s.id === subjectId);
    if (idx === -1) return false;
    const removed = this.data.subjects.splice(idx, 1)[0];
    this.save();
    return removed;
  }

  // --- Attendance ---
  getAttendance({ branch, division, subjectId, date } = {}) {
    let records = this.data.attendance;
    if (branch) records = records.filter(r => r.branch === branch);
    if (division) records = records.filter(r => r.division === division);
    if (subjectId) records = records.filter(r => r.subjectId === subjectId);
    if (date) records = records.filter(r => r.date === date);
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  saveOrUpdateAttendance({ branch, division, subjectId, date, records, facultyId, facultyName }) {
    if (!branch || !division || !subjectId || !date) {
      throw new Error('branch, division, subjectId, and date are required');
    }

    const subject = this.data.subjects.find(s => s.id === subjectId);
    const subjectName = subject ? subject.name : 'Unknown Subject';
    const subjectCode = subject ? subject.code : '';

    // Check if attendance already exists for this exact slot
    const existingIndex = this.data.attendance.findIndex(a => 
      a.branch === branch &&
      a.division === division &&
      a.subjectId === subjectId &&
      a.date === date
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing record
      this.data.attendance[existingIndex] = {
        ...this.data.attendance[existingIndex],
        records: { ...records },
        facultyId: facultyId || this.data.attendance[existingIndex].facultyId,
        facultyName: facultyName || this.data.attendance[existingIndex].facultyName,
        subjectName,
        subjectCode,
        updatedAt: now,
        isUpdated: true
      };
      this.save();
      return { 
        record: this.data.attendance[existingIndex], 
        action: 'updated' 
      };
    } else {
      // Create new record
      const newAttendance = {
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        branch,
        division,
        subjectId,
        subjectName,
        subjectCode,
        date,
        facultyId,
        facultyName,
        records: { ...records },
        createdAt: now,
        updatedAt: now,
        isUpdated: false
      };
      this.data.attendance.push(newAttendance);
      this.save();
      return { 
        record: newAttendance, 
        action: 'created' 
      };
    }
  }

  deleteAttendance(attendanceId) {
    const idx = this.data.attendance.findIndex(a => a.id === attendanceId);
    if (idx === -1) return false;
    const removed = this.data.attendance.splice(idx, 1)[0];
    this.save();
    return removed;
  }
}

export const db = new Database();
