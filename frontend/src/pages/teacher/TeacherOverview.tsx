import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, ClipboardList, TrendingUp, BookOpen, Clock, Activity, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function TeacherOverview({ user, onTabChange }: { user: any, onTabChange: (tab: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([
          api.get('/teacher/dashboard-stats'),
          api.get('/teacher/classes')
        ]);
        setStats(statsRes.data);
        setClasses(classesRes.data.classes || []);
      } catch (err) {
        console.error("Failed to load overview data", err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: <Users size={24} />, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { label: 'Active Exams', value: stats?.active_exams || 0, icon: <FileText size={24} />, color: 'from-[#0EA5A4] to-[#14B8A6]', shadow: 'shadow-[#0EA5A4]/20' },
    { label: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: <ClipboardList size={24} />, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
    { label: 'Class Avg Score', value: `${stats?.average_score || 0}%`, icon: <TrendingUp size={24} />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-40 w-40 h-40 bg-[#0EA5A4]/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    {user?.full_name?.charAt(0) || 'T'}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-1">Hello, {user?.full_name?.split(' ')[0]} <span className="inline-block animate-wave">👋</span></h1>
              <p className="text-slate-300 font-medium">Manage students, classes, exams, attendance and academic performance.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div variants={itemVariants} key={i} className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out blur-xl`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1 relative z-10">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Teaching Assignment */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
              <BookOpen size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Teaching Assignment</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Department</p>
                <p className="font-semibold text-slate-800 dark:text-white">{user?.teacher_profile?.department || 'General Education'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Employee ID</p>
                <p className="font-semibold text-slate-800 dark:text-white">{user?.teacher_profile?.employee_id || 'TCH000'}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold mb-3">Assigned Classes</p>
              <div className="flex flex-wrap gap-2">
                {classes.slice(0, 5).map(c => (
                  <span key={c.id} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                    {c.name} ({c.student_count} Students)
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onTabChange('attendance')}
            className="w-full mt-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
          >
            View All Classes
          </button>
        </motion.div>

        {/* Pending Actions */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl">
              <Clock size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quick Actions</h3>
          </div>
          
          <div className="space-y-3 flex-1">
            {[
              { title: 'Create New Test', desc: 'Use AI to generate a new MCQ test', icon: <Activity size={18} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', tab: 'generate' },
              { title: 'Mark Attendance', desc: 'Record daily attendance for your classes', icon: <CheckCircle2 size={18} />, color: 'bg-blue-50 text-blue-600 border-blue-100', tab: 'attendance' },
              { title: 'Assign Homework', desc: 'Create a new homework assignment', icon: <BookOpen size={18} />, color: 'bg-purple-50 text-purple-600 border-purple-100', tab: 'homework' },
              { title: 'Send Announcement', desc: 'Broadcast a message to students', icon: <ClipboardList size={18} />, color: 'bg-rose-50 text-rose-600 border-rose-100', tab: 'communication' }
            ].map((action, i) => (
              <div key={i} onClick={() => onTabChange(action.tab)} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#0EA5A4]/30 bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.color} dark:bg-opacity-10 dark:border-opacity-20`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#0EA5A4] transition-colors">{action.title}</h4>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-[#0EA5A4] group-hover:text-white transition-colors">
                  <span className="font-bold">→</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}
