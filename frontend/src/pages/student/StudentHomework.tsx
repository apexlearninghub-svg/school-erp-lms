import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, FileText, Send, X, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function StudentHomework() {
  const [homework, setHomework] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/homework');
      setHomework(res.data.homework || []);
      setSubmissions(res.data.submissions || {});
    } catch (err) {
      toast.error('Failed to load homework');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    try {
      setIsSubmitting(true);
      await api.post(`/homework/${activeModal.id}/submit`, { notes });
      toast.success('Homework submitted successfully!');
      setActiveModal(null);
      setNotes('');
      fetchHomework(); // Refresh
    } catch (err) {
      toast.error('Failed to submit homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr).getTime() < new Date().getTime() - 86400000;
  };

  // Stats
  const total = homework.length;
  const submittedCount = Object.values(submissions).filter(s => s).length;
  const pendingCount = homework.filter(h => !submissions[h.id] && !isOverdue(h.due_date)).length;
  const overdueCount = homework.filter(h => !submissions[h.id] && isOverdue(h.due_date)).length;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><ClipboardList size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Total</p><p className="text-xl font-black dark:text-white">{total}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><CheckCircle2 size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Submitted</p><p className="text-xl font-black dark:text-white">{submittedCount}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl"><Clock size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Pending</p><p className="text-xl font-black dark:text-white">{pendingCount}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl"><AlertCircle size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Overdue</p><p className="text-xl font-black dark:text-white">{overdueCount}</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" /></div>
        ) : homework.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {homework.map(hw => {
              const sub = submissions[hw.id];
              const overdue = !sub && isOverdue(hw.due_date);
              
              return (
                <motion.div variants={itemVariants} key={hw.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Accent Border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${sub ? 'bg-emerald-500' : overdue ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {hw.subject}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md ${
                      sub ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      overdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {sub ? <><CheckCircle2 size={14} /> Submitted</> : 
                       overdue ? <><AlertCircle size={14} /> Overdue</> : 
                       <><Clock size={14} /> Pending</>}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-2">{hw.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 flex-1">{hw.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto flex items-center justify-between">
                    <div className="text-xs font-medium">
                      <span className="text-slate-400 block mb-0.5">Due Date</span>
                      <span className={`${overdue && !sub ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {new Date(hw.due_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    {!sub ? (
                      <button 
                        onClick={() => setActiveModal(hw)}
                        className="px-4 py-2 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        Submit Now
                      </button>
                    ) : (
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block mb-0.5">Marks</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {sub.marks_obtained !== null ? `${sub.marks_obtained}/${hw.max_marks}` : 'Grading...'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <ClipboardList size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No homework assigned</h3>
            <p className="text-slate-500 text-sm">You're all caught up! Enjoy your free time.</p>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0EA5A4]/10 text-[#0EA5A4] rounded-xl"><Send size={20} /></div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Submit Homework</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{activeModal.title}</h4>
                  <p className="text-xs text-slate-500">Subject: {activeModal.subject} • Max Marks: {activeModal.max_marks}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Submission Notes / Link</label>
                    <textarea 
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Type your answer here, or paste a link to your Google Doc/Drive file..."
                      className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none resize-none text-slate-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  {/* In a real app, we'd add file upload here */}
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center">
                    <FileText className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">File upload coming soon</p>
                    <p className="text-xs text-slate-500">For now, paste links in the notes box above.</p>
                  </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !notes.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white font-bold rounded-xl shadow-lg shadow-[#0EA5A4]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Submit Work</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
