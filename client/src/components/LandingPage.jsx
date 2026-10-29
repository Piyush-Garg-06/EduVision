import React from 'react';
import { 
  Sparkles, GraduationCap, BookOpen, Clock, Users, ShieldAlert, 
  Award, ArrowRight, TrendingUp, Brain, CheckCircle2, Trophy, 
  Target, Heart, UserCheck, ShieldCheck, FileCode, Bell, ChevronRight,
  Flame, Laptop, CalendarCheck
} from 'lucide-react';

export default function LandingPage({ onLaunchPortal }) {
  const pillars = [
    {
      num: '01',
      title: 'Complete Academic Life Tracking',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-600',
      desc: 'Complete digital history of Marks, 75% attendance threshold radar, CGPA simulator, and semester SGPA progression.'
    },
    {
      num: '02',
      title: 'Real-Time Parent Portal',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      desc: 'Parents monitor live attendance, exam results, view printable report cards, and send direct consultation notes to mentors.'
    },
    {
      num: '03',
      title: '1-Click Teacher Registers',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      desc: 'No manual registers! Teachers log full class attendance with 1-click "Mark All Present" & bulk-record internal test scores.'
    },
    {
      num: '04',
      title: 'AI Personalized Study Plan',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      desc: 'AI detects weak subjects and automatically generates a 7-day recovery timetable with micro-milestones that award XP!'
    },
    {
      num: '05',
      title: '24/7 AI Counselor Mentor',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      desc: 'Context-aware AI mentor answering student queries in English and Hinglish about exam prep, attendance recovery, and stress.'
    },
    {
      num: '06',
      title: 'Career & Skill Gap Analysis',
      icon: Target,
      color: 'from-cyan-500 to-blue-600',
      desc: 'AI compares student skills with target roles (Software Engineer, AI/ML, DevOps) and provides a phased roadmap to bridge gaps.'
    },
    {
      num: '07',
      title: 'Gamification & Motivation',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-600',
      desc: 'Turn studies into a game with XP Points, Level progression, Streak tracking (🔥), unlockable Badges, and College Leaderboard.'
    },
    {
      num: '08',
      title: 'Digital Portfolio & Resume',
      icon: Laptop,
      color: 'from-teal-500 to-emerald-600',
      desc: 'Showcase projects, verified skills, certifications, and internships with a one-click printable digital resume for recruiters.'
    },
    {
      num: '09',
      title: 'Alerts & Remedial Workflows',
      icon: Bell,
      color: 'from-red-500 to-rose-600',
      desc: 'Instant notifications when attendance falls below 75% or scores drop, allowing mentors to assign tracked remedial tasks.'
    },
    {
      num: '10',
      title: '4 Distinct Role Portals',
      icon: ShieldCheck,
      color: 'from-indigo-500 to-purple-600',
      desc: 'Dedicated views for Students, Teachers, Parents, and Administrators — each seeing strictly what is relevant to their role.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                EduVision
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase block -mt-1">
                AI Academic Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#pillars" className="hover:text-white transition-colors">10 Core Pillars</a>
            <a href="#portals" className="hover:text-white transition-colors">Role Portals</a>
            <a href="#ai-engine" className="hover:text-white transition-colors">Groq AI Engine</a>
          </nav>

          <button 
            onClick={onLaunchPortal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 group"
          >
            Launch Portal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden flex-1">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-500/15 via-cyan-500/15 to-purple-500/15 rounded-full blur-[140px] -z-10"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Connect Students, Teachers, Parents & Admin in One Intelligent Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-tight">
            Ensuring Every Student Achieves Their{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Highest Academic Potential
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            EduVision unifies Students, Faculty Mentors, Parents, and Administrators into one intelligent, predictive ecosystem. Powered by automated recovery schedules, 1-click attendance registers, real-time guardian oversight, and 24/7 AI academic counseling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLaunchPortal}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold tracking-wide shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              Sign In to Demo Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#pillars"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white font-bold border border-slate-800 transition-all text-center"
            >
              Explore 10 Pillars
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-1.5">
                <span>75%</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Mandatory Attendance Radar</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-cyan-400">1-Click</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Teacher Registers</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-indigo-400">24/7</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">AI Counselor Mentor</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 text-orange-500" />
                <span>Gamified</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">XP, Streaks & Badges</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Pillars Section */}
      <section id="pillars" className="py-24 bg-slate-900/40 relative border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
              All 10 Core Pillars Integrated
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered Solutions for Every Academic Challenge
            </h3>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              EduVision was engineered from the ground up to solve the real academic bottlenecks faced by students, parents, and faculties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div 
                  key={p.num} 
                  className="glass-panel p-6 rounded-3xl hover:border-indigo-500/40 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 font-mono group-hover:text-cyan-400 transition-colors">
                      {p.num}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Portals Showcase */}
      <section id="portals" className="py-24 border-t border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-2">
              4 Dedicated Role Consoles
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Purpose-Built Consoles for Every Stakeholder
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/20 hover:border-indigo-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Student Portal</h4>
              <p className="text-xs text-slate-400 mb-4">Attendance safety margins, CGPA target simulator, AI study plan, career roadmaps, and digital resume.</p>
              <span className="text-[11px] font-mono text-indigo-400">Login: testuser</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/20 hover:border-emerald-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Teacher Portal</h4>
              <p className="text-xs text-slate-400 mb-4">1-Click class attendance register, bulk internal marks matrix, parent consultation replies, and high-risk student warnings.</p>
              <span className="text-[11px] font-mono text-emerald-400">Login: faculty</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Parent Portal</h4>
              <p className="text-xs text-slate-400 mb-4">Real-time attendance radar, alert acknowledgments, official printable report card, and direct mentor consultation messaging.</p>
              <span className="text-[11px] font-mono text-amber-400">Login: parent</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">Admin Portal</h4>
              <p className="text-xs text-slate-400 mb-4">Institution-wide performance breakdown, failure rate analytics, department CGPA comparisons, and student risk directory.</p>
              <span className="text-[11px] font-mono text-purple-400">Login: admin</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 border-t border-slate-850 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">EduVision 2026</span>
            <span>— AI-Powered Academic Monitoring & Remediation</span>
          </div>
          <button 
            onClick={onLaunchPortal}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
          >
            Launch System Demo &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
}
