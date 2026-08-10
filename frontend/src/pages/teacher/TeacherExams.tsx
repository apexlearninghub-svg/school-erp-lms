import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertCircle, Trash2, Plus, Edit2, PlayCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, SkeletonCard, EmptyState } from '@/components/ui';

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
  const [loading, setIsLoading] = useState(true);

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
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Management</h2>
          <p className="text-slate-500 text-sm mt-1">View and manage tests assigned to your classes</p>
        </div>
        <Button onClick={() => onTabChange('generate')}>
          <Plus size={18} className="mr-2" /> Generate New Test
        </Button>
      </Card>

      <div className="flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : tests.length === 0 ? (
          <EmptyState title="No active exams found" message="Create an AI-generated exam to evaluate your students." icon={<FileText />} />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <motion.div variants={itemVariants} key={test.id} className="h-full">
                <Card className="h-full flex flex-col hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="violet" className="uppercase">
                    {test.subject}
                  </Badge>
                  <Badge variant={test.difficulty === 'hard' ? 'danger' : test.difficulty === 'medium' ? 'warning' : 'success'} className="uppercase">
                    {test.difficulty}
                  </Badge>
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
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTest(test.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 size={16} />
                    </Button>
                    <Button variant="dark" size="sm">
                      View Results
                    </Button>
                  </div>
                </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
