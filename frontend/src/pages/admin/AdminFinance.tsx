import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, DownloadCloud, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function AdminFinance() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/finance/revenue')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <DollarSign className="text-[#0EA5A4]" /> Finance & Fees
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track revenue, fee collections, and outstanding payments</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
          <DownloadCloud size={18} /> Export Financial Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] rounded-3xl p-6 shadow-lg shadow-teal-500/20 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-teal-100 font-bold text-sm uppercase tracking-wider mb-2 relative z-10">Total Collected</p>
              <h3 className="text-4xl font-black mb-1 relative z-10">${data?.total_collected?.toLocaleString() || 0}</h3>
              <p className="text-sm font-medium text-teal-50 relative z-10">Live Revenue Data</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">Outstanding Dues</p>
                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><AlertCircle size={18} /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">${data?.total_outstanding?.toLocaleString() || 0}</h3>
              <p className="text-sm font-medium text-rose-500">Requires follow-up</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">Collection Rate</p>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg"><TrendingUp size={18} /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{data?.collection_rate || 0}%</h3>
              <p className="text-sm font-medium text-slate-400">Target: 95%</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Revenue Trend (Last 6 Months)</h3>
              
              <div className="h-64 flex items-end gap-2 sm:gap-4 relative pt-10">
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-bold text-slate-400 w-12 text-right pr-2">
                  <span>$80k</span><span>$60k</span><span>$40k</span><span>$20k</span><span>0</span>
                </div>
                
                <div className="absolute left-12 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-slate-100 dark:border-slate-700/50"></div>)}
                </div>

                <div className="flex-1 flex items-end justify-around pl-12 relative z-10 h-full pb-6">
                  {data?.monthly_revenue?.map((item: any, i: number) => {
                    const heightPercent = (item.amount / 80000) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center group w-full px-1 sm:px-2 h-full justify-end">
                        <div className="w-full max-w-[40px] relative flex justify-center items-end" style={{ height: `${Math.max(5, heightPercent)}%` }}>
                          <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                            ${item.amount.toLocaleString()}
                          </div>
                          <div className="w-full h-full rounded-t-xl bg-gradient-to-t from-emerald-500 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all shadow-md"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 mt-3 absolute bottom-0">{item.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Transactions</h3>
                <button className="text-sm font-bold text-[#0EA5A4] hover:underline">View All</button>
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <CreditCard size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Transaction log empty</h4>
                <p className="text-sm text-slate-500 mt-1">New fee payments will appear here as they are processed.</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
