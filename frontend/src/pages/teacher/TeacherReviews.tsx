import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Search, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, SkeletonList, EmptyState, SearchInput, Avatar } from '@/components/ui';

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
  const [loading, setIsLoading] = useState(true);
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
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="text-[#862fe7]" /> Pending Reviews
          </h2>
          <p className="text-slate-500 text-sm mt-1">Grade subjective answers and homework submissions</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SearchInput 
              placeholder="Search student or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="px-3">
            <Filter size={18} />
          </Button>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto pb-6">
        {loading ? (
          <SkeletonList rows={3} />
        ) : filteredReviews.length === 0 ? (
          <Card>
            <EmptyState title="All Caught Up!" message="There are no pending submissions to review right now." icon={<CheckCircle2 />} />
          </Card>
        ) : (
          <div className="space-y-4 pr-2">
            {filteredReviews.map(review => (
              <motion.div variants={itemVariants} key={review.id}>
                <Card className="flex flex-col lg:flex-row gap-6">
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="violet" className="uppercase tracking-wider">
                      {review.type}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{review.title}</h3>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <Avatar name={review.student_name} size="sm" />
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
                        <div className="flex gap-2 mt-3">
                          <Button variant="dark" size="sm" onClick={() => setGradingId(null)} className="flex-1">
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleGrade(review.id, review.max_marks)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 border-none">
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center">
                        <p className="text-sm text-slate-500 mb-3">Pending Grade</p>
                        <Button variant="primary" onClick={() => setGradingId(review.id)} className="w-full">
                          Grade Now
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <button className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline text-center w-full">
                    View Attached Files
                  </button>
                </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
