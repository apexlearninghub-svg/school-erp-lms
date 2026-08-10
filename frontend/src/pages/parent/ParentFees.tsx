import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, AlertCircle, DownloadCloud, FileText, CreditCard } from 'lucide-react';
import { Card, Button, Badge, SkeletonTable } from '@/components/ui';
import api from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentFees() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/fees')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <DollarSign className="text-[#862fe7]" /> Fee Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">View fee structures, outstanding dues, and payment history</p>
        </div>
      </Card>

      {isLoading ? (
        <SkeletonTable rows={3} cols={3} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#862fe7] to-[#ad6df4] rounded-3xl p-6 shadow-lg shadow-violet-500/20 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-teal-100 font-bold text-sm uppercase tracking-wider mb-2 relative z-10">Total Outstanding</p>
              <h3 className="text-4xl font-black mb-1 relative z-10">${data?.total_pending?.toLocaleString() || 0}</h3>
              <p className="text-sm font-medium text-teal-50 relative z-10">Due by: {data?.due_date}</p>
              
              <Button 
                className="w-full mt-6 bg-white text-[#862fe7] hover:bg-slate-50 shadow-md hover:shadow-lg transition-all relative z-10" 
                icon={<CreditCard size={20} />}
              >
                Pay Now
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card title="Fee Summary">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <span className="text-slate-500 font-bold">Total Fees</span>
                  <span className="text-slate-800 dark:text-white font-black">${((data?.total_paid || 0) + (data?.total_pending || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <span className="text-emerald-600 font-bold">Paid</span>
                  <span className="text-emerald-600 font-black">${data?.total_paid?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  <span className="text-rose-600 font-bold">Remaining</span>
                  <span className="text-rose-600 font-black">${data?.total_pending?.toLocaleString() || 0}</span>
                </div>
              </div>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col">
            <Card title="Transaction History" className="flex-1 flex flex-col">
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {data?.transactions?.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${txn.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40'}`}>
                      {txn.status === 'completed' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Tuition Installment</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{new Date(txn.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{txn.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">${txn.amount.toLocaleString()}</p>
                      <Badge variant={txn.status === 'completed' ? 'success' : 'warning'} className="uppercase">
                        {txn.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" disabled={txn.status !== 'completed'} className="p-2">
                      <DownloadCloud size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
