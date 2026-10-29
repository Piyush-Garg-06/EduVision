import React, { useState, useEffect } from 'react';
import API from '../api';
import AiChatbot from './AiChatbot';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Calendar, BrainCircuit, Target, Trophy,
  Award, CheckSquare, Sparkles, TrendingUp, Briefcase, 
  AlertTriangle, RefreshCw, LogOut, CheckCircle2, ChevronRight,
  Plus, Menu, Bell, X, Flame, ExternalLink, Trash2, Printer, ShieldCheck,
  Send, Bot, User, Check, Clock
} from 'lucide-react';

export default function StudentDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [remediation, setRemediation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: overview, attendance, aiStudyPlan, aiCounselor, skills, portfolio, gamification
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [analyzingGap, setAnalyzingGap] = useState(false);

  // AI Counselor Plan States
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Dedicated In-Tab AI Counselor Chat
  const [counselorInput, setCounselorInput] = useState('');
  const [counselorChat, setCounselorChat] = useState([
    { 
      role: 'assistant', 
      content: `Hello ${user?.firstName || 'there'}! I am EduVision AI Counselor. How can I assist you with your course performance, attendance recovery, or career preparation today?` 
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Form states for Portfolio
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);
  const [addingSkill, setAddingSkill] = useState(false);

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');
  const [addingProj, setAddingProj] = useState(false);

  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [addingCert, setAddingCert] = useState(false);

  const [newInternCompany, setNewInternCompany] = useState('');
  const [newInternRole, setNewInternRole] = useState('');
  const [newInternDuration, setNewInternDuration] = useState('');
  const [addingIntern, setAddingIntern] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const meRes = await API.get('/auth/me');
      setProfile(meRes.data.profile);
      const studentId = meRes.data.user._id || meRes.data.user.id;

      const [attRes, marksRes, remRes, notifRes, lbRes] = await Promise.all([
        API.get(`/academic/attendance/${studentId}`),
        API.get(`/academic/marks/${studentId}`),
        API.get(`/academic/remediation/${studentId}`),
        API.get(`/academic/notifications`),
        API.get('/analytics/leaderboard').catch(() => ({ data: [] }))
      ]);

      setAttendance(attRes.data || []);
      setMarks(marksRes.data || []);
      setRemediation(remRes.data || null);
      setNotifications(notifRes.data || []);
      setLeaderboard(lbRes.data || []);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate or Refresh AI Study & Recovery Plan
  const handleGenerateAiPlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await API.post('/ai/action-plan', { studentId: user._id || user.id });
      setRemediation(res.data.remediation);
      const meRes = await API.get('/auth/me');
      setProfile(meRes.data.profile);
      alert('Personalized Academic Recovery and Study Schedule generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error contacting AI service. Active local fallback plan loaded.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Analyze Career Skill Gap
  const handleAnalyzeSkillGap = async (roleToAnalyze) => {
    const role = roleToAnalyze || targetRole;
    setAnalyzingGap(true);
    try {
      const res = await API.post('/ai/skill-gap', { targetRole: role });
      setGapAnalysis(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching career gap analysis.');
    } finally {
      setAnalyzingGap(false);
    }
  };

  // Toggle Daily Study Plan Milestone
  const handleToggleStudyDay = async (idx) => {
    try {
      const res = await API.post('/academic/study-plan/toggle-day', { dayIndex: idx });
      setProfile(prev => ({
        ...prev,
        aiStudyPlan: res.data,
        gamification: {
          ...prev.gamification,
          xp: (prev.gamification?.xp || 0) + 40
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Remedial Task Status
  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'assigned' : 'completed';
    try {
      const res = await API.post('/academic/remediation/action', {
        studentId: user._id || user.id,
        taskId,
        status: nextStatus
      });
      setRemediation(res.data);
      const meRes = await API.get('/auth/me');
      setProfile(meRes.data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  // In-Tab AI Counselor Chat
  const handleSendCounselorMessage = async (customText) => {
    const query = customText || counselorInput;
    if (!query.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: query };
    setCounselorChat(prev => [...prev, userMsg]);
    setCounselorInput('');
    setChatLoading(true);

    try {
      const history = counselorChat.slice(-4).map(c => ({ role: c.role, content: c.content }));
      const res = await API.post('/ai/chat', {
        studentId: user._id || user.id,
        message: query,
        chatHistory: history
      });

      setCounselorChat(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        isAiPowered: res.data.isAiPowered
      }]);
    } catch (err) {
      console.error(err);
      setCounselorChat(prev => [...prev, {
        role: 'assistant',
        content: "I am experiencing a momentary connection issue. Please try again shortly.",
        isAiPowered: false
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Portfolio Management
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setAddingSkill(true);
    try {
      const res = await API.post('/academic/portfolio/skills', { name: newSkill.trim(), level: skillLevel });
      setProfile(res.data);
      setNewSkill('');
      alert('Skill recorded successfully. +15 XP earned!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillName) => {
    try {
      const res = await API.delete(`/academic/portfolio/skill/${encodeURIComponent(skillName)}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    setAddingProj(true);
    try {
      const res = await API.post('/academic/portfolio/achievement', {
        category: 'project',
        title: newProjTitle.trim(),
        description: newProjDesc.trim(),
        url: newProjUrl.trim()
      });
      setProfile(res.data);
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjUrl('');
      alert('Project saved successfully. +50 XP awarded!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProj(false);
    }
  };

  const handleDeleteProject = async (projId) => {
    try {
      const res = await API.delete(`/academic/portfolio/project/${projId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!newCertTitle.trim()) return;
    setAddingCert(true);
    try {
      const res = await API.post('/academic/portfolio/achievement', {
        category: 'certification',
        title: newCertTitle.trim(),
        issuer: newCertIssuer.trim()
      });
      setProfile(res.data);
      setNewCertTitle('');
      setNewCertIssuer('');
      alert('Certification recorded. +75 XP awarded!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingCert(false);
    }
  };

  const handleDeleteCertification = async (certId) => {
    try {
      const res = await API.delete(`/academic/portfolio/certification/${certId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInternship = async (e) => {
    e.preventDefault();
    if (!newInternCompany.trim()) return;
    setAddingIntern(true);
    try {
      const res = await API.post('/academic/portfolio/achievement', {
        category: 'internship',
        title: newInternRole.trim() || 'Intern',
        company: newInternCompany.trim(),
        duration: newInternDuration.trim()
      });
      setProfile(res.data);
      setNewInternCompany('');
      setNewInternRole('');
      setNewInternDuration('');
      alert('Internship cataloged. +100 XP awarded!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingIntern(false);
    }
  };

  const handleDeleteInternship = async (internId) => {
    try {
      const res = await API.delete(`/academic/portfolio/internship/${internId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Notifications
  const handleMarkAllNotifsRead = async () => {
    try {
      await API.post('/academic/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNotif = async (notifId) => {
    try {
      await API.post(`/academic/notifications/read/${notifId}`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-wide">Synchronizing EduVision Student Profile...</p>
        </div>
      </div>
    );
  }

  // Attendance metrics calculation
  let totalClasses = 0;
  let attendedClasses = 0;
  const attendanceBreakdown = attendance.map(a => {
    const present = a.records.filter(r => r.status === 'present').length;
    const total = a.records.length;
    totalClasses += total;
    attendedClasses += present;
    const pct = total > 0 ? (present / total) * 100 : 100;
    
    // Professional safety margin calculation
    let safeMarginText = '';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (pct < 75) {
      const needed = Math.max(1, Math.ceil((0.75 * total - present) / 0.25));
      safeMarginText = `Shortage Alert: Must attend next ${needed} consecutive lectures`;
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else {
      const canMiss = Math.floor((present - 0.75 * total) / 0.75);
      safeMarginText = canMiss > 0 ? `Safe Buffer: Up to ${canMiss} absences permitted` : `Eligibility boundary: Attend upcoming lectures`;
      if (pct < 80) statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }

    return {
      courseCode: a.courseCode,
      courseName: a.courseName,
      present,
      total,
      percentage: pct.toFixed(1),
      safeMarginText,
      statusColor
    };
  });

  const overallAttendancePct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

  // Gamification metrics
  const currentXp = profile?.gamification?.xp || 0;
  const currentLevel = profile?.gamification?.level || 1;
  const xpInCurrentLevel = currentXp % 500;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));
  const currentStreak = profile?.gamification?.streak || 1;

  const levelTitles = [
    'Novice Scholar',
    'Academic Explorer',
    'Knowledge Practitioner',
    'Master Scholar',
    'Senior Academic Fellow'
  ];
  const levelTitle = levelTitles[Math.min(currentLevel - 1, levelTitles.length - 1)];
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    // Fixed Viewport Layout: guarantees sidebar spans 100% height without any gap
    <div className="h-screen w-full flex bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:h-full self-stretch shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              E
            </div>
            <div>
              <h2 className="font-extrabold text-white tracking-tight leading-none text-base">EduVision</h2>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Student Console</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Academic & CGPA Radar removed per user request) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
            { id: 'attendance', label: 'Attendance & Buffer Margins', icon: Calendar },
            { id: 'aiStudyPlan', label: 'AI Study & Recovery Plan', icon: BrainCircuit, badge: 'AI' },
            { id: 'aiCounselor', label: 'AI Counselor & Mentor', icon: Sparkles, badge: '24/7' },
            { id: 'skills', label: 'Career & Skill Pathways', icon: Target },
            { id: 'portfolio', label: 'Digital Portfolio & Resume', icon: Briefcase },
            { id: 'gamification', label: 'Gamification & Quests', icon: Trophy, count: `${currentXp} XP` },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout (Anchored cleanly at the bottom) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
                {user?.firstName?.[0] || 'S'}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">{profile?.collegeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>{currentStreak}d</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-slate-800 hover:border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Scrollable Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight capitalize">
                {activeTab === 'aiStudyPlan' ? 'AI Study Schedule & Recovery Timetable' :
                 activeTab === 'attendance' ? 'Attendance Radar & Buffer Margins' :
                 activeTab === 'aiCounselor' ? 'AI Academic Counselor & Mentor' :
                 activeTab === 'skills' ? 'Career & Technical Skill Pathways' :
                 activeTab === 'portfolio' ? 'Digital Portfolio & Resume Builder' :
                 activeTab === 'gamification' ? 'Gamification & Daily Challenges' :
                 'Academic Performance Dashboard'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Semester {profile?.semester || 5} &bull; {profile?.department || 'Computer Science & Engineering'}
              </p>
            </div>
          </div>

          {/* Action Header Icons */}
          <div className="flex items-center gap-3">
            
            {/* Quick Transcript Modal Trigger */}
            <button
              onClick={() => setShowTranscriptModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Marksheet</span>
            </button>

            {/* Quick Digital Resume Modal Trigger */}
            <button
              onClick={() => setShowResumeModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Digital Resume</span>
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white relative border border-slate-700 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel-glow rounded-2xl shadow-2xl z-50 p-4 border border-slate-700 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Notifications</h4>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-[10px] text-cyan-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No active notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id}
                          onClick={() => handleReadNotif(n._id)}
                          className={`py-2.5 px-1 cursor-pointer transition flex items-start gap-2.5 ${n.isRead ? 'opacity-60' : 'opacity-100'}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'warning' ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()} &bull; {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gamification Level Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="text-left leading-none">
                <span className="text-[11px] font-bold text-white block">Lvl {currentLevel}</span>
                <span className="text-[9px] text-slate-400">{currentXp} XP</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Academic Risk Alert Banner */}
          {remediation?.riskLevel === 'high' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-300">
                    Academic Risk Alert: High Risk Intervention Required
                  </h3>
                  <p className="text-xs text-rose-400/80 mt-0.5">
                    {remediation.reasons?.join('; ') || 'Attendance or internal evaluation scores below required minimum threshold.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('aiStudyPlan')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition"
              >
                View AI Recovery Plan &rarr;
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* CGPA Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Cumulative CGPA</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{profile?.cgpa?.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">/ 10.0 scale</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      (profile?.cgpa || 0) >= 8 ? 'bg-emerald-500/20 text-emerald-300' :
                      (profile?.cgpa || 0) >= 6.5 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {(profile?.cgpa || 0) >= 8 ? 'First Class Distinction' :
                       (profile?.cgpa || 0) >= 6.5 ? 'Average Performance' : 'Academic Remediation Required'}
                    </span>
                  </div>
                </div>

                {/* Overall Attendance Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Overall Attendance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{overallAttendancePct.toFixed(1)}%</span>
                    <span className="text-xs text-slate-400">({attendedClasses}/{totalClasses} lectures)</span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          overallAttendancePct >= 75 ? 'bg-cyan-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, overallAttendancePct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Risk Index Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Academic Risk Index</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      {remediation?.riskScore?.toFixed(0) || 0}
                    </span>
                    <span className="text-xs text-slate-400">/ 100 Index</span>
                  </div>
                  <div className="mt-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      remediation?.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300' :
                      remediation?.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {remediation?.riskLevel || 'Low'} Risk Status
                    </span>
                  </div>
                </div>

                {/* Gamification Level Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Level & Daily Streak</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-400">Lvl {currentLevel}</span>
                    <span className="text-xs text-slate-300 font-bold">🔥 {currentStreak}d Streak</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 truncate">
                    {levelTitle} ({xpInCurrentLevel}/500 XP to Level {currentLevel + 1})
                  </p>
                </div>

              </div>

              {/* Two Column Layout: SGPA Progression Chart & Remedial Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SGPA Progression Chart */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Academic Performance Journey</h3>
                      <p className="text-xs text-slate-400">Semester-by-semester SGPA progression</p>
                    </div>
                    <button
                      onClick={() => setShowTranscriptModal(true)}
                      className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      View Marksheet &rarr;
                    </button>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profile?.sgpaHistory?.map(s => ({ sem: `Sem ${s.semester}`, sgpa: s.sgpa })) || []}>
                        <defs>
                          <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="sem" stroke="#64748b" textAnchor="end" fontSize={11} />
                        <YAxis stroke="#64748b" domain={[0, 10]} fontSize={11} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Area type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#sgpaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Remedial Action Tasks */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-base font-bold text-white">Remedial Action Tasks</h3>
                      </div>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        +100 XP Each
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Assigned to resolve academic risk flags:
                    </p>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {(!remediation?.assignedActions || remediation.assignedActions.length === 0) ? (
                        <p className="text-xs text-slate-500 py-6 text-center">No outstanding remedial tasks assigned. All clear!</p>
                      ) : (
                        remediation.assignedActions.map(action => (
                          <div
                            key={action._id}
                            onClick={() => handleToggleTask(action._id, action.status)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                              action.status === 'completed'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              action.status === 'completed' ? 'bg-emerald-500 text-white' : 'border border-slate-600'
                            }`}>
                              {action.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium leading-snug ${action.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                {action.task}
                              </p>
                              <span className="text-[10px] text-slate-500 block mt-1 capitalize">
                                Status: {action.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('aiStudyPlan')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open 7-Day Recovery Timetable</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Course Attendance Radar Grid */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Course Attendance Buffer & Margins</h3>
                    <p className="text-xs text-slate-400">Strict 75% examination eligibility threshold</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Detailed History &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {attendanceBreakdown.slice(0, 6).map(item => (
                    <div 
                      key={item.courseCode}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-white">{item.courseCode}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mb-2">{item.courseName}</p>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span>Attended {item.present}/{item.total}</span>
                        <span className="font-semibold text-cyan-300">{item.safeMarginText}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ATTENDANCE & BUFFER MARGIN ANALYSIS */}
          {/* ========================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              
              {/* Overall Attendance Summary Banner */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Institutional Attendance Radar
                  </span>
                  <h3 className="text-2xl font-extrabold text-white">
                    Overall: {overallAttendancePct.toFixed(1)}% Attended
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Total lectures conducted: <strong>{totalClasses}</strong> &bull; Present: <strong>{attendedClasses}</strong> &bull; Absent: <strong>{totalClasses - attendedClasses}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Minimum Cutoff</span>
                    <span className="text-xl font-bold text-indigo-400">75%</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-semibold">Eligibility Status</span>
                    <span className={`text-xl font-bold ${overallAttendancePct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {overallAttendancePct >= 75 ? 'Eligible' : 'Detention Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course-by-Course Attendance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendanceBreakdown.map(item => (
                  <div 
                    key={item.courseCode}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-extrabold text-white">{item.courseCode}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${item.statusColor}`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-3">{item.courseName}</h4>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full rounded-full ${parseFloat(item.percentage) >= 75 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, parseFloat(item.percentage))}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 text-center gap-2 py-2 bg-slate-900/60 rounded-xl text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total</span>
                          <span className="font-bold text-white">{item.total}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400 block">Present</span>
                          <span className="font-bold text-white">{item.present}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-400 block">Absent</span>
                          <span className="font-bold text-white">{item.total - item.present}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-cyan-300 flex items-center justify-between">
                      <span>Advisory Margin:</span>
                      <span>{item.safeMarginText}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: AI STUDY & RECOVERY PLAN */}
          {/* ========================================================= */}
          {activeTab === 'aiStudyPlan' && (
            <div className="space-y-6">
              
              {/* AI Study Plan Banner */}
              <div className="glass-panel-glow p-6 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <BrainCircuit className="w-4 h-4 animate-pulse" />
                    <span>Personalized Recovery Schedule Engine</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">
                    7-Day Structured Academic Recovery Timetable
                  </h3>
                  <div className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    <MarkdownRenderer content={profile?.aiStudyPlan?.summary || remediation?.mentorRemarks || 'AI continuously evaluates assessment grades and attendance logs to prescribe daily micro-milestones.'} />
                  </div>
                </div>
                <button
                  onClick={handleGenerateAiPlan}
                  disabled={generatingPlan}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${generatingPlan ? 'animate-spin' : ''}`} />
                  <span>{generatingPlan ? 'Evaluating Telemetry...' : 'Regenerate Study Plan'}</span>
                </button>
              </div>

              {/* 7-Day Timetable Grid */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Learning Schedule</h3>
                    <p className="text-xs text-slate-400">Complete each daily milestone to earn +40 XP toward your next level</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-bold">
                    Semester {profile?.semester || 5}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(profile?.aiStudyPlan?.weeklySchedule?.length > 0 ? profile.aiStudyPlan.weeklySchedule : [
                    { day: "Monday", focusSubject: "Compiler Design", targetTopic: "Syntax Trees & LL(1) Parsing Mechanics", durationMinutes: 90, isCompleted: false },
                    { day: "Tuesday", focusSubject: "Compiler Design", targetTopic: "LR Parsing Tables & Shift-Reduce Operations", durationMinutes: 75, isCompleted: false },
                    { day: "Wednesday", focusSubject: "Operating Systems", targetTopic: "Deadlock Detection Algorithms & Semaphores", durationMinutes: 90, isCompleted: false },
                    { day: "Thursday", focusSubject: "Analysis of Algorithms", targetTopic: "Dynamic Programming Memoization Strategies", durationMinutes: 60, isCompleted: false },
                    { day: "Friday", focusSubject: "Compiler Design Lab", targetTopic: "LEX / YACC Specification Practice Programs", durationMinutes: 90, isCompleted: false },
                    { day: "Saturday", focusSubject: "Comprehensive Revision", targetTopic: "Previous 3-Year Midterm Exam Solutions", durationMinutes: 120, isCompleted: false },
                    { day: "Sunday", focusSubject: "Progress Assessment", targetTopic: "Diagnostic Mock Quiz & Faculty Doubt Clearance", durationMinutes: 60, isCompleted: false }
                  ]).map((item, idx) => (
                    <div 
                      key={item.day}
                      onClick={() => handleToggleStudyDay(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        item.isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                          : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">{item.day}</span>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            item.isCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-600'
                          }`}>
                            {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <h4 className={`text-sm font-bold text-white mb-1 ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {item.focusSubject}
                        </h4>
                        <p className="text-xs text-slate-400 leading-snug">
                          {item.targetTopic}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.durationMinutes} mins
                        </span>
                        <span className={`font-bold ${item.isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.isCompleted ? 'Completed (+40 XP)' : 'Tap to Mark Done'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: AI COUNSELOR & 24/7 MENTOR */}
          {/* ========================================================= */}
          {activeTab === 'aiCounselor' && (
            <div className="space-y-6">
              
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col h-[650px]">
                {/* Counselor Header */}
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">EduVision AI Academic Counselor</h3>
                      <p className="text-xs text-cyan-400">Context-Aware Advisory &bull; 24/7 Academic Support</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                    AI Online & Connected
                  </span>
                </div>

                {/* Suggested Prompt Chips */}
                <div className="py-3 flex flex-wrap gap-2 border-b border-slate-800/60">
                  {[
                    "How can I improve my performance in Compiler Design?",
                    "What is my strategy to restore attendance above 75%?",
                    "Recommend an academic recovery plan to reach 7.5 CGPA",
                    "What portfolio projects align with Software Engineer roles?"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendCounselorMessage(chip)}
                      className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Scroll Area */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                  {counselorChat.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-line text-white">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                      <span>EduVision AI is analyzing your academic telemetry...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                  <input
                    type="text"
                    value={counselorInput}
                    onChange={(e) => setCounselorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCounselorMessage()}
                    placeholder="Ask counselor about academic recovery, course preparation, or career pathways..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleSendCounselorMessage()}
                    disabled={chatLoading}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CAREER & SKILL PATHWAYS */}
          {/* ========================================================= */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="max-w-2xl mb-6">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Industry Skill Gap Analysis
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    Target Career Pathways & Competency Benchmarking
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your target profession to benchmark current competencies against current industry hiring requirements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mb-6">
                  {[
                    'Software Engineer',
                    'Full Stack Web Developer',
                    'AI / Machine Learning Engineer',
                    'Cloud & DevOps Engineer',
                    'Data Scientist',
                    'Cybersecurity Analyst'
                  ].map(role => (
                    <button
                      key={role}
                      onClick={() => { setTargetRole(role); handleAnalyzeSkillGap(role); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        targetRole === role
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleAnalyzeSkillGap()}
                  disabled={analyzingGap}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Target className="w-4 h-4" />
                  <span>{analyzingGap ? 'Analyzing Industry Standards...' : `Benchmark Skills for ${targetRole}`}</span>
                </button>
              </div>

              {gapAnalysis && (
                <div className="space-y-6">
                  
                  <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Benchmarked Readiness
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {gapAnalysis.roleMatchPercentage}% Readiness for {targetRole}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Profile currently matches {gapAnalysis.matchedSkills?.length || 0} core competencies, with {gapAnalysis.missingSkills?.length || 0} recommended competencies to acquire.
                      </p>
                    </div>

                    <div className="w-28 h-28 rounded-full border-4 border-cyan-500/40 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-black text-cyan-400">
                        {gapAnalysis.roleMatchPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verified Profile Competencies</span>
                      </h4>

                      <div className="space-y-2.5">
                        {(!gapAnalysis.matchedSkills || gapAnalysis.matchedSkills.length === 0) ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No matching technical skills cataloged yet.</p>
                        ) : (
                          gapAnalysis.matchedSkills.map((s, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{s.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                Level {s.level || 3}/5 Proficient
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Recommended Missing Competencies</span>
                      </h4>

                      <div className="space-y-2.5">
                        {(!gapAnalysis.missingSkills || gapAnalysis.missingSkills.length === 0) ? (
                          <p className="text-xs text-emerald-400 py-4 text-center">All primary technical baselines satisfied.</p>
                        ) : (
                          gapAnalysis.missingSkills.map((s, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-white block">{s.name}</span>
                                <span className="text-[10px] text-slate-400">{s.description || 'Essential tool for this role'}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                s.importance === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {s.importance}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: DIGITAL PORTFOLIO & RESUME BUILDER */}
          {/* ========================================================= */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Student Digital Portfolio & Resume</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage project repositories, verified technical skills, professional certifications, and internship experiences.
                  </p>
                </div>
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition shrink-0"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Preview Full Digital Resume</span>
                </button>
              </div>

              {/* Technical Skills */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Technical Competencies</h4>
                  <span className="text-xs text-slate-400">Total: {profile?.skills?.length || 0}</span>
                </div>

                <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill name (e.g. React.js, Python, Docker)"
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none w-full"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-400">Proficiency:</span>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(Number(e.target.value))}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    >
                      <option value={1}>1 - Beginner</option>
                      <option value={2}>2 - Elementary</option>
                      <option value={3}>3 - Intermediate</option>
                      <option value={4}>4 - Advanced</option>
                      <option value={5}>5 - Expert</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={addingSkill}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Skill (+15 XP)</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {profile?.skills?.map((s, idx) => (
                    <div 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-2 group"
                    >
                      <span>{s.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">({s.level}/5)</span>
                      <button 
                        onClick={() => handleDeleteSkill(s.name)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Project Portfolio</h4>
                  <span className="text-xs text-slate-400">Total: {profile?.portfolio?.projects?.length || 0}</span>
                </div>

                <form onSubmit={handleAddProject} className="space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newProjTitle}
                      onChange={(e) => setNewProjTitle(e.target.value)}
                      placeholder="Project Title (e.g. Distributed Consensus Engine)"
                      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                    />
                    <input
                      type="text"
                      value={newProjUrl}
                      onChange={(e) => setNewProjUrl(e.target.value)}
                      placeholder="Repository / Deployment URL (optional)"
                      className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Short description, architecture, and technology stack used..."
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingProj}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Project (+50 XP)</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.portfolio?.projects?.map(p => (
                    <div key={p._id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-xs font-bold text-white">{p.title}</h5>
                          <button 
                            onClick={() => handleDeleteProject(p._id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                      </div>
                      {p.url && (
                        <a 
                          href={p.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>{p.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications & Internships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Certifications */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Professional Certifications</h4>
                  
                  <form onSubmit={handleAddCertification} className="space-y-2 mb-4">
                    <input
                      type="text"
                      value={newCertTitle}
                      onChange={(e) => setNewCertTitle(e.target.value)}
                      placeholder="Certificate Title (e.g. AWS Certified Cloud Practitioner)"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCertIssuer}
                        onChange={(e) => setNewCertIssuer(e.target.value)}
                        placeholder="Issuing Organization (e.g. Amazon Web Services, Meta)"
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={addingCert}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                      >
                        Add (+75 XP)
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    {profile?.portfolio?.certifications?.map(c => (
                      <div key={c._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{c.title}</span>
                          <span className="text-[10px] text-slate-400">{c.issuer}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteCertification(c._id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internships */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Industry Experience & Internships</h4>
                  
                  <form onSubmit={handleAddInternship} className="space-y-2 mb-4">
                    <input
                      type="text"
                      value={newInternCompany}
                      onChange={(e) => setNewInternCompany(e.target.value)}
                      placeholder="Company Name (e.g. InnovateTech Solutions)"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newInternRole}
                        onChange={(e) => setNewInternRole(e.target.value)}
                        placeholder="Role (e.g. Junior Web Engineering Intern)"
                        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                      />
                      <input
                        type="text"
                        value={newInternDuration}
                        onChange={(e) => setNewInternDuration(e.target.value)}
                        placeholder="Duration (e.g. 2 Months, Summer 2025)"
                        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingIntern}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                    >
                      Record Internship (+100 XP)
                    </button>
                  </form>

                  <div className="space-y-2">
                    {profile?.portfolio?.internships?.map(i => (
                      <div key={i._id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{i.role} at {i.company}</span>
                          <span className="text-[10px] text-slate-400">{i.duration}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteInternship(i._id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: GAMIFICATION & LEADERBOARD */}
          {/* ========================================================= */}
          {activeTab === 'gamification' && (
            <div className="space-y-6">
              
              <div className="glass-panel-glow p-6 rounded-3xl border border-amber-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Academic Motivation & Gamification Progress
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Level {currentLevel}: {levelTitle}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Earn XP by maintaining consistent attendance, resolving remedial tasks, and completing daily learning milestones.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-amber-400">{currentXp}</span>
                    <span className="text-xs text-slate-400 block font-mono">Total Academic XP</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgressPct}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{xpInCurrentLevel} XP in Level {currentLevel}</span>
                  <span>{500 - xpInCurrentLevel} XP to Level {currentLevel + 1}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Badges Showcase */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Unlocked Badges & Distinctions</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Newcomer', desc: 'Verified student onboarding', unlocked: true },
                      { name: 'Rising Star', desc: 'Achieved 500+ academic XP points', unlocked: currentXp >= 500 },
                      { name: 'Scholar Badge', desc: 'Achieved 1000+ academic XP points', unlocked: currentXp >= 1000 },
                      { name: 'Attendance Titan', desc: 'Maintained 85%+ overall attendance', unlocked: overallAttendancePct >= 85 },
                      { name: 'Project Builder', desc: 'Cataloged at least 1 real-world project', unlocked: (profile?.portfolio?.projects?.length || 0) > 0 },
                      { name: 'Remediation Champion', desc: 'Successfully resolved assigned recovery task', unlocked: (remediation?.assignedActions?.filter(a => a.status === 'completed').length || 0) > 0 }
                    ].map(badge => (
                      <div 
                        key={badge.name}
                        className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                          badge.unlocked 
                            ? 'bg-amber-500/10 border-amber-500/30 text-white' 
                            : 'bg-slate-900/40 border-slate-800 opacity-40 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Trophy className={`w-5 h-5 ${badge.unlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                          <span className="text-[10px] font-bold">
                            {badge.unlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold">{badge.name}</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-cyan-400" />
                      <span>Department Academic Leaderboard</span>
                    </h4>
                    <span className="text-xs text-slate-400">Rankings</span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {leaderboard.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">Loading leaderboard rankings...</p>
                    ) : (
                      leaderboard.map(s => {
                        const isSelf = s.studentId === user._id || s.name?.includes(user?.firstName);
                        return (
                          <div 
                            key={s.rank}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              isSelf 
                                ? 'bg-indigo-600/20 border-indigo-500/50 text-white ring-1 ring-indigo-500' 
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-[11px] ${
                                s.rank === 1 ? 'bg-amber-500 text-slate-950 font-black' :
                                s.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                                s.rank === 3 ? 'bg-amber-700 text-white font-black' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {s.rank}
                              </span>
                              <div>
                                <span className="font-bold block">
                                  {s.name} {isSelf && '(You)'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{s.collegeId} &bull; Level {s.level}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-amber-400 block">{s.xp} XP</span>
                              <span className="text-[10px] text-slate-400">CGPA: {s.cgpa?.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* Floating 24/7 AI Chatbot Widget */}
      <AiChatbot studentId={user._id || user.id} placeholderText="Ask counselor about academic recovery, course preparation, or career pathways..." />

      {/* ========================================================= */}
      {/* MODAL 1: OFFICIAL DIGITAL MARKSHEET / TRANSCRIPT */}
      {/* ========================================================= */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto printable-area text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-extrabold text-white">Official Academic Transcript</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Gradecard</span>
                </button>
                <button
                  onClick={() => setShowTranscriptModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-wider text-white">EduVision Institute of Engineering & Technology</h2>
              <p className="text-xs text-slate-400">Affiliated to State Technical University &bull; Academic Session 2025-2026</p>
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-2 underline">
                Semester Evaluation Gradecard
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-850/80 border border-slate-800 text-xs mb-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Student Name</span>
                <span className="font-bold text-white">{user?.firstName} {user?.lastName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">College ID</span>
                <span className="font-bold text-white font-mono">{profile?.collegeId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Department</span>
                <span className="font-bold text-white">{profile?.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Cumulative CGPA</span>
                <span className="font-bold text-amber-400">{profile?.cgpa?.toFixed(2)} / 10.0</span>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-6">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3">Marks Obtained</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {marks.map(m => {
                  const att = attendance.find(a => a.courseCode === m.courseCode);
                  const attPresent = att ? att.records.filter(r => r.status === 'present').length : 0;
                  const attTotal = att ? att.records.length : 0;
                  const attPct = attTotal > 0 ? ((attPresent / attTotal) * 100).toFixed(1) : '100.0';

                  const i1 = m.evaluations.find(e => e.type === 'internal_1')?.obtained || 0;
                  const i2 = m.evaluations.find(e => e.type === 'internal_2')?.obtained || 0;
                  const prac = m.evaluations.find(e => e.type === 'practical')?.obtained || 0;
                  const total = i1 + i2 + prac;
                  const maxTotal = 70;
                  const pct = (total / maxTotal) * 100;

                  return (
                    <tr key={m.courseCode}>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">{m.courseCode}</td>
                      <td className="py-2.5 px-3">{m.courseName}</td>
                      <td className="py-2.5 px-3 font-mono">{total} / {maxTotal}</td>
                      <td className="py-2.5 px-3 font-mono">{attPct}%</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={pct >= 50 ? 'text-emerald-400' : 'text-rose-400'}>
                          {pct >= 50 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-8 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 mt-6">
              <div>
                <p className="font-semibold">Mentor Faculty: {profile?.mentorId ? `Dr. ${profile.mentorId.firstName} ${profile.mentorId.lastName}` : 'Dr. Amit Sharma'}</p>
                <span className="text-[10px] text-slate-500">Verified digitally on {new Date().toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">Controller of Examinations</p>
                <span className="text-[10px] text-slate-500">EduVision Academic Registry</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DIGITAL RESUME PREVIEW */}
      {/* ========================================================= */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto printable-area text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 no-print">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-extrabold text-white">Student Digital Resume & Portfolio</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Resume</span>
                </button>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-800 pb-6 mb-6">
              <h2 className="text-2xl font-black text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                Aspiring {targetRole} &bull; {profile?.department}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2 font-mono">
                <span>Email: {user?.email}</span>
                <span>College ID: {profile?.collegeId}</span>
                <span>CGPA: {profile?.cgpa?.toFixed(2)} / 10.0</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Technical Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-white border border-slate-700">
                    {s.name} (Lvl {s.level}/5)
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Key Project Repositories</h4>
              <div className="space-y-3">
                {profile?.portfolio?.projects?.map(p => (
                  <div key={p._id} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-bold text-white">{p.title}</h5>
                      {p.url && <a href={p.url} className="text-[11px] text-cyan-400 font-mono hover:underline">{p.url}</a>}
                    </div>
                    <p className="text-xs text-slate-400">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Professional Certifications</h4>
                <div className="space-y-2">
                  {profile?.portfolio?.certifications?.map(c => (
                    <div key={c._id} className="p-2.5 rounded-xl bg-slate-850 text-xs">
                      <span className="font-bold text-white block">{c.title}</span>
                      <span className="text-[10px] text-slate-400">{c.issuer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Professional Experience</h4>
                <div className="space-y-2">
                  {profile?.portfolio?.internships?.map(i => (
                    <div key={i._id} className="p-2.5 rounded-xl bg-slate-850 text-xs">
                      <span className="font-bold text-white block">{i.role} at {i.company}</span>
                      <span className="text-[10px] text-slate-400">{i.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
