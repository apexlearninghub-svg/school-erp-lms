import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, BrainCircuit, Clock, Settings } from 'lucide-react';
import api from '@/services/api';
import { Card, Button, Badge, EmptyState, SkeletonCard } from '@/components/ui';

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
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="text-[#862fe7]" /> Exam & AI Control
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage all institutional exams and monitor AI Test Generator usage</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="primary" className="flex items-center gap-2">
            <BrainCircuit size={18} /> Configure AI Limits
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <motion.div variants={itemVariants}>
          <Card className="h-full">
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
                <h4 className="text-2xl font-black text-[#862fe7]">124</h4>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">AI Approval Workflow</h3>
              <Badge variant="success">Auto-Approve Enabled</Badge>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Teachers can currently generate and publish tests instantly. Switch to manual review to require admin approval before a test is published to students.
            </p>
            <Button variant="outline">
              Require Manual Approval
            </Button>
          </Card>
        </motion.div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Active Institutional Exams</h3>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : exams.length === 0 ? (
            <EmptyState icon={<FileText />} title="No active exams" message="No active exams found in the system." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(test => (
                <Card key={test.id} className="hover:border-[#862fe7]/30 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="neutral">
                      {test.subject}
                    </Badge>
                    <button className="text-slate-400 hover:text-[#862fe7]"><Settings size={16} /></button>
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
                    <span className="text-[#862fe7] cursor-pointer hover:underline">View Analytics →</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
