import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Clock, Inbox } from 'lucide-react';
import api from '@/services/api';
import { Card, SkeletonList, EmptyState } from '@/components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function TeacherNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotis = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
        
        // Mark as read after a short delay
        const unreadCount = res.data.notifications?.filter((n: any) => !n.is_read).length || 0;
        if (unreadCount > 0) {
          setTimeout(() => {
            api.post('/notifications/read').then(() => {
              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            });
          }, 2000);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotis();
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <Card className="shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <Bell className="text-[#862fe7]" /> Notifications Panel
        </h2>
        <p className="text-slate-500 text-sm">Stay updated on student submissions, system alerts, and administrative messages.</p>
      </Card>

      <Card className="flex-1">
        {loading ? (
          <SkeletonList rows={5} />
        ) : notifications.length === 0 ? (
          <EmptyState title="All caught up!" message="You have no new notifications." icon={<Inbox />} />
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <AnimatePresence>
              {notifications.map((noti) => (
                <motion.div
                  key={noti.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    noti.is_read 
                      ? 'bg-slate-50 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800' 
                      : 'bg-[#F0FDFA] border-[#CCFBF1] dark:bg-teal-950/20 dark:border-teal-900/30 shadow-md'
                  }`}
                >
                  {!noti.is_read && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-rose-500"></div>
                  )}
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                      noti.is_read ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-teal-100 text-[#862fe7] dark:bg-teal-900/50 dark:text-teal-400'
                    }`}>
                      {noti.is_read ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${noti.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {noti.title}
                      </h4>
                      <p className={`text-sm mt-1 mb-2 ${noti.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                        {noti.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <Clock size={12} />
                        {new Date(noti.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
