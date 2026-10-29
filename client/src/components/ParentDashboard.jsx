import React, { useState, useEffect } from 'react';
import API from '../api';
import AiChatbot from './AiChatbot';
import { 
  Shield, Calendar, BookOpen, AlertTriangle, MessageSquare, 
  Heart, RefreshCw, LogOut, LayoutDashboard, FileSpreadsheet,
  GraduationCap, ClipboardCheck, Menu, X, Printer, Send, 
  CheckCircle2, Bell, Clock, ExternalLink, HelpCircle, PhoneCall,
  Mail, Phone, MapPin, Sparkles, AlertCircle, Check, ArrowRight,
  Filter, Search, User, CornerDownRight, CheckCircle
} from 'lucide-react';

export default function ParentDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  // Tabs: overview, attendanceLogs, reportCard, mentorGuidance
  const [activeTab, setActiveTab] = useState('overview');

  // Inquiry Form State
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('attendance');
  const [inquiryUrgency, setInquiryUrgency] = useState('normal');
  const [meetingRequested, setMeetingRequested] = useState(false);
  const [preferredTime, setPreferredTime] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryFeedback, setInquiryFeedback] = useState(null);
  const [inquiryFilter, setInquiryFilter] = useState('all');

  // Printable Report Card Modal
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const meRes = await API.get('/auth/me');
      const studentIdVal = meRes.data.profile?.userId?._id || meRes.data.profile?.userId;
      setStudentId(studentIdVal);

      if (studentIdVal) {
        const [studentRes, attRes, marksRes, remRes, notifRes, inqRes] = await Promise.all([
          API.get('/auth/me'),
          API.get(`/academic/attendance/${studentIdVal}`),
          API.get(`/academic/marks/${studentIdVal}`),
          API.get(`/academic/remediation/${studentIdVal}`),
          API.get('/academic/notifications'),
          API.get('/academic/parent/inquiries').catch(() => ({ data: [] }))
        ]);

        setData({
          student: studentRes.data.profile,
          studentName: `${studentRes.data.profile.userId.firstName} ${studentRes.data.profile.userId.lastName}`,
          attendance: attRes.data,
          marks: marksRes.data,
          remediation: remRes.data,
          notifications: notifRes.data
        });
        setInquiries(inqRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching parent portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper
  const applyInquiryPreset = (preset) => {
    setInquirySubject(preset.subject);
    setInquiryCategory(preset.category);
    setInquiryMessage(preset.message);
    if (preset.meeting) {
      setMeetingRequested(true);
      setPreferredTime(preset.time || 'Next Tuesday at 3:30 PM');
    } else {
      setMeetingRequested(false);
      setPreferredTime('');
    }
  };

  // Submit Parent Inquiry / Consultation request
  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;
    setSendingInquiry(true);
    setInquiryFeedback(null);
    try {
      await API.post('/academic/parent/inquiry', {
        subject: inquirySubject.trim(),
        message: inquiryMessage.trim(),
        category: inquiryCategory,
        urgency: inquiryUrgency,
        meetingRequested,
        preferredTime: meetingRequested ? preferredTime.trim() : ''
      });
      setInquiryFeedback({
        type: 'success',
        text: `Your inquiry "${inquirySubject.trim()}" was officially dispatched to mentor faculty Dr. ${data?.student?.mentorId?.firstName || 'Amit'} ${data?.student?.mentorId?.lastName || 'Sharma'}. You will receive a direct notification once answered.`
      });
      setInquirySubject('');
      setInquiryMessage('');
      setMeetingRequested(false);
      setPreferredTime('');
      const inqRes = await API.get('/academic/parent/inquiries');
      setInquiries(inqRes.data || []);
    } catch (err) {
      console.error(err);
      setInquiryFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error transmitting message to mentor faculty. Please try again.'
      });
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Connecting to Ward Academic Stream...</p>
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

  const childName = data?.studentName || 'Your Ward';
  const childCgpa = data?.student?.cgpa || 0;
  const isHighRisk = data?.remediation?.riskLevel === 'high';

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
              E
            </div>
            <div>
              <h2 className="font-extrabold text-white tracking-tight leading-none text-base">EduVision</h2>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Parent Console</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Ward Academic Radar', icon: LayoutDashboard },
            { id: 'attendanceLogs', label: 'Live Attendance Records', icon: Calendar },
            { id: 'reportCard', label: 'Term Exam Report Card', icon: FileSpreadsheet },
            { id: 'mentorGuidance', label: 'Mentor & Inquiries', icon: MessageSquare, count: `${inquiries.length}` },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Parent Profile Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.firstName?.[0] || 'P'}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400">Parent of {childName.split(' ')[0]}</p>
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
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                {childName}'s Performance Stream
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                ID: {data?.student?.collegeId} &bull; Semester {data?.student?.semester} &bull; {data?.student?.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportCardModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Report Card</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Child Academic Health Alert Banner */}
          {isHighRisk && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-300">
                    Immediate Parent Notice: {childName} is Flagged in High Academic Risk
                  </h3>
                  <p className="text-xs text-rose-400/80 mt-0.5">
                    {data?.remediation?.reasons?.join('; ') || 'Attendance or test marks require parental guidance.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('mentorGuidance')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition"
              >
                Message Mentor Faculty &rarr;
              </button>
            </div>
          )}

          {/* Top 3 High-Level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cumulative CGPA</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{childCgpa?.toFixed(2)}</span>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
                childCgpa >= 7.5 ? 'bg-emerald-500/20 text-emerald-300' :
                childCgpa >= 6.0 ? 'bg-amber-500/20 text-amber-300' :
                'bg-rose-500/20 text-rose-300'
              }`}>
                {childCgpa >= 7.5 ? 'Good Academic Standing' : childCgpa >= 6.0 ? 'Average Standing' : 'Critical Shortage'}
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Overall Classroom Attendance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{overallAttendancePct.toFixed(1)}%</span>
                <span className="text-xs text-slate-400">({attendedClasses}/{totalClasses} lectures)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
                overallAttendancePct >= 75 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {overallAttendancePct >= 75 ? 'Eligible for Exams (>75%)' : 'Detained Risk (<75% threshold)'}
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Remedial Tasks</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  {data?.remediation?.assignedActions?.filter(a => a.status === 'completed').length || 0} / {data?.remediation?.assignedActions?.length || 0}
                </span>
                <span className="text-xs text-slate-400">completed</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {data?.remediation?.assignedActions?.length === 0 ? 'No remedial actions active' : 'Recovery progress actively tracked'}
              </p>
            </div>

          </div>

          {/* ========================================================= */}
          {/* TAB 1: WARD ACADEMIC RADAR */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Critical Subject Attendance Radar */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Live Course Attendance Radar</h3>
                    <p className="text-xs text-slate-400">Mandatory 75% college rule strictly observed</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendanceLogs')}
                    className="text-xs font-semibold text-amber-400 hover:underline"
                  >
                    View Class Logs &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data?.attendance?.map(att => {
                    const present = att.records.filter(r => r.status === 'present').length;
                    const total = att.records.length;
                    const pct = total > 0 ? (present / total) * 100 : 100;
                    return (
                      <div 
                        key={att.courseCode}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{att.courseCode}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            pct >= 75 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <h4 className="text-xs text-slate-400 truncate mb-2">{att.courseName}</h4>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
                          <span>Attended: {present}/{total}</span>
                          <span className={pct < 75 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {pct < 75 ? 'Shortage Alert' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mentor Official Guidance for Parents */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Faculty Mentor's Official Remarks</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Mentor: {data?.student?.mentorId?.firstName ? `Dr. ${data.student.mentorId.firstName} ${data.student.mentorId.lastName}` : 'Dr. Amit Sharma'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  "{data?.remediation?.mentorRemarks || 'Student is participating in lectures. Please ensure regular attendance in Compiler Design and core lab sessions.'}"
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DETAILED ATTENDANCE LOGS */}
          {/* ========================================================= */}
          {activeTab === 'attendanceLogs' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div>
                <h3 className="text-xl font-extrabold text-white">Full Subject Attendance Logs</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time record of all lectures held and attended by {childName}.
                </p>
              </div>

              <div className="space-y-4">
                {data?.attendance?.map(a => {
                  const pCount = a.records.filter(r => r.status === 'present').length;
                  const tCount = a.records.length;
                  const pct = tCount > 0 ? (pCount / tCount) * 100 : 100;
                  return (
                    <div key={a.courseCode} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-white text-sm">{a.courseCode} - {a.courseName}</span>
                          <p className="text-xs text-slate-400">Conducted: {tCount} &bull; Attended: {pCount} &bull; Missed: {tCount - pCount}</p>
                        </div>
                        <span className={`text-sm font-bold font-mono px-3 py-1 rounded-xl ${
                          pct >= 75 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>

                      {/* Mini Timeline of last 10 records */}
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-800">
                        {a.records.slice(-15).map((r, i) => (
                          <span 
                            key={i} 
                            title={`${new Date(r.date).toLocaleDateString()}: ${r.status}`}
                            className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center cursor-default ${
                              r.status === 'present' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {r.status === 'present' ? 'P' : 'A'}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TERM EXAM REPORT CARD */}
          {/* ========================================================= */}
          {activeTab === 'reportCard' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Term Assessment Report Card</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Midterms, assignments, and lab evaluations.</p>
                </div>
                <button
                  onClick={() => setShowReportCardModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Grade Sheet</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Subject Code</th>
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Internal 1 (20)</th>
                      <th className="py-3 px-4">Internal 2 (20)</th>
                      <th className="py-3 px-4">Practical (30)</th>
                      <th className="py-3 px-4">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {data?.marks?.map(m => {
                      const i1 = m.evaluations.find(e => e.type === 'internal_1')?.obtained || 0;
                      const i2 = m.evaluations.find(e => e.type === 'internal_2')?.obtained || 0;
                      const prac = m.evaluations.find(e => e.type === 'practical')?.obtained || 0;
                      const total = i1 + i2 + prac;
                      const pct = (total / 70) * 100;

                      return (
                        <tr key={m.courseCode} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-white">{m.courseCode}</td>
                          <td className="py-3 px-4">{m.courseName}</td>
                          <td className="py-3 px-4 font-mono">{i1} / 20</td>
                          <td className="py-3 px-4 font-mono">{i2} / 20</td>
                          <td className="py-3 px-4 font-mono">{prac} / 30</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pct >= 60 ? 'bg-emerald-500/20 text-emerald-300' :
                              pct >= 40 ? 'bg-amber-500/20 text-amber-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {pct >= 60 ? 'Satisfactory' : pct >= 40 ? 'Marginal' : 'Failing'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MENTOR GUIDANCE & DIRECT INQUIRY */}
          {/* ========================================================= */}
          {activeTab === 'mentorGuidance' && (
            <div className="space-y-6">
              
              {/* Assigned Faculty Mentor Profile Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-amber-500/20">
                        {data?.student?.mentorId?.firstName?.[0] || 'A'}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active on Portal"></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Assigned Academic Mentor
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          Available for Consultation
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white mt-1">
                        {data?.student?.mentorId ? `${data.student.mentorId.firstName} ${data.student.mentorId.lastName}` : 'Dr. Amit Sharma'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Associate Professor • {data?.student?.department || 'Computer Science & Engineering'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full md:w-auto text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{data?.student?.mentorId?.email || 'amit.sharma@college.edu'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{data?.student?.mentorId?.phone || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Cabin 304, Academic Block A</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Mon-Fri: 3:00 PM – 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Inquiry Form */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Direct Consultation & Message to Mentor</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Send academic inquiries, attendance explanations, or request 1-on-1 meetings directly with your ward's mentor faculty.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    Average Response Time: &lt; 24h
                  </span>
                </div>

                {/* Quick 1-Click Starter Presets */}
                <div className="mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Quick Topic Presets (Click to autofill):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: '📉 Attendance Shortage Guidance',
                        subject: 'Attendance Margin & Shortage Guidance',
                        category: 'attendance',
                        message: 'Hello Professor, I noticed my ward’s attendance percentage in some courses is falling close to or below 75%. Could you please guide us on which specific lectures or laboratory practicals require priority catch-up?'
                      },
                      {
                        label: '📊 Midterm Marks & Remedial Classes',
                        subject: 'Midterm Marks & Remedial Support',
                        category: 'academic_marks',
                        message: 'Dear Mentor, I am writing to discuss my ward’s marks in recent midterm assessments. Are there dedicated faculty remedial sessions or compensatory tutorial assignments available to strengthen their fundamentals?'
                      },
                      {
                        label: '📅 Request 1-on-1 Consultation Call',
                        subject: 'Request In-Person / Phone Consultation Meeting',
                        category: 'meeting_request',
                        meeting: true,
                        time: 'Next Tuesday at 3:30 PM',
                        message: 'Dear Professor, I would appreciate the opportunity to have a direct consultation meeting to review my ward’s academic focus, daily routine, and upcoming semester exam strategy.'
                      },
                      {
                        label: '🧠 AI Timetable & Daily Study Routine',
                        subject: 'AI Recovery Timetable Implementation',
                        category: 'counseling',
                        message: 'Hello Professor, we have reviewed the AI-generated study schedule on the student portal. Could you give faculty recommendations on balancing laboratory preparations with evening revision hours?'
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyInquiryPreset(preset)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition flex items-center gap-1.5"
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Toast Banner */}
                {inquiryFeedback && (
                  <div className={`p-4 rounded-2xl mb-4 border flex items-start gap-3 transition ${
                    inquiryFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {inquiryFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs">
                      <p className="font-semibold">{inquiryFeedback.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInquiryFeedback(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Subject Input */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Inquiry Subject / Topic: <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={inquirySubject}
                        onChange={(e) => setInquirySubject(e.target.value)}
                        placeholder="e.g. Regarding Compiler Design attendance and lab submissions..."
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none transition"
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Inquiry Category:</label>
                      <select
                        value={inquiryCategory}
                        onChange={(e) => setInquiryCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition"
                      >
                        <option value="attendance">Attendance Shortage & Leaves</option>
                        <option value="academic_marks">Midterms & Examination Marks</option>
                        <option value="counseling">Academic Counseling & Routine</option>
                        <option value="meeting_request">Meeting / Call Consultation</option>
                        <option value="general">General Academic Inquiry</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority & Meeting Options */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      <label className="font-semibold text-slate-300">Urgency Level:</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInquiryUrgency('normal')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                            inquiryUrgency === 'normal'
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-800/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setInquiryUrgency('urgent')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                            inquiryUrgency === 'urgent'
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                              : 'bg-slate-800/60 text-slate-400 hover:text-rose-400'
                          }`}
                        >
                          Urgent / High Priority
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={meetingRequested}
                          onChange={(e) => setMeetingRequested(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="font-semibold">Request Consultation Meeting / Call</span>
                      </label>
                    </div>
                  </div>

                  {/* Preferred Time Slot (Conditional) */}
                  {meetingRequested && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <label className="font-semibold text-amber-300 block mb-1">
                        Preferred Date / Time Slot for Meeting:
                      </label>
                      <input
                        type="text"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        placeholder="e.g. Next Tuesday at 3:30 PM (Office Hours) or phone consultation"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Detailed Message Textarea */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Detailed Message for Mentor Faculty: <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Explain your query, request a call, or discuss your ward's study routine..."
                      className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none leading-relaxed transition"
                    ></textarea>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Provide specific details so the mentor faculty can prepare tailored guidance.</span>
                      <span>{inquiryMessage.length} characters</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      disabled={sendingInquiry}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{sendingInquiry ? 'Transmitting to Mentor...' : 'Send Message to Mentor'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Inquiries Thread History */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Past Inquiries & Mentor Consultation Thread</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review all logged messages, mentor guidance notes, and meeting appointment statuses.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setInquiryFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        inquiryFilter === 'all' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({inquiries.length})
                    </button>
                    <button
                      onClick={() => setInquiryFilter('pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        inquiryFilter === 'pending' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pending ({inquiries.filter(i => i.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setInquiryFilter('responded')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        inquiryFilter === 'responded' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Answered ({inquiries.filter(i => i.status === 'responded' || i.status === 'resolved').length})
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {inquiries
                    .filter(inq => {
                      if (inquiryFilter === 'pending') return inq.status === 'pending';
                      if (inquiryFilter === 'responded') return inq.status === 'responded' || inq.status === 'resolved';
                      return true;
                    })
                    .length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
                      <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-400">No consultation inquiries found in this view.</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Use the consultation composer above to reach out directly to your ward's faculty mentor.
                      </p>
                    </div>
                  ) : (
                    inquiries
                      .filter(inq => {
                        if (inquiryFilter === 'pending') return inq.status === 'pending';
                        if (inquiryFilter === 'responded') return inq.status === 'responded' || inq.status === 'resolved';
                        return true;
                      })
                      .map(inq => {
                        const isPending = inq.status === 'pending';
                        const isUrgent = inq.urgency === 'urgent';
                        return (
                          <div 
                            key={inq._id} 
                            className={`p-5 rounded-2xl border transition ${
                              isPending
                                ? 'bg-slate-900/90 border-amber-500/30'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            {/* Inquiry Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                  inq.category === 'attendance'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : inq.category === 'academic_marks'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : inq.category === 'meeting_request'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                  {inq.category?.replace('_', ' ') || 'General'}
                                </span>

                                {isUrgent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                    Urgent Priority
                                  </span>
                                )}

                                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(inq.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                                inq.status === 'responded'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : inq.status === 'resolved'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {isPending ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                                    <span>Awaiting Faculty Review</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Answered by Mentor</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Subject & Parent Message */}
                            <h5 className="text-sm font-extrabold text-white mb-2">{inq.subject}</h5>
                            
                            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed mb-3">
                              <p>{inq.message}</p>
                              {inq.meetingRequested && inq.preferredTime && (
                                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Requested Meeting Slot: {inq.preferredTime}</span>
                                </div>
                              )}
                            </div>

                            {/* Faculty Response Section */}
                            {inq.response ? (
                              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 text-xs">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-[11px] text-emerald-300">
                                      {inq.mentorId?.firstName?.[0] || 'M'}
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">
                                      {inq.mentorId?.firstName ? `Dr. ${inq.mentorId.firstName} ${inq.mentorId.lastName}` : 'Faculty Mentor Response'}
                                    </span>
                                  </div>
                                  {inq.respondedAt && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(inq.respondedAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-100 leading-relaxed pl-8 font-medium">{inq.response}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-amber-400/80 italic pl-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Dr. {data?.student?.mentorId?.firstName || 'Amit'} {data?.student?.mentorId?.lastName || 'Sharma'} has been notified and is preparing feedback.</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <AiChatbot studentId={studentId} placeholderText="Ask AI anything about your ward's progress..." />

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL PARENT REPORT CARD */}
      {/* ========================================================= */}
      {showReportCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto printable-area text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-extrabold text-white">Parent Academic Progress Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setShowReportCardModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-wider text-white">EduVision Institute of Technology</h2>
              <p className="text-xs text-slate-400">Official Guardian Academic Evaluation Bulletin &bull; Semester 5</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-850 border border-slate-800 text-xs mb-6">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Ward Name</span>
                <span className="font-bold text-white">{childName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">College ID</span>
                <span className="font-bold text-white font-mono">{data?.student?.collegeId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Cumulative CGPA</span>
                <span className="font-bold text-amber-400">{childCgpa?.toFixed(2)} / 10.0</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Attendance Status</span>
                <span className="font-bold text-cyan-400">{overallAttendancePct.toFixed(1)}%</span>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-6">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Internal Test 1</th>
                  <th className="py-2.5 px-3">Internal Test 2</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data?.marks?.map(m => {
                  const att = data?.attendance?.find(a => a.courseCode === m.courseCode);
                  const pCount = att ? att.records.filter(r => r.status === 'present').length : 0;
                  const tCount = att ? att.records.length : 0;
                  const pct = tCount > 0 ? ((pCount / tCount) * 100).toFixed(1) : '100.0';

                  const i1 = m.evaluations.find(e => e.type === 'internal_1')?.obtained || 0;
                  const i2 = m.evaluations.find(e => e.type === 'internal_2')?.obtained || 0;

                  return (
                    <tr key={m.courseCode}>
                      <td className="py-2.5 px-3 font-bold text-white">{m.courseCode} - {m.courseName}</td>
                      <td className="py-2.5 px-3 font-mono">{pct}%</td>
                      <td className="py-2.5 px-3 font-mono">{i1} / 20</td>
                      <td className="py-2.5 px-3 font-mono">{i2} / 20</td>
                      <td className="py-2.5 px-3">
                        <span className={parseFloat(pct) >= 75 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {parseFloat(pct) >= 75 ? 'Eligible' : 'Attendance Warning'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4 rounded-2xl bg-slate-850 text-xs mb-6">
              <span className="font-bold text-white block mb-1">Mentor Remarks:</span>
              <p className="text-slate-400 italic">
                "{data?.remediation?.mentorRemarks || 'Regular guidance requested to improve scores in Compiler Design.'}"
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>Parent / Guardian: {user?.firstName} {user?.lastName}</span>
              <span>Issued by EduVision Student Academic Bureau</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
