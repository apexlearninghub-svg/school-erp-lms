import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle2, DownloadCloud, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentHomework() {
  const homeworks = [
    { id: 1, subject: 'Mathematics', title: 'Algebra Equations', status: 'pending', dueDate: 'Tomorrow, 9:00 AM' },
    { id: 2, subject: 'Science', title: 'Physics Lab Report', status: 'pending', dueDate: 'Friday, 11:59 PM' },
    { id: 3, subject: 'English', title: 'Essay on Shakespeare', status: 'submitted', dueDate: 'Yesterday', marks: '9.5/10' },
    { id: 4, subject: 'History', title: 'World War II Summary', status: 'submitted', dueDate: 'Last Week', marks: '8/10' }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-[#862fe7]" /> Homework Tracker
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review assignments, due dates, and completion status</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card 
            title={
              <span className="flex items-center gap-2">
                <Clock className="text-orange-500" size={20} /> Pending Assignments (2)
              </span> as any
            }
          >
          
          <div className="space-y-4">
            {homeworks.filter(h => h.status === 'pending').map(hw => (
              <div key={hw.id} className="p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="warning" className="uppercase">
                    {hw.subject}
                  </Badge>
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle size={14} /> Due {hw.dueDate}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-3">{hw.title}</h4>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="px-3" title="Download Attachment">
                    <DownloadCloud size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card 
            title={
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={20} /> Submitted (Recently)
              </span> as any
            }
          >
          
          <div className="space-y-4">
            {homeworks.filter(h => h.status === 'submitted').map(hw => (
              <div key={hw.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {hw.subject}
                  </span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Graded
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">{hw.title}</h4>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400">Score</span>
                  <span className="font-black text-[#862fe7]">{hw.marks}</span>
                </div>
              </div>
            ))}
          </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
