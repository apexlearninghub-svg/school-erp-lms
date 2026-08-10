import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Layers, Book, Plus, MoreVertical } from 'lucide-react';
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

export function AdminAcademics() {
  const [data, setData] = useState<any>({ classes: [], subjects: [], sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  useEffect(() => {
    api.get('/admin/academics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-[#862fe7]" /> Academic Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure classes, sections, and curriculum subjects</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab('classes')} variant={activeTab === 'classes' ? 'primary' : 'outline'} size="sm">Classes & Sections</Button>
          <Button onClick={() => setActiveTab('subjects')} variant={activeTab === 'subjects' ? 'primary' : 'outline'} size="sm">Subjects</Button>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activeTab === 'classes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#862fe7] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-[#862fe7]/10 flex items-center justify-center text-[#862fe7] mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-[#862fe7] transition-colors">Add New Class</h3>
              <p className="text-xs text-slate-500 mt-1">Create a new academic class</p>
            </div>
            
            {data.classes.length === 0 ? (
              <div className="col-span-full">
                <EmptyState icon={<Layers />} title="No classes found" message="Get started by adding a new class." />
              </div>
            ) : (
              data.classes.map((cls: any) => (
              <motion.div variants={itemVariants} key={cls.id}>
                <Card className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                        <Layers size={20} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">{cls.name}</h3>
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Sections</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {data.sections.filter((s: any) => s.class_id === cls.id).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Students</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">-</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#862fe7] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group">
              <div className="w-10 h-10 rounded-full bg-[#862fe7]/10 flex items-center justify-center text-[#862fe7] mb-2 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#862fe7] transition-colors">Add Subject</h3>
            </div>
            
            {data.subjects.length === 0 ? (
              <div className="col-span-full">
                <EmptyState icon={<Book />} title="No subjects found" message="Get started by adding a new subject." />
              </div>
            ) : (
              data.subjects.map((sub: any) => (
              <motion.div variants={itemVariants} key={sub.id} className="group h-full">
                <Card className="h-full flex flex-col hover:border-[#862fe7]/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg">
                      <Book size={18} />
                    </div>
                    <Badge variant="neutral">
                      {sub.code || 'N/A'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{sub.name}</h3>
                  <button className="mt-4 text-xs font-bold text-[#862fe7] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Manage Syllabus →
                  </button>
                </Card>
              </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
