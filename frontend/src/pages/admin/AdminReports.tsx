import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DownloadCloud, FileText, CheckCircle2, AlertTriangle, BookOpen, Loader2 } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

const COLORS = ['#0EA5A4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export function AdminReports() {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [enrollRes, attendRes, perfRes] = await Promise.all([
          api.get('/admin/analytics/enrollment'),
          api.get('/admin/analytics/attendance'),
          api.get('/admin/performance/trends')
        ]);
        setEnrollmentData(enrollRes.data.data || []);
        setAttendanceData(attendRes.data.data || []);
        setPerformanceData(perfRes.data.trends || []);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#0EA5A4] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-[#0EA5A4]" /> Interactive Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">Real-time charts and system metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 py-2 px-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
            <DownloadCloud size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Student Enrollment Trend */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Student & Teacher Enrollment</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5A4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EA5A4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="students" stroke="#0EA5A4" fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="teachers" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTeachers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Exam Performance Analytics */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Average Performance by Subject</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Attendance Analytics (Donut) */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Today's Attendance Breakdown</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Report Generation */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Custom Reports Generation</h3>
          <div className="space-y-4 flex-1">
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30"><FileText size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm dark:text-white">Student Performance Report</h4>
                  <p className="text-xs text-slate-500">Term-wise academic results</p>
                </div>
              </div>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Generate</button>
            </div>
            
            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30"><CheckCircle2 size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm dark:text-white">Monthly Attendance Log</h4>
                  <p className="text-xs text-slate-500">Class-wise attendance status</p>
                </div>
              </div>
              <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Generate</button>
            </div>

            <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30"><BarChart3 size={20} /></div>
                <div>
                  <h4 className="font-bold text-sm dark:text-white">Financial Summary</h4>
                  <p className="text-xs text-slate-500">Revenue, expenses & pending</p>
                </div>
              </div>
              <button className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline">Generate</button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
