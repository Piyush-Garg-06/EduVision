import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Users, 
  ShieldAlert, 
  Award, 
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';

export default function LandingPage({ onLaunchPortal }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              EduVision
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#community" className="hover:text-white transition-colors">Portals</a>
          </nav>

          <button 
            onClick={onLaunchPortal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 group"
          >
            Launch Portal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden flex-1">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <Brain className="w-3.5 h-3.5" />
            <span>Next-Gen MERN Student monitoring system</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Empowering Student Growth through{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Intelligent Monitoring
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            EduVision is a unified, intelligent MERN platform providing students, mentors, parents, and administrators with real-time academic warnings, predictive counseling, and gamified progress mapping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onLaunchPortal}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              Sign In to Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold border border-slate-700/50 transition-all text-center"
            >
              Explore Features
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20 p-8 rounded-2xl bg-slate-800/30 border border-slate-850 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">75%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Attendance Threshold</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-white">6 + 4</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Courses & Labs</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-white">24/7</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">AI Advising Chat</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-3xl font-extrabold text-white">Realtime</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Academic Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dynamic Modular Ecosystem
            </h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              Tailored integrations and predictive telemetry tools created for every academic checkpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Counselor Advising</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Personalized study plans and learning roadmap suggestions generated directly based on subject marks and attendance telemetry.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Strict 75% Attendance Check</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enforces institutional compliance globally. Students with less than 75% attendance are automatically flagged for mentor reviews.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Academic Risk Warning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Dynamic classification (High/Medium/Low) with automated remediation checklists assigned to students by faculty advisors.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gamified Milestones</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Keeps students motivated with XP progression, levels, and special accomplishment badges like "Top Performer" and "Web3 Pioneer."
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Parent-Mentor Integration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Direct parental dashboard synchronization to monitor ward metrics, notifications, warnings, and mentor action items.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analytical Performance Trends</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visually track semester CGPA progression and department metrics over time with interactive dashboard analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="community" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">4 Distinct Portal Gateways</h2>
            <p className="text-slate-400 mt-2">Customized roles working in tandem to support educational success.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 text-center">
              <GraduationCap className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
              <div className="font-bold text-white">Student Portal</div>
              <div className="text-xs text-slate-500 mt-2">Track progress, AI Chat, and check tasks</div>
            </div>
            <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
              <div className="font-bold text-white">Faculty Portal</div>
              <div className="text-xs text-slate-500 mt-2">Manage marks, attendance, and risk lists</div>
            </div>
            <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 text-center">
              <BookOpen className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <div className="font-bold text-white">Parent Portal</div>
              <div className="text-xs text-slate-500 mt-2">View warning alerts and grades</div>
            </div>
            <div className="p-6 rounded-xl bg-slate-850 border border-slate-800 text-center">
              <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-4" />
              <div className="font-bold text-white">Admin Portal</div>
              <div className="text-xs text-slate-500 mt-2">Complete platform configurations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-300">EduVision</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} EduVision Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
