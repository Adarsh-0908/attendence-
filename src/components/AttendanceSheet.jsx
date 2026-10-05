import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Check, 
  X, 
  Download, 
  Save, 
  CheckCircle2, 
  Users, 
  Search, 
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';

export default function AttendanceSheet({ 
  user, 
  branch, 
  division, 
  onNavigateToSubjects,
  onNavigateToStudents 
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { [studentId]: 'P' | 'A' }
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load subjects whenever branch or division changes
  useEffect(() => {
    loadSubjects();
  }, [branch, division]);

  // Load students whenever branch or division changes
  useEffect(() => {
    loadStudents();
  }, [branch, division]);

  // Check if attendance exists for current (branch, division, subject, date)
  useEffect(() => {
    if (selectedSubjectId && selectedDate) {
      checkExistingAttendance();
    }
  }, [branch, division, selectedSubjectId, selectedDate, students]);

  const loadSubjects = async () => {
    try {
      const list = await api.getSubjects(branch, division);
      setSubjects(list);
      if (list.length > 0) {
        setSelectedSubjectId(list[0].id);
      } else {
        setSelectedSubjectId('');
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await api.getStudents(branch, division);
      setStudents(list);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAttendance = async () => {
    try {
      const records = await api.getAttendance(branch, division, selectedSubjectId, selectedDate);
      if (records && records.length > 0) {
        const record = records[0];
        setExistingRecord(record);
        // Populate existing attendance
        const map = {};
        students.forEach(s => {
          map[s.id] = record.records[s.id] || 'P'; // default to recorded or 'P'
        });
        setAttendanceRecords(map);
      } else {
        setExistingRecord(null);
        // Default all active students to 'P' (Present)
        const defaultMap = {};
        students.forEach(s => {
          defaultMap[s.id] = 'P';
        });
        setAttendanceRecords(defaultMap);
      }
    } catch (err) {
      console.error('Failed to check attendance:', err);
    }
  };

  // Toggle or set student status (ONLY P or A)
  const setStudentStatus = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Mark all present
  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  // Save / Update Attendance
  const handleSaveAttendance = async () => {
    if (!selectedSubjectId) {
      setNotification({ type: 'error', message: 'Please select a subject first.' });
      return;
    }
    if (students.length === 0) {
      setNotification({ type: 'error', message: 'No students found in this division to mark attendance for.' });
      return;
    }

    setSaving(true);
    try {
      const res = await api.saveAttendance({
        branch,
        division,
        subjectId: selectedSubjectId,
        date: selectedDate,
        records: attendanceRecords
      });

      setExistingRecord(res.attendance);
      setNotification({
        type: 'success',
        message: res.action === 'updated' 
          ? `✓ Attendance updated successfully! Excel export has been updated with these changes.` 
          : `✓ Attendance saved successfully! Ready to export to Excel.`
      });

      // Clear toast after 5s
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to save attendance.' });
    } finally {
      setSaving(false);
    }
  };

  // Download Excel
  const handleDownloadExcel = async (exportSingleDate = false) => {
    if (!selectedSubjectId) {
      setNotification({ type: 'error', message: 'Please select a subject before downloading Excel.' });
      return;
    }

    setDownloading(true);
    try {
      const filename = await api.downloadExcel({
        branch,
        division,
        subjectId: selectedSubjectId,
        date: exportSingleDate ? selectedDate : null
      });

      setNotification({
        type: 'success',
        message: `📥 Downloaded ${filename} successfully! Updated attendance included.`
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Excel export failed.' });
    } finally {
      setDownloading(false);
    }
  };

  // Calculate live statistics
  const totalCount = students.length;
  let presentCount = 0;
  let absentCount = 0;
  students.forEach(s => {
    const st = attendanceRecords[s.id] || 'P';
    if (st === 'P') presentCount++;
    else absentCount++;
  });
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  // Filter students by search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo && s.rollNo.toString().includes(searchQuery))
  );

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="text-sm font-semibold">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 hover:bg-black/5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Config Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mark Attendance</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {branch} - {division}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select date and subject to record or update student attendance.
            </p>
          </div>

          {/* Existing Record Indicator */}
          {existingRecord ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Editing Existing Record</span>
                <span className="block text-[11px] text-amber-700">
                  Last updated on {new Date(existingRecord.updatedAt || existingRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>New Attendance Record</span>
            </div>
          )}
        </div>

        {/* Date and Subject Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Lecture Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50"
            />
          </div>

          {/* Subject Picker */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Subject / Course</span>
              </label>
              {subjects.length === 0 && (
                <button
                  type="button"
                  onClick={onNavigateToSubjects}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  + Add Subject
                </button>
              )}
            </div>

            {subjects.length > 0 ? (
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 cursor-pointer"
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code ? `[${sub.code}] ` : ''}{sub.name} (Sem {sub.semester || 1})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>No subjects added for {branch} ({division}) yet.</span>
                <button
                  onClick={onNavigateToSubjects}
                  className="font-bold underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Attendance Stats & Quick Actions Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</div>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-900">{presentCount}</div>
            <div className="text-[11px] font-semibold text-emerald-700 uppercase">Present</div>
          </div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <X className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="text-xl font-bold text-rose-900">{absentCount}</div>
            <div className="text-[11px] font-semibold text-rose-700 uppercase">Absent</div>
          </div>
        </div>

        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <span className="font-bold text-sm">%</span>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-950">{attendanceRate}%</div>
            <div className="text-[11px] font-semibold text-indigo-700 uppercase">Attendance Rate</div>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name, enrollment no, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll('P')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              onClick={() => markAll('A')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark All Absent</span>
            </button>
          </div>

        </div>

        {/* Student Roster Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading student roster...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 font-medium text-sm">
              {students.length === 0 
                ? `No students found in branch ${branch} (${division}).` 
                : 'No students match your search criteria.'}
            </p>
            {students.length === 0 && (
              <button
                onClick={onNavigateToStudents}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
              >
                + Add Students to {division}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-20 text-center">Roll No</th>
                  <th className="py-3.5 px-4">Enrollment Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4 w-72 text-center">
                    Attendance Status (Present / Absent Only)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredStudents.map((stu, index) => {
                  const status = attendanceRecords[stu.id] || 'P';
                  const isPresent = status === 'P';

                  return (
                    <tr 
                      key={stu.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isPresent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono text-xs">
                        {stu.rollNo || '-'}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                        {stu.enrollmentNo}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {stu.name}
                      </td>

                      {/* ONLY PRESENT AND ABSENT BUTTONS - NO LATE BUTTON */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                          
                          {/* PRESENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(stu.id, 'P')}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-600 ring-offset-1'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Present</span>
                          </button>

                          {/* ABSENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => setStudentStatus(stu.id, 'A')}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-2 ring-rose-600 ring-offset-1'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Absent</span>
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save & Export Sticky Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="text-xs text-slate-500 font-medium">
            {students.length > 0 && (
              <span>
                Ready to submit: <strong>{presentCount}</strong> Present, <strong>{absentCount}</strong> Absent.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Download Excel for this date */}
            <button
              type="button"
              onClick={() => handleDownloadExcel(true)}
              disabled={downloading || !selectedSubjectId}
              title="Download Excel for this single date"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Day Report (.xlsx)</span>
            </button>

            {/* Download Full Cumulative Register (Master Excel) */}
            <button
              type="button"
              onClick={() => handleDownloadExcel(false)}
              disabled={downloading || !selectedSubjectId}
              title="Download Master Attendance Register with all dates and attendance percentages"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Master Register (.xlsx)</span>
            </button>

            {/* SAVE / UPDATE ATTENDANCE */}
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || !selectedSubjectId || students.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving 
                  ? 'Saving...' 
                  : existingRecord 
                    ? 'Update Attendance' 
                    : 'Save Attendance'}
              </span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
