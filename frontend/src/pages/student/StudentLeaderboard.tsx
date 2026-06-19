import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Loader2, Lock, Flame, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface LeaderboardProps {
  currentUserId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export function StudentLeaderboard({ currentUserId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setLeaderboard(response.data.leaderboard);
        setMyRank(response.data.my_rank);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" /></div>;
  }

  // Define badges logic
  const badges = [
    { id: 'top_performer', name: 'Class Topper', desc: 'Rank #1 in class', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', earned: myRank?.rank === 1 },
    { id: 'fast_learner', name: 'Fast Learner', desc: '5+ Exams Completed', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', earned: (myRank?.completed_tests || 0) >= 5 },
    { id: 'exam_master', name: 'Exam Master', desc: '10+ Exams Completed', icon: Star, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', earned: (myRank?.completed_tests || 0) >= 10 },
    { id: 'perfection', name: 'A+ Student', desc: 'Got an A+ Grade', icon: Medal, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', earned: myRank?.best_grade === 'A+' },
    { id: 'first_step', name: 'First Step', desc: 'Completed 1st Exam', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', earned: (myRank?.completed_tests || 0) >= 1 }
  ];

  const top3 = leaderboard.slice(0, 3);
  // Pad if < 3
  while (top3.length < 3) top3.push(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Top Section: My Rank & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* My Rank Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] rounded-3xl p-6 text-white shadow-xl shadow-[#0EA5A4]/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
          
          <div>
            <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-1">Your Class Rank</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black">{myRank?.rank || '-'}</span>
              <span className="text-xl text-white/80">/ {leaderboard.length}</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/70 text-xs font-semibold mb-1">Avg Score</p>
              <p className="text-xl font-bold">{myRank?.avg_score || 0}%</p>
            </div>
            <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/70 text-xs font-semibold mb-1">Tests Done</p>
              <p className="text-xl font-bold">{myRank?.completed_tests || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Achievements & Badges</h3>
            <span className="bg-[#0EA5A4]/10 text-[#0EA5A4] font-bold px-3 py-1 rounded-full text-sm">
              {badges.filter(b => b.earned).length} / {badges.length} Unlocked
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all ${badge.earned ? 'border-transparent bg-slate-50 dark:bg-slate-900/50 hover:shadow-md hover:-translate-y-1' : 'border-slate-100 dark:border-slate-700 bg-transparent grayscale opacity-60'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.earned ? badge.bg : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {badge.earned ? <badge.icon className={`w-6 h-6 ${badge.color}`} /> : <Lock className="w-5 h-5 text-slate-400" />}
                </div>
                <p className={`font-bold text-sm mb-1 ${badge.earned ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{badge.name}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Podium and Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        
        {/* Podium (Top 3) */}
        {leaderboard.length > 0 && (
          <div className="flex items-end justify-center gap-2 md:gap-6 mb-12 h-48 mt-8">
            {/* Rank 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 flex items-center justify-center text-xl font-bold border-2 border-slate-300">2</div>
              <p className="font-bold text-sm text-slate-800 dark:text-white mb-1 truncate w-24 text-center">{top3[1]?.student_name.split(' ')[0] || '-'}</p>
              <div className="w-20 md:w-28 h-24 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-t-xl flex items-start justify-center pt-2 shadow-inner">
                <span className="font-black text-slate-400 dark:text-slate-400">{top3[1]?.avg_score || 0}%</span>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center">
              <Trophy className="w-8 h-8 text-yellow-500 mb-1" />
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2 flex items-center justify-center text-2xl font-black border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]">1</div>
              <p className="font-black text-base text-slate-800 dark:text-white mb-1 truncate w-28 text-center">{top3[0]?.student_name.split(' ')[0] || '-'}</p>
              <div className="w-24 md:w-32 h-32 bg-gradient-to-t from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-700/40 rounded-t-xl flex items-start justify-center pt-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                <span className="font-black text-yellow-600 dark:text-yellow-500 text-lg">{top3[0]?.avg_score || 0}%</span>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-2 flex items-center justify-center text-xl font-bold border-2 border-orange-300">3</div>
              <p className="font-bold text-sm text-slate-800 dark:text-white mb-1 truncate w-24 text-center">{top3[2]?.student_name.split(' ')[0] || '-'}</p>
              <div className="w-20 md:w-28 h-20 bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-t-xl flex items-start justify-center pt-2 shadow-inner">
                <span className="font-black text-orange-600 dark:text-orange-500">{top3[2]?.avg_score || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Class Standings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Rank</th>
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Tests</th>
                <th className="p-4 font-bold">Best Grade</th>
                <th className="p-4 font-bold text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student, idx) => (
                <motion.tr 
                  variants={itemVariants}
                  key={student.student_id} 
                  className={`border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                    ${student.student_id === currentUserId ? 'bg-[#0EA5A4]/5 dark:bg-[#0EA5A4]/10' : ''}
                  `}
                >
                  <td className="p-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-500'}
                    ">
                      {idx + 1}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {student.student_name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold ${student.student_id === currentUserId ? 'text-[#0EA5A4]' : 'text-slate-800 dark:text-white'}`}>
                          {student.student_name} {student.student_id === currentUserId && '(You)'}
                        </p>
                        <p className="text-xs text-slate-500">Roll: {student.roll_number || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{student.completed_tests}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white bg-slate-800 dark:bg-slate-600
                      ${student.best_grade === 'A+' ? 'bg-emerald-500 dark:bg-emerald-500' : 
                        student.best_grade === 'A' ? 'bg-teal-500 dark:bg-teal-500' : ''}
                    `}>
                      {student.best_grade}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <TrendingUp className="w-3 h-3 text-[#0EA5A4]" />
                      <span className="font-bold text-slate-800 dark:text-white">{student.avg_score}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
