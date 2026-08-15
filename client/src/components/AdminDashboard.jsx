import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Users, BookOpen, AlertTriangle, Calendar, Award, 
  BarChart3, RefreshCw, LogOut, ShieldAlert, LineChart, Cpu, Sparkles, Menu
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, riskBoard, courseAnalytics, skillsCatalog

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading admin workspace...</p>
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
    FailureRate: parseFloat(s.failureRate),
    AverageGrade: parseFloat(s.averageGrade)
  })) || [];

  const skillChartData = data?.skillDistribution?.map(s => ({
    name: s.name,
    Count: s.count
  })) || [];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 z-45 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:h-screen shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-200">
            E
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 tracking-tight leading-none text-base">EduVision</h2>
            <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">Admin Portal</span>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'overview' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Global Overview
          </button>
          
          <button
            onClick={() => { setActiveTab('riskBoard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'riskBoard' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Risk Board
          </button>

          <button
            onClick={() => { setActiveTab('courseAnalytics'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'courseAnalytics' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Subject Analytics
          </button>

          <button
            onClick={() => { setActiveTab('skillsCatalog'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'skillsCatalog' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" /> Skills Catalog
          </button>
        </nav>

        {/* Profile footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 text-sm border border-slate-200">
              AD
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-slate-800 truncate">Administrator</span>
              <span className="block text-[10px] text-slate-400 truncate">Dean's Office</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-semibold transition border border-slate-200/50"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen w-full">
        
        {/* Top Header Section */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-lg font-bold text-slate-800 uppercase tracking-tight">
              {activeTab === 'overview' && 'College performance overview'}
              {activeTab === 'riskBoard' && 'High Academic Risk Board'}
              {activeTab === 'courseAnalytics' && 'Subject failure rate analytics'}
              {activeTab === 'skillsCatalog' && 'Skills catalog distribution'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAdminData}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 w-full">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Students</span>
                    <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{data?.totalStudents || 0}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg CGPA</span>
                    <span className="text-3xl font-extrabold text-cyan-600 mt-1 block">{data?.avgCGPA || "0.00"}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-50 text-cyan-600">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Attendance</span>
                    <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{data?.avgAttendance || 0.0}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between border-rose-100 bg-rose-50/10">
                  <div>
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">High Risk Cases</span>
                    <span className="text-3xl font-extrabold text-rose-600 mt-1 block">{data?.highRiskCount || 0}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Department comparative graph */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" /> Department Average CGPA Comparison
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                      <Bar dataKey="CGPA" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RISK BOARD */}
          {activeTab === 'riskBoard' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-rose-50/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider">High Risk Active Cases</h3>
                  <p className="text-xs text-slate-500">Students with risk threshold score &gt; 65%</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {data?.highRiskList?.length || 0} active flags
                </span>
              </div>

              <div className="p-6">
                {data?.highRiskList?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-3 font-semibold">Student Name</th>
                          <th className="pb-3 font-semibold">College ID</th>
                          <th className="pb-3 font-semibold">CGPA</th>
                          <th className="pb-3 font-semibold">Risk Index</th>
                          <th className="pb-3 font-semibold">Alert Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.highRiskList.map((hr, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 font-bold text-slate-800">{hr.name}</td>
                            <td className="py-3.5 text-slate-500">{hr.collegeId}</td>
                            <td className="py-3.5 text-slate-600">{hr.cgpa.toFixed(2)}</td>
                            <td className="py-3.5 font-bold text-rose-600">{hr.riskScore.toFixed(0)}%</td>
                            <td className="py-3.5 text-slate-500 max-w-xs truncate" title={hr.reasons.join(', ')}>
                              {hr.reasons.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No high risk active student profiles detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COURSE PERFORMANCE ANALYTICS */}
          {activeTab === 'courseAnalytics' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subject Performance & Failure Rate</h3>
                <p className="text-xs text-slate-500">Evaluates failure rate ratios per course code.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                    <Bar dataKey="FailureRate" name="Failure Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS DISTRIBUTION CATALOG */}
          {activeTab === 'skillsCatalog' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Skill Index Distribution</h3>
                <p className="text-xs text-slate-500">Distribution count of verified skills cataloged across students.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                    <Bar dataKey="Count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
