import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Loader2, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
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

export function TeacherHomework() {
  const [homework, setHomework] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hwRes, classRes] = await Promise.all([
        api.get('/homework'),
        api.get('/teacher/classes')
      ]);
      setHomework(hwRes.data.homework || []);
      setClasses(classRes.data.classes || []);
      if (classRes.data.classes?.length > 0) {
        setClassName(classRes.data.classes[0].name);
      }
    } catch (err) {
      toast.error('Failed to load homework data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/homework', {
        title, subject, class_name: className, due_date: dueDate, description, max_marks: maxMarks
      });
      toast.success('Homework assigned successfully');
      setShowForm(false);
      setTitle(''); setSubject(''); setDescription('');
      fetchData(); // Refresh list
    } catch (err) {
      toast.error('Failed to assign homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-[#0EA5A4]" /> Homework Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Assign, manage, and track class homework</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${
            showForm 
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-none' 
              : 'bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white shadow-[#0EA5A4]/20 hover:opacity-95'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Assign New Homework</>}
        </button>
      </div>

      {showForm && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">New Assignment</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 3 Exercise" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                <input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
                <select required value={className} onChange={e => setClassName(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white">
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Max Marks</label>
                <input required type="number" min="1" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Description / Instructions</label>
              <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide detailed instructions for the homework..." className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#0EA5A4] text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckSquare />} Create Assignment
            </button>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
        </div>
      ) : homework.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center opacity-70 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No active homework</h3>
          <p className="text-slate-500 text-sm mt-1">Assignments you create will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homework.map(hw => (
            <motion.div variants={itemVariants} key={hw.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 bg-[#0EA5A4]/10 text-[#0EA5A4] text-xs font-bold uppercase rounded-md">
                    {hw.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded">
                    {hw.class_name}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{hw.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{hw.description}</p>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-auto">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                    <CalendarIcon size={16} /> Due: {hw.due_date}
                  </div>
                  <div className="text-slate-500 font-medium">{hw.max_marks} Marks</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
