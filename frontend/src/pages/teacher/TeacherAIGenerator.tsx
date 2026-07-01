import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Upload, Loader2, X, Plus, Edit2, Trash2, CheckSquare } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

const AVAILABLE_CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export function TeacherAIGenerator({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  const [currentDraft, setCurrentDraft] = useState<any | null>(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [tempQuestion, setTempQuestion] = useState<any | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSourceFile(file);
      toast.success(`Attached: ${file.name}`);
    }
  };

  const handleGenerateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim() || !testSubject.trim()) return toast.error('Title and Subject required.');
    
    setIsGenerating(true);
    const compoundPrompt = sourceFile ? `[Source Material: ${sourceFile.name}]. ${aiPrompt}` : aiPrompt;

    try {
      const response = await api.post('/generate-test', {
        title: testTitle,
        subject: testSubject,
        difficulty,
        count: questionCount,
        prompt: compoundPrompt,
        duration: 30,
        correct_marks: 1.0,
        negative_marks: 0.0,
        passing_marks: Math.max(1, Math.round(questionCount * 0.4)),
        is_timed: true
      });
      setCurrentDraft(response.data.test);
      toast.success('AI MCQ Test generated successfully!');
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData?.detail || errorData?.fix) {
        toast.error(`${errorData.detail}\n${errorData.fix || ''}`.trim(), { duration: 6000 });
      } else {
        toast.error(errorData?.error || 'AI generation failed.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishTest = async () => {
    if (!currentDraft || selectedClasses.length === 0) return toast.error('Select classes to publish to.');
    
    setIsPublishing(true);
    try {
      await api.put(`/tests/${currentDraft.id}`, currentDraft);
      await api.post('/publish-test', { test_id: currentDraft.id, classes: selectedClasses });
      
      toast.success('Exam successfully published!');
      setCurrentDraft(null);
      onTabChange('exams');
    } catch (err) {
      toast.error('Failed to publish test.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Draft edits
  const saveQuestionEdit = (idx: number) => {
    if (!tempQuestion) return;
    const updated = [...currentDraft.questions];
    updated[idx] = tempQuestion;
    setCurrentDraft({ ...currentDraft, questions: updated });
    setEditingQuestionIdx(null);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      {!currentDraft ? (
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="p-3 bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] rounded-2xl text-white shadow-lg shadow-[#0EA5A4]/20">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Exam Builder</h2>
              <p className="text-slate-500 text-sm mt-1">Generate structured exam papers from prompts and documents instantly.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateTest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Title</label>
                <input required value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="e.g. Science Midterm" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Domain</label>
                <input required value={testSubject} onChange={e => setTestSubject(e.target.value)} placeholder="e.g. Biology" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complexity</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none dark:text-white appearance-none">
                  <option value="easy">Easy (Foundation)</option>
                  <option value="medium">Medium (Intermediate)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Count</label>
                <input type="number" min="10" max="100" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Material (Optional)</label>
              <div onDragOver={e => e.preventDefault()} onDrop={handleFileDrop} className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#0EA5A4] rounded-2xl p-8 text-center transition-colors cursor-pointer bg-slate-50 dark:bg-slate-900/30 group">
                <Upload size={32} className="text-slate-400 mx-auto mb-3 group-hover:text-[#0EA5A4] transition-colors" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">{sourceFile ? sourceFile.name : 'Drag & Drop PDF or Document'}</p>
                <input type="file" id="ai-file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && setSourceFile(e.target.files[0])} className="hidden" />
                <label htmlFor="ai-file" className="mt-4 inline-block px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-sm font-bold cursor-pointer transition-colors dark:text-white">Browse Files</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Prompt / Guidelines</label>
              <textarea rows={3} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. Include real-world examples, avoid trick questions..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none resize-none dark:text-white" />
            </div>

            <button type="submit" disabled={isGenerating} className="w-full py-4 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white font-bold rounded-xl shadow-lg shadow-[#0EA5A4]/20 hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-lg mt-4">
              {isGenerating ? <><Loader2 className="animate-spin" /> Generating via Gemini...</> : <><BrainCircuit /> Generate Test Now</>}
            </button>
          </form>
        </motion.div>
      ) : (
        /* Draft Mode */
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-xs font-bold text-[#0EA5A4] uppercase tracking-widest bg-[#0EA5A4]/10 px-2.5 py-1 rounded-md">Draft Mode</span>
              <h2 className="text-2xl font-bold mt-2">{currentDraft.title}</h2>
              <p className="text-slate-400 mt-1">{currentDraft.subject} • {currentDraft.questions.length} Questions</p>
            </div>
            <button onClick={() => setCurrentDraft(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {currentDraft.questions.map((q: any, idx: number) => {
                const isEditing = editingQuestionIdx === idx;
                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    {isEditing ? (
                      <div className="space-y-4">
                        <input value={tempQuestion?.question_text} onChange={e => setTempQuestion({...tempQuestion, question_text: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                        <div className="grid grid-cols-2 gap-4">
                          {['a', 'b', 'c', 'd'].map(opt => (
                            <input key={opt} value={tempQuestion?.[`option_${opt}`]} onChange={e => setTempQuestion({...tempQuestion, [`option_${opt}`]: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                          ))}
                        </div>
                        <div className="flex gap-4">
                          <select value={tempQuestion?.correct_option} onChange={e => setTempQuestion({...tempQuestion, correct_option: e.target.value})} className="w-1/3 px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                          </select>
                          <input value={tempQuestion?.explanation || ''} onChange={e => setTempQuestion({...tempQuestion, explanation: e.target.value})} className="flex-1 px-4 py-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Explanation..." />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingQuestionIdx(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold rounded-xl">Cancel</button>
                          <button onClick={() => saveQuestionEdit(idx)} className="px-4 py-2 bg-[#0EA5A4] text-white font-bold rounded-xl">Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                            <h4 className="font-bold text-lg dark:text-white mt-1">{q.question_text}</h4>
                          </div>
                          <button onClick={() => { setEditingQuestionIdx(idx); setTempQuestion({...q}); }} className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 rounded-lg"><Edit2 size={16}/></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} className={`p-3 rounded-xl border ${q.correct_option === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-300'}`}>
                              {opt}. {q[`option_${opt.toLowerCase()}`]}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-fit sticky top-0">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Publish Settings</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500">Duration (mins)</label>
                  <input type="number" value={currentDraft.duration} onChange={e => setCurrentDraft({...currentDraft, duration: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500">+ Marks</label>
                    <input type="number" step="0.5" value={currentDraft.correct_marks} onChange={e => setCurrentDraft({...currentDraft, correct_marks: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">- Marks</label>
                    <input type="number" step="0.25" value={currentDraft.negative_marks} onChange={e => setCurrentDraft({...currentDraft, negative_marks: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Passing Marks</label>
                  <input type="number" value={currentDraft.passing_marks} onChange={e => setCurrentDraft({...currentDraft, passing_marks: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
              </div>

              <hr className="my-6 border-slate-100 dark:border-slate-700" />
              
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 block mb-2">Target Classes</label>
                <div className="h-40 overflow-y-auto border rounded-xl p-2 space-y-1 dark:border-slate-700">
                  {AVAILABLE_CLASSES.map(cls => (
                    <label key={cls} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                      <input type="checkbox" checked={selectedClasses.includes(cls)} onChange={e => {
                        if (e.target.checked) setSelectedClasses([...selectedClasses, cls]);
                        else setSelectedClasses(selectedClasses.filter(c => c !== cls));
                      }} className="text-[#0EA5A4] rounded focus:ring-[#0EA5A4]" />
                      <span className="text-sm font-medium dark:text-white">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={handlePublishTest} disabled={isPublishing || selectedClasses.length === 0} className="w-full py-3 bg-[#0EA5A4] text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                {isPublishing ? <Loader2 className="animate-spin" /> : <CheckSquare />}
                Publish to Students
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
