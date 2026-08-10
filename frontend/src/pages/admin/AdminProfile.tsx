import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Key, Edit, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Button, Badge, Avatar } from '@/components/ui';

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
      <Card className="shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-[#862fe7]" /> Admin Profile
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account and global security settings</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <Card className="text-center relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#862fe7] to-[#ad6df4] opacity-10"></div>
            
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center mb-4 mt-4">
              <Avatar src={user?.avatar} name={user?.full_name || 'System Admin'} size="lg" />
              <button className="absolute bottom-0 right-0 p-2 bg-[#862fe7] text-white rounded-full hover:bg-[#ad6df4] transition-colors shadow-md z-10">
                <Edit size={14} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user?.full_name || 'System Admin'}</h3>
            <p className="text-slate-500 mb-4">{user?.email || 'admin@apexhub.edu'}</p>
            
            <div className="mb-8">
              <Badge variant="violet" className="uppercase tracking-wider">
                <Shield size={14} className="inline mr-1" /> Super Admin
              </Badge>
            </div>
            
            <Button 
              variant="destructive"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Sign Out
            </Button>
          </Card>
        </motion.div>

        {/* Security & Roles */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Key className="text-[#862fe7]" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Security Settings</h3>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#862fe7] dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#862fe7] dark:text-white" />
              </div>
              <Button variant="primary">
                Update Password
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <Lock className="text-slate-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Role-Based Access Control</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">You have full super-admin access. Manage permissions for other administrative roles below.</p>
            
            <div className="space-y-3">
              {['System Administrator', 'Principal', 'Vice Principal', 'Accountant'].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <div className="font-bold text-slate-700 dark:text-slate-300">{role}</div>
                  <button className="text-xs font-bold text-[#862fe7] hover:underline">Edit Permissions</button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
