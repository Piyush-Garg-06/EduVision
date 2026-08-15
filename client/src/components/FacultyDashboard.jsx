import React, { useState, useEffect } from 'react';
import API from '../api';
import AiChatbot from './AiChatbot';
import { 
  Users, BookOpen, AlertTriangle, ChevronRight, CheckSquare, 
  Calendar, Award, Star, BookOpenCheck, RefreshCw, LogOut, FileText,
  UserCheck, ClipboardList, Target, MessageCircle, Menu
} from 'lucide-react';

export default function FacultyDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState('roster'); // roster, details, logAttendance, logMarks, counseling
  
  const [activeStudentId, setActiveStudentId] = useState('');

  // Expander detail states
  const [studentDetails, setStudentDetails] = useState({
    profile: null,
    attendance: [],
    marks: [],
    remediation: null
  });
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Logging states
  const [logCourseCode, setLogCourseCode] = useState('CS-302');
  const [logCourseName, setLogCourseName] = useState('Database Management Systems');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logStatus, setLogStatus] = useState('present');
  const [loggingAttendance, setLoggingAttendance] = useState(false);

  const [logExamType, setLogExamType] = useState('internal_1');
  const [logMaxMarks, setLogMaxMarks] = useState(20);
  const [logObtainedMarks, setLogObtainedMarks] = useState(15);
  const [loggingMarks, setLoggingMarks] = useState(false);

  const [newActionTask, setNewActionTask] = useState('');
  const [addingAction, setAddingAction] = useState(false);

  const [mentorRemarks, setMentorRemarks] = useState('');
  const [updatingRemarks, setUpdatingRemarks] = useState(false);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/analytics/faculty');
      setMetrics(res.data);
      if (res.data.students?.length > 0 && !activeStudentId) {
        setActiveStudentId(res.data.students[0].studentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudentDetail = async (studentId) => {
    setActiveStudentId(studentId);
    setFetchingDetails(true);
    setActiveTab('details');
    
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

  // Trigger details fetch if student selection changes manually in details view
  const handleDropdownStudentChange = (e) => {
    const id = e.target.value;
    handleSelectStudentDetail(id);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    if (!activeStudentId) {
      alert('Please select a student first');
      return;
    }

    setLoggingAttendance(true);
    try {
      await API.post('/academic/attendance', {
        studentId: activeStudentId,
        courseCode: logCourseCode,
        courseName: logCourseName,
        records: [{ date: new Date(logDate), status: logStatus }]
      });
      alert('Attendance record logged successfully!');
      if (activeTab === 'details') {
        handleSelectStudentDetail(activeStudentId);
      }
      fetchFacultyData();
    } catch (err) {
      console.error(err);
      alert('Error logging attendance');
    } finally {
      setLoggingAttendance(false);
    }
  };

  const handleLogMarks = async (e) => {
    e.preventDefault();
    if (!activeStudentId) {
      alert('Please select a student first');
      return;
    }

    setLoggingMarks(true);
    try {
      await API.post('/academic/marks', {
        studentId: activeStudentId,
        courseCode: logCourseCode,
        courseName: logCourseName,
        evaluations: [{ type: logExamType, maxMarks: logMaxMarks, obtained: logObtainedMarks, date: new Date() }]
      });
      alert('Marks logged successfully!');
      if (activeTab === 'details') {
        handleSelectStudentDetail(activeStudentId);
      }
      fetchFacultyData();
    } catch (err) {
      console.error(err);
      alert('Error logging marks');
    } finally {
      setLoggingMarks(false);
    }
  };

  const handleAddActionTask = async (e) => {
    e.preventDefault();
    if (!newActionTask || !activeStudentId) return;

    setAddingAction(true);
    try {
      const res = await API.post('/academic/remediation/action', {
        studentId: activeStudentId,
        taskText: newActionTask
      });
      setStudentDetails(prev => ({ ...prev, remediation: res.data }));
      setNewActionTask('');
      alert('Action plan task assigned!');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingAction(false);
    }
  };

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
      alert('Remarks updated!');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingRemarks(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading faculty workspace...</p>
        </div>
      </div>
    );
  }

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
        
        {/* Portal Branding */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-200">
            E
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 tracking-tight leading-none text-base">EduVision</h2>
            <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">Mentor Console</span>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => { setActiveTab('roster'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'roster' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Mentee Roster
          </button>
          
          <button
            onClick={() => {
              setActiveTab('details');
              setIsSidebarOpen(false);
              if (activeStudentId) handleSelectStudentDetail(activeStudentId);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'details' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Performance Audit
          </button>

          <button
            onClick={() => { setActiveTab('logAttendance'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'logAttendance' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Log Attendance
          </button>

          <button
            onClick={() => { setActiveTab('logMarks'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'logMarks' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" /> Log Marks
          </button>

          <button
            onClick={() => { setActiveTab('counseling'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === 'counseling' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Counselor Guidance
          </button>
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 text-sm border border-slate-200">
              M
            </div>
            <div className="truncate">
              <span className="block text-xs font-bold text-slate-800 truncate">Dr. Rajesh Gupta</span>
              <span className="block text-[10px] text-slate-400 truncate">Senior Faculty, CSE</span>
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
              {activeTab === 'roster' && 'Mentee Profile Roster'}
              {activeTab === 'details' && 'Detailed Performance Audit'}
              {activeTab === 'logAttendance' && 'Submit Class Attendance Record'}
              {activeTab === 'logMarks' && 'Submit Evaluation Marks'}
              {activeTab === 'counseling' && 'Mentorship Counselor Remarks & Tasks'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchFacultyData}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 w-full">

          {/* TAB 1: ROSTER OVERVIEW */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              
              {/* Metrics cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Mentees</span>
                    <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{metrics?.mentoredCount || 0}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between border-rose-100 bg-rose-50/10">
                  <div>
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Critical Risk Alerts</span>
                    <span className="text-3xl font-extrabold text-rose-600 mt-1 block">{metrics?.highRiskCount || 0}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Class Avg Attendance</span>
                    <span className="text-3xl font-extrabold text-cyan-600 mt-1 block">{metrics?.averageAttendance || 0}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-50 text-cyan-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Mentee list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Roster Directory</h4>
                </div>

                <div className="divide-y divide-slate-100">
                  {metrics?.students?.map(s => (
                    <div key={s.studentId} className="px-6 py-4 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600 border border-slate-200">
                          {s.name[0]}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{s.name}</h5>
                          <span className="text-xs text-slate-400">{s.collegeId} • Sem {s.semester}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">CGPA</span>
                          <strong className="text-slate-700">{s.cgpa.toFixed(2)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Attendance</span>
                          <strong className={parseFloat(s.attendance) >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                            {s.attendance}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Risk Level</span>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            s.riskLevel === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            s.riskLevel === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {s.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => handleSelectStudentDetail(s.studentId)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                        >
                          Audit Performance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED AUDIT */}
          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Roster dropdown switcher */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Student:</span>
                <select
                  value={activeStudentId}
                  onChange={handleDropdownStudentChange}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-semibold focus:border-indigo-500 outline-none"
                >
                  {metrics?.students?.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.name} ({s.collegeId})</option>
                  ))}
                </select>
              </div>

              {fetchingDetails ? (
                <div className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Attendance log details list */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Attendance Summary
                    </h4>
                    
                    {studentDetails.attendance.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {studentDetails.attendance.map((att, idx) => {
                          const pCount = att.records.filter(r => r.status === 'present').length;
                          const pct = att.records.length > 0 ? (pCount / att.records.length) * 100 : 100;
                          return (
                            <div key={idx} className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-100">
                              <span className="text-slate-600 font-semibold">{att.courseName}</span>
                              <strong className={pct >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{pct.toFixed(0)}%</strong>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No attendance registered.</p>
                    )}
                  </div>

                  {/* Marks evaluation list */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Marks Evaluations
                    </h4>

                    {studentDetails.marks.length > 0 ? (
                      <div className="space-y-3 text-xs">
                        {studentDetails.marks.map((m, idx) => {
                          const midterm = m.evaluations.find(e => e.type === 'internal_1');
                          const final = m.evaluations.find(e => e.type === 'final_semester');
                          return (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-slate-100 flex justify-between items-center">
                              <span className="font-semibold text-slate-700">{m.courseName}</span>
                              <span className="text-slate-500">
                                Midterm Test: <strong className="text-slate-800">{midterm ? `${midterm.obtained}/${midterm.maxMarks}` : '-'}</strong> | Final Exam: <strong className="text-slate-800">{final ? `${final.obtained}/${final.maxMarks}` : '-'}</strong>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No grades logged.</p>
                    )}
                  </div>

                  {/* Active checklist progress */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-3 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" /> Remedial Action Checklist
                    </h4>

                    {studentDetails.remediation?.assignedActions?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {studentDetails.remediation.assignedActions.map((act) => (
                          <div key={act._id} className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-lg text-xs">
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
                      <p className="text-xs text-slate-400 text-center py-4">No remedial recovery steps configured for student.</p>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 3: LOG ATTENDANCE */}
          {activeTab === 'logAttendance' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
              <form onSubmit={handleLogAttendance} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Student Target</label>
                  <select 
                    value={activeStudentId} 
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-700 font-semibold"
                  >
                    <option value="">-- Choose Mentee --</option>
                    {metrics?.students?.map(s => (
                      <option key={s.studentId} value={s.studentId}>{s.name} ({s.collegeId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject Course</label>
                  <select 
                    value={logCourseCode}
                    onChange={(e) => {
                      setLogCourseCode(e.target.value);
                      if (e.target.value === 'CS-301') setLogCourseName('Computer Networks');
                      else if (e.target.value === 'CS-302') setLogCourseName('Database Management Systems');
                      else if (e.target.value === 'CS-303') setLogCourseName('Operating Systems');
                      else if (e.target.value === 'CS-304') setLogCourseName('Machine Learning Basics');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="CS-301">CS-301 Computer Networks</option>
                    <option value="CS-302">CS-302 Database Management Systems</option>
                    <option value="CS-303">CS-303 Operating Systems</option>
                    <option value="CS-304">CS-304 Machine Learning Basics</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Lecture Date</label>
                    <input 
                      type="date" 
                      value={logDate} 
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Attendance Status</label>
                    <select 
                      value={logStatus} 
                      onChange={(e) => setLogStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"
                    >
                      <option value="present">Present (Attended)</option>
                      <option value="absent">Absent (Skipped)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loggingAttendance}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
                >
                  {loggingAttendance ? 'Saving Records...' : 'Submit Attendance Entry'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: LOG MARKS */}
          {activeTab === 'logMarks' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
              <form onSubmit={handleLogMarks} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Student Target</label>
                  <select 
                    value={activeStudentId} 
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-700 font-semibold"
                  >
                    <option value="">-- Choose Mentee --</option>
                    {metrics?.students?.map(s => (
                      <option key={s.studentId} value={s.studentId}>{s.name} ({s.collegeId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject Course</label>
                  <select 
                    value={logCourseCode}
                    onChange={(e) => {
                      setLogCourseCode(e.target.value);
                      if (e.target.value === 'CS-301') setLogCourseName('Computer Networks');
                      else if (e.target.value === 'CS-302') setLogCourseName('Database Management Systems');
                      else if (e.target.value === 'CS-303') setLogCourseName('Operating Systems');
                      else if (e.target.value === 'CS-304') setLogCourseName('Machine Learning Basics');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="CS-301">CS-301 Computer Networks</option>
                    <option value="CS-302">CS-302 Database Management Systems</option>
                    <option value="CS-303">CS-303 Operating Systems</option>
                    <option value="CS-304">CS-304 Machine Learning Basics</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Evaluation Type</label>
                    <select 
                      value={logExamType} 
                      onChange={(e) => setLogExamType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"
                    >
                      <option value="internal_1">Internal Test 1</option>
                      <option value="internal_2">Internal Test 2</option>
                      <option value="practical">Practical / Lab Exam</option>
                      <option value="final_semester">End Semester Theory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Maximum Marks</label>
                    <input 
                      type="number" 
                      value={logMaxMarks} 
                      onChange={(e) => setLogMaxMarks(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Obtained Marks</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={logObtainedMarks} 
                    onChange={(e) => setLogObtainedMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loggingMarks}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
                >
                  {loggingMarks ? 'Saving...' : 'Submit Assessment Entry'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: COUNSELOR REMARKS & TASKS */}
          {activeTab === 'counseling' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg space-y-6">
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Mentee Target</label>
                <select 
                  value={activeStudentId} 
                  onChange={(e) => handleSelectStudentDetail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none text-slate-700 font-semibold"
                >
                  <option value="">-- Choose Mentee --</option>
                  {metrics?.students?.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.name} ({s.collegeId})</option>
                  ))}
                </select>
              </div>

              {/* Remarks Form */}
              <form onSubmit={handleUpdateRemarks} className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Write Advisor Observations</label>
                <textarea
                  value={mentorRemarks}
                  onChange={(e) => setMentorRemarks(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"
                  placeholder="Record discussions, warning escalations, parent calls..."
                />
                <button
                  type="submit"
                  disabled={updatingRemarks}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
                >
                  {updatingRemarks ? 'Saving Remarks...' : 'Update Remarks'}
                </button>
              </form>

              {/* Action Plan Task form */}
              <form onSubmit={handleAddActionTask} className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assign Action recovery task</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Schedule meeting with Physics Professor"
                    value={newActionTask}
                    onChange={(e) => setNewActionTask(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={addingAction}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    {addingAction ? 'Adding...' : 'Assign'}
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>

        {/* Floating AI Chatbot Assistant for Faculty */}
        {activeStudentId && (
          <AiChatbot studentId={activeStudentId} placeholderText="Ask EduVision AI about this mentee..." />
        )}

      </main>
    </div>
  );
}
