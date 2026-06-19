import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bell, Mail, Send, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentCommunication() {
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [newMessage, setNewMessage] = useState('');

  const announcements = [
    { id: 1, title: 'Summer Vacation Dates', content: 'School will remain closed from July 1st to August 15th.', date: 'Today, 10:00 AM', isNew: true },
    { id: 2, title: 'Annual Sports Meet', content: 'The annual sports meet will be held next Friday. Parents are cordially invited.', date: 'Yesterday', isNew: false }
  ];

  const messages = [
    { id: 1, sender: 'Mr. Smith (Math Teacher)', preview: 'Your child has been doing excellent in algebra.', date: '10:30 AM', unread: true },
    { id: 2, sender: 'Principal Office', preview: 'Please note the change in uniform policy.', date: 'Mon', unread: false }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-[#0EA5A4]" /> Communication Center
          </h2>
          <p className="text-slate-500 text-sm mt-1">Stay connected with teachers and school administration</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-white dark:bg-slate-800 text-[#0EA5A4] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Messages
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcements' ? 'bg-white dark:bg-slate-800 text-[#0EA5A4] shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Announcements
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {activeTab === 'messages' ? (
          <>
            <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[500px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white">Conversations</h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-2xl cursor-pointer transition-colors border ${msg.unread ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${msg.unread ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{msg.sender}</h4>
                      <span className="text-xs text-slate-500">{msg.date}</span>
                    </div>
                    <p className={`text-xs truncate ${msg.unread ? 'font-medium text-slate-700 dark:text-slate-400' : 'text-slate-500'}`}>{msg.preview}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-[500px]">
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#0EA5A4] font-black">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Mr. Smith (Math Teacher)</h3>
                  <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                  </p>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex flex-col gap-4">
                  <div className="self-start max-w-[80%]">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-300">
                      Hello, I wanted to update you on your child's recent mock test performance.
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 ml-1 block">10:30 AM</span>
                  </div>
                  <div className="self-end max-w-[80%]">
                    <div className="bg-[#0EA5A4] p-4 rounded-2xl rounded-tr-sm text-white text-sm shadow-md shadow-[#0EA5A4]/20">
                      Thank you Mr. Smith. We will review the paper tonight.
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 mr-1 block text-right flex items-center justify-end gap-1">
                      10:35 AM <CheckCircle2 size={12} className="text-[#0EA5A4]" />
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0EA5A4]/20 dark:text-white"
                />
                <button className="p-3 bg-[#0EA5A4] text-white rounded-xl hover:bg-[#14B8A6] transition-colors shadow-md flex items-center justify-center">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${ann.isNew ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}>
                        <Bell size={18} />
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{ann.title}</h4>
                    </div>
                    {ann.isNew && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded">New</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{ann.content}</p>
                  <div className="text-xs font-bold text-slate-400">Posted: {ann.date}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
