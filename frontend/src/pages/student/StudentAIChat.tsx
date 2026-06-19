import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const PRESET_PROMPTS = [
  "Explain Newton's Laws",
  "Generate 5 MCQs on Algebra",
  "Create study notes on Photosynthesis",
  "Help me with quadratic equations",
  "Tips for exam preparation"
];

export function StudentAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hello! I'm your AI Study Assistant powered by Gemini. How can I help you today? You can ask me to explain concepts, generate practice questions, or help with your homework.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/student/ai-chat', { message: text });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown renderer for bold and code
  const renderFormattedText = (text: string) => {
    // This is a basic formatter. For a full app, you'd use react-markdown.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">{part.slice(1, -1)}</code>;
      }
      // Handle simple newlines
      return <span key={i}>{part.split('\n').map((line, j) => <React.Fragment key={j}>{line}<br/></React.Fragment>)}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] rounded-xl text-white shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-lg">AI Study Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-500 font-medium">Powered by Gemini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Chips */}
      {messages.length === 1 && (
        <div className="flex items-center gap-2 overflow-x-auto p-4 scrollbar-hide border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
          <Sparkles className="text-amber-500 w-4 h-4 shrink-0 ml-1" />
          {PRESET_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-[#0EA5A4]/10 hover:text-[#0EA5A4] dark:hover:bg-[#0EA5A4]/20 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium transition-colors border border-transparent hover:border-[#0EA5A4]/30"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[#0EA5A4]'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] text-white rounded-tr-sm shadow-md' : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-tl-sm'}`}>
              <div className="text-[15px] leading-relaxed">
                {msg.role === 'ai' ? renderFormattedText(msg.content) : msg.content}
              </div>
              <div className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] mr-auto">
            <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[#0EA5A4]">
              <Bot size={20} />
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-tl-sm flex items-center gap-1.5">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-[#0EA5A4]/60"></motion.div>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#0EA5A4]/80"></motion.div>
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#0EA5A4]"></motion.div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#0EA5A4]/50 focus-within:border-[#0EA5A4] transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your AI tutor anything..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-700 dark:text-slate-200"
            rows={input.split('\n').length > 3 ? 3 : input.split('\n').length}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-1 shrink-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}
