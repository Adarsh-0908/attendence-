import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import AttendanceSheet from './components/AttendanceSheet';
import AttendanceReports from './components/AttendanceReports';
import StudentManager from './components/StudentManager';
import SubjectManager from './components/SubjectManager';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('take-attendance'); // 'take-attendance' | 'reports' | 'students' | 'subjects'

  // Selected branch & division context
  const [selectedBranch, setSelectedBranch] = useState('EC');
  const [selectedDivision, setSelectedDivision] = useState('EC-I');

  // Check login on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('faculty_token');
    if (!token) {
      setAuthChecking(false);
      return;
    }

    try {
      const me = await api.getMe();
      setUser(me);
      if (me.branch) setSelectedBranch(me.branch);
      if (me.division) setSelectedDivision(me.division);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('faculty_token');
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser.branch) setSelectedBranch(loggedUser.branch);
    if (loggedUser.division) setSelectedDivision(loggedUser.division);
  };

  const handleLogout = () => {
    localStorage.removeItem('faculty_token');
    setUser(null);
  };

  // Jump to edit a specific past date
  const handleEditDateAttendance = (date, subjectId) => {
    setActiveTab('take-attendance');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-300">Loading Faculty Portal...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Sign In / Sign Up Modal
  if (!user) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'take-attendance' && (
          <AttendanceSheet
            user={user}
            branch={selectedBranch}
            division={selectedDivision}
            onNavigateToSubjects={() => setActiveTab('subjects')}
            onNavigateToStudents={() => setActiveTab('students')}
          />
        )}

        {activeTab === 'reports' && (
          <AttendanceReports
            user={user}
            branch={selectedBranch}
            division={selectedDivision}
            onEditDateAttendance={handleEditDateAttendance}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            branch={selectedBranch}
            division={selectedDivision}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectManager
            branch={selectedBranch}
            division={selectedDivision}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 bg-white">
        <p>College Faculty Attendance & Academic Portal • Built for Engineering Faculty</p>
      </footer>
    </div>
  );
}
