import React from 'react';
import { Card, Button, EmptyState } from '@/components/ui';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Award, Target, TrendingUp, Zap } from 'lucide-react';

interface AnalyticsProps {
  resultsList: any[];
  analyticsData?: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const COLORS = ['#10B981', '#0EA5A4', '#3B82F6', '#F59E0B', '#F97316', '#EF4444'];

export function StudentAnalytics({ resultsList, analyticsData }: AnalyticsProps) {
  if (!resultsList || resultsList.length === 0) {
    return (
      <div className="py-12">
        <EmptyState 
          icon={<Award size={48} className="text-[#0EA5A4]" />}
          title="No Data Yet"
          message="Complete some tests to unlock detailed performance analytics, charts, and personalized insights."
        />
      </div>
    );
  }

  // Data Processing
  const sortedResults = [...resultsList].sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
  
  // 1. Trend Data (last 10)
  const trendData = sortedResults.slice(-10).map((r, i) => ({
    name: `T${i+1}`,
    fullTitle: r.test_title || r.test_subject,
    score: r.percentage
  }));

  // 2. Subject Performance
  const subjectMap: Record<string, { total: number; count: number }> = {};
  resultsList.forEach(r => {
    const sub = r.test_subject || 'General';
    if (!subjectMap[sub]) subjectMap[sub] = { total: 0, count: 0 };
    subjectMap[sub].total += r.percentage;
    subjectMap[sub].count += 1;
  });
  const subjectData = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    average: Math.round(data.total / data.count)
  })).sort((a, b) => b.average - a.average);

  // 3. Grade Distribution
  const gradeMap: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  resultsList.forEach(r => { if (gradeMap[r.grade] !== undefined) gradeMap[r.grade]++; });
  const gradeData = Object.entries(gradeMap).filter(([_, count]) => count > 0).map(([name, value]) => ({ name, value }));

  // 4. Correct/Wrong/Skipped
  let tCorrect = 0, tWrong = 0, tSkipped = 0;
  resultsList.forEach(r => {
    tCorrect += r.correct; tWrong += r.wrong; tSkipped += r.skipped;
  });
  const accuracyData = [
    { name: 'Answers', Correct: tCorrect, Wrong: tWrong, Skipped: tSkipped }
  ];

  // Insights
  const strongestSubject = subjectData[0]?.subject || 'N/A';
  const weakestSubject = subjectData[subjectData.length - 1]?.subject || 'N/A';
  const bestScore = Math.max(...resultsList.map(r => r.percentage));
  
  let improvement = 0;
  if (sortedResults.length >= 2) {
    const firstHalf = sortedResults.slice(0, Math.ceil(sortedResults.length/2));
    const secondHalf = sortedResults.slice(Math.ceil(sortedResults.length/2));
    const avg1 = firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;
    improvement = Math.round(avg2 - avg1);
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Header with Export */}
      <Card className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Performance Analytics</h2>
          <p className="text-sm text-slate-500">Track your progress and identify areas for improvement.</p>
        </div>
        <Button
          onClick={async () => {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.text("Student Analytics Report", 14, 22);
            
            doc.setFontSize(12);
            doc.text(`Strongest Subject: ${strongestSubject}`, 14, 35);
            doc.text(`Needs Focus: ${weakestSubject}`, 14, 42);
            doc.text(`Best Score: ${bestScore}%`, 14, 49);
            
            const tableData = resultsList.map(r => [
              r.test_subject || 'General',
              r.test_title || 'Assigned Test',
              `${r.percentage}%`,
              r.grade
            ]);

            autoTable(doc, {
              startY: 60,
              head: [['Subject', 'Test Title', 'Score', 'Grade']],
              body: tableData,
            });

            doc.save("Analytics_Report.pdf");
          }}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Award className="w-4 h-4" /> Export Report
        </Button>
      </Card>

      {/* Insights Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Award size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Strongest</p><p className="text-lg font-black dark:text-white truncate">{strongestSubject}</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl"><Target size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Needs Focus</p><p className="text-lg font-black dark:text-white truncate">{weakestSubject}</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Zap size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Best Score</p><p className="text-lg font-black dark:text-white">{bestScore}%</p></div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl"><TrendingUp size={24} /></div>
          <div><p className="text-xs text-slate-500 uppercase font-bold">Improvement</p><p className="text-lg font-black dark:text-white">{improvement > 0 ? '+' : ''}{improvement}%</p></div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-80 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Score Trend (Last 10)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0EA5A4" strokeWidth={4} dot={{ r: 4, fill: '#0EA5A4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Subject Performance */}
        <motion.div variants={itemVariants}>
          <Card className="h-80 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Average by Subject</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical" margin={{ top: 5, right: 20, bottom: 20, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="average" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Grade Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-80 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Grade Distribution</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Total Accuracy Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="h-80 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Total Answer Accuracy</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="Correct" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Wrong" stackId="a" fill="#EF4444" />
                  <Bar dataKey="Skipped" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
