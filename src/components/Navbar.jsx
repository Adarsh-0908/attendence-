import React from 'react';
import { 
  GraduationCap, 
  LogOut, 
  CheckSquare, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  Building2, 
  Layers 
} from 'lucide-react';
import { BRANCHES, getDivisionsForBranch } from '../data/branches';

export default function Navbar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout,
  selectedBranch,
  setSelectedBranch,
  selectedDivision,
  setSelectedDivision 
}) {
  const currentDivisions = getDivisionsForBranch(selectedBranch);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">CampusAttend</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Faculty Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">College Academic Attendance System</p>
            </div>
          </div>

          {/* Branch & Division Selector Bar */}
          <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 gap-1 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Branch:</span>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => {
                const newBranch = e.target.value;
                setSelectedBranch(newBranch);
                const divs = getDivisionsForBranch(newBranch);
                setSelectedDivision(divs[0] || 'Div-A');
              }}
              className="bg-white text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {BRANCHES.map(b => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name.split('(')[0]}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 font-medium ml-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Div:</span>
            </div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-white text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {currentDivisions.map(div => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
              <span className="text-[11px] text-slate-500">
                {user?.facultyId || user?.email}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* Mobile Branch / Division Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 gap-2 text-xs">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-slate-500 font-medium">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => {
                const newBranch = e.target.value;
                setSelectedBranch(newBranch);
                const divs = getDivisionsForBranch(newBranch);
                setSelectedDivision(divs[0] || 'Div-A');
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 font-semibold flex-1"
            >
              {BRANCHES.map(b => (
                <option key={b.code} value={b.code}>{b.code}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-slate-500 font-medium">Div:</span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 font-semibold flex-1"
            >
              {currentDivisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-4 border-t border-slate-100 pt-1 -mb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('take-attendance')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'take-attendance'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Take Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Register & Excel Export</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students List</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Subjects</span>
          </button>
        </div>

      </div>
    </header>
  );
}
