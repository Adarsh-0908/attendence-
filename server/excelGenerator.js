import * as XLSX from 'xlsx';
import { db } from './db.js';

export function generateAttendanceExcel({ branch, division, subjectId, date = null }) {
  const students = db.getStudents({ branch, division });
  const allAttendance = db.getAttendance({ branch, division, subjectId });
  const subjects = db.getSubjects({ branch, division });
  const currentSubject = subjects.find(s => s.id === subjectId) || { name: 'All Subjects', code: 'N/A' };

  // Filter by date if specific date requested, else all dates for master register
  let attendanceRecords = allAttendance;
  if (date) {
    attendanceRecords = allAttendance.filter(a => a.date === date);
  }

  // Sort dates chronologically
  attendanceRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Extract unique sorted lecture dates
  const lectureDates = attendanceRecords.map(a => a.date);
  const totalLectures = lectureDates.length;

  // Build spreadsheet header rows
  const reportTitle = date 
    ? `DAILY ATTENDANCE REPORT (${date})` 
    : `CUMULATIVE ATTENDANCE REGISTER`;

  const headerRows = [
    ['COLLEGE FACULTY ATTENDANCE PORTAL'],
    [reportTitle],
    [`Branch: ${branch}`, `Division: ${division}`, `Subject: ${currentSubject.name} (${currentSubject.code || ''})`],
    [`Generated On: ${new Date().toLocaleString()}`, `Total Lectures Conducted: ${totalLectures}`],
    [] // blank row
  ];

  // Build table columns
  const tableHeaders = [
    'Sr. No.',
    'Roll No.',
    'Enrollment Number',
    'Student Name'
  ];

  // Add each lecture date as a column
  lectureDates.forEach((dt, idx) => {
    tableHeaders.push(`Lec #${idx + 1} (${dt})`);
  });

  tableHeaders.push('Total Present');
  tableHeaders.push('Total Lectures');
  tableHeaders.push('Attendance %');
  tableHeaders.push('Status (>=75%)');

  // Build rows for each student
  const studentRows = students.map((stu, index) => {
    let presentCount = 0;
    const row = [
      index + 1,
      stu.rollNo || '-',
      stu.enrollmentNo,
      stu.name
    ];

    lectureDates.forEach(dt => {
      const attRecord = attendanceRecords.find(a => a.date === dt);
      const status = attRecord && attRecord.records ? attRecord.records[stu.id] : '-';
      if (status === 'P' || status === 'present') {
        presentCount++;
        row.push('P');
      } else if (status === 'A' || status === 'absent') {
        row.push('A');
      } else {
        row.push('-');
      }
    });

    const percentage = totalLectures > 0 ? ((presentCount / totalLectures) * 100).toFixed(1) : '0.0';
    const isEligible = parseFloat(percentage) >= 75 ? 'Eligible' : 'Defaulter';

    row.push(presentCount);
    row.push(totalLectures);
    row.push(`${percentage}%`);
    row.push(isEligible);

    return row;
  });

  // Calculate Column-wise class summary (Total students present per date)
  const summaryRow = ['TOTAL PRESENT', '', '', ''];
  lectureDates.forEach(dt => {
    const attRecord = attendanceRecords.find(a => a.date === dt);
    let countP = 0;
    if (attRecord && attRecord.records) {
      Object.values(attRecord.records).forEach(st => {
        if (st === 'P' || st === 'present') countP++;
      });
    }
    summaryRow.push(countP);
  });

  // Calculate overall class attendance average
  let totalAllPresent = 0;
  students.forEach(stu => {
    lectureDates.forEach(dt => {
      const attRecord = attendanceRecords.find(a => a.date === dt);
      const status = attRecord && attRecord.records ? attRecord.records[stu.id] : null;
      if (status === 'P' || status === 'present') totalAllPresent++;
    });
  });
  const maxPossible = students.length * totalLectures;
  const overallClassAvg = maxPossible > 0 ? ((totalAllPresent / maxPossible) * 100).toFixed(1) : '0.0';

  summaryRow.push(totalAllPresent);
  summaryRow.push(maxPossible);
  summaryRow.push(`${overallClassAvg}%`);
  summaryRow.push('-');

  // Combine all rows into worksheet
  const allRows = [
    ...headerRows,
    tableHeaders,
    ...studentRows,
    [],
    summaryRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Set nice column widths
  const colWidths = [
    { wch: 8 },  // Sr No
    { wch: 10 }, // Roll No
    { wch: 22 }, // Enrollment No
    { wch: 25 }, // Name
  ];
  lectureDates.forEach(() => {
    colWidths.push({ wch: 16 }); // Date columns
  });
  colWidths.push({ wch: 14 }); // Total Present
  colWidths.push({ wch: 14 }); // Total Lectures
  colWidths.push({ wch: 14 }); // Attendance %
  colWidths.push({ wch: 16 }); // Status

  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetName = (currentSubject.code || currentSubject.name || 'Attendance').substring(0, 30);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return {
    buffer,
    filename: `Attendance_${branch}_${division}_${currentSubject.code || 'Sub'}_${date || 'Register'}.xlsx`
  };
}
