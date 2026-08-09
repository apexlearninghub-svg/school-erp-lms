import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LogOut, User, Settings, Bell, Menu, X,
  Shield, BookOpen, GraduationCap, Users,
  ChevronDown, Moon, Sun, Activity,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { SearchInput } from '@/components/ui/SearchInput';
import { Avatar } from '@/components/ui/Avatar';
import type { UserRole } from '@/types';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badgeBg: string; badgeText: string }> = {
  admin:   { label: 'Admin',   icon: <Shield className="w-3.5 h-3.5" />,       badgeBg: 'bg-[#ebdafd]',              badgeText: 'text-[#862fe7]' },
  teacher: { label: 'Teacher', icon: <BookOpen className="w-3.5 h-3.5" />,     badgeBg: 'bg-[#dbeafe]',              badgeText: 'text-[#2563eb]' },
  student: { label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5" />,badgeBg: 'bg-[#dcfce7]',              badgeText: 'text-[#16a34a]' },
  parent:  { label: 'Parent',  icon: <Users className="w-3.5 h-3.5" />,        badgeBg: 'bg-[#fff7ed]',              badgeText: 'text-[#c2410c]' },
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
  const [search, setSearch] = useState('');

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
    <div className={`min-h-screen flex ${isDark ? 'bg-[#0F172A]' : 'bg-[#f1f5f9]'}`}>
      {/* Mobile Sidebar Overlay */}
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

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={`fixed top-0 left-0 h-full w-72 z-40 lg:hidden ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#d8e0ea]'} border-r flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-[#334155]' : 'border-[#d8e0ea]'}`}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Apex Learning Hub" className="w-8 h-8 rounded-[12px] object-contain shrink-0" />
            <span className="font-semibold text-[#111827] dark:text-white text-sm">Apex Learning Hub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] transition-colors"
          >
            <X className="w-4 h-4 text-[#6b7589]" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${rc.badgeBg} ${rc.badgeText}`}>
            {rc.icon}
            {rc.label} Portal
          </div>
        </div>

        {/* Nav placeholder — actual nav is in each dashboard */}
        <div className="flex-1 px-4 overflow-y-auto">
          <p className="text-xs text-[#6b7589] dark:text-[#94A3B8] px-2">
            Use the sidebar in the dashboard to navigate.
          </p>
        </div>

        {/* Logout */}
        <div className={`p-4 border-t ${isDark ? 'border-[#334155]' : 'border-[#d8e0ea]'}`}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* ── Sticky Top Bar ── */}
        <header
          className={`sticky top-0 z-20 h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4 border-b backdrop-blur-xl ${
            isDark
              ? 'bg-[#1E293B]/90 border-[#334155]'
              : 'bg-white/90 border-[#d8e0ea]'
          }`}
        >
          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[10px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5 text-[#6b7589] dark:text-[#94A3B8]" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
            <img src="/logo.png" alt="Apex Learning Hub" className="w-8 h-8 rounded-[12px] object-contain shrink-0" />
            <span className="font-semibold text-[#111827] dark:text-white hidden sm:block text-sm">
              Apex Learning Hub
            </span>
          </Link>

          {/* Role Badge */}
          <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${rc.badgeBg} ${rc.badgeText}`}>
            {rc.icon}
            {rc.label}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchInput
              placeholder="Search portal..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`p-2 rounded-[10px] border transition-all ${
              isDark
                ? 'bg-[#1E293B] border-[#334155] hover:border-[#862fe7]'
                : 'bg-white border-[#d8e0ea] hover:border-[#862fe7]'
            }`}
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-[#6b7589]" />
            }
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-[10px] border relative transition-all ${
              isDark
                ? 'bg-[#1E293B] border-[#334155] hover:border-[#862fe7]'
                : 'bg-white border-[#d8e0ea] hover:border-[#862fe7]'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#6b7589] dark:text-[#94A3B8]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#862fe7] rounded-full" />
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-[12px] border transition-all ${
                isDark
                  ? 'bg-[#1E293B] border-[#334155] hover:border-[#862fe7]'
                  : 'bg-white border-[#d8e0ea] hover:border-[#862fe7]'
              }`}
            >
              <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-[#111827] dark:text-white leading-tight">
                  {user?.full_name}
                </div>
                <div className="text-[10px] text-[#6b7589] dark:text-[#94A3B8]">
                  @{user?.username}
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-full mt-2 w-56 rounded-[20px] border shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden z-50 ${
                    isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#d8e0ea]'
                  }`}
                >
                  {/* User Info */}
                  <div className={`p-4 border-b ${isDark ? 'border-[#334155]' : 'border-[#d8e0ea]'}`}>
                    <div className="flex items-center gap-3">
                      <Avatar src={user?.avatar} name={user?.full_name} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-[#111827] dark:text-white">{user?.full_name}</p>
                        <p className="text-xs text-[#6b7589] dark:text-[#94A3B8]">{user?.email}</p>
                        {user?.is_verified && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#16a34a] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    {[
                      { icon: <User className="w-4 h-4" />, label: 'Profile' },
                      { icon: <Activity className="w-4 h-4" />, label: 'Activity' },
                      { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
                    ].map(item => (
                      <button
                        key={item.label}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#3f4654] dark:text-[#F1F5F9] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] rounded-[10px] transition-colors"
                      >
                        <span className="text-[#6b7589] dark:text-[#94A3B8]">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    <div className={`my-1.5 border-t ${isDark ? 'border-[#334155]' : 'border-[#d8e0ea]'}`} />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-[10px] transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#111827] dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] mt-1">{subtitle}</p>
              )}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
