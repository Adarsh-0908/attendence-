import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  BookOpen, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { api } from '../api';

export default function AttendanceReports({ 
  branch, 
  division, 
  onEditDateAttendance 
}) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, [branch, division]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadData();
    }
  }, [branch, division, selectedSubjectId]);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuList, attRecords] = await Promise.all([
        api.getStudents(branch, division),
        api.getAttendance(branch, division, selectedSubjectId)
      ]);
      setStudents(stuList);
      // Sort attendance records chronologically
      attRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAttendanceList(attRecords);
    } catch (err) {
      console.error('Failed to load attendance report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async (date = null) => {
    if (!selectedSubjectId) return;
    setDownloading(true);
    try {
      const filename = await api.downloadExcel({
        branch,
        division,
        subjectId: selectedSubjectId,
        date
      });
      setNotification({
        type: 'success',
        message: `📥 Downloaded ${filename} successfully!`
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to download Excel file'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteRecord = async (attId, attDate) => {
    if (!window.confirm(`Are you sure you want to delete attendance record for date ${attDate}?`)) {
      return;
    }
    try {
      await api.deleteAttendance(attId);
      setNotification({ type: 'success', message: `Deleted record for ${attDate}` });
      loadData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Calculations for register
  const totalLectures = attendanceList.length;
  const lectureDates = attendanceList.map(a => a.date);

  // Per-student stats
  let totalEligible = 0;
  let totalDefaulters = 0;

  const studentStats = students.map(stu => {
    let presentCount = 0;
    attendanceList.forEach(att => {
      const status = att.records ? att.records[stu.id] : null;
      if (status === 'P' || status === 'present') presentCount++;
    });

    const percentage = totalLectures > 0 
      ? parseFloat(((presentCount / totalLectures) * 100).toFixed(1)) 
      : 0;

    const isEligible = percentage >= 75;
    if (totalLectures > 0) {
      if (isEligible) totalEligible++;
      else totalDefaulters++;
    }

    return {
      ...stu,
      presentCount,
      totalLectures,
      percentage,
      isEligible
    };
  });

  const filteredStudentStats = studentStats.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-semibold">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-bold px-2 py-1 hover:bg-black/5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Excel Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Attendance Register & Excel Reports
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {branch} - {division}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cumulative view of all lecture dates, student attendance percentages, and dynamic Excel generation.
            </p>
          </div>

          {/* Master Excel Download Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadExcel(null)}
              disabled={downloading || totalLectures === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-100 transition cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{downloading ? 'Generating Excel...' : 'Download Master Excel (.xlsx)'}</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh attendance records"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subject Filter Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50/50 cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code ? `[${s.code}] ` : ''}{s.name} (Sem {s.semester || 1})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Lectures Conducted: <strong className="text-slate-800">{totalLectures}</strong>
          </div>
        </div>

      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase">Total Lectures</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalLectures}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded so far</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase">Total Students</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{students.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In this division</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-emerald-700 text-xs font-semibold uppercase">Eligible (&ge;75%)</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{totalEligible}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Meeting quota</div>
        </div>

        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-rose-700 text-xs font-semibold uppercase">Defaulters (&lt;75%)</div>
          <div className="text-2xl font-bold text-rose-900 mt-1">{totalDefaulters}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Short attendance</div>
        </div>
      </div>

      {/* Lecture Dates Recorded Bar (Quick edit past dates) */}
      {totalLectures > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Lectures Conducted (Click to Edit / Update Attendance):
            </span>
            <span className="text-[11px] text-slate-400">
              Updates automatically synchronize with Excel export
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {attendanceList.map((att) => (
              <div 
                key={att.id}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-2.5 py-1 text-xs transition group"
              >
                <button
                  onClick={() => onEditDateAttendance(att.date, att.subjectId)}
                  className="font-semibold text-slate-700 group-hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                  title="Click to edit/update attendance for this date"
                >
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                  <span>{att.date}</span>
                </button>

                <button
                  onClick={() => handleDownloadExcel(att.date)}
                  title="Download single day Excel report"
                  className="text-slate-400 hover:text-emerald-600 ml-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleDeleteRecord(att.id, att.date)}
                  title="Delete this record"
                  className="text-slate-300 hover:text-red-500 ml-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Master Matrix Sheet Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student in register..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing <strong>{filteredStudentStats.length}</strong> students across <strong>{totalLectures}</strong> lecture dates
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading attendance matrix...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students enrolled in {branch} ({division}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center sticky left-0 bg-slate-50 z-10">#</th>
                  <th className="py-3 px-3 w-16 text-center sticky left-10 bg-slate-50 z-10">Roll</th>
                  <th className="py-3 px-3 w-32 sticky left-26 bg-slate-50 z-10">Enrollment No</th>
                  <th className="py-3 px-3 min-w-44 sticky left-58 bg-slate-50 z-10">Student Name</th>
                  
                  {/* Dynamic Lecture Date Columns */}
                  {lectureDates.map((dt, idx) => (
                    <th key={dt} className="py-3 px-2 text-center min-w-20 border-l border-slate-200/60">
                      <div>Lec #{idx + 1}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{dt.slice(5)}</div>
                    </th>
                  ))}

                  <th className="py-3 px-3 text-center bg-slate-100/70 border-l border-slate-200 w-20">Present</th>
                  <th className="py-3 px-3 text-center bg-slate-100/70 w-20">Total Lec</th>
                  <th className="py-3 px-3 text-center bg-slate-100/70 w-24">Att %</th>
                  <th className="py-3 px-3 text-center bg-slate-100/70 w-24">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudentStats.map((stu, index) => {
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono sticky left-0 bg-white">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 sticky left-10 bg-white">
                        {stu.rollNo || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 sticky left-26 bg-white">
                        {stu.enrollmentNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 sticky left-58 bg-white">
                        {stu.name}
                      </td>

                      {/* Presence status for each lecture date */}
                      {lectureDates.map(dt => {
                        const att = attendanceList.find(a => a.date === dt);
                        const status = att && att.records ? att.records[stu.id] : null;
                        const isP = status === 'P' || status === 'present';
                        const isA = status === 'A' || status === 'absent';

                        return (
                          <td key={dt} className="py-2.5 px-2 text-center border-l border-slate-100">
                            {isP ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                                P
                              </span>
                            ) : isA ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
                                A
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-slate-50/50 border-l border-slate-200">
                        {stu.presentCount}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 bg-slate-50/50">
                        {stu.totalLectures}
                      </td>
                      <td className="py-2.5 px-3 text-center bg-slate-50/50">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          stu.isEligible 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {stu.percentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center bg-slate-50/50">
                        {totalLectures === 0 ? (
                          <span className="text-slate-400">N/A</span>
                        ) : stu.isEligible ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Eligible
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            Defaulter
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
