import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Upload
} from 'lucide-react';
import { api } from '../api';

export default function StudentManager({ branch, division }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Single add form state
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [adding, setAdding] = useState(false);

  // Bulk add modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [branch, division]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const list = await api.getStudents(branch, division);
      setStudents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name.trim() || !enrollmentNo.trim()) return;

    setAdding(true);
    try {
      await api.addStudent({
        name,
        enrollmentNo,
        rollNo,
        branch,
        division
      });

      setName('');
      setEnrollmentNo('');
      setRollNo('');
      setNotification({ type: 'success', message: `Added ${name} to ${branch} (${division})` });
      loadStudents();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to add student.' });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName}?`)) return;

    try {
      await api.removeStudent(studentId);
      setNotification({ type: 'success', message: `Removed ${studentName}` });
      loadStudents();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;
    setBulkProcessing(true);

    // Parse lines: comma-separated or tab-separated (from Excel)
    // Format: EnrollmentNo, Name, RollNo OR Name, EnrollmentNo
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const parsed = [];

    lines.forEach(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        // If first part is numeric enrollment:
        if (/^\d+$/.test(parts[0])) {
          parsed.push({
            enrollmentNo: parts[0],
            name: parts[1],
            rollNo: parts[2] || ''
          });
        } else {
          parsed.push({
            name: parts[0],
            enrollmentNo: parts[1],
            rollNo: parts[2] || ''
          });
        }
      }
    });

    if (parsed.length === 0) {
      setNotification({ type: 'error', message: 'Could not parse student entries. Please check format.' });
      setBulkProcessing(false);
      return;
    }

    try {
      const res = await api.bulkAddStudents(parsed, branch, division);
      setNotification({ type: 'success', message: res.message });
      setBulkText('');
      setShowBulkModal(false);
      loadStudents();
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Add 5 realistic sample students
  const handleAddSampleBatch = async () => {
    const samples = [
      { name: 'Kunal Trivedi', enrollmentNo: `210020107${Math.floor(100 + Math.random() * 900)}`, rollNo: `${students.length + 1}` },
      { name: 'Shruti Varma', enrollmentNo: `210020107${Math.floor(100 + Math.random() * 900)}`, rollNo: `${students.length + 2}` },
      { name: 'Manish Panchal', enrollmentNo: `210020107${Math.floor(100 + Math.random() * 900)}`, rollNo: `${students.length + 3}` },
      { name: 'Dhwani Makwana', enrollmentNo: `210020107${Math.floor(100 + Math.random() * 900)}`, rollNo: `${students.length + 4}` },
      { name: 'Jaydeep Rathod', enrollmentNo: `210020107${Math.floor(100 + Math.random() * 900)}`, rollNo: `${students.length + 5}` },
    ];
    try {
      await api.bulkAddStudents(samples, branch, division);
      setNotification({ type: 'success', message: 'Added 5 sample students to roster!' });
      loadStudents();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo && s.rollNo.toString().includes(searchQuery))
  );

  return (
    <div className="space-y-6">

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border ${
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

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Roster Management</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {branch} - {division}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Add, remove, or bulk import student names and enrollment numbers for this class.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bulk Paste / Import</span>
            </button>

            <button
              onClick={handleAddSampleBatch}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Add 5 Demo Students</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-600" />
          <span>Add New Student to {branch} ({division})</span>
        </h3>

        <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priyanshu Sharma"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Enrollment Number *</label>
            <input
              type="text"
              required
              value={enrollmentNo}
              onChange={(e) => setEnrollmentNo(e.target.value)}
              placeholder="e.g. 210020107018"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Roll Number (Optional)</label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g. 18"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{adding ? 'Adding...' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter students by name or enrollment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Enrolled: <strong className="text-slate-800">{students.length}</strong> students
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading roster...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No students found in {branch} ({division}). Use the form above to add students.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-20 text-center">Roll No</th>
                  <th className="py-3 px-4">Enrollment Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch & Div</th>
                  <th className="py-3 px-4 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((stu, index) => (
                  <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono text-xs">
                      {stu.rollNo || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {stu.enrollmentNo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {stu.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {stu.branch} ({stu.division})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveStudent(stu.id, stu.name)}
                        title="Remove student"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Bulk Import Students</span>
              </h3>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste student details copied from Excel or CSV (one student per line).<br />
              Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">EnrollmentNo, Student Name, RollNo</code>
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`210020107021, Aayush Sharma, 21\n210020107022, Bhavya Patel, 22\n210020107023, Chirag Desai, 23`}
              className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={bulkProcessing || !bulkText.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {bulkProcessing ? 'Importing...' : 'Import Students'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
