import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function StudentAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        setAttendance(res.data.records || []);
        setSummary(res.data.summary || { total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
      } catch (err) {
        toast.error('Failed to load attendance');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // For the calendar view
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Map attendance to dates
  const attByDate: Record<number, string> = {};
  attendance.forEach(a => {
    const d = new Date(a.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      attByDate[d.getDate()] = a.status; // 'present', 'absent', 'late'
    }
  });

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 opacity-0"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const status = attByDate[i];
      const isToday = i === today.getDate();
      const isFuture = i > today.getDate();
      
      let colorClass = 'bg-slate-50 dark:bg-slate-800 text-slate-400';
      if (status === 'present') colorClass = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold border-emerald-200 dark:border-emerald-800';
      else if (status === 'absent') colorClass = 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-bold border-red-200 dark:border-red-800';
      else if (status === 'late') colorClass = 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400 font-bold border-yellow-200 dark:border-yellow-800';
      else if (isToday) colorClass = 'bg-blue-50 text-blue-600 border-blue-200 font-bold';
      else if (isFuture) colorClass = 'bg-transparent text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700';

      cells.push(
        <div key={i} className={`h-10 md:h-12 flex items-center justify-center rounded-xl border text-sm md:text-base ${colorClass} transition-all hover:scale-105 cursor-default`}>
          {i}
        </div>
      );
    }
    return cells;
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" /></div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><CheckCircle2 size={80} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Present</p>
          <p className="text-4xl font-black text-emerald-500">{summary?.present || 0}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><XCircle size={80} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Absent</p>
          <p className="text-4xl font-black text-red-500">{summary?.absent || 0}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Late</p>
          <p className="text-4xl font-black text-yellow-500">{summary?.late || 0}</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] p-6 rounded-3xl shadow-lg shadow-[#0EA5A4]/20 relative overflow-hidden text-white group flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-1">Overall</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{summary?.percentage || 0}</span>
            <span className="text-xl font-bold text-white/80">%</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-[#0EA5A4]" /> 
              {today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500"></div> Present</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500"></div> Absent</div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center font-bold text-xs text-slate-400 pb-2">{d}</div>
            ))}
            {renderCalendar()}
          </div>
        </motion.div>

        {/* Recent History List */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent History</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {attendance.length > 0 ? (
              attendance.slice(0, 15).map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${record.status === 'present' ? 'bg-emerald-500' : record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      {record.subject && <p className="text-xs text-slate-500">{record.subject}</p>}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase
                    ${record.status === 'present' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 
                      record.status === 'absent' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 
                      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'}
                  `}>
                    {record.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70 pb-10">
                <CalendarIcon size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No records found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
