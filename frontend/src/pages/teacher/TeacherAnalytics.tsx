import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, Award, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function TeacherAnalytics() {
  const [data, setData] = useState<any>({ top_students: [], weak_students: [], performance_history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/teacher/analytics');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-[#0EA5A4]" /> Performance Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track class averages, identify struggling students, and monitor trends.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0EA5A4] animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Section */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Class Performance Trend (Last 5 Months)</h3>
            
            <div className="h-64 flex items-end gap-2 sm:gap-4 relative pt-10">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-slate-400 w-8">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-8 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-full border-t border-slate-100 dark:border-slate-700/50"></div>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 flex items-end justify-around pl-10 relative z-10 h-full pb-6">
                {data.performance_history?.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col items-center group w-full px-1 sm:px-2">
                    <div className="w-full max-w-[60px] relative flex justify-center items-end h-[200px]">
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                        {item.score}% Avg
                      </div>
                      <div 
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#14B8A6] to-[#0EA5A4] group-hover:from-[#0EA5A4] group-hover:to-[#0D9488] transition-all shadow-lg"
                        style={{ height: `${Math.max(5, item.score)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 mt-3 absolute bottom-0">{item.name}</span>
                  </div>
                ))}
                {(!data.performance_history || data.performance_history.length === 0) && (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                    Not enough data for trend analysis
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                    <Award size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Top Performers</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.top_students?.length > 0 ? data.top_students.map((student: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{student.name}</h4>
                        <p className="text-xs text-slate-500">Roll: {student.roll_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-500 font-bold">{student.average.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">{student.tests_taken} Exams</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 text-sm py-8">No data available</p>
                )}
              </div>
            </motion.div>

            {/* Needs Attention */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Needs Attention</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.weak_students?.length > 0 ? data.weak_students.map((student: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{student.name}</h4>
                        <p className="text-xs text-slate-500">Roll: {student.roll_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-rose-500 font-bold">{student.average.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">{student.tests_taken} Exams</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-500 text-sm py-8">No students below passing criteria</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
