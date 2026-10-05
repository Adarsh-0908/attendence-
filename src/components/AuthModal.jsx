import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Layers, 
  BadgeCheck, 
  ArrowRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { BRANCHES, getDivisionsForBranch } from '../data/branches';
import { api } from '../api';

export default function AuthModal({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sign In state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign Up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState('EC');
  const [division, setDivision] = useState('EC-I');
  const [customDivision, setCustomDivision] = useState('');
  const [isCustomDiv, setIsCustomDiv] = useState(false);

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    const divs = getDivisionsForBranch(newBranch);
    setDivision(divs[0] || 'Div-A');
    setIsCustomDiv(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.signin({
        email: signinEmail,
        password: signinPassword
      });
      localStorage.setItem('faculty_token', res.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const finalDivision = isCustomDiv ? customDivision.trim() : division;
    if (!finalDivision) {
      setError('Please specify a division for your branch.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({
        name,
        email,
        facultyId,
        password,
        branch,
        division: finalDivision
      });
      localStorage.setItem('faculty_token', res.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Failed to create faculty account.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const quickLogin = async (demoEmail, demoPass) => {
    setSigninEmail(demoEmail);
    setSigninPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const res = await api.signin({ email: demoEmail, password: demoPass });
      localStorage.setItem('faculty_token', res.token);
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableDivisions = getDivisionsForBranch(branch);

  return (
    <div className="min-h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">College Faculty Portal</h1>
              <p className="text-indigo-100 text-xs sm:text-sm">Attendance Management & Academic Register</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-indigo-900/40 p-1 rounded-xl mt-6 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Faculty Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Faculty Registration (Sign Up)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Faculty College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    placeholder="e.g. rajesh.ec@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Quick Logins */}
              <div className="pt-4 border-t border-slate-100 mt-6">
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Test Login (Pre-configured Faculty):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLogin('rajesh.ec@college.edu', 'faculty123')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Dr. Rajesh Sharma</div>
                    <div className="text-slate-500 text-[11px]">Dept: EC | Div: EC-I</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('neha.ict@college.edu', 'faculty123')}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-indigo-600">Prof. Neha Gupta</div>
                    <div className="text-slate-500 text-[11px]">Dept: ICT | Div: ICT-A</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Sameer Joshi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="faculty@college.edu"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Faculty ID (Optional)
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      placeholder="e.g. FAC-EC-109"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* BRANCH SELECTION - All requested branches */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    Academic Branch / Department
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">12 Branches Available</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                >
                  {BRANCHES.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DIVISION SELECTION - e.g. EC-I / EC-J */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Assigned Division
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDiv(!isCustomDiv)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    {isCustomDiv ? 'Select standard division' : '+ Enter custom division'}
                  </button>
                </div>

                {!isCustomDiv ? (
                  <div className="space-y-1.5">
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold bg-white"
                    >
                      {availableDivisions.map(div => (
                        <option key={div} value={div}>
                          Division: {div} {branch === 'EC' && (div === 'EC-I' || div === 'EC-J') ? '🌟 (Standard)' : ''}
                        </option>
                      ))}
                    </select>
                    {branch === 'EC' && (
                      <p className="text-[11px] text-indigo-600">
                        ✓ EC-I and EC-J divisions pre-configured for Electronics & Communication
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={customDivision}
                    onChange={(e) => setCustomDivision(e.target.value)}
                    placeholder="e.g. EC-I/J Combined or Div-K"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating Faculty Account...' : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
