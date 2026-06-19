import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogOut, Key, Edit, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function ParentProfile({ user }: { user: any }) {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }
    setIsUpdating(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update password.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-[#0EA5A4]" /> Parent Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account, contact details, and notification preferences</p>
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
                {user?.full_name?.charAt(0) || 'P'}
              </span>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-[#0EA5A4] text-white rounded-full hover:bg-[#14B8A6] transition-colors shadow-md">
              <Edit size={14} />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user?.full_name || 'Parent Name'}</h3>
          <p className="text-slate-500 mb-4">{user?.email || 'parent@apexhub.edu'}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
            <Shield size={14} /> Parent Account
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-rose-600 font-bold rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </motion.div>

        {/* Security & Settings */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Key className="text-[#0EA5A4]" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Security Settings</h3>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white" 
                />
              </div>
              <button 
                onClick={handlePasswordUpdate}
                disabled={isUpdating}
                className="py-2.5 px-6 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white font-bold rounded-xl transition-colors shadow-md shadow-[#0EA5A4]/20 flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Settings className="text-slate-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Notification Preferences</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Exam Results Alerts', desc: 'Get notified when new results are published' },
                { label: 'Attendance Alerts', desc: 'Daily attendance SMS/Email notifications' },
                { label: 'Fee Reminders', desc: 'Alerts for upcoming fee deadlines' },
                { label: 'Teacher Messages', desc: 'Push notifications for direct messages' }
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">{pref.label}</div>
                    <div className="text-xs text-slate-500">{pref.desc}</div>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id={`toggle${i}`} defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#0EA5A4]" style={{ right: 0, borderColor: '#0EA5A4', backgroundColor: '#0EA5A4' }}/>
                    <label htmlFor={`toggle${i}`} className="toggle-label block overflow-hidden h-5 rounded-full bg-[#0EA5A4] cursor-pointer"></label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
