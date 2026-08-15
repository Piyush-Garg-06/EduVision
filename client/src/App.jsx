import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import ParentDashboard from './components/ParentDashboard';
import AdminDashboard from './components/AdminDashboard';
import API from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-glowIndigo border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Role-Based Router View rendering
  switch (user.role) {
    case 'student':
      return <StudentDashboard user={user} onLogout={handleLogout} />;
    case 'faculty':
      return <FacultyDashboard user={user} onLogout={handleLogout} />;
    case 'parent':
      return <ParentDashboard user={user} onLogout={handleLogout} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-darkBg text-white p-6">
          <h2 className="text-xl font-bold text-glowRose">Unknown Portal Configuration</h2>
          <p className="text-gray-400 mt-2">The system detected an unassigned role authorization.</p>
          <button 
            onClick={handleLogout} 
            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            Clear Session
          </button>
        </div>
      );
  }
}
