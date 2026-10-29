import React, { useState, useEffect } from 'react';
import API from '../api';
import AiChatbot from './AiChatbot';
import { 
  Users, BookOpen, AlertTriangle, ChevronRight, CheckSquare, 
  Calendar, Award, Star, BookOpenCheck, RefreshCw, LogOut, FileText,
  UserCheck, ClipboardList, Target, MessageCircle, Menu, X, Check,
  Search, Send, ShieldAlert, Sparkles, Filter, CheckCircle2, Clock,
  Mail, Phone, AlertCircle, MessageSquare, CornerDownRight, CheckCircle
} from 'lucide-react';

export default function FacultyDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: roster, bulkAttendance, bulkMarks, parentInquiries, studentDetail
  const [activeTab, setActiveTab] = useState('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Parent Inquiries State
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFeedback, setInquiryFeedback] = useState(null);
  const [expandedReplyId, setExpandedReplyId] = useState(null);

  // Selected student for detail drilldown
  const [activeStudentId, setActiveStudentId] = useState('');
  const [studentDetails, setStudentDetails] = useState({
    profile: null,
    attendance: [],
    marks: [],
    remediation: null
  });
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // 1-Click Smart Class Attendance Register State
  const [attCourse, setAttCourse] = useState('CS-504');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [classAttendanceMap, setClassAttendanceMap] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // 1-Click Bulk Marks Gradebook Matrix State
  const [marksCourse, setMarksCourse] = useState('CS-504');
  const [marksEvalType, setMarksEvalType] = useState('internal_1');
  const [marksMaxVal, setMarksMaxVal] = useState(20);
  const [marksDate, setMarksDate] = useState(new Date().toISOString().split('T')[0]);
  const [classMarksMap, setClassMarksMap] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);

  // Task & Remark States for single student
  const [newActionTask, setNewActionTask] = useState('');
  const [addingAction, setAddingAction] = useState(false);
  const [mentorRemarks, setMentorRemarks] = useState('');
  const [updatingRemarks, setUpdatingRemarks] = useState(false);

  // Parent Inquiry Reply state
  const [replyTextMap, setReplyTextMap] = useState({});
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const [facRes, coursesRes, inqRes] = await Promise.all([
        API.get('/analytics/faculty'),
        API.get('/analytics/courses').catch(() => ({ data: [] })),
        API.get('/academic/parent/inquiries').catch(() => ({ data: [] }))
      ]);

      setMetrics(facRes.data);
      setCourses(coursesRes.data || []);
      setInquiries(inqRes.data || []);

      const studentList = facRes.data.students || [];
      if (studentList.length > 0) {
        // Initialize 1-click attendance map (default present for all)
        const initialAtt = {};
        const initialMarks = {};
        studentList.forEach(s => {
          initialAtt[s.studentId] = 'present';
          initialMarks[s.studentId] = 15;
        });
        setClassAttendanceMap(initialAtt);
        setClassMarksMap(initialMarks);
        if (!activeStudentId) {
          setActiveStudentId(studentList[0].studentId);
        }
      }
    } catch (err) {
      console.error('Error loading faculty portal:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select student for deep drilldown
  const handleSelectStudentDetail = async (studentId) => {
    setActiveStudentId(studentId);
    setFetchingDetails(true);
    setActiveTab('studentDetail');

    try {
      const [attRes, marksRes, remRes] = await Promise.all([
        API.get(`/academic/attendance/${studentId}`),
        API.get(`/academic/marks/${studentId}`),
        API.get(`/academic/remediation/${studentId}`)
      ]);

      const studentMeta = metrics?.students?.find(s => s.studentId === studentId);

      setStudentDetails({
        profile: studentMeta,
        attendance: attRes.data,
        marks: marksRes.data,
        remediation: remRes.data
      });
      setMentorRemarks(remRes.data?.mentorRemarks || '');
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDetails(false);
    }
  };

  // 1-Click "Mark All Present" helper
  const handleMarkAllPresent = () => {
    const updated = {};
    metrics?.students?.forEach(s => {
      updated[s.studentId] = 'present';
    });
    setClassAttendanceMap(updated);
  };

  // Toggle single student attendance in class register
  const handleToggleStudentAttendance = (studentId, nextStatus) => {
    setClassAttendanceMap(prev => ({
      ...prev,
      [studentId]: nextStatus
    }));
  };

  // Save 1-Click Class Attendance Register
  const handleSaveBulkAttendance = async () => {
    setSavingAttendance(true);
    try {
      const currentCourseObj = courses.find(c => c.code === attCourse);
      const records = Object.keys(classAttendanceMap).map(sId => ({
        studentId: sId,
        status: classAttendanceMap[sId]
      }));

      await API.post('/academic/attendance/bulk', {
        courseCode: attCourse,
        courseName: currentCourseObj?.name || attCourse,
        date: attDate,
        records
      });

      alert(`1-Click Attendance successfully recorded for all ${records.length} students in ${attCourse}!`);
      fetchFacultyData();
    } catch (err) {
      console.error(err);
      alert('Error saving bulk attendance register');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Update marks in matrix
  const handleMarksChange = (studentId, val) => {
    setClassMarksMap(prev => ({
      ...prev,
      [studentId]: Number(val)
    }));
  };

  // Save 1-Click Bulk Marks Matrix
  const handleSaveBulkMarks = async () => {
    setSavingMarks(true);
    try {
      const currentCourseObj = courses.find(c => c.code === marksCourse);
      const studentMarks = Object.keys(classMarksMap).map(sId => ({
        studentId: sId,
        obtained: classMarksMap[sId]
      }));

      await API.post('/academic/marks/bulk', {
        courseCode: marksCourse,
        courseName: currentCourseObj?.name || marksCourse,
        type: marksEvalType,
        maxMarks: marksMaxVal,
        date: marksDate,
        studentMarks
      });

      alert(`1-Click Marks successfully published for all ${studentMarks.length} students!`);
      fetchFacultyData();
    } catch (err) {
      console.error(err);
      alert('Error saving class marks');
    } finally {
      setSavingMarks(false);
    }
  };

  // Assign remedial task to single student
  const handleAddRemedialAction = async (e) => {
    e.preventDefault();
    if (!newActionTask.trim() || !activeStudentId) return;
    setAddingAction(true);
    try {
      const res = await API.post('/academic/remediation/action', {
        studentId: activeStudentId,
        taskText: newActionTask.trim()
      });
      setStudentDetails(prev => ({ ...prev, remediation: res.data }));
      setNewActionTask('');
      alert('Remedial action assigned! Student notified.');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingAction(false);
    }
  };

  // Update mentor remarks
  const handleUpdateRemarks = async (e) => {
    e.preventDefault();
    if (!activeStudentId) return;
    setUpdatingRemarks(true);
    try {
      const res = await API.post('/academic/remediation/remark', {
        studentId: activeStudentId,
        remarks: mentorRemarks
      });
      setStudentDetails(prev => ({ ...prev, remediation: res.data }));
      alert('Mentor counseling remarks saved.');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingRemarks(false);
    }
  };

  // Reply to parent inquiry
  const handleReplyInquiry = async (inquiryId) => {
    const text = replyTextMap[inquiryId];
    if (!text?.trim()) return;
    setSubmittingReply(true);
    setInquiryFeedback(null);
    try {
      await API.post(`/academic/parent/inquiry/${inquiryId}/reply`, { response: text.trim() });
      setInquiryFeedback({
        type: 'success',
        text: 'Official mentor response delivered directly to parent console!'
      });
      const updatedInq = await API.get('/academic/parent/inquiries');
      setInquiries(updatedInq.data || []);
      setReplyTextMap(prev => ({ ...prev, [inquiryId]: '' }));
      setExpandedReplyId(null);
    } catch (err) {
      console.error(err);
      setInquiryFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Error transmitting reply to parent'
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading EduVision Faculty Console...</p>
        </div>
      </div>
    );
  }

  // Filter students roster
  const filteredStudents = (metrics?.students || []).filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.collegeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || s.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
              E
            </div>
            <div>
              <h2 className="font-extrabold text-white tracking-tight leading-none text-base">EduVision</h2>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Faculty Console</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'roster', label: 'Mentored Roster & Radar', icon: Users, count: `${metrics?.students?.length || 0}` },
            { id: 'bulkAttendance', label: '1-Click Class Register', icon: Calendar, badge: '1-Click' },
            { id: 'bulkMarks', label: '1-Click Marks Matrix', icon: BookOpenCheck, badge: 'Matrix' },
            { id: 'parentInquiries', label: 'Parent Inquiries Inbox', icon: MessageCircle, count: `${inquiries.filter(i => i.status === 'pending').length}` },
            { id: 'studentDetail', label: 'Student Telemetry Detail', icon: Target },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-xs text-white">
              {user?.firstName?.[0] || 'F'}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400">Department Faculty & Mentor</p>
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
        
        {/* Top Header */}
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
                {activeTab === 'bulkAttendance' ? '1-Click Class Attendance Register' :
                 activeTab === 'bulkMarks' ? '1-Click Class Marks Gradebook Matrix' :
                 activeTab === 'parentInquiries' ? 'Parent Direct Inquiries & Messaging' :
                 activeTab === 'studentDetail' ? 'Student In-Depth Telemetry Drilldown' :
                 'Mentored Students Roster & Early Warnings'}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                CSE Department &bull; Academic Year 2025-2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('bulkAttendance')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1-Click Register</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Mentored Students</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{metrics?.mentoredCount || 0}</span>
                <span className="text-xs text-slate-400">enrolled in semester 5</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">High Risk Students Flagged</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{metrics?.highRiskCount || 0}</span>
                <span className="text-xs text-slate-400">require immediate intervention</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Class Attendance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-cyan-400">{metrics?.averageAttendance || '0.0'}%</span>
                <span className="text-xs text-slate-400">across 10 subjects/labs</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: MENTORED STUDENTS ROSTER */}
          {/* ========================================================= */}
          {activeTab === 'roster' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or ID..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400">Risk Filter:</span>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="all">All Students</option>
                    <option value="high">High Risk Only</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk / Safe</option>
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">College ID</th>
                      <th className="py-3 px-4">CGPA</th>
                      <th className="py-3 px-4">Attendance</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Weak Subjects</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredStudents.map(s => (
                      <tr key={s.studentId} className="hover:bg-slate-900/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-slate-500">{s.remediationStatus}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-400">{s.collegeId}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.cgpa?.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold ${parseFloat(s.attendance) >= 75 ? 'text-cyan-400' : 'text-rose-400'}`}>
                            {s.attendance}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            s.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            s.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {s.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {s.weakSubjects?.length > 0 ? (
                            <span className="text-rose-300 font-medium">{s.weakSubjects.join(', ')}</span>
                          ) : (
                            <span className="text-emerald-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleSelectStudentDetail(s.studentId)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: 1-CLICK CLASS ATTENDANCE REGISTER */}
          {/* ========================================================= */}
          {activeTab === 'bulkAttendance' && (
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 space-y-6">
              
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No Manual Registers — 1-Click Digital Attendance</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Class Daily Attendance Register</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your lecture course and date. Tap "Mark All Present" to set everyone with 1 click, then toggle any absentees.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark All Present (1-Click)</span>
                  </button>

                  <button
                    onClick={handleSaveBulkAttendance}
                    disabled={savingAttendance}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <SaveIcon className="w-4 h-4" />
                    <span>{savingAttendance ? 'Saving Full Register...' : 'Save Class Attendance'}</span>
                  </button>
                </div>
              </div>

              {/* Course & Date Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Select Course:
                  </label>
                  <select
                    value={attCourse}
                    onChange={(e) => setAttCourse(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Attendance Date:
                  </label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  />
                </div>
              </div>

              {/* Class Register Roster Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">College ID</th>
                      <th className="py-3 px-4">Current Subject Attendance</th>
                      <th className="py-3 px-4 text-center">Status for this Lecture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {metrics?.students?.map(s => {
                      const currentStatus = classAttendanceMap[s.studentId] || 'present';
                      return (
                        <tr key={s.studentId} className="hover:bg-slate-900/60 transition">
                          <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{s.collegeId}</td>
                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold ${parseFloat(s.attendance) >= 75 ? 'text-cyan-400' : 'text-rose-400'}`}>
                              {s.attendance}% Overall
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 gap-1">
                              {['present', 'absent', 'excused'].map(stat => (
                                <button
                                  key={stat}
                                  type="button"
                                  onClick={() => handleToggleStudentAttendance(s.studentId, stat)}
                                  className={`px-3 py-1 rounded-lg font-bold text-[11px] capitalize transition ${
                                    currentStatus === stat
                                      ? stat === 'present' ? 'bg-emerald-600 text-white shadow-sm' :
                                        stat === 'absent' ? 'bg-rose-600 text-white shadow-sm' :
                                        'bg-amber-600 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {stat}
                                </button>
                              ))}
                            </div>
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
          {/* TAB 3: 1-CLICK CLASS MARKS MATRIX */}
          {/* ========================================================= */}
          {activeTab === 'bulkMarks' && (
            <div className="glass-panel p-6 rounded-3xl border border-teal-500/20 space-y-6">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <BookOpenCheck className="w-4 h-4" />
                    <span>Bulk Evaluation Score Matrix</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Record Assessment Marks for Entire Class</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select assessment type, enter maximum marks, and input student scores in one streamlined table.
                  </p>
                </div>

                <button
                  onClick={handleSaveBulkMarks}
                  disabled={savingMarks}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <SaveIcon className="w-4 h-4" />
                  <span>{savingMarks ? 'Publishing Marks...' : 'Publish All Class Marks'}</span>
                </button>
              </div>

              {/* Assessment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Course:</label>
                  <select
                    value={marksCourse}
                    onChange={(e) => setMarksCourse(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evaluation Type:</label>
                  <select
                    value={marksEvalType}
                    onChange={(e) => setMarksEvalType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  >
                    <option value="internal_1">Internal Assessment 1</option>
                    <option value="internal_2">Internal Assessment 2</option>
                    <option value="practical">Practical / Lab Test</option>
                    <option value="assignment">Assignment Evaluation</option>
                    <option value="final_semester">Final Semester Exam</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Max Marks:</label>
                  <input
                    type="number"
                    value={marksMaxVal}
                    onChange={(e) => setMarksMaxVal(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assessment Date:</label>
                  <input
                    type="date"
                    value={marksDate}
                    onChange={(e) => setMarksDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                  />
                </div>
              </div>

              {/* Marks Entry Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">College ID</th>
                      <th className="py-3 px-4">Current CGPA</th>
                      <th className="py-3 px-4">Marks Obtained (Out of {marksMaxVal})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {metrics?.students?.map(s => (
                      <tr key={s.studentId} className="hover:bg-slate-900/60 transition">
                        <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.collegeId}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.cgpa?.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max={marksMaxVal}
                            value={classMarksMap[s.studentId] !== undefined ? classMarksMap[s.studentId] : 15}
                            onChange={(e) => handleMarksChange(s.studentId, e.target.value)}
                            className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs focus:border-teal-500 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PARENT INQUIRIES & DIRECT MESSAGING */}
          {/* ========================================================= */}
          {activeTab === 'parentInquiries' && (
            <div className="space-y-6">
              
              {/* Header & KPI Summary */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      <span>Parent Inquiries & Consultation Inbox</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct inquiries, attendance concerns, and consultation requests submitted by parents regarding their ward.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      Office Hours: Mon-Fri 3:00 PM – 5:00 PM (Cabin 304)
                    </span>
                  </div>
                </div>

                {/* 4 KPI Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Inquiries</span>
                    <div className="text-2xl font-black text-white">{inquiries.length}</div>
                    <span className="text-[10px] text-slate-500">All-time received</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    </div>
                    <div className="text-2xl font-black text-amber-300">
                      {inquiries.filter(i => i.status === 'pending').length}
                    </div>
                    <span className="text-[10px] text-amber-400/80">Requires faculty response</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Answered & Resolved</span>
                    <div className="text-2xl font-black text-emerald-300">
                      {inquiries.filter(i => i.status === 'responded' || i.status === 'resolved').length}
                    </div>
                    <span className="text-[10px] text-emerald-400/80">Guidance dispatched</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">Meeting Requests</span>
                    <div className="text-2xl font-black text-purple-300">
                      {inquiries.filter(i => i.meetingRequested).length}
                    </div>
                    <span className="text-[10px] text-purple-400/80">1-on-1 consultations</span>
                  </div>
                </div>
              </div>

              {/* Feedback Toast Banner */}
              {inquiryFeedback && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 transition ${
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

              {/* Search & Filter Controls */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search inquiries by student roll, name, parent or topic..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shrink-0">
                  <button
                    onClick={() => setInquiryFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      inquiryFilter === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({inquiries.length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      inquiryFilter === 'pending' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({inquiries.filter(i => i.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('responded')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      inquiryFilter === 'responded' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Responded ({inquiries.filter(i => i.status === 'responded' || i.status === 'resolved').length})
                  </button>
                  <button
                    onClick={() => setInquiryFilter('meeting')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      inquiryFilter === 'meeting' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Meetings ({inquiries.filter(i => i.meetingRequested).length})
                  </button>
                </div>
              </div>

              {/* Inquiries Stream */}
              <div className="space-y-4">
                {inquiries
                  .filter(inq => {
                    if (inquiryFilter === 'pending') return inq.status === 'pending';
                    if (inquiryFilter === 'responded') return inq.status === 'responded' || inq.status === 'resolved';
                    if (inquiryFilter === 'meeting') return inq.meetingRequested;
                    return true;
                  })
                  .filter(inq => {
                    if (!inquirySearch.trim()) return true;
                    const q = inquirySearch.toLowerCase();
                    const sName = `${inq.studentId?.firstName || ''} ${inq.studentId?.lastName || ''}`.toLowerCase();
                    const pName = `${inq.parentId?.firstName || ''} ${inq.parentId?.lastName || ''}`.toLowerCase();
                    const roll = (inq.studentProfile?.collegeId || '').toLowerCase();
                    const subj = (inq.subject || '').toLowerCase();
                    return sName.includes(q) || pName.includes(q) || roll.includes(q) || subj.includes(q);
                  })
                  .length === 0 ? (
                  <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-base font-bold text-white">No parent inquiries found.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      All parent inquiries matching your current search or filter criteria have been handled.
                    </p>
                  </div>
                ) : (
                  inquiries
                    .filter(inq => {
                      if (inquiryFilter === 'pending') return inq.status === 'pending';
                      if (inquiryFilter === 'responded') return inq.status === 'responded' || inq.status === 'resolved';
                      if (inquiryFilter === 'meeting') return inq.meetingRequested;
                      return true;
                    })
                    .filter(inq => {
                      if (!inquirySearch.trim()) return true;
                      const q = inquirySearch.toLowerCase();
                      const sName = `${inq.studentId?.firstName || ''} ${inq.studentId?.lastName || ''}`.toLowerCase();
                      const pName = `${inq.parentId?.firstName || ''} ${inq.parentId?.lastName || ''}`.toLowerCase();
                      const roll = (inq.studentProfile?.collegeId || '').toLowerCase();
                      const subj = (inq.subject || '').toLowerCase();
                      return sName.includes(q) || pName.includes(q) || roll.includes(q) || subj.includes(q);
                    })
                    .map(inq => {
                      const isPending = inq.status === 'pending';
                      const isUrgent = inq.urgency === 'urgent';
                      const isEditing = expandedReplyId === inq._id;
                      return (
                        <div 
                          key={inq._id} 
                          className={`p-6 rounded-3xl border transition ${
                            isPending
                              ? 'bg-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          {/* Student & Parent Header Bar */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                                {inq.studentId?.firstName?.[0] || 'S'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-extrabold text-white">
                                    {inq.studentId?.firstName} {inq.studentId?.lastName}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                    {inq.studentProfile?.collegeId || 'CSE-2026-001'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Sem {inq.studentProfile?.semester || 5} • {inq.studentProfile?.department || 'CSE'}
                                  </span>
                                  {inq.studentProfile?.cgpa && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                      CGPA: {inq.studentProfile.cgpa.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                                  <span>Parent: <strong className="text-slate-200">{inq.parentId?.firstName} {inq.parentId?.lastName}</strong></span>
                                  {inq.parentId?.phone && (
                                    <span className="text-slate-500 font-mono">📞 {inq.parentId.phone}</span>
                                  )}
                                  {inq.parentId?.email && (
                                    <span className="text-slate-500">✉️ {inq.parentId.email}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
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
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                  Urgent Priority
                                </span>
                              )}

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
                                    <span>Pending Your Reply</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Responded</span>
                                  </>
                                )}
                              </span>

                              <span className="text-[11px] text-slate-500 font-mono">
                                {new Date(inq.createdAt).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Subject & Message Content */}
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-white mb-1.5">{inq.subject}</h4>
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                              <p>{inq.message}</p>
                              {inq.meetingRequested && inq.preferredTime && (
                                <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs font-semibold text-purple-300 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span>Requested Consultation Slot: <strong className="text-white">{inq.preferredTime}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sent Reply View */}
                          {inq.response && !isEditing && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 text-xs mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Your Official Sent Guidance:</span>
                                </span>
                                <div className="flex items-center gap-3">
                                  {inq.respondedAt && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Dispatched {new Date(inq.respondedAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setExpandedReplyId(inq._id);
                                      setReplyTextMap(prev => ({ ...prev, [inq._id]: inq.response }));
                                    }}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline"
                                  >
                                    Update Note
                                  </button>
                                </div>
                              </div>
                              <p className="text-slate-100 leading-relaxed pl-5 font-medium">{inq.response}</p>
                            </div>
                          )}

                          {/* Faculty Response Composer (When Pending or Editing) */}
                          {(isPending || isEditing) && (
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                              {/* Quick 1-Click Preset Responses */}
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                  Quick Response Presets (Click to autofill):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    'I have scheduled a dedicated 1-on-1 tutorial remediation session for your ward this Friday at 3:00 PM.',
                                    'Ward’s attendance is currently below 75%. Please ensure they attend all morning theory & lab sessions regularly.',
                                    'I have reviewed the midterm assessments. A personalized AI recovery study schedule has been assigned on their portal.',
                                    'Consultation meeting confirmed! Please visit Cabin 304, Academic Block A during office hours (3:00 PM - 5:00 PM).'
                                  ].map((preset, pIdx) => (
                                    <button
                                      key={pIdx}
                                      type="button"
                                      onClick={() => setReplyTextMap(prev => ({ ...prev, [inq._id]: preset }))}
                                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition"
                                    >
                                      {preset.slice(0, 48)}...
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Multi-line Reply Box */}
                              <textarea
                                rows={3}
                                value={replyTextMap[inq._id] || ''}
                                onChange={(e) => setReplyTextMap({ ...replyTextMap, [inq._id]: e.target.value })}
                                placeholder="Type tailored faculty advice, meeting confirmation, or academic plan for the parent..."
                                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 leading-relaxed transition"
                              ></textarea>

                              <div className="flex items-center justify-between">
                                {isEditing ? (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedReplyId(null)}
                                    className="text-xs text-slate-400 hover:text-white"
                                  >
                                    Cancel Edit
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-500">
                                    Parent receives an instant notification upon sending.
                                  </span>
                                )}

                                <button
                                  onClick={() => handleReplyInquiry(inq._id)}
                                  disabled={submittingReply || !replyTextMap[inq._id]?.trim()}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{submittingReply ? 'Transmitting...' : isEditing ? 'Save Updated Note' : 'Send Official Reply'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: STUDENT TELEMETRY DETAIL DRILLDOWN */}
          {/* ========================================================= */}
          {activeTab === 'studentDetail' && (
            <div className="space-y-6">
              
              {/* Student Selector Dropdown in Detail View */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Inspecting Student Profile:
                </span>
                <select
                  value={activeStudentId}
                  onChange={(e) => handleSelectStudentDetail(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs outline-none"
                >
                  {metrics?.students?.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.name} ({s.collegeId}) - {s.riskLevel.toUpperCase()} RISK
                    </option>
                  ))}
                </select>
              </div>

              {fetchingDetails ? (
                <div className="p-12 text-center text-slate-400">Loading student details...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Student Academic Telemetry */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Telemetry Overview */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-white">{studentDetails.profile?.name}</h3>
                          <p className="text-xs text-slate-400 font-mono">{studentDetails.profile?.collegeId} &bull; Semester {studentDetails.profile?.semester}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${
                          studentDetails.remediation?.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {studentDetails.remediation?.riskLevel || 'Low'} Risk
                        </span>
                      </div>

                      {/* Reasons if flagged */}
                      {studentDetails.remediation?.reasons?.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-4">
                          <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">Risk Causes:</span>
                          <ul className="text-xs text-rose-300 list-disc pl-4 space-y-1">
                            {studentDetails.remediation.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Course Attendance List */}
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject-wise Attendance</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                        {studentDetails.attendance.map(a => {
                          const pCount = a.records.filter(r => r.status === 'present').length;
                          const tCount = a.records.length;
                          const pct = tCount > 0 ? ((pCount / tCount) * 100).toFixed(1) : '100.0';
                          return (
                            <div key={a.courseCode} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                              <span className="font-bold text-white block">{a.courseCode}</span>
                              <span className={`font-mono font-bold ${parseFloat(pct) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pct}% ({pCount}/{tCount})
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Course Marks List */}
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluations & Internal Scores</h4>
                      <div className="space-y-2">
                        {studentDetails.marks.map(m => (
                          <div key={m.courseCode} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{m.courseCode} ({m.courseName})</span>
                            <div className="flex gap-2 font-mono">
                              {m.evaluations.map(e => (
                                <span key={e.type} className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">
                                  {e.type}: <strong>{e.obtained}/{e.maxMarks}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Assign Remedial Task & Remarks */}
                  <div className="space-y-6">
                    
                    {/* Remedial Task Assign Form */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Assign Remedial Task</h4>
                      <form onSubmit={handleAddRemedialAction} className="space-y-3">
                        <textarea
                          rows={3}
                          value={newActionTask}
                          onChange={(e) => setNewActionTask(e.target.value)}
                          placeholder="e.g. Complete re-submission of Compiler Design assignment 2 by Friday..."
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        ></textarea>
                        <button
                          type="submit"
                          disabled={addingAction}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          {addingAction ? 'Assigning...' : 'Assign Remedial Task'}
                        </button>
                      </form>

                      {/* Active Tasks List */}
                      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {studentDetails.remediation?.assignedActions?.map((act, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                            <span className="text-slate-300">{act.task}</span>
                            <span className="text-[10px] text-cyan-400 capitalize">{act.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentor Remarks */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Mentor Official Remarks</h4>
                      <form onSubmit={handleUpdateRemarks} className="space-y-3">
                        <textarea
                          rows={4}
                          value={mentorRemarks}
                          onChange={(e) => setMentorRemarks(e.target.value)}
                          placeholder="Official mentor notes visible to student and parents..."
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                        ></textarea>
                        <button
                          type="submit"
                          disabled={updatingRemarks}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                        >
                          {updatingRemarks ? 'Saving Remarks...' : 'Save Remarks for Parent & Student'}
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <AiChatbot studentId={activeStudentId} placeholderText="Ask AI about student performance..." />
    </div>
  );
}

function SaveIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}
