import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { examService } from '@/services/authService';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard, BookOpen, BarChart3, Bot, Bell, Award, 
  Archive, Calendar as CalendarIcon, ClipboardList, CheckCircle2, User as UserIcon,
  Clock, ChevronRight, ChevronLeft, Printer, FileText, XCircle, MinusCircle,
  ArrowRight, ListOrdered, Check, Loader2, X, AlertCircle, CheckSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Subcomponents
import { StudentOverview } from '../student/StudentOverview';
import { StudentAnalytics } from '../student/StudentAnalytics';
import { StudentAIChat } from '../student/StudentAIChat';
import { StudentNotifications } from '../student/StudentNotifications';
import { StudentLeaderboard } from '../student/StudentLeaderboard';
import { StudentMaterials } from '../student/StudentMaterials';
import { StudentCalendar } from '../student/StudentCalendar';
import { StudentHomework } from '../student/StudentHomework';
import { StudentAttendance } from '../student/StudentAttendance';
import { StudentProfile } from '../student/StudentProfile';

interface TestItem {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  total_questions: number;
  duration: number;
  correct_marks: number;
  negative_marks: number;
  passing_marks: number;
  is_timed: boolean;
  has_completed: boolean;
  is_started: boolean;
}

interface StudentResult {
  id: string;
  test_id: string;
  test_title?: string;
  test_subject?: string;
  status: string;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  marks_obtained: number;
  percentage: number;
  grade: string;
  class_rank?: number;
  school_rank?: number;
  completed_at?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
};

export default function StudentDashboard() {
  const { user } = useAuth();

  // Zustand Store mappings
  const {
    isExamActive,
    activeTest,
    activeQuestions,
    activeAnswers,
    examTimeRemaining,
    activeResultId,
    startExam,
    setAnswer,
    tickTimer,
    clearActiveExam
  } = useStore();

  // Sidebar Tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Stats / Dashboard metrics
  const [stats, setStats] = useState<{
    assigned_tests: number;
    completed_tests: number;
    pending_tests: number;
    average_score: number;
  } | null>(null);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [resultsList, setResultsList] = useState<StudentResult[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Exam Step tracking
  const [selectedInstructionTest, setSelectedInstructionTest] = useState<TestItem | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail result modal
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [isResultLoading, setIsResultLoading] = useState(false);

  // Timer tick effect
  useEffect(() => {
    let timerId: any;
    if (isExamActive && examTimeRemaining > 0) {
      timerId = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (isExamActive && examTimeRemaining <= 0) {
      // Auto submit on timeout
      toast.error('Time is up! Submitting your exam paper automatically.', { icon: '⏰', duration: 5000 });
      triggerAutoSubmit();
    }
    return () => clearInterval(timerId);
  }, [isExamActive, examTimeRemaining]);

  // Load profile data
  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const [statsData, testsData, resultsData, notifData, analyticsResp] = await Promise.all([
        examService.getDashboardStats(),
        examService.getTests(),
        examService.getResultsList(),
        examService.getNotifications(),
        examService.getDashboardAnalytics()
      ]);
      setStats(statsData);
      setTests(testsData.tests);
      setResultsList(resultsData.results || []);
      setNotifications(notifData.notifications || []);
      setAnalyticsData(analyticsResp);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync student account records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Starting exam actions
  const handleStartExam = async (test: TestItem) => {
    try {
      setIsLoading(true);
      const res = await examService.startTest(test.id);
      // Initialize Zustand store
      startExam(res.result_id, res.test, res.questions, res.test.duration * 60);
      setCurrentQuestionIdx(0);
      setMarkedForReview([]);
      setSelectedInstructionTest(null);
      toast.success(`Exam '${test.title}' started! Good luck.`, { icon: '📝' });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Failed to start exam instance.');
    } finally {
      setIsLoading(false);
    }
  };

  // Answer save action
  const handleOptionSelect = async (questionId: string, option: string) => {
    if (!activeResultId) return;
    setAnswer(questionId, option);
    try {
      await examService.saveAnswer(activeResultId, questionId, option);
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  // Submission helper
  const triggerAutoSubmit = async () => {
    if (!activeResultId) return;
    setIsSubmitting(true);
    try {
      const res = await examService.submitTest(activeResultId);
      toast.success('Your exam has been submitted successfully!', { icon: '🎉' });
      clearActiveExam();
      // Fetch updated info
      await fetchStudentData();
      // Show result details
      handleViewResultDetails(res.result.id);
      setActiveTab('results');
    } catch (err) {
      console.error(err);
      toast.error('Submission encountered an error. Saving locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const manualSubmitExam = () => {
    const unansweredCount = activeQuestions.length - Object.keys(activeAnswers).length;
    let confirmMsg = 'Are you sure you want to submit your exam?';
    if (unansweredCount > 0) {
      confirmMsg = `You have ${unansweredCount} unanswered questions remaining. Do you still wish to submit?`;
    }
    if (window.confirm(confirmMsg)) {
      triggerAutoSubmit();
    }
  };

  // Result inspect
  const handleViewResultDetails = async (resultId: string) => {
    setIsResultLoading(true);
    try {
      const res = await examService.getResult(resultId);
      setSelectedResult(res.result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch detailed result score analysis.');
    } finally {
      setIsResultLoading(false);
    }
  };

  const handlePrintResult = () => {
    window.print();
  };

  // Formatting helper
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleReviewMark = (idx: number) => {
    setMarkedForReview(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // ─── VIEW 1: ACTIVE EXAM PORTAL ───────────────────────────────────────────
  if (isExamActive && activeTest) {
    const currentQuestion = activeQuestions[currentQuestionIdx];
    const hasNext = currentQuestionIdx < activeQuestions.length - 1;
    const hasPrev = currentQuestionIdx > 0;
    const selectedAnswer = activeAnswers[currentQuestion?.id] || '';

    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 md:p-6 transition-colors duration-300 font-sans flex flex-col justify-between">
        {/* Exam Header */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[#0EA5A4] uppercase tracking-widest bg-teal-50 dark:bg-teal-950/20 px-2.5 py-1 rounded-md">
              {activeTest.subject} Exam
            </span>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-1.5">{activeTest.title}</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 rounded-xl">
              <Clock className="w-4.5 h-4.5 animate-pulse" />
              <span className="font-mono font-bold text-base">{formatTime(examTimeRemaining)}</span>
            </div>
            <button
              onClick={manualSubmitExam}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
            </button>
          </div>
        </div>

        {/* Exam Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start flex-1 mb-6">
          {/* Question Grid Navigation (Side Column) */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ListOrdered className="w-5 h-5 text-[#0EA5A4]" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Question Navigation</h4>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {activeQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = !!activeAnswers[q.id];
                const isMarked = markedForReview.includes(idx);

                let btnClass = 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
                if (isCurrent) {
                  btnClass = 'bg-[#0EA5A4] text-white border border-[#0EA5A4] shadow-md shadow-[#0EA5A4]/10';
                } else if (isMarked) {
                  btnClass = 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-50 text-emerald-600 border border-emerald-255 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 w-9 text-xs font-bold rounded-xl transition-all flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-3.5 h-3.5 rounded bg-[#0EA5A4]" /> Current Question
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200" /> Answered
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-3.5 h-3.5 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-200" /> Marked for Review
              </div>
            </div>
          </div>

          {/* Active Question detail card (Main Column) */}
          <div className="lg:col-span-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[450px]">
            {currentQuestion ? (
              <div className="space-y-6">
                {/* Question Info */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-450 uppercase">Question {currentQuestionIdx + 1} of {activeQuestions.length}</span>
                  <div className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded">
                    Correct: +{activeTest.correct_marks} | Negative: -{activeTest.negative_marks}
                  </div>
                </div>

                {/* Question Text */}
                <h4 className="font-bold text-base text-slate-800 dark:text-white leading-relaxed">
                  {currentQuestion.question_text}
                </h4>

                {/* MCQ Options */}
                <div className="space-y-3">
                  {[
                    { key: 'A', text: currentQuestion.option_a },
                    { key: 'B', text: currentQuestion.option_b },
                    { key: 'C', text: currentQuestion.option_c },
                    { key: 'D', text: currentQuestion.option_d }
                  ].map((opt) => {
                    const isSelected = selectedAnswer === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleOptionSelect(currentQuestion.id, opt.key)}
                        className={`w-full p-4 rounded-xl border text-left text-sm flex gap-3 items-center transition-all ${
                          isSelected
                            ? 'border-[#0EA5A4] bg-teal-50/20 dark:bg-teal-950/10 text-slate-800 dark:text-white font-semibold shadow-sm'
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-350'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'border-[#0EA5A4] bg-[#0EA5A4] text-white'
                            : 'border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}>
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Loading active question...</div>
            )}

            {/* Footer Navigation */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <button
                onClick={() => toggleReviewMark(currentQuestionIdx)}
                className={`w-full sm:w-auto px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  markedForReview.includes(currentQuestionIdx)
                    ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
                }`}
              >
                {markedForReview.includes(currentQuestionIdx) ? 'Unmark Review' : 'Mark for Review'}
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={!hasPrev}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-1 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={!hasNext}
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-1 px-4 py-2 bg-[#0EA5A4] text-white rounded-xl text-xs font-bold hover:bg-[#0EA5A4]/90 disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW 2: NORMAL STUDENT PANEL WITH PREMIUM SIDEBAR ───────────────────
  
  const SIDEBAR_TABS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'available', label: 'Assigned Exams', icon: CheckSquare },
    { id: 'results', label: 'My Results', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'homework', label: 'Homework', icon: ClipboardList },
    { id: 'materials', label: 'Study Materials', icon: Archive },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Award },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <DashboardLayout
      title={`Hello, ${user?.full_name?.split(' ')[0]} 🎓`}
      subtitle="Your comprehensive enterprise learning dashboard"
    >
      <div className="flex flex-col lg:flex-row gap-6 mt-2 relative">
        
        {/* Modern Sidebar inside Dashboard */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm sticky top-6">
            <nav className="space-y-1">
              {SIDEBAR_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedInstructionTest(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative
                      ${isActive 
                        ? 'text-white bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] shadow-md shadow-[#0EA5A4]/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {tab.label}
                    {tab.id === 'notifications' && notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute right-4 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full">
                        {notifications.filter(n => !n.is_read).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading student dashboards...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <StudentOverview 
                    user={user} 
                    stats={stats} 
                    tests={tests} 
                    resultsList={resultsList} 
                    notifications={notifications}
                    onTabChange={setActiveTab}
                    onStartExam={setSelectedInstructionTest}
                  />
                )}
                
                {activeTab === 'analytics' && <StudentAnalytics resultsList={resultsList} analyticsData={analyticsData} />}
                
                {activeTab === 'ai' && <StudentAIChat />}
                
                {activeTab === 'notifications' && (
                  <StudentNotifications 
                    notifications={notifications} 
                    onMarkRead={async () => {
                      try {
                        await examService.markAllNotificationsRead();
                        setNotifications(prev => prev.map(n => ({...n, is_read: true})));
                        toast.success('All notifications marked as read');
                      } catch (err) {
                        toast.error('Failed to mark notifications');
                      }
                    }} 
                    onDelete={async (id: string) => {
                      try {
                        await examService.deleteNotification(id);
                        setNotifications(prev => prev.filter(n => n.id !== id));
                        toast.success('Notification deleted');
                      } catch (err) {
                        toast.error('Failed to delete notification');
                      }
                    }}
                  />
                )}
                
                {activeTab === 'leaderboard' && <StudentLeaderboard currentUserId={user?.id || ''} />}
                
                {activeTab === 'materials' && <StudentMaterials />}
                
                {activeTab === 'calendar' && <StudentCalendar />}
                
                {activeTab === 'homework' && <StudentHomework />}
                
                {activeTab === 'attendance' && <StudentAttendance />}
                
                {activeTab === 'profile' && <StudentProfile user={user} />}

                {/* Exams and Results logic remains inline to preserve the exact instructions and modals */}
                {activeTab === 'available' && (
                  <div className="space-y-6">
                    {!selectedInstructionTest ? (
                      <motion.div variants={itemVariants} className="space-y-4">
                        <div className="border-b border-[#F1F5F9] dark:border-[#334155] pb-3">
                          <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Assigned Exams List</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Below are tests assigned by your course instructors.</p>
                        </div>

                        {tests.length === 0 ? (
                          <div className="text-center py-16 bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 rounded-2xl">
                            <AlertCircle className="w-12 h-12 text-slate-350 dark:text-slate-655 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No exams assigned to your class</p>
                            <p className="text-xs text-slate-400 mt-1">Check back later for newly published tests from teachers.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {tests.map(t => (
                              <div
                                key={t.id}
                                className="bg-white dark:bg-[#1E293B] border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-[#0EA5A4] uppercase bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded-md">
                                      {t.subject}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">Difficulty: {t.difficulty}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-850 dark:text-white text-base mb-1">{t.title}</h4>
                                  <div className="text-xs text-slate-450 space-y-1 mb-4">
                                    <div>Questions: <strong>{t.total_questions} MCQs</strong></div>
                                    <div>Time Limit: <strong>{t.duration} Minutes</strong></div>
                                    <div>Marking scheme: <strong>+{t.correct_marks} / -{t.negative_marks}</strong></div>
                                  </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between items-center">
                                  <span className="text-xs font-semibold text-slate-400">
                                    {t.has_completed ? (
                                      <span className="text-emerald-500 flex items-center gap-1">
                                        <Check className="w-4 h-4" /> Completed
                                      </span>
                                    ) : (
                                      <span className="text-amber-500">Unattempted</span>
                                    )}
                                  </span>

                                  {t.has_completed ? (
                                    <button
                                      onClick={() => {
                                        const matchingRes = resultsList.find(r => r.test_id === t.id);
                                        if (matchingRes) {
                                          handleViewResultDetails(matchingRes.id);
                                          setActiveTab('results');
                                        } else {
                                          toast.error('Detailed report is being compiled.');
                                        }
                                      }}
                                      className="flex items-center gap-1 text-xs font-bold text-[#0EA5A4]"
                                    >
                                      View Report <ChevronRight className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setSelectedInstructionTest(t)}
                                      className="flex items-center gap-1 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-[#0EA5A4]/10"
                                    >
                                      Start Exam <ArrowRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* ─── TEST INSTRUCTIONS PAGE ─── */
                      <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-5"
                      >
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                          <FileText className="w-6 h-6 text-[#0EA5A4]" />
                          <div>
                            <h3 className="font-bold text-lg text-slate-850 dark:text-white">Exam Instructions</h3>
                            <p className="text-xs text-slate-450">{selectedInstructionTest.title}</p>
                          </div>
                        </div>

                        {/* Student Info Box - from database */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-[#0EA5A4]/5 border border-[#0EA5A4]/20 p-4 rounded-xl">
                          <div>
                            <span className="text-slate-400">Student Name:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">{user?.full_name || '—'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Roll Number:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">{user?.student_profile?.roll_number || '—'}</strong>
                          </div>
                          <div className="mt-1">
                            <span className="text-slate-400">Class:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">{user?.student_profile?.class_name || '—'}</strong>
                          </div>
                          <div className="mt-1">
                            <span className="text-slate-400">Exam:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5 truncate">{selectedInstructionTest.title}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                          <div>
                            <span className="text-slate-400">Total Questions:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">{selectedInstructionTest.total_questions} MCQs</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Exam Duration:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">{selectedInstructionTest.duration} Minutes</strong>
                          </div>
                          <div className="mt-2">
                            <span className="text-slate-400">Positive Marks:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">+{selectedInstructionTest.correct_marks} per correct</strong>
                          </div>
                          <div className="mt-2">
                            <span className="text-slate-400">Negative Penalty:</span>
                            <strong className="block text-slate-800 dark:text-white text-sm mt-0.5">-{selectedInstructionTest.negative_marks} per incorrect</strong>
                          </div>
                        </div>

                        {/* Rules list */}
                        <div className="space-y-3">
                          <h5 className="font-bold text-sm text-slate-800 dark:text-white">Critical Rules & Code of Conduct:</h5>
                          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside">
                            <li className="text-rose-500 font-semibold">The exam timer cannot be paused once started.</li>
                            <li>Auto Submit: The system will automatically lock and submit your responses on timeout.</li>
                            <li>No browser reload warning: Page reloads or navigation will NOT pause your time.</li>
                            <li>Double check your selected options before clicking finish.</li>
                          </ul>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setSelectedInstructionTest(null)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={() => handleStartExam(selectedInstructionTest)}
                            className="flex items-center gap-1 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0EA5A4]/10"
                          >
                            Start Test Now <ArrowRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {activeTab === 'results' && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-sm"
                  >
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg text-[#0F172A] dark:text-white">Exam Report Cards</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Inspect evaluated marks, grades, and detailed question reviews.</p>
                      </div>
                      <button
                        onClick={() => {
                          import('xlsx').then(XLSX => {
                            const ws = XLSX.utils.json_to_sheet(resultsList.map(r => ({
                              Subject: r.test_subject || 'General',
                              Title: r.test_title || 'Assigned Test',
                              Score: `${r.percentage}%`,
                              Grade: r.grade,
                              'Marks Obtained': r.marks_obtained,
                              'Class Rank': r.class_rank || '-',
                              'School Rank': r.school_rank || '-',
                              'Completed At': new Date(r.completed_at || '').toLocaleDateString()
                            })));
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Results");
                            XLSX.writeFile(wb, "Student_Results.xlsx");
                            toast.success('Results exported to Excel');
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Export Excel
                      </button>
                    </div>

                    {resultsList.length === 0 ? (
                      <div className="text-center py-16">
                        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No results found</p>
                        <p className="text-xs text-slate-400 mt-1">Complete examinations to access marked score sheets.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <th className="py-3 px-4">Subject</th>
                              <th className="py-3 px-4">Test Title</th>
                              <th className="py-3 px-4 text-center">Score %</th>
                              <th className="py-3 px-4 text-center">Grade</th>
                              <th className="py-3 px-4 text-center">Class / School Rank</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {resultsList.map((res) => (
                              <tr key={res.id} className="text-sm text-slate-600 dark:text-slate-350 hover:bg-[#F8FAFC]/50 dark:hover:bg-[#1E293B]/60 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-[#0EA5A4] uppercase">
                                  {res.test_subject || 'General'}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-850 dark:text-white truncate max-w-xs">
                                  {res.test_title || 'Assigned Test'}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="font-bold text-[#0EA5A4]">{res.percentage}%</span>
                                  <div className="text-[10px] text-slate-400">{res.marks_obtained} marks</div>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                                    res.grade === 'F'
                                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'
                                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                                  }`}>
                                    {res.grade}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center text-xs">
                                  <span className="font-semibold text-slate-800 dark:text-white">
                                    C-Rank: {res.class_rank || '-'}
                                  </span>
                                  <div className="text-[10px] text-slate-400">
                                    S-Rank: {res.school_rank || '-'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => handleViewResultDetails(res.id)}
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 ml-auto"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Detailed Analysis
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Detailed Result Card Modal Overlay */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:relative print:inset-auto print:z-auto print:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="absolute inset-0 bg-black/60 print:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 border border-slate-100 dark:border-slate-800 max-h-[85vh] flex flex-col justify-between print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:bg-white print:text-black"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] p-5 text-white flex justify-between items-center print:bg-none print:text-black print:border-b print:pb-3">
                <div>
                  <h4 className="font-bold text-lg print:text-xl">Examination Performance Report</h4>
                  <p className="text-xs text-teal-50 print:text-slate-500">Student score card analysis overview</p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handlePrintResult}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    title="Print / Save PDF"
                  >
                    <Printer className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 print:overflow-visible">
                <div className="text-center space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800 print:text-left">
                  <h5 className="font-bold text-2xl text-slate-850 dark:text-white print:text-xl">{selectedResult.test_title}</h5>
                  <p className="text-xs font-semibold text-[#0EA5A4] uppercase tracking-wider">{selectedResult.test_subject} Domain</p>
                  <p className="text-[10px] text-slate-400">Completed at: {selectedResult.completed_at ? new Date(selectedResult.completed_at).toLocaleString() : 'N/A'}</p>
                </div>

                {/* Score cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Marks Obtained</span>
                    <strong className="block text-[#0EA5A4] text-2xl mt-1">{selectedResult.marks_obtained}</strong>
                    <span className="text-[10px] text-slate-400">out of {selectedResult.total_questions * 1}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
                    <strong className="block text-slate-800 dark:text-white text-2xl mt-1">{selectedResult.percentage}%</strong>
                    <span className="text-[10px] text-slate-400">Passing: 40%</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Grade Secured</span>
                    <strong className={`block text-2xl mt-1 ${selectedResult.grade === 'F' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedResult.grade}
                    </strong>
                    <span className="text-[10px] text-slate-400">{selectedResult.percentage >= 50 ? 'Passed' : 'Failed'}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Class / School Rank</span>
                    <strong className="block text-slate-800 dark:text-white text-lg mt-1.5">
                      C: #{selectedResult.class_rank || '-'}
                    </strong>
                    <span className="text-[10px] text-slate-400">School: #{selectedResult.school_rank || '-'}</span>
                  </div>
                </div>

                {/* Correct/Wrong Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Correct</span>
                      <strong className="text-sm">{selectedResult.correct} questions</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-rose-50/20 dark:bg-rose-950/10 text-rose-600 dark:text-rose-450">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Wrong</span>
                      <strong className="text-sm">{selectedResult.wrong} questions</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400">
                    <MinusCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Skipped</span>
                      <strong className="text-sm">{selectedResult.skipped} questions</strong>
                    </div>
                  </div>
                </div>

                {/* Questions Review Section */}
                <div className="space-y-4 print:page-break-before">
                  <h5 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2">Question Review & Explanations</h5>

                  {selectedResult.questions && selectedResult.questions.map((q: any, idx: number) => {
                    const isSkipped = !q.selected_option;
                    const isCorrect = q.selected_option === q.correct_option;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/20 space-y-3 print:border print:mb-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Question {idx + 1}</span>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{q.question_text}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                              : isSkipped
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-900'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                          }`}>
                            {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                          </span>
                        </div>

                        {/* Options list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {[
                            { key: 'A', text: q.option_a },
                            { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c },
                            { key: 'D', text: q.option_d }
                          ].map(opt => {
                            let itemClass = 'border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400';
                            if (q.correct_option === opt.key) {
                              itemClass = 'border-emerald-200 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400 font-semibold';
                            } else if (q.selected_option === opt.key && !isCorrect) {
                              itemClass = 'border-rose-200 bg-rose-50/20 text-rose-600 dark:text-rose-450 font-semibold';
                            }
                            return (
                              <div key={opt.key} className={`p-2.5 rounded-lg border flex gap-1.5 ${itemClass}`}>
                                <span className="font-bold">{opt.key}.</span>
                                <span>{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 p-2 rounded border border-slate-100/50 dark:border-slate-850/50">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 print:hidden">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0EA5A4] text-white hover:bg-[#0EA5A4]/90 transition-all shadow-md shadow-[#0EA5A4]/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// Minimalist Sub-component
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
