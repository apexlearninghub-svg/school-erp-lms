import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, GraduationCap, CalendarDays, 
  BookOpen, DollarSign, MessageSquare, Bot, User,
  LogOut, Sun, Moon, Menu, ChevronRight, Home
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import all Parent Modules
import { ParentOverview } from '../parent/ParentOverview';
import { ParentAcademics } from '../parent/ParentAcademics';
import { ParentAttendance } from '../parent/ParentAttendance';
import { ParentHomework } from '../parent/ParentHomework';
import { ParentFees } from '../parent/ParentFees';
import { ParentCommunication } from '../parent/ParentCommunication';
import { ParentAIAssistant } from '../parent/ParentAIAssistant';
import { ParentProfile } from '../parent/ParentProfile';

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Auth Protection
  useEffect(() => {
    if (!user || user.role !== 'parent') {
      navigate('/login');
    }
  }, [user, navigate]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const NAVIGATION_TABS = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'academics', label: 'Academic Progress', icon: <GraduationCap size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarDays size={20} /> },
    { id: 'homework', label: 'Homework Tracker', icon: <BookOpen size={20} /> },
    { id: 'fees', label: 'Fee Management', icon: <DollarSign size={20} /> },
    { id: 'communication', label: 'Communication Center', icon: <MessageSquare size={20} /> },
    { id: 'ai', label: 'AI Learning Assistant', icon: <Bot size={20} /> }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <ParentOverview onTabChange={setActiveTab} />;
      case 'academics': return <ParentAcademics />;
      case 'attendance': return <ParentAttendance />;
      case 'homework': return <ParentHomework />;
      case 'fees': return <ParentFees />;
      case 'communication': return <ParentCommunication />;
      case 'ai': return <ParentAIAssistant />;
      case 'profile': return <ParentProfile user={user} />;
      default: return <ParentOverview onTabChange={setActiveTab} />;
    }
  };

  const currentTabLabel = NAVIGATION_TABS.find(t => t.id === activeTab)?.label || 'Profile';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans selection:bg-[#0EA5A4] selection:text-white flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-xl lg:shadow-none z-50 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-10 h-10 rounded-xl object-contain shadow-lg shadow-[#0EA5A4]/30 bg-white shrink-0" />
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight leading-tight">
              Apex Learning Hub
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="mb-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Portal</div>
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 group ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#0EA5A4]/10 to-transparent text-[#0EA5A4] dark:from-[#0EA5A4]/20' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className={`${activeTab === tab.id ? 'text-[#0EA5A4]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`}>
                {tab.icon}
              </div>
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeIndicator" className="absolute left-0 w-1 h-8 bg-[#0EA5A4] rounded-r-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => {
              setActiveTab('profile');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className="flex items-center gap-3 p-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.full_name?.charAt(0) || 'P'
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user.full_name}</p>
              <p className="text-xs text-[#0EA5A4] font-bold uppercase tracking-wider">Parent</p>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen w-full lg:w-[calc(100%-280px)]">
        
        {/* Top Header Area */}
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                Hello, Parent <span className="animate-wave inline-block origin-bottom-right">👋</span>
              </h1>
              <div className="flex items-center text-xs font-bold text-slate-500 mt-0.5 gap-2">
                <span>Dashboard</span>
                <ChevronRight size={12} />
                <span className="text-[#0EA5A4]">{currentTabLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors shadow-inner"
              title="Home"
            >
              <Home size={20} />
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors shadow-inner"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={logout}
              className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
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
        </div>

      </main>
    </div>
  );
}
