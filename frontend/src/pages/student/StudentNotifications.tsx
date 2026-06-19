import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BookOpen, Award, ClipboardList, CheckCircle2, Trash2 } from 'lucide-react';

interface NotificationProps {
  notifications: any[];
  onMarkRead: () => void;
  onDelete: (id: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function StudentNotifications({ notifications, onMarkRead, onDelete }: NotificationProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('test') || t.includes('exam')) return <BookOpen className="w-5 h-5 text-blue-500" />;
    if (t.includes('result') || t.includes('score')) return <Award className="w-5 h-5 text-purple-500" />;
    if (t.includes('homework') || t.includes('assignment')) return <ClipboardList className="w-5 h-5 text-orange-500" />;
    return <Bell className="w-5 h-5 text-[#0EA5A4]" />;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const min = Math.floor(diff / 60000);
    const hours = Math.floor(min / 60);
    const days = Math.floor(hours / 24);

    if (min < 60) return `${min}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0EA5A4]/10 flex items-center justify-center text-[#0EA5A4]">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Notifications</h2>
            <p className="text-sm text-slate-500">You have {notifications.filter(n => !n.is_read).length} unread alerts</p>
          </div>
        </div>
        <button 
          onClick={onMarkRead}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-[#0EA5A4]/10 hover:text-[#0EA5A4] text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
        >
          <CheckCircle2 size={16} /> Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex border-b border-slate-100 dark:border-slate-700">
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`flex-1 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
              filter === f 
                ? 'border-[#0EA5A4] text-[#0EA5A4] bg-[#0EA5A4]/5' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30 dark:bg-slate-900/10">
        {filtered.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence>
              {filtered.map(notif => (
                <motion.div 
                  key={notif.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20 }}
                  className={`relative p-5 rounded-2xl border transition-all hover:shadow-md group
                    ${!notif.is_read 
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-75'}`}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-[#0EA5A4] to-[#14B8A6] rounded-r-full"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${!notif.is_read ? 'bg-slate-100 dark:bg-slate-700' : 'bg-transparent'}`}>
                      {getIcon(notif.title)}
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h4 className={`text-base truncate ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {getTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm ${!notif.is_read ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {notif.message}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onDelete(notif.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <Bell size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">All caught up!</h3>
            <p className="text-slate-500 text-sm">You don't have any {filter !== 'all' ? filter : ''} notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
