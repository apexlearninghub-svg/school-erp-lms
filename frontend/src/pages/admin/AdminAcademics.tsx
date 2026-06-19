import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Layers, Book, Plus, MoreVertical, Loader2 } from 'lucide-react';
import api from '@/services/api';

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
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-[#0EA5A4]" /> Academic Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configure classes, sections, and curriculum subjects</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'classes' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800 shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Classes & Sections</button>
          <button onClick={() => setActiveTab('subjects')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'subjects' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800 shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Subjects</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
          </div>
        ) : activeTab === 'classes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0EA5A4] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-[#0EA5A4]/10 flex items-center justify-center text-[#0EA5A4] mb-3 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-[#0EA5A4] transition-colors">Add New Class</h3>
              <p className="text-xs text-slate-500 mt-1">Create a new academic class</p>
            </div>
            
            {data.classes.map((cls: any) => (
              <motion.div variants={itemVariants} key={cls.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
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
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0EA5A4] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group">
              <div className="w-10 h-10 rounded-full bg-[#0EA5A4]/10 flex items-center justify-center text-[#0EA5A4] mb-2 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-[#0EA5A4] transition-colors">Add Subject</h3>
            </div>
            
            {data.subjects.map((sub: any) => (
              <motion.div variants={itemVariants} key={sub.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col group hover:border-[#0EA5A4]/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg">
                    <Book size={18} />
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                    {sub.code || 'N/A'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{sub.name}</h3>
                <button className="mt-4 text-xs font-bold text-[#0EA5A4] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Manage Syllabus →
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
