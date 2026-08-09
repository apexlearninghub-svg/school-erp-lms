import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, CheckCircle2, DollarSign, Activity, BookOpen,
  AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Clock, UserCheck,
  Plus, Calendar as CalendarIcon, CreditCard, Sparkles, ArrowRight,
} from 'lucide-react';
import api from '@/services/api';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then(res => setStats(res.data.kpis))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  const statCards = [
    { key: 'total_students',   label: 'Total Students',    icon: <Users size={18} />,       iconBg: 'bg-[#dbeafe]' },
    { key: 'total_teachers',   label: 'Total Teachers',    icon: <BookOpen size={18} />,    iconBg: 'bg-[#ebdafd]' },
    { key: 'total_parents',    label: 'Total Parents',     icon: <Users size={18} />,       iconBg: 'bg-[#fce7f3]' },
    { key: 'total_staff',      label: 'Total Staff',       icon: <ShieldCheck size={18} />, iconBg: 'bg-[#f1f5f9]' },
    { key: 'total_classes',    label: 'Total Classes',     icon: <Activity size={18} />,    iconBg: 'bg-[#d6fcf4]' },
    { key: 'active_courses',   label: 'Active Courses',    icon: <BookOpen size={18} />,    iconBg: 'bg-[#dbeafe]' },
    { key: 'active_exams',     label: 'Active Exams',      icon: <FileText size={18} />,    iconBg: 'bg-[#fff7ed]' },
    { key: 'attendance_rate',  label: 'Attendance Rate',   icon: <CheckCircle2 size={18} />,iconBg: 'bg-[#dcfce7]' },
    { key: 'pending_approvals',label: 'Pending Approvals', icon: <AlertTriangle size={18} />,iconBg: 'bg-[#fef9c3]' },
    { key: 'monthly_revenue',  label: 'Monthly Revenue',   icon: <DollarSign size={18} />,  iconBg: 'bg-[#dcfce7]', isCurrency: true },
    { key: 'total_revenue',    label: 'Total Revenue',     icon: <DollarSign size={18} />,  iconBg: 'bg-[#d6fcf4]', isCurrency: true },
    { key: 'active_users',     label: 'Active Users',      icon: <UserCheck size={18} />,   iconBg: 'bg-[#ebdafd]' },
  ];

  const quickActions = [
    { label: 'Add Student',    icon: <Plus size={18} />,       bg: 'bg-[#dbeafe]',  text: 'text-[#2563eb]'  },
    { label: 'Create Class',   icon: <BookOpen size={18} />,   bg: 'bg-[#ebdafd]',  text: 'text-[#862fe7]'  },
    { label: 'Schedule Exam',  icon: <CalendarIcon size={18} />,bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]'  },
    { label: 'Collect Fee',    icon: <CreditCard size={18} />, bg: 'bg-[#dcfce7]',  text: 'text-[#16a34a]'  },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] rounded-[24px] p-6">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #862fe7, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 right-24 w-32 h-32 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #ff5fe4, transparent)', transform: 'translateY(40%)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#6b7589] dark:text-[#94A3B8] mb-1">
              {greeting} 👋
            </p>
            <h1 className="text-2xl font-bold text-[#111827] dark:text-white">
              Admin Command Center
            </h1>
            <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ebdafd] dark:bg-[rgba(134,47,231,0.18)] rounded-full">
              <Sparkles size={14} className="text-[#862fe7]" />
              <span className="text-xs font-semibold text-[#862fe7]">AI Insights Active</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Period Filter */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827] dark:text-white">Institution Overview</h2>
        <select className="bg-white dark:bg-[#1E293B] border border-[#d8e0ea] dark:border-[#334155] text-[#3f4654] dark:text-[#94A3B8] text-sm font-medium rounded-[10px] px-3 py-2 outline-none focus:border-[#862fe7] cursor-pointer transition-colors">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const data = stats?.[stat.key];
          const value = data?.value ?? 0;
          const displayValue = stat.isCurrency ? `$${Number(value).toLocaleString()}` : value;
          const trend = data?.trend || 'neutral';

          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <StatCard
                label={stat.label}
                value={displayValue}
                icon={stat.icon}
                iconBg={stat.iconBg}
                trend={trend}
                growth={data?.growth}
                comparison={data?.comparison}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Widget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card title="Quick Actions" icon={<Activity size={18} />}>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-[16px] ${action.bg} hover:opacity-90 transition-all group`}
                >
                  <div className={`w-9 h-9 rounded-[12px] bg-white dark:bg-[#1E293B] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${action.text}`}>
                    {action.icon}
                  </div>
                  <span className={`text-xs font-semibold ${action.text}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants}>
          <Card
            title="Upcoming Events"
            icon={<CalendarIcon size={18} />}
            action={
              <button className="text-xs font-semibold text-[#862fe7] hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </button>
            }
          >
            <div className="space-y-3 mt-2">
              {[
                { title: 'Mid-Term Exams Begin', date: 'Oct 15, 2026', type: 'Exam',    color: 'bg-[#862fe7]' },
                { title: 'Parent-Teacher Meet',  date: 'Oct 20, 2026', type: 'Meeting', color: 'bg-[#2563eb]' },
                { title: 'National Science Day', date: 'Nov 02, 2026', type: 'Holiday', color: 'bg-[#16a34a]' },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]/60 transition-colors cursor-pointer group">
                  <div className={`w-1.5 h-10 rounded-full ${event.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] dark:text-white truncate">{event.title}</p>
                    <p className="text-xs text-[#6b7589] dark:text-[#94A3B8] mt-0.5">{event.date}</p>
                  </div>
                  <Badge variant="neutral" className="text-[10px] shrink-0">{event.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card title="Recent Activity" icon={<Clock size={18} />}>
            <div className="relative mt-2">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-[#f1f5f9] dark:bg-[#334155]" />
              <div className="space-y-5">
                {[
                  { action: 'New Student Registration', user: 'Admin',             time: '10 mins ago', icon: <Users size={11} />,       color: 'bg-[#dbeafe] text-[#2563eb]' },
                  { action: 'Fee Payment Received',     user: 'John Doe (Parent)', time: '1 hour ago',  icon: <DollarSign size={11} />,  color: 'bg-[#dcfce7] text-[#16a34a]' },
                  { action: 'Math Test Created',        user: 'Sarah Smith',       time: '3 hours ago', icon: <FileText size={11} />,    color: 'bg-[#fff7ed] text-[#c2410c]' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-4 ring-white dark:ring-[#1E293B] ${act.color}`}>
                      {act.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827] dark:text-white leading-tight">{act.action}</p>
                      <p className="text-xs text-[#6b7589] dark:text-[#94A3B8] mt-0.5">by {act.user} · {act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
