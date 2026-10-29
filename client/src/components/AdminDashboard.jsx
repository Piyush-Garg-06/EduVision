import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Users, BookOpen, AlertTriangle, Calendar, Award, 
  BarChart3, RefreshCw, LogOut, ShieldAlert, LineChart, Cpu, Sparkles, Menu, X,
  GraduationCap, Search, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: overview, riskBoard, courseAnalytics, studentsDirectory
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/analytics/admin');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading Institutional Analytics...</p>
        </div>
      </div>
    );
  }

  const deptChartData = data?.departmentBreakdown?.map(d => ({
    name: d.department.split(' ')[0],
    CGPA: parseFloat(d.averageCgpa),
    Students: d.studentCount
  })) || [];

  const subjectChartData = data?.subjectPerformance?.map(s => ({
    name: s.courseCode,
    FailureRate: parseFloat(s.failureRate || 0),
    AverageGrade: parseFloat(s.averageGrade || 0)
  })) || [];

  const highRiskStudents = data?.highRiskStudents || data?.highRiskList || [];

  return (
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20">
              E
            </div>
            <div>
              <h2 className="font-extrabold text-white tracking-tight leading-none text-base">EduVision</h2>
              <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Institutional Intelligence', icon: BarChart3 },
            { id: 'riskBoard', label: 'High-Risk Early Warnings', icon: ShieldAlert, count: `${highRiskStudents.length}` },
            { id: 'courseAnalytics', label: 'Subject Failure Analytics', icon: BookOpen },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400">Institutional Dean Office</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden">
        
        {/* Header Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight capitalize">
                {activeTab === 'riskBoard' ? 'Early Risk Detection Board' :
                 activeTab === 'courseAnalytics' ? 'Course Difficulty & Failure Rates' :
                 'College-Wide Performance Command Center'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Academic Risk Mitigation & Analytics Engine
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Enrolled Students</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{data?.totalStudents || 0}</span>
                <span className="text-xs text-slate-400">across all branches</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Average College CGPA</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-cyan-400">{data?.averageCgpa || '0.0'}</span>
                <span className="text-xs text-slate-400">/ 10.0 scale</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Students at High Risk</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{data?.highRiskCount || 0}</span>
                <span className="text-xs text-rose-400/80">urgent alerts</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Institutional Attendance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {data?.averageAttendance !== undefined ? Number(data.averageAttendance).toFixed(1) : (data?.avgAttendance || '0.0')}%
                </span>
                <span className="text-xs text-slate-400">overall</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & DEPARTMENT COMPARISON */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Department Performance Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1">Department Academic Standing</h3>
                <p className="text-xs text-slate-400 mb-6">Average CGPA recorded across engineering disciplines</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" domain={[0, 10]} fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      />
                      <Bar dataKey="CGPA" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* High Risk Quick Summary */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Critical Students Early Warning Radar</h3>
                    <p className="text-xs text-slate-400">Flagged by automated telemetry analysis</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('riskBoard')}
                    className="text-xs font-semibold text-purple-400 hover:underline"
                  >
                    View All {highRiskStudents.length} Students &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highRiskStudents.slice(0, 4).map(s => (
                    <div key={s.studentId} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{s.name} ({s.collegeId})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                          Score: {s.riskScore?.toFixed(0)}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mb-2">CGPA: {s.cgpa?.toFixed(2)}</p>
                      <ul className="text-[11px] text-rose-300/90 list-disc pl-4 space-y-0.5">
                        {s.reasons?.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HIGH-RISK EARLY WARNINGS BOARD */}
          {/* ========================================================= */}
          {activeTab === 'riskBoard' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div>
                <h3 className="text-xl font-extrabold text-white">High-Risk Student Action Board</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Students identified as vulnerable to detention or academic failure based on multi-factor telemetry.
                </p>
              </div>

              <div className="space-y-4">
                {highRiskStudents.map(s => (
                  <div key={s.studentId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-white text-sm">{s.name}</h4>
                        <span className="text-xs text-slate-400 font-mono">{s.collegeId}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                          Risk Score: {s.riskScore?.toFixed(0)}/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Recorded CGPA: <strong>{s.cgpa?.toFixed(2)}</strong></p>
                      
                      <div className="space-y-1">
                        {s.reasons?.map((r, i) => (
                          <div key={i} className="text-xs text-rose-400/90 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs text-slate-400 block mb-1">Automated Action:</span>
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                        Remedial Plan Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: COURSE ANALYTICS & FAILURE RATES */}
          {/* ========================================================= */}
          {activeTab === 'courseAnalytics' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div>
                <h3 className="text-xl font-extrabold text-white">Course Difficulty & Failure Rate Analysis</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identifies subjects with low student pass rates to allocate faculty support and tutorial sessions.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="FailureRate" fill="#ef4444" radius={[8, 8, 0, 0]} name="Failure Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subjectChartData.map(s => (
                  <div key={s.name} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-white text-xs block mb-1">{s.name}</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Failure Rate:</span>
                      <span className="font-mono font-bold text-rose-400">{s.FailureRate}%</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
