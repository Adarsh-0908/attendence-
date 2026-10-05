import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { BRANCHES } from './data/constants.js';
import { generateAttendanceExcel } from './excelGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'college-faculty-attendance-secret-key-2026';
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ----------------- AUTH ROUTES -----------------

// Faculty Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, branch, division, facultyId } = req.body;

    if (!name || !email || !password || !branch || !division) {
      return res.status(400).json({ error: 'Name, email, password, branch, and division are required.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A faculty account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      facultyId: (facultyId || `FAC-${branch}-${Date.now().toString().slice(-4)}`).trim(),
      passwordHash,
      branch,
      division: division.trim()
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, branch: user.branch, division: user.division },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        division: user.division,
        facultyId: user.facultyId
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create faculty account: ' + err.message });
  }
});

// Faculty Signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, branch: user.branch, division: user.division },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        division: user.division,
        facultyId: user.facultyId
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Current User Info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Faculty not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    branch: user.branch,
    division: user.division,
    facultyId: user.facultyId
  });
});

// ----------------- BRANCHES & CONFIG -----------------
app.get('/api/branches', (req, res) => {
  res.json(BRANCHES);
});

// ----------------- STUDENTS ROUTES -----------------
app.get('/api/students', authenticateToken, (req, res) => {
  const { branch, division } = req.query;
  const students = db.getStudents({ branch, division });
  res.json(students);
});

app.post('/api/students', authenticateToken, (req, res) => {
  try {
    const { name, enrollmentNo, rollNo, branch, division } = req.body;
    if (!name || !enrollmentNo || !branch || !division) {
      return res.status(400).json({ error: 'Name, Enrollment Number, Branch, and Division are required.' });
    }

    const newStudent = db.addStudent({
      name,
      enrollmentNo,
      rollNo,
      branch,
      division
    });

    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk add students
app.post('/api/students/bulk', authenticateToken, (req, res) => {
  try {
    const { students, branch, division } = req.body;
    if (!Array.isArray(students) || !branch || !division) {
      return res.status(400).json({ error: 'Valid students array, branch, and division are required.' });
    }

    const added = [];
    const skipped = [];

    students.forEach(s => {
      try {
        if (!s.name || !s.enrollmentNo) return;
        const newStudent = db.addStudent({
          name: s.name,
          enrollmentNo: s.enrollmentNo,
          rollNo: s.rollNo || '',
          branch,
          division
        });
        added.push(newStudent);
      } catch (err) {
        skipped.push({ student: s, reason: err.message });
      }
    });

    res.json({
      message: `Added ${added.length} students (${skipped.length} skipped)`,
      added,
      skipped
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', authenticateToken, (req, res) => {
  const removed = db.removeStudent(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student removed successfully', student: removed });
});

// ----------------- SUBJECTS ROUTES -----------------
app.get('/api/subjects', authenticateToken, (req, res) => {
  const { branch, division } = req.query;
  const subjects = db.getSubjects({ branch, division });
  res.json(subjects);
});

app.post('/api/subjects', authenticateToken, (req, res) => {
  try {
    const { code, name, branch, division, semester } = req.body;
    if (!name || !branch) {
      return res.status(400).json({ error: 'Subject Name and Branch are required.' });
    }

    const newSubject = db.addSubject({
      code: code || '',
      name,
      branch,
      division: division || 'All',
      semester: semester || '1'
    });

    res.status(201).json({ message: 'Subject added successfully', subject: newSubject });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', authenticateToken, (req, res) => {
  const removed = db.removeSubject(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Subject not found' });
  res.json({ message: 'Subject removed successfully', subject: removed });
});

// ----------------- ATTENDANCE ROUTES -----------------
app.get('/api/attendance', authenticateToken, (req, res) => {
  const { branch, division, subjectId, date } = req.query;
  const records = db.getAttendance({ branch, division, subjectId, date });
  res.json(records);
});

// Save or Update Attendance
app.post('/api/attendance', authenticateToken, (req, res) => {
  try {
    const { branch, division, subjectId, date, records } = req.body;

    if (!branch || !division || !subjectId || !date || !records) {
      return res.status(400).json({ error: 'branch, division, subjectId, date, and attendance records are required.' });
    }

    const user = db.findUserById(req.user.id);
    const facultyName = user ? user.name : req.user.name;

    const result = db.saveOrUpdateAttendance({
      branch,
      division,
      subjectId,
      date,
      records,
      facultyId: req.user.id,
      facultyName
    });

    res.json({
      message: result.action === 'updated' ? 'Attendance updated successfully' : 'Attendance recorded successfully',
      action: result.action,
      attendance: result.record
    });
  } catch (err) {
    console.error('Attendance save error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', authenticateToken, (req, res) => {
  const removed = db.deleteAttendance(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Attendance record not found' });
  res.json({ message: 'Attendance record deleted' });
});

// ----------------- EXCEL EXPORT ROUTE -----------------
app.get('/api/export-excel', authenticateToken, (req, res) => {
  try {
    const { branch, division, subjectId, date } = req.query;

    if (!branch || !division || !subjectId) {
      return res.status(400).json({ error: 'branch, division, and subjectId are required for export.' });
    }

    const { buffer, filename } = generateAttendanceExcel({
      branch,
      division,
      subjectId,
      date: date || null
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Failed to generate Excel file: ' + err.message });
  }
});

// Serve frontend static build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA Fallback for non-API routes
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Web app is running. Open in dev mode or run npm run build.');
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Faculty Attendance Server running at http://localhost:${PORT}`);
  });
}

export default app;
