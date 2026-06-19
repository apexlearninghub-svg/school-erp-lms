import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Clock, Calendar, DownloadCloud, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentAcademics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/academics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-[#0EA5A4]" /> Academic Progress
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track exam performance, upcoming schedules, and class ranking</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
          <DownloadCloud size={18} /> Download Full Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Subject Performance</h3>
              
              <div className="space-y-5">
                {data?.subject_scores?.map((subject: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <BookOpen size={16} className="text-slate-400" /> {subject.subject}
                      </span>
                      <span className="font-black text-lg text-slate-800 dark:text-white">{subject.score}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          subject.score >= 90 ? 'bg-emerald-500' :
                          subject.score >= 80 ? 'bg-blue-500' :
                          subject.score >= 70 ? 'bg-orange-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${subject.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Trend */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Monthly Trend</h3>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Trophy size={14} /> Top 5% in Class
                </span>
              </div>
              
              <div className="flex-1 flex items-end gap-2 sm:gap-6 relative pt-10 px-2 sm:px-6">
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-bold text-slate-400 w-8 text-right pr-2">
                  <span>100</span><span>80</span><span>60</span><span>40</span><span>0</span>
                </div>
                
                <div className="absolute left-8 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-slate-100 dark:border-slate-700/50"></div>)}
                </div>

                <div className="flex-1 flex items-end justify-around pl-8 relative z-10 h-full pb-6">
                  {data?.monthly_performance?.map((item: any, i: number) => {
                    const heightPercent = item.score;
                    return (
                      <div key={i} className="flex flex-col items-center group w-full px-1 sm:px-3 h-full justify-end relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0EA5A4]/10 rounded-full scale-0 group-hover:scale-150 transition-transform blur-md"></div>
                        <div className="w-full max-w-[24px] relative flex justify-center items-end" style={{ height: `${heightPercent}%` }}>
                          <div className="absolute -top-8 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                            {item.score}%
                          </div>
                          <div className="w-full h-full rounded-full bg-gradient-to-t from-[#0EA5A4] to-[#14B8A6] group-hover:from-[#14B8A6] group-hover:to-[#2DD4BF] transition-all shadow-[0_0_10px_rgba(14,165,164,0.3)]"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 mt-3 absolute bottom-0">{item.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Exam Results */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Recent Exam Results</h3>
              <div className="space-y-4">
                {data?.recent_results?.map((result: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#0EA5A4]/30 transition-all group">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white mb-1 group-hover:text-[#0EA5A4] transition-colors">{result.exam}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{result.subject}</span>
                        <span>•</span>
                        <span>{new Date(result.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-xl font-black text-slate-800 dark:text-white">{result.percentage}%</p>
                        <p className="text-xs font-bold text-[#0EA5A4]">Grade {result.grade}</p>
                      </div>
                      <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Exams */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Upcoming Exams</h3>
              
              {data?.upcoming_exams?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <Calendar size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                  <p>No upcoming exams scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.upcoming_exams?.map((exam: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl font-bold flex flex-col justify-center items-center text-center min-w-[60px]">
                        <span className="text-sm uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-xl leading-none mt-1">{new Date(exam.date).getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded mb-2 inline-block uppercase tracking-wider">{exam.subject}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{exam.exam}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration} Mins</span>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-blue-600 hover:underline mt-1">Details</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
