import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  TrendingUp, 
  CalendarCheck, 
  BookOpen, 
  ClipboardCheck,
  MessageSquare, 
  Bell, 
  User as UserIcon,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Import all 10 Teacher Modules
import { TeacherOverview } from '../teacher/TeacherOverview';
import { TeacherExams } from '../teacher/TeacherExams';
import { TeacherAIGenerator } from '../teacher/TeacherAIGenerator';
import { TeacherAnalytics } from '../teacher/TeacherAnalytics';
import { TeacherAttendance } from '../teacher/TeacherAttendance';
import { TeacherHomework } from '../teacher/TeacherHomework';
import { TeacherReviews } from '../teacher/TeacherReviews';
import { TeacherCommunication } from '../teacher/TeacherCommunication';
import { TeacherNotifications } from '../teacher/TeacherNotifications';
import { TeacherProfile } from '../teacher/TeacherProfile';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NAVIGATION_TABS = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'exams', label: 'Exam Management', icon: <FileText size={20} /> },
    { id: 'generate', label: 'AI Test Generator', icon: <BrainCircuit size={20} /> },
    { id: 'analytics', label: 'Student Performance', icon: <TrendingUp size={20} /> },
    { id: 'reviews', label: 'Pending Reviews', icon: <ClipboardCheck size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
    { id: 'homework', label: 'Homework', icon: <BookOpen size={20} /> },
    { id: 'communication', label: 'Communication Center', icon: <MessageSquare size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'profile', label: 'Teacher Profile', icon: <UserIcon size={20} /> }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <TeacherOverview user={user} onTabChange={setActiveTab} />;
      case 'exams': return <TeacherExams onTabChange={setActiveTab} />;
      case 'generate': return <TeacherAIGenerator onTabChange={setActiveTab} />;
      case 'analytics': return <TeacherAnalytics />;
      case 'reviews': return <TeacherReviews />;
      case 'attendance': return <TeacherAttendance />;
      case 'homework': return <TeacherHomework />;
      case 'communication': return <TeacherCommunication />;
      case 'notifications': return <TeacherNotifications />;
      case 'profile': return <TeacherProfile user={user} />;
      default: return <TeacherOverview user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 font-sans`}>
      
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col shadow-2xl lg:shadow-none"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
                  E
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">EduTrack</h2>
                  <p className="text-[10px] font-bold text-[#0EA5A4] uppercase tracking-widest">Enterprise Teacher</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
              {NAVIGATION_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#0EA5A4]/10 to-transparent dark:from-[#0EA5A4]/20 text-[#0EA5A4] font-bold shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#334155]/40 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-[#0EA5A4]' : 'opacity-70'}`}>
                        {tab.icon}
                      </div>
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-[#0EA5A4]" />}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-bold transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm">Secure Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[76px] shrink-0 bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4] hover:border-[#0EA5A4]/30 rounded-xl transition-all shadow-sm"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                {NAVIGATION_TABS.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors"
              title="Home"
            >
              <Home size={20} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors hidden sm:block"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-slate-100 dark:border-slate-800"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 p-1.5 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#0EA5A4]/30 rounded-2xl transition-all shadow-sm group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:shadow-[#0EA5A4]/40 transition-all overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'T'
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Teacher</p>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
