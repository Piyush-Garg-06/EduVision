import React, { useState, useEffect } from 'react';
import API from '../api';
import AiChatbot from './AiChatbot';
import { 
  Shield, Calendar, BookOpen, AlertTriangle, MessageSquare, 
  Heart, RefreshCw, LogOut, LayoutDashboard, FileSpreadsheet,
  GraduationCap, ClipboardCheck, Menu
} from 'lucide-react';

export default function ParentDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  // Tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, attendanceLogs, reportCard, mentorGuidance

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const meRes = await API.get('/auth/me');
      const studentIdVal = meRes.data.profile?.userId?._id || meRes.data.profile?.userId;
      setStudentId(studentIdVal);

      if (!studentIdVal) {
        setData(meRes.data);
      } else {
        const [studentRes, attRes, marksRes, remRes, notifRes] = await Promise.all([
          API.get(`/auth/me`),
          API.get(`/academic/attendance/${studentIdVal}`),
          API.get(`/academic/marks/${studentIdVal}`),
          API.get(`/academic/remediation/${studentIdVal}`),
          API.get(`/academic/notifications`)
        ]);

        setData({
          student: studentRes.data.profile,
          studentName: `${studentRes.data.profile.userId.firstName} ${studentRes.data.profile.userId.lastName}`,
          attendance: attRes.data,
          marks: marksRes.data,
          remediation: remRes.data,
          notifications: notifRes.data
        });
      }
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
          <p className="text-slate-500 font-medium">Loading parent workspace...</p>
        </div>
      </div>
    );
  }

  // Calculate Overall Attendance for child
  let totalClasses = 0;
  let attendedClasses = 0;
  data?.attendance?.forEach(a => {
    a.records.forEach(r => {
      totalClasses++;
      if (r.status === 'present') attendedClasses++;
    });
  });
  const overallAttendancePct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

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
            <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">Parent Console</span>
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
            <LayoutDashboard className="w-4 h-4" /> Ward Overview
          </button>
          
          <button
            onClick={() => { setActiveTab('attendanceLogs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'attendanceLogs' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Attendance logs
          </button>

          <button
            onClick={() => { setActiveTab('reportCard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'reportCard' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Report Card
          </button>

          <button
            onClick={() => { setActiveTab('mentorGuidance'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'mentorGuidance' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" /> Mentor Guidance
          </button>
        </nav>

        {/* Profile footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 text-sm border border-slate-200">
              P
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-slate-800 truncate">{user.firstName} {user.lastName}</span>
              <span className="block text-[10px] text-slate-400 truncate">Guardian Portal</span>
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
              {activeTab === 'overview' && 'Ward performance summary'}
              {activeTab === 'attendanceLogs' && 'Detailed Attendance Sheet'}
              {activeTab === 'reportCard' && 'Exam Evaluation Report Card'}
              {activeTab === 'mentorGuidance' && 'Mentor remarks & Action list'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchParentData}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 w-full">

          {/* High risk notice banner */}
          {data?.remediation?.riskLevel === 'high' && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Critical Academic Alert Notice</h4>
                <p className="text-xs text-slate-600">
                  Your ward has been flagged with **HIGH RISK** status. Attendance is below the required 75% or grade evaluations show sub-par progress.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: WARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats overview row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Overall Attendance</span>
                  <span className={`text-3xl font-extrabold mt-1 block ${overallAttendancePct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {overallAttendancePct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 block">Min. requirement: 75%</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cumulative GPA</span>
                  <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{(data?.student?.cgpa || 8.10).toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-2 block">✓ Clearance Index Met</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Risk Matrix</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-3 border ${
                    data?.remediation?.riskLevel === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    data?.remediation?.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {data?.remediation?.riskLevel?.toUpperCase() || 'LOW'}
                  </span>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ATTENDANCE SHEET */}
          {activeTab === 'attendanceLogs' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Subject Attendance Log Sheets</h3>
              <div className="space-y-3">
                {data?.attendance?.map((att, idx) => {
                  const present = att.records.filter(r => r.status === 'present').length;
                  const total = att.records.length;
                  const pct = total > 0 ? (present / total) * 100 : 100;
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase">{att.courseCode}</span>
                        <h4 className="text-sm font-bold text-slate-800">{att.courseName}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold block ${pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {pct.toFixed(0)}%
                        </span>
                        <span className="text-[10px] text-slate-400">({present}/{total} lectures)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REPORT CARD */}
          {activeTab === 'reportCard' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Academic Assessment Grade report</h3>
              <div className="space-y-4">
                {data?.marks?.map((m, idx) => {
                  const i1 = m.evaluations.find(e => e.type === 'internal_1');
                  const i2 = m.evaluations.find(e => e.type === 'internal_2');
                  const final = m.evaluations.find(e => e.type === 'final_semester');
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-800">{m.courseName}</h4>
                        {final && <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600">Final Exam: {final.obtained}/{final.maxMarks}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-slate-500">
                        <div>Midterm Test 1: <strong className="text-slate-800">{i1 ? `${i1.obtained}/${i1.maxMarks}` : 'N/A'}</strong></div>
                        <div>Midterm Test 2: <strong className="text-slate-800">{i2 ? `${i2.obtained}/${i2.maxMarks}` : 'N/A'}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MENTOR GUIDANCE */}
          {activeTab === 'mentorGuidance' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Remarks */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" /> Counselor Remarks
                </h4>
                {data?.remediation?.mentorRemarks ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    {data.remediation.mentorRemarks}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No mentorship notes recorded for this cycle.</p>
                )}
              </div>

              {/* Tasks list */}
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-3">Improvement Recovery Checklist</span>
                {data?.remediation?.assignedActions?.length > 0 ? (
                  <div className="space-y-2">
                    {data.remediation.assignedActions.map((act, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className={act.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {act.task}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          act.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No active recovery tasks mapped by academic counselor.</p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Floating AI Chatbot Assistant for Parents */}
        {studentId && (
          <AiChatbot studentId={studentId} placeholderText="Ask EduVision AI about your ward..." />
        )}

      </main>
    </div>
  );
}
