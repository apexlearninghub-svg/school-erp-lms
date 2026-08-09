import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, BrainCircuit, TrendingUp,
  CalendarCheck, BookOpen, ClipboardCheck, MessageSquare,
  Bell, User as UserIcon, LogOut, ChevronRight, Menu, X,
  Moon, Sun, Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

import { TeacherOverview } from '../teacher/TeacherOverview';
import { TeacherExams } from '../teacher/TeacherExams';
import { TeacherAIGenerator } from '../teacher/TeacherAIGenerator';
import { TeacherAnalytics } from '../teacher/TeacherAnalytics';
import { TeacherReviews } from '../teacher/TeacherReviews';
import { TeacherAttendance } from '../teacher/TeacherAttendance';
import { TeacherHomework } from '../teacher/TeacherHomework';
import { TeacherCommunication } from '../teacher/TeacherCommunication';
import { TeacherNotifications } from '../teacher/TeacherNotifications';
import { TeacherProfile } from '../teacher/TeacherProfile';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview',      label: 'Dashboard',          icon: LayoutDashboard },
      { id: 'exams',         label: 'Exam Management',    icon: FileText },
      { id: 'generate',      label: 'AI Test Generator',  icon: BrainCircuit },
      { id: 'analytics',     label: 'Student Performance',icon: TrendingUp },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { id: 'reviews',       label: 'Pending Reviews',    icon: ClipboardCheck },
      { id: 'attendance',    label: 'Attendance',         icon: CalendarCheck },
      { id: 'homework',      label: 'Homework',           icon: BookOpen },
      { id: 'communication', label: 'Communication',      icon: MessageSquare },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'notifications', label: 'Notifications',      icon: Bell },
      { id: 'profile',       label: 'My Profile',         icon: UserIcon },
    ],
  },
];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (!user || user.role !== 'teacher') navigate('/login');
  }, [user, navigate]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <TeacherOverview user={user} onTabChange={setActiveTab} />;
      case 'exams':         return <TeacherExams onTabChange={setActiveTab} />;
      case 'generate':      return <TeacherAIGenerator onTabChange={setActiveTab} />;
      case 'analytics':     return <TeacherAnalytics />;
      case 'reviews':       return <TeacherReviews />;
      case 'attendance':    return <TeacherAttendance />;
      case 'homework':      return <TeacherHomework />;
      case 'communication': return <TeacherCommunication />;
      case 'notifications': return <TeacherNotifications />;
      case 'profile':       return <TeacherProfile user={user} />;
      default:              return <TeacherOverview user={user} onTabChange={setActiveTab} />;
    }
  };

  const currentLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Profile';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#d8e0ea] dark:border-[#334155] shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Apex Learning Hub" className="w-9 h-9 rounded-[12px] object-contain shrink-0 bg-white" />
          <div>
            <h2 className="text-sm font-bold text-[#111827] dark:text-white leading-none">Apex Learning Hub</h2>
            <p className="text-[10px] text-[#2563eb] font-semibold uppercase tracking-widest mt-0.5">Teacher Portal</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589]">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold text-[#6b7589] uppercase tracking-widest mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#dbeafe] text-[#2563eb] dark:bg-[rgba(37,99,235,0.18)] dark:text-[#60a5fa]'
                        : 'text-[#6b7589] dark:text-[#94A3B8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] hover:text-[#111827] dark:hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon size={18} className={isActive ? '' : 'text-[#6b7589] dark:text-[#94A3B8]'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#d8e0ea] dark:border-[#334155] space-y-1 shrink-0">
        <button
          onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
        >
          <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-[#6b7589] dark:text-[#94A3B8]">Teacher</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0F172A] flex transition-colors duration-200 font-sans">

      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        {isDesktopSidebarOpen && (
          <motion.aside
            key="desktop"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="hidden lg:flex flex-col shrink-0 bg-white dark:bg-[#1E293B] border-r border-[#d8e0ea] dark:border-[#334155] overflow-hidden h-screen sticky top-0"
          >
            <div className="w-[272px]">{sidebarContent}</div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              key="mobile"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-[272px] z-50 lg:hidden bg-white dark:bg-[#1E293B] border-r border-[#d8e0ea] dark:border-[#334155] shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 shrink-0 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl border-b border-[#d8e0ea] dark:border-[#334155] flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30">
          <button
            onClick={() => window.innerWidth >= 1024 ? setIsDesktopSidebarOpen(v => !v) : setIsSidebarOpen(true)}
            className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className="text-[#6b7589] font-medium">Teacher</span>
            <ChevronRight size={14} className="text-[#d8e0ea]" />
            <span className="text-[#111827] dark:text-white font-semibold">{currentLabel}</span>
          </div>
          <div className="flex-1" />
          <button onClick={() => navigate('/')} className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors" title="Home">
            <Home size={18} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors">
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#862fe7] rounded-full" />
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-[12px] border border-[#d8e0ea] dark:border-[#334155] hover:border-[#2563eb] bg-white dark:bg-[#1E293B] transition-all"
          >
            <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#111827] dark:text-white leading-none">{user?.full_name}</p>
              <p className="text-[10px] text-[#6b7589] mt-0.5">Teacher</p>
            </div>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
