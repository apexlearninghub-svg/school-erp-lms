import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertCircle, Trash2, Plus, Edit2, PlayCircle } from 'lucide-react';
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

export function TeacherExams({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/tests');
        // Filter tests created by this teacher
        setTests(res.data.tests || []);
      } catch (err) {
        toast.error('Failed to load published tests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this test permanently?')) return;
    try {
      await api.delete(`/tests/${testId}`);
      toast.success('Test deleted successfully');
      setTests(prev => prev.filter(t => t.id !== testId));
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Management</h2>
          <p className="text-slate-500 text-sm mt-1">View and manage tests assigned to your classes</p>
        </div>
        <button
          onClick={() => onTabChange('generate')}
          className="flex items-center gap-2 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-95 shadow-md shadow-[#0EA5A4]/20 transition-all"
        >
          <Plus size={18} /> Generate New Test
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0EA5A4] animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <FileText size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active exams found</h3>
            <p className="text-slate-500 text-sm mt-1">Create an AI-generated exam to evaluate your students.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <motion.div variants={itemVariants} key={test.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-[#0EA5A4]/10 text-[#0EA5A4]">
                    {test.subject}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                    test.difficulty === 'hard' ? 'border-rose-200 text-rose-500 bg-rose-50' :
                    test.difficulty === 'medium' ? 'border-amber-200 text-amber-500 bg-amber-50' :
                    'border-emerald-200 text-emerald-500 bg-emerald-50'
                  }`}>
                    {test.difficulty}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-4">{test.title}</h3>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <FileText size={16} className="mr-2 text-slate-400" />
                    <span>{test.total_questions} Questions</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    <span>{test.duration} Minutes Duration</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <AlertCircle size={16} className="mr-2 text-slate-400" />
                    <span>+{test.correct_marks} / -{test.negative_marks} Marks</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400 font-medium font-mono">ID: {test.id.slice(0, 8)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteTest(test.id)} className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                      View Results
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
