import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, CheckCircle2, DollarSign, Activity, BookOpen, 
  AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Clock, UserCheck,
  Plus, Calendar as CalendarIcon, Send, Download, CreditCard
} from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse p-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-32 w-full"></div>
        ))}
      </div>
    );
  }

  // 12 Cards configuration mapping
  const statCards = [
    { key: 'total_students', label: 'Total Students', icon: <Users size={22} />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { key: 'total_teachers', label: 'Total Teachers', icon: <BookOpen size={22} />, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
    { key: 'total_parents', label: 'Total Parents', icon: <Users size={22} />, color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
    { key: 'total_staff', label: 'Total Staff', icon: <ShieldCheck size={22} />, color: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20' },
    { key: 'total_classes', label: 'Total Classes', icon: <Activity size={22} />, color: 'from-[#0EA5A4] to-[#14B8A6]', shadow: 'shadow-[#0EA5A4]/20' },
    { key: 'active_courses', label: 'Active Courses', icon: <BookOpen size={22} />, color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
    { key: 'active_exams', label: 'Active Exams', icon: <FileText size={22} />, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
    { key: 'attendance_rate', label: 'Attendance Rate', icon: <CheckCircle2 size={22} />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { key: 'pending_approvals', label: 'Pending Approvals', icon: <AlertTriangle size={22} />, color: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-500/20' },
    { key: 'monthly_revenue', label: 'Monthly Revenue', icon: <DollarSign size={22} />, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20', isCurrency: true },
    { key: 'total_revenue', label: 'Total Revenue', icon: <DollarSign size={22} />, color: 'from-emerald-600 to-teal-700', shadow: 'shadow-teal-500/20', isCurrency: true },
    { key: 'active_users', label: 'Active Users', icon: <UserCheck size={22} />, color: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/20' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 flex flex-col pb-6">
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Institution Overview</h2>
        <div className="flex gap-2">
          <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 cursor-pointer shadow-sm">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* 12 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 shrink-0">
        {statCards.map((stat, i) => {
          const data = stats?.[stat.key];
          const value = data?.value || 0;
          const displayValue = stat.isCurrency ? `$${value.toLocaleString()}` : value;
          const trend = data?.trend || 'neutral';
          
          return (
            <motion.div variants={itemVariants} key={i} className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative`}>
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500 ease-out blur-xl`}></div>
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                  {stat.icon}
                </div>
                
                {data?.growth && (
                  <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                    trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 
                    trend === 'down' ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10' : 
                    'text-slate-500 bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {trend === 'up' && <TrendingUp size={10} />}
                    {trend === 'down' && <TrendingDown size={10} />}
                    {data.growth}
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 relative z-10">{displayValue}</h3>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider relative z-10">{stat.label}</p>
                {data?.comparison && (
                  <span className="text-[9px] text-slate-400 font-medium">{data.comparison}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="text-[#0EA5A4]" size={20} /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Student</span>
            </button>
            <button className="p-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><BookOpen size={18} /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Create Class</span>
            </button>
            <button className="p-3 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><CalendarIcon size={18} /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Schedule Exam</span>
            </button>
            <button className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><CreditCard size={18} /></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Collect Fee</span>
            </button>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-purple-500" size={20} /> Upcoming Events
            </h3>
            <button className="text-xs font-bold text-[#0EA5A4] hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { title: "Mid-Term Exams Begin", date: "Oct 15, 2026", type: "Exam", color: "bg-rose-500" },
              { title: "Parent-Teacher Meeting", date: "Oct 20, 2026", type: "Meeting", color: "bg-blue-500" },
              { title: "National Science Day", date: "Nov 02, 2026", type: "Holiday", color: "bg-emerald-500" }
            ].map((event, i) => (
              <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent dark:border-slate-700/50">
                <div className={`w-2 h-10 rounded-full ${event.color}`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{event.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{event.date}</p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {event.type}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities Feed */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> Recent Activities
            </h3>
          </div>
          <div className="space-y-5 flex-1 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
            {[
              { action: "New Student Registration", user: "Admin", time: "10 mins ago", icon: <Users size={12} />, color: "bg-blue-500" },
              { action: "Fee Payment Received", user: "John Doe (Parent)", time: "1 hour ago", icon: <DollarSign size={12} />, color: "bg-emerald-500" },
              { action: "Math Test Created", user: "Sarah Smith", time: "3 hours ago", icon: <FileText size={12} />, color: "bg-orange-500" },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${act.color} ring-4 ring-white dark:ring-slate-800`}>
                  {act.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{act.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">by {act.user} • {act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
