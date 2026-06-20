import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LogOut, User, Settings, Bell, Menu, X,
  Shield, BookOpen, GraduationCap, Users,
  ChevronDown, Moon, Sun, Activity, Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  admin: { label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
  teacher: { label: 'Teacher', icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
  student: { label: 'Student', icon: <GraduationCap className="w-4 h-4" />, color: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
  parent: { label: 'Parent', icon: <Users className="w-4 h-4" />, color: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const role = user?.role as UserRole;
  const rc = roleConfig[role] || roleConfig.student;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-full w-72 z-40 lg:hidden ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'} border-r flex flex-col shadow-2xl`}
      >
        <div className="p-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-8 h-8 rounded-xl object-contain shrink-0" />
            <span className="font-bold text-[#0F172A] dark:text-white">Apex Learning Hub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155]">
            <X className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
          </button>
        </div>
        <div className="flex-1 p-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 bg-gradient-to-r ${rc.gradient} bg-opacity-10`}>
            <div className={`bg-gradient-to-r ${rc.gradient} p-1.5 rounded-lg text-white`}>{rc.icon}</div>
            <span className={`text-sm font-semibold bg-gradient-to-r ${rc.gradient} bg-clip-text text-transparent`}>{rc.label} Panel</span>
          </div>
        </div>
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155]">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-20 ${isDark ? 'bg-[#1E293B]/90 border-[#334155]' : 'bg-white/90 border-[#E2E8F0]'} border-b backdrop-blur-xl`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            {/* Mobile menu */}
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#334155] lg:hidden">
              <Menu className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-8 h-8 rounded-xl object-contain shrink-0" />
              <span className="font-bold text-[#0F172A] dark:text-white hidden sm:block">Apex Learning Hub</span>
            </Link>

            {/* Role Badge */}
            <div className={`ml-2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${rc.gradient} text-white`}>
              {rc.icon}
              {rc.label}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Global Search */}
              <div className="hidden md:flex relative mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search across portal..." 
                  className={`pl-9 pr-4 py-1.5 text-sm rounded-full border transition-colors outline-none focus:ring-2 focus:ring-[#0EA5A4] w-64 ${isDark ? 'bg-[#0F172A] border-[#334155] text-white focus:bg-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0] focus:bg-white'}`}
                />
              </div>

              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-[#1E293B] border-[#334155] hover:border-[#0EA5A4]' : 'bg-white border-[#E2E8F0] hover:border-[#0EA5A4]'}`}
              >
                {isDark ? <Sun className="w-4 h-4 text-[#F59E0B]" /> : <Moon className="w-4 h-4 text-[#64748B]" />}
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl border relative transition-all ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}
              >
                <Bell className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
              </motion.button>

              {/* Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${isDark ? 'bg-[#1E293B] border-[#334155] hover:border-[#0EA5A4]' : 'bg-white border-[#E2E8F0] hover:border-[#0EA5A4]'}`}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.full_name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0EA5A4, #14B8A6)' }}>
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white leading-tight">{user?.full_name}</div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">@{user?.username}</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-50 ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E2E8F0]'}`}
                    >
                      <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                        <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{user?.full_name}</p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{user?.email}</p>
                        {user?.is_verified && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#22C55E] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Verified
                          </span>
                        )}
                      </div>
                      {[
                        { icon: <User className="w-4 h-4" />, label: 'Profile' },
                        { icon: <Activity className="w-4 h-4" />, label: 'Activity' },
                        { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
                      ].map((item) => (
                        <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors">
                          <span className="text-[#64748B] dark:text-[#94A3B8]">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                      <div className="border-t border-[#E2E8F0] dark:border-[#334155] p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">{title}</h1>
              {subtitle && <p className="text-[#64748B] dark:text-[#94A3B8] mt-1">{subtitle}</p>}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
