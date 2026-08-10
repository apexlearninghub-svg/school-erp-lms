import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';
import { 
  BookOpen, TrendingUp, Award, CheckSquare, BarChart3, 
  Bell, Flame, Target, ChevronRight, PlayCircle 
} from 'lucide-react';

interface OverviewProps {
  user: any;
  stats: any;
  tests: any[];
  resultsList: any[];
  notifications: any[];
  onTabChange: (tab: string) => void;
  onStartExam: (test: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
};

export function StudentOverview({ user, stats, tests, resultsList, notifications, onTabChange, onStartExam }: OverviewProps) {
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
  };

  // Compute extra stats
  const bestGrade = resultsList.length > 0 
    ? resultsList.reduce((best, curr) => {
        const order = { 'A+': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
        return (order[curr.grade as keyof typeof order] || 0) > (order[best as keyof typeof order] || 0) ? curr.grade : best;
      }, 'F')
    : 'N/A';

  const classRank = resultsList.length > 0 ? Math.min(...resultsList.map(r => r.class_rank || 999)) : '-';
  const unreadNotifs = notifications.filter(n => !n.is_read).length;
  
  // Calculate study streak (days since first result, mock logic)
  const streak = resultsList.length > 0 ? resultsList.length * 2 : 0; 

  const statCards = [
    { label: 'Assigned Exams', value: stats?.assigned_tests || 0, icon: BookOpen, color: 'from-blue-500 to-blue-600', action: () => onTabChange('available') },
    { label: 'Completed', value: stats?.completed_tests || 0, icon: CheckSquare, color: 'from-emerald-500 to-emerald-600', action: () => onTabChange('results') },
    { label: 'Pending', value: stats?.pending_tests || 0, icon: Target, color: 'from-orange-500 to-orange-600', action: () => onTabChange('available') },
    { label: 'Average Score', value: `${stats?.average_score || 0}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', action: () => onTabChange('analytics') },
    { label: 'Class Rank', value: classRank !== 999 ? `#${classRank}` : '-', icon: Award, color: 'from-rose-500 to-rose-600', action: () => onTabChange('leaderboard') },
    { label: 'Best Grade', value: bestGrade, icon: BarChart3, color: 'from-teal-500 to-teal-600', action: () => onTabChange('analytics') },
    { label: 'Unread Alerts', value: unreadNotifs, icon: Bell, color: 'from-indigo-500 to-indigo-600', action: () => onTabChange('notifications') },
    { label: 'Study Streak', value: `${streak} Days`, icon: Flame, color: 'from-amber-500 to-amber-600', action: () => onTabChange('attendance') },
  ];

  const recentResults = [...resultsList].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 3);
  const upcomingTests = tests.filter(t => !t.has_completed && !t.is_started).slice(0, 2);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-r from-[#862fe7] to-[#ad6df4] rounded-3xl p-8 text-white shadow-xl shadow-[#862fe7]/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 -mb-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/40 shadow-inner">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.full_name)
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {getGreeting()}, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
              <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Class: {user?.student_profile?.class_name || '-'}
              </span>
              <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Roll: {user?.student_profile?.roll_number || '-'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} onClick={stat.action} className="cursor-pointer group">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl hover:shadow-md transition-all hover:-translate-y-1 h-full">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h3>
            </Card>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" onClick={() => onTabChange('available')} className="flex items-center justify-center gap-2 py-4">
          <PlayCircle className="w-5 h-5 text-[#862fe7]" /> Start Test
        </Button>
        <Button variant="outline" onClick={() => onTabChange('results')} className="flex items-center justify-center gap-2 py-4">
          <BarChart3 className="w-5 h-5 text-purple-500" /> View Results
        </Button>
        <Button variant="outline" onClick={() => onTabChange('ai')} className="flex items-center justify-center gap-2 py-4">
          <BookOpen className="w-5 h-5 text-amber-500" /> AI Assistant
        </Button>
        <Button variant="outline" onClick={() => onTabChange('notifications')} className="flex items-center justify-center gap-2 py-4">
          <Bell className="w-5 h-5 text-rose-500" /> Notifications
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Results */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Results</h3>
              <button onClick={() => onTabChange('results')} className="text-sm font-semibold text-[#862fe7] hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentResults.length > 0 ? recentResults.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{res.test_title || res.test_subject}</h4>
                    <p className="text-xs text-slate-500">{new Date(res.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#862fe7]">{res.percentage}%</span>
                    <Badge variant={res.grade.startsWith('A') ? 'success' : res.grade.startsWith('B') ? 'info' : res.grade.startsWith('C') ? 'warning' : 'danger'}>
                      {res.grade}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No results yet.</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Tests */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Upcoming Tests</h3>
              <button onClick={() => onTabChange('available')} className="text-sm font-semibold text-[#862fe7] hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingTests.length > 0 ? upcomingTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{test.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{test.subject}</span>
                      <span>• {test.total_questions} Qs</span>
                      <span>• {test.duration}m</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartExam(test)}
                    className="p-2 text-[#862fe7]"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No pending tests.</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
