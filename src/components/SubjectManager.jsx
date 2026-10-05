import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  GraduationCap
} from 'lucide-react';
import { api } from '../api';

export default function SubjectManager({ branch, division }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [semester, setSemester] = useState('5');
  const [adding, setAdding] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, [branch, division]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const list = await api.getSubjects(branch, division);
      setSubjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      await api.addSubject({
        name,
        code,
        semester,
        branch,
        division
      });

      setName('');
      setCode('');
      setNotification({ type: 'success', message: `Added subject "${name}" to ${branch} (${division})` });
      loadSubjects();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to add subject.' });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveSubject = async (subId, subName) => {
    if (!window.confirm(`Are you sure you want to remove ${subName}?`)) return;

    try {
      await api.removeSubject(subId);
      setNotification({ type: 'success', message: `Removed subject "${subName}"` });
      loadSubjects();
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    }
  };

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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Subjects Management</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {branch} - {division}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Add and configure academic subjects taught for this branch and division.
            </p>
          </div>
        </div>
      </div>

      {/* Add Subject Form */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Add New Subject</span>
        </h3>

        <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Signals and Systems"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Subject Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. EC404"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{adding ? 'Adding...' : 'Add Subject'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Subjects Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Current Subjects for {branch} ({division})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No subjects configured for this branch and division yet. Use the form above to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(sub => (
              <div 
                key={sub.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {sub.code || 'NO-CODE'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Sem {sub.semester || '1'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition">
                    {sub.name}
                  </h4>

                  <div className="text-xs text-slate-500">
                    Dept: {sub.branch} | Div: {sub.division || 'All'}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                  <button
                    onClick={() => handleRemoveSubject(sub.id, sub.name)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
