import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Search, Filter, Loader2, CheckCircle2 } from 'lucide-react';
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

export function TeacherReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/teacher/reviews/pending');
      setReviews(res.data.pending_reviews || []);
    } catch (err) {
      toast.error('Failed to load pending reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrade = async (id: string, maxMarks: number) => {
    const marks = parseFloat(gradeInput);
    if (isNaN(marks) || marks < 0 || marks > maxMarks) {
      return toast.error(`Valid marks (0-${maxMarks}) required.`);
    }

    try {
      await api.post('/teacher/reviews/grade', { submission_id: id, marks });
      toast.success('Graded successfully!');
      setGradingId(null);
      setGradeInput('');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Grading failed.');
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="text-[#0EA5A4]" /> Pending Reviews
          </h2>
          <p className="text-slate-500 text-sm mt-1">Grade subjective answers and homework submissions</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search student or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:border-[#0EA5A4] transition-colors dark:text-white"
            />
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-[#0EA5A4] transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <CheckCircle2 size={64} className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">All Caught Up!</h3>
            <p className="text-slate-500 mt-2">There are no pending submissions to review right now.</p>
          </div>
        ) : (
          <div className="space-y-4 pr-2">
            {filteredReviews.map(review => (
              <motion.div variants={itemVariants} key={review.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row gap-6">
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase rounded-md tracking-wider">
                      {review.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{review.title}</h3>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      {review.student_name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{review.student_name}</span>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {review.notes || "No notes provided by student."}
                  </div>
                </div>

                <div className="w-full lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Evaluation</p>
                    {gradingId === review.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.5"
                            placeholder="Marks"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none dark:text-white"
                          />
                          <span className="text-slate-400 text-sm">/ {review.max_marks}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setGradingId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Cancel
                          </button>
                          <button onClick={() => handleGrade(review.id, review.max_marks)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center">
                        <p className="text-sm text-slate-500 mb-3">Pending Grade</p>
                        <button onClick={() => setGradingId(review.id)} className="w-full py-2 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white font-bold text-sm rounded-lg transition-colors shadow-md shadow-[#0EA5A4]/20">
                          Grade Now
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline text-center w-full">
                    View Attached Files
                  </button>
                </div>
                
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
