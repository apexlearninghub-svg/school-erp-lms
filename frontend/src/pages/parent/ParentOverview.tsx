import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle2, AlertCircle, FileText, BarChart3, Clock, DollarSign, Calendar } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentOverview({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/parent/dashboard-stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const statCards = [
    { label: 'Attendance %', value: `${stats?.attendance_percentage || 0}%`, icon: <CheckCircle2 size={24} />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Average Score', value: `${stats?.average_score || 0}%`, icon: <BarChart3 size={24} />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { label: 'Pending Homework', value: stats?.pending_homework || 0, icon: <Clock size={24} />, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
    { label: 'Upcoming Exams', value: stats?.upcoming_exams || 0, icon: <Calendar size={24} />, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
    { label: 'Class Rank', value: stats?.class_rank || 'N/A', icon: <FileText size={24} />, color: 'from-[#0EA5A4] to-[#14B8A6]', shadow: 'shadow-[#0EA5A4]/20' },
    { label: 'Fee Status', value: stats?.fee_status || 'Checking', icon: <DollarSign size={24} />, color: stats?.fee_status === 'Paid' ? 'from-emerald-500 to-green-500' : 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
        {statCards.map((stat, i) => (
          <motion.div variants={itemVariants} key={i} className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative`}>
            <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out blur-xl`}></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-0.5 relative z-10">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider relative z-10 truncate">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Card: Student Overview */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
              <User size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Student Overview</h3>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-3xl font-black text-[#0EA5A4] mb-3">
              {stats?.child_name?.charAt(0) || 'S'}
            </div>
            <h4 className="font-black text-xl text-slate-800 dark:text-white">{stats?.child_name || 'Loading...'}</h4>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold mt-2">
              {stats?.child_class || 'Class'}
            </span>
          </div>
          
          <div className="space-y-3 flex-1 w-full">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <span className="text-sm font-bold text-slate-500">Roll Number</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">{stats?.child_roll || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <span className="text-sm font-bold text-slate-500">School</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">Demo High School</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <span className="text-sm font-bold text-slate-500">Session</span>
              <span className="text-sm font-black text-[#0EA5A4]">2023-2024</span>
            </div>
          </div>
          
          <button onClick={() => onTabChange('academics')} className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
            View Academic Progress
          </button>
        </motion.div>

        {/* Right Card: Academic Performance & Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quick Actions & Alerts</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Check Homework', icon: <Clock size={18} />, color: 'bg-purple-50 text-purple-600', tab: 'homework' },
              { title: 'Pay Fees', icon: <DollarSign size={18} />, color: 'bg-emerald-50 text-emerald-600', tab: 'fees' },
              { title: 'Message Teacher', icon: <User size={18} />, color: 'bg-blue-50 text-blue-600', tab: 'communication' },
              { title: 'AI Assistant', icon: <AlertCircle size={18} />, color: 'bg-rose-50 text-rose-600', tab: 'ai' }
            ].map((action, i) => (
              <div key={i} onClick={() => onTabChange(action.tab)} className="cursor-pointer group flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#0EA5A4]/30 hover:shadow-sm transition-all">
                <div className={`p-2.5 rounded-xl ${action.color} dark:bg-opacity-20`}>{action.icon}</div>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm group-hover:text-[#0EA5A4] transition-colors">{action.title}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Recent Alerts</h4>
            
            {stats?.pending_fees > 0 && (
              <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 text-rose-600">
                <AlertCircle size={18} />
                <span className="text-sm font-bold">Outstanding Fee of ${stats.pending_fees.toLocaleString()} is due.</span>
              </div>
            )}
            
            {stats?.pending_homework > 0 && (
              <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 text-orange-600">
                <Clock size={18} />
                <span className="text-sm font-bold">{stats.pending_homework} Homework assignments are pending submission.</span>
              </div>
            )}

            {stats?.upcoming_exams > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-blue-600">
                <Calendar size={18} />
                <span className="text-sm font-bold">{stats.upcoming_exams} Upcoming exams scheduled for this week.</span>
              </div>
            )}

            {(!stats?.pending_fees && !stats?.pending_homework && !stats?.upcoming_exams) && (
              <div className="text-center text-slate-500 text-sm font-medium py-4">
                You're all caught up! No recent alerts.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
