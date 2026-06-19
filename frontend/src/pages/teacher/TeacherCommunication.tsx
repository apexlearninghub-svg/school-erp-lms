import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Megaphone, Send, Users, Loader2 } from 'lucide-react';
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

export function TeacherCommunication() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [annRes, classRes] = await Promise.all([
        api.get('/teacher/announcements'),
        api.get('/teacher/classes')
      ]);
      setAnnouncements(annRes.data.announcements || []);
      setClasses(classRes.data.classes || []);
    } catch (err) {
      toast.error('Failed to load communication data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/teacher/announcements', {
        title,
        content,
        target_audience: targetAudience,
        class_name: targetAudience === 'class' ? selectedClass : null
      });
      toast.success('Announcement broadcast successfully!');
      setTitle(''); setContent('');
      fetchData(); // refresh list
    } catch (err) {
      toast.error('Failed to broadcast announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <MessageSquare className="text-[#0EA5A4]" /> Communication Center
        </h2>
        <p className="text-slate-500 text-sm">Broadcast announcements and communicate with students or parents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Announcement Form */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-fit sticky top-0">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Megaphone className="text-[#0EA5A4]" size={20} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">New Broadcast</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Science Fair Tomorrow" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Target Audience</label>
              <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white">
                <option value="all">All My Students</option>
                <option value="class">Specific Class</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>

            {targetAudience === 'class' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Class</label>
                <select required value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white">
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
              <textarea required rows={5} value={content} onChange={e => setContent(e.target.value)} placeholder="Type your announcement here..." className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] hover:opacity-90 text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 shadow-md shadow-[#0EA5A4]/20 transition-all">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Broadcast Now
            </button>
          </form>
        </motion.div>

        {/* History List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center opacity-70 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <Megaphone size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">No announcements sent</h3>
              <p className="text-slate-500 text-sm mt-1">Your broadcast history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800 dark:text-white">{ann.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-medium">{new Date(ann.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          <Users size={12} /> {ann.target_audience === 'class' ? ann.class_name : ann.target_audience}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {ann.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
      </div>
    </motion.div>
  );
}
