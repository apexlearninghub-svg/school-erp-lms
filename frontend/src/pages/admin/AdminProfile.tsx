import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Key, Edit, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function AdminProfile({ user }: { user: any }) {
  const { logout } = useAuth();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-[#0EA5A4]" /> Admin Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account and global security settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="md:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] opacity-10"></div>
          
          <div className="relative mx-auto w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mb-4 mt-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-slate-400 dark:text-slate-500">
                {user?.full_name?.charAt(0) || 'A'}
              </span>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-[#0EA5A4] text-white rounded-full hover:bg-[#14B8A6] transition-colors shadow-md">
              <Edit size={14} />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user?.full_name || 'System Admin'}</h3>
          <p className="text-slate-500 mb-4">{user?.email || 'admin@apexhub.edu'}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            <Shield size={14} /> Super Admin
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 font-bold rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </motion.div>

        {/* Security & Roles */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Key className="text-[#0EA5A4]" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Security Settings</h3>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" />
              </div>
              <button className="py-2.5 px-6 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white font-bold rounded-xl transition-colors shadow-md shadow-[#0EA5A4]/20">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Lock className="text-slate-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Role-Based Access Control</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">You have full super-admin access. Manage permissions for other administrative roles below.</p>
            
            <div className="space-y-3">
              {['System Administrator', 'Principal', 'Vice Principal', 'Accountant'].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div className="font-bold text-slate-700 dark:text-slate-300">{role}</div>
                  <button className="text-xs font-bold text-[#0EA5A4] hover:underline">Edit Permissions</button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
