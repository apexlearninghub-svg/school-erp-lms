import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, BrainCircuit, Clock, AlertCircle, Settings, Loader2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function AdminExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/tests')
      .then(res => setExams(res.data.tests || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-[#0EA5A4]" /> Exam & AI Control
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage all institutional exams and monitor AI Test Generator usage</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#0EA5A4]/20 hover:opacity-95 transition-all">
            <BrainCircuit size={18} /> Configure AI Limits
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl">
              <BrainCircuit size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">AI Usage</h3>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tokens Used</p>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">1.2M</h4>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Generated Tests</p>
              <h4 className="text-2xl font-black text-[#0EA5A4]">124</h4>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">AI Approval Workflow</h3>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">Auto-Approve Enabled</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Teachers can currently generate and publish tests instantly. Switch to manual review to require admin approval before a test is published to students.
          </p>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-[#0EA5A4] transition-colors">
            Require Manual Approval
          </button>
        </motion.div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Active Institutional Exams</h3>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No active exams found in the system.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(test => (
                <div key={test.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#0EA5A4]/30 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                      {test.subject}
                    </span>
                    <button className="text-slate-400 hover:text-[#0EA5A4]"><Settings size={16} /></button>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-3 line-clamp-1">{test.title}</h4>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-xs text-slate-500">
                      <FileText size={14} className="mr-2" /> {test.total_questions} Questions
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock size={14} className="mr-2" /> {test.duration} Minutes
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">By: Admin</span>
                    <span className="text-[#0EA5A4] cursor-pointer hover:underline">View Analytics →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
