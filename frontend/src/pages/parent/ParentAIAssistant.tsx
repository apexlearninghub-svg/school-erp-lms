import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, TrendingUp, AlertTriangle, MessageSquare, Send, Loader2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentAIAssistant() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    api.get('/parent/ai-insights')
      .then(res => setInsights(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-xl shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                AI Learning Assistant <Sparkles size={20} className="text-yellow-400" />
              </h2>
              <p className="text-indigo-200 mt-1">Personalized academic insights and actionable recommendations for your child.</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="text-purple-500" /> Smart Recommendations
              </h3>
              
              <div className="space-y-3">
                {insights?.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl">
                    <div className="text-purple-500 mt-0.5"><CheckCircleIcon /></div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {insights?.strengths?.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" /> Areas to Focus
                </h3>
                <ul className="space-y-2">
                  {insights?.weak_areas?.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full lg:col-span-1 min-h-[400px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Ask AI Assistant</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-300 max-w-[90%]">
                Hello! I am your AI Parent Assistant. You can ask me questions like: "How can I help my child improve in History?" or "What topics are coming up in Science?"
              </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..." 
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
