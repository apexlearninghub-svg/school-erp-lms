import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogOut, Key, Edit, Settings } from 'lucide-react';
import { Card, Button, Badge, Avatar } from '@/components/ui';
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
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-[#862fe7]" /> Parent Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account, contact details, and notification preferences</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card className="text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#862fe7] to-[#ad6df4] opacity-10"></div>
          
          <div className="relative mb-4 mt-4">
            <Avatar src={user?.avatar} name={user?.full_name || 'Parent Name'} size="xl" className="w-28 h-28 text-4xl border-4 border-white dark:border-slate-800 shadow-lg" />
            <button className="absolute bottom-0 right-0 p-2 bg-[#862fe7] text-white rounded-full hover:bg-[#ad6df4] transition-colors shadow-md z-10">
              <Edit size={14} />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user?.full_name || 'Parent Name'}</h3>
          <p className="text-slate-500 mb-4">{user?.email || 'parent@apexhub.edu'}</p>
          
          <Badge variant="info" className="mb-8 uppercase">
            <Shield size={14} /> Parent Account
          </Badge>
          
          <Button 
            variant="destructive"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Sign Out
          </Button>
          </Card>
        </motion.div>

        {/* Security & Settings */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <Card title="Security Settings" icon={<Key size={24} />}>
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#862fe7] dark:text-white" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#862fe7] dark:text-white" 
                />
              </div>
              <Button 
                onClick={handlePasswordUpdate}
                disabled={isUpdating}
                loading={isUpdating}
                className="w-auto"
              >
                Update Password
              </Button>
            </div>
          </Card>

          <Card title="Notification Preferences" icon={<Settings size={24} />}>
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
                    <input type="checkbox" name="toggle" id={`toggle${i}`} defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#862fe7]" style={{ right: 0, borderColor: '#0EA5A4', backgroundColor: '#0EA5A4' }}/>
                    <label htmlFor={`toggle${i}`} className="toggle-label block overflow-hidden h-5 rounded-full bg-[#862fe7] cursor-pointer"></label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
