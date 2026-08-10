import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, FileText,
  DollarSign, MessageSquare, BarChart3, Settings,
  LogOut, Sun, Moon, Menu, X, ChevronRight,
  Search, Bell, Calendar, User as UserIcon, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';

import { AdminOverview } from '../admin/AdminOverview';
import { AdminUsers } from '../admin/AdminUsers';
import { AdminAcademics } from '../admin/AdminAcademics';
import { AdminExams } from '../admin/AdminExams';
import { AdminFinance } from '../admin/AdminFinance';
import { AdminCommunication } from '../admin/AdminCommunication';
import { AdminReports } from '../admin/AdminReports';
import { AdminSystem } from '../admin/AdminSystem';
import { AdminProfile } from '../admin/AdminProfile';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { id: 'overview',      label: 'Dashboard',         icon: LayoutDashboard },
      { id: 'users',         label: 'User Management',   icon: Users },
      { id: 'academics',     label: 'Academics',         icon: GraduationCap },
      { id: 'exams',         label: 'Exam Management',   icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'finance',       label: 'Finance & Fees',    icon: DollarSign },
      { id: 'communication', label: 'Communication',     icon: MessageSquare },
      { id: 'reports',       label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'system',        label: 'System Monitor',    icon: Settings },
    ],
  },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login');
  }, [user, navigate]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentTab = NAV_GROUPS.flatMap(g => g.items).find(t => t.id === activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <AdminOverview />;
      case 'users':         return <AdminUsers />;
      case 'academics':     return <AdminAcademics />;
      case 'exams':         return <AdminExams />;
      case 'finance':       return <AdminFinance />;
      case 'communication': return <AdminCommunication />;
      case 'reports':       return <AdminReports />;
      case 'system':        return <AdminSystem />;
      case 'profile':       return <AdminProfile user={user} />;
      default:              return <AdminOverview />;
    }
  };

  if (!user) return null;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center justify-between shrink-0 border-b border-[#d8e0ea] dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Apex Learning Hub" className="w-9 h-9 rounded-[12px] object-contain shrink-0 bg-white" />
          <div>
            <h2 className="text-sm font-bold text-[#111827] dark:text-white leading-none">Apex Learning Hub</h2>
            <p className="text-[10px] text-[#862fe7] font-semibold uppercase tracking-widest mt-0.5">Admin Portal</p>
          </div>
        </div>
        <button
          onClick={() => { setIsSidebarOpen(false); }}
          className="lg:hidden p-1.5 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold text-[#6b7589] uppercase tracking-widest mb-2">
              {group.label}
            </p>
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
                        ? 'bg-[#ebdafd] text-[#862fe7] dark:bg-[rgba(134,47,231,0.18)] dark:text-[#ad6df4]'
                        : 'text-[#6b7589] dark:text-[#94A3B8] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] hover:text-[#111827] dark:hover:text-white',
                    ].join(' ')}
                  >
                    <item.icon
                      size={18}
                      className={isActive ? 'text-[#862fe7] dark:text-[#ad6df4]' : 'text-[#6b7589] dark:text-[#94A3B8]'}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-[#862fe7] dark:text-[#ad6df4] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Footer */}
      <div className="px-4 py-4 border-t border-[#d8e0ea] dark:border-[#334155] space-y-1 shrink-0">
        <button
          onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
        >
          <Avatar src={user.avatar} name={user.full_name} size="sm" />
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{user.full_name}</p>
            <p className="text-xs text-[#6b7589] dark:text-[#94A3B8]">Super Admin</p>
          </div>
          <UserIcon size={14} className="text-[#6b7589] shrink-0" />
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0F172A] flex transition-colors duration-200 font-sans">

      {/* ── Desktop Sidebar ── */}
      <AnimatePresence initial={false}>
        {isDesktopSidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
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

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-[272px] z-50 lg:hidden bg-white dark:bg-[#1E293B] border-r border-[#d8e0ea] dark:border-[#334155] shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">

        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl border-b border-[#d8e0ea] dark:border-[#334155] flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30">

          {/* Sidebar toggle */}
          <button
            onClick={() => window.innerWidth >= 1024 ? setIsDesktopSidebarOpen(v => !v) : setIsSidebarOpen(true)}
            className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            <span className="text-[#6b7589] dark:text-[#94A3B8] font-medium">Admin</span>
            <ChevronRight size={14} className="text-[#d8e0ea] dark:text-[#334155]" />
            <span className="text-[#111827] dark:text-white font-semibold">
              {currentTab?.label || 'Profile'}
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-sm ml-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7589]" />
              <input
                type="text"
                placeholder="Search students, staff, reports..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-[12px] bg-[#f1f5f9] dark:bg-[#0F172A] border border-transparent focus:border-[#862fe7] focus:ring-2 focus:ring-[rgba(134,47,231,0.15)] outline-none text-[#111827] dark:text-white placeholder-[#6b7589] transition-all"
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Date */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-[#6b7589] dark:text-[#94A3B8] bg-[#f1f5f9] dark:bg-[#0F172A] px-3 py-1.5 rounded-[10px]">
            <Calendar size={13} className="text-[#862fe7]" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(v => !v)}
              className="relative p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] dark:text-[#94A3B8] transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#862fe7] rounded-full" />
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-[20px] border border-[#d8e0ea] dark:border-[#334155] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-[#f1f5f9] dark:border-[#334155] flex justify-between items-center">
                    <h3 className="font-semibold text-[#111827] dark:text-white text-sm">Notifications</h3>
                    <button className="text-xs font-medium text-[#862fe7] hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#f1f5f9] dark:divide-[#334155]">
                    {[
                      { icon: <Users size={14} />, bg: 'bg-[#dbeafe] text-[#2563eb]', title: 'New Student Registration', desc: 'A student completed admission.', time: '10 mins ago' },
                      { icon: <DollarSign size={14} />, bg: 'bg-[#dcfce7] text-[#16a34a]', title: 'Fee Payment Received', desc: 'Payment received for Class 10.', time: '1 hour ago' },
                    ].map((n, i) => (
                      <div key={i} className="p-4 hover:bg-[#f1f5f9] dark:hover:bg-[#334155]/50 transition-colors cursor-pointer flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>{n.icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-[#111827] dark:text-white">{n.title}</p>
                          <p className="text-xs text-[#6b7589] mt-0.5">{n.desc}</p>
                          <p className="text-[10px] text-[#6b7589] mt-1 font-medium uppercase tracking-wide">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[#f1f5f9] dark:border-[#334155] text-center">
                    <span className="text-xs font-semibold text-[#862fe7] cursor-pointer hover:underline">View all notifications</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark Mode */}
          <button
            onClick={() => setIsDarkMode(v => !v)}
            className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] text-[#6b7589] dark:text-[#94A3B8] transition-colors"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          {/* Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-[12px] border border-[#d8e0ea] dark:border-[#334155] hover:border-[#862fe7] bg-white dark:bg-[#1E293B] transition-all"
          >
            <Avatar src={user.avatar} name={user.full_name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#111827] dark:text-white leading-none">{user.full_name}</p>
              <p className="text-[10px] text-[#6b7589] dark:text-[#94A3B8] mt-0.5">Admin</p>
            </div>
          </button>
        </header>

        {/* Content */}
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
