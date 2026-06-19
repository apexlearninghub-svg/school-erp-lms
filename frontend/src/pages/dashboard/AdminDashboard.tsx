import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, GraduationCap, FileText, 
  DollarSign, MessageSquare, BarChart3, Settings,
  LogOut, Sun, Moon, Menu, X, CheckCircle2, ChevronRight, Home,
  Search, Bell, Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import all Admin Modules
import { AdminOverview } from '../admin/AdminOverview';
import { AdminUsers } from '../admin/AdminUsers';
import { AdminAcademics } from '../admin/AdminAcademics';
import { AdminExams } from '../admin/AdminExams';
import { AdminFinance } from '../admin/AdminFinance';
import { AdminCommunication } from '../admin/AdminCommunication';
import { AdminReports } from '../admin/AdminReports';
import { AdminSystem } from '../admin/AdminSystem';
import { AdminProfile } from '../admin/AdminProfile';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
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
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const NAVIGATION_TABS = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'academics', label: 'Academic Management', icon: <GraduationCap size={20} /> },
    { id: 'exams', label: 'Exam Management', icon: <FileText size={20} /> },
    { id: 'finance', label: 'Finance & Fees', icon: <DollarSign size={20} /> },
    { id: 'communication', label: 'Communication Center', icon: <MessageSquare size={20} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
    { id: 'system', label: 'System Monitoring', icon: <Settings size={20} /> }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'academics': return <AdminAcademics />;
      case 'exams': return <AdminExams />;
      case 'finance': return <AdminFinance />;
      case 'communication': return <AdminCommunication />;
      case 'reports': return <AdminReports />;
      case 'system': return <AdminSystem />;
      case 'profile': return <AdminProfile user={user} />;
      default: return <AdminOverview />;
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden pointer-events-auto"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <motion.aside 
        className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-xl lg:shadow-none z-50 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#0EA5A4] p-2.5 rounded-xl shadow-lg shadow-[#0EA5A4]/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Edu<span className="text-[#0EA5A4]">Core</span></h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-4 first:mt-0">Main Menu</p>
            {NAVIGATION_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 group relative ${
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
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="relative">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=0EA5A4&color=fff`} alt={user.full_name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <div className="text-left flex-1 overflow-hidden">
              <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{user.full_name}</p>
              <p className="text-xs text-[#0EA5A4] font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen w-full lg:w-[calc(100%-280px)] relative z-10 pointer-events-auto">
        
        {/* Top Header Area */}
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                Hello, Admin <span className="animate-wave inline-block origin-bottom-right">👋</span>
              </h1>
              <div className="flex items-center text-xs font-bold text-slate-500 mt-0.5 gap-2">
                <span>Dashboard</span>
                <ChevronRight size={12} />
                <span className="text-[#0EA5A4]">{currentTabLabel}</span>
              </div>
            </div>
            
            {/* Global Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md ml-8 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0EA5A4] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search students, staff, reports..." 
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0EA5A4]/20 outline-none text-slate-700 dark:text-slate-300 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">Ctrl K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Date & Time */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 text-xs font-bold mr-2">
              <Calendar size={14} className="text-[#0EA5A4]" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsMessagesOpen(false); }}
                className="relative p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A4] rounded-xl transition-colors shadow-inner group"
              >
                <Bell size={20} className="group-hover:animate-swing" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-100 dark:border-slate-900 rounded-full animate-pulse"></span>
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                      <button className="text-xs font-bold text-[#0EA5A4] hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">New Student Registration</p>
                            <p className="text-xs text-slate-500 mt-0.5">John Doe completed admission.</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">10 MINS AGO</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                            <DollarSign size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Fee Payment Received</p>
                            <p className="text-xs text-slate-500 mt-0.5">$500 received for Class 10.</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold">1 HOUR AGO</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <span className="text-xs font-bold text-[#0EA5A4]">View All Notifications</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Center */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => { setIsMessagesOpen(!isMessagesOpen); setIsNotificationsOpen(false); }}
                className="relative p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A4] rounded-xl transition-colors shadow-inner"
              >
                <MessageSquare size={20} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">3</span>
              </button>
              
              <AnimatePresence>
                {isMessagesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <h3 className="font-bold text-slate-800 dark:text-white">Messages</h3>
                      <button className="text-xs font-bold text-[#0EA5A4] hover:underline">New Message</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <img src="https://ui-avatars.com/api/?name=Sarah+Smith&background=0EA5A4&color=fff" className="w-10 h-10 rounded-full shrink-0" alt="Sarah" />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-slate-800 dark:text-white">Sarah Smith</p>
                              <p className="text-[10px] text-slate-400 font-bold">10:45 AM</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">Can we schedule a meeting for tomorrow?</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <img src="https://ui-avatars.com/api/?name=Michael+Brown&background=f59e0b&color=fff" className="w-10 h-10 rounded-full shrink-0" alt="Michael" />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-slate-800 dark:text-white">Michael Brown</p>
                              <p className="text-[10px] text-slate-400 font-bold">YESTERDAY</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">The curriculum looks great.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <span className="text-xs font-bold text-[#0EA5A4]">Open Message Center</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Home / Mode / Logout */}
            <button 
              onClick={() => navigate('/')}
              className="hidden sm:block p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A4] dark:hover:text-[#0EA5A4] rounded-xl transition-colors shadow-inner"
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
