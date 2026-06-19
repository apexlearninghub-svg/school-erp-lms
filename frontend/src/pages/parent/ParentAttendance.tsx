import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, CalendarDays, DownloadCloud, Loader2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentAttendance() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/attendance')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
      </div>
    );
  }


  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-[#0EA5A4]" /> Attendance Record
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monitor your child's daily school attendance</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
          <DownloadCloud size={18} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-0.5">Present Days</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.present}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600">
            <XCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider mb-0.5">Absent Days</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.absent}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-3xl p-6 shadow-sm flex items-center gap-4 lg:col-span-2">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wider">Overall Attendance</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.percentage}%</span>
            </div>
            <div className="h-3 w-full bg-orange-200 dark:bg-orange-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex-1">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Recent Attendance Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Subject</th>
              </tr>
            </thead>
            <tbody>
              {stats?.history?.map((log: any) => (
                <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm">
                  <td className="py-3 text-slate-800 dark:text-white font-semibold">{log.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      log.status === 'present' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                      log.status === 'absent' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' :
                      'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{log.subject}</td>
                </tr>
              ))}
              {(!stats?.history || stats.history.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">No attendance logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
