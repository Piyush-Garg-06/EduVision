import React, { useState } from 'react';
import API from '../api';
import { 
  Shield, BookOpen, Key, Users, Sparkles, GraduationCap, 
  UserCheck, Heart, ShieldCheck, ArrowRight, Loader2, ArrowLeft
} from 'lucide-react';

export default function Login({ onLoginSuccess, onBackToHome }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  const demoAccounts = [
    {
      role: 'student',
      title: 'Student',
      user: 'testuser',
      pass: 'password123',
      icon: GraduationCap,
      desc: 'Aarav Singhal (Sem 5, High Risk Alert)',
      color: 'from-indigo-500 to-cyan-500',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      role: 'faculty',
      title: 'Teacher',
      user: 'faculty',
      pass: 'faculty123',
      icon: UserCheck,
      desc: 'Dr. Amit Sharma (1-Click Registers & Mentorship)',
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      role: 'parent',
      title: 'Parent',
      user: 'parent',
      pass: 'password123',
      icon: Heart,
      desc: 'Sanjay Singhal (Real-time Ward Tracker)',
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      role: 'admin',
      title: 'Admin',
      user: 'admin',
      pass: 'admin123',
      icon: ShieldCheck,
      desc: 'Dean Office (College-wide Intelligence)',
      color: 'from-purple-500 to-pink-500',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass, role) => {
    setUsername(user);
    setPassword(pass);
    setSelectedRole(role);
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { username: user, password: pass });
      localStorage.setItem('token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none animate-glow delay-1000"></div>

      <div className="w-full max-w-xl glass-panel-glow p-8 sm:p-10 rounded-3xl relative z-10 border border-slate-800 shadow-2xl backdrop-blur-2xl">
        {onBackToHome && (
          <button 
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
        )}

        {/* Portal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            EduVision Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Next-Gen Academic Life Tracking & AI-Powered Success Platform
          </p>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1-Click Instant Demo Login
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
              Click any card to auto-login
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {demoAccounts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item.user, item.pass, item.role)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group hover:scale-[1.02] ${
                    username === item.user 
                      ? 'bg-slate-850 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-tr ${item.color} text-white shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">1-Click</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5" title={item.desc}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or College ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. testuser, faculty, parent, admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white placeholder-slate-600 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white placeholder-slate-600 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Secure Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by JWT & Role-Based Guard</span>
          <span>EduVision v2.5 Local</span>
        </div>
      </div>
    </div>
  );
}
