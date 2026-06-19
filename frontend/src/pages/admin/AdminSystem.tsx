import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Database, HardDrive, ShieldCheck, Settings, Loader2, AlertCircle, RefreshCw, Cpu, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

// Mock data for live charts
const cpuData = Array.from({ length: 20 }, (_, i) => ({ time: i, value: Math.floor(Math.random() * 40) + 20 }));
const networkData = Array.from({ length: 20 }, (_, i) => ({ time: i, value: Math.floor(Math.random() * 100) + 50 }));

export function AdminSystem() {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/system/health')
      .then(res => setHealth(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#0EA5A4] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 flex flex-col pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Server className="text-[#0EA5A4]" /> System Monitoring
          </h2>
          <p className="text-slate-500 text-sm mt-1">Real-time infrastructure health and server metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 bg-[#0EA5A4] text-white font-bold px-4 py-2 rounded-xl transition-colors hover:bg-[#14B8A6] shadow-lg shadow-[#0EA5A4]/20">
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500 opacity-5 group-hover:scale-150 transition-transform duration-500 blur-xl"></div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 relative z-10 shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              {health?.status || 'Healthy'} <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-500 opacity-5 group-hover:scale-150 transition-transform duration-500 blur-xl"></div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 relative z-10 shadow-inner">
            <Activity size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">CPU Load</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{health?.cpu_usage || '32%'}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-500 opacity-5 group-hover:scale-150 transition-transform duration-500 blur-xl"></div>
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 relative z-10 shadow-inner">
            <Database size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Database</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Connected</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-500 opacity-5 group-hover:scale-150 transition-transform duration-500 blur-xl"></div>
          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 relative z-10 shadow-inner">
            <HardDrive size={28} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-0.5">Storage</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{health?.storage || '45% Used'}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Cpu className="text-blue-500" size={20} /> Live CPU Usage
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Wifi className="text-emerald-500" size={20} /> Network Traffic (MB/s)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
