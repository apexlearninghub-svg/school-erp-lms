import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Shield, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

interface ProfileProps {
  user: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function StudentProfile({ user }: ProfileProps) {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.put('/user/password', {
        current_password: passwords.current,
        new_password: passwords.new
      });
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6 pb-6">
      
      {/* Header Card */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mt-20 -mr-20"></div>
        </div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-[#0EA5A4] shadow-lg relative overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.full_name)
              )}
            </div>
            
            <div className="text-center sm:text-left flex-1 pb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1">{user?.full_name}</h1>
              <p className="text-slate-500 font-medium">Student • Class {user?.student_profile?.class_name || 'N/A'}</p>
            </div>
            
            <div className="pb-2">
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-sm font-bold flex items-center gap-2">
                <Shield size={16} /> Active Status
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 uppercase font-bold">Email</p>
                  <p className="text-sm font-semibold truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 uppercase font-bold">Phone</p>
                  <p className="text-sm font-semibold truncate">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 uppercase font-bold">Address</p>
                  <p className="text-sm font-semibold truncate">{user?.student_profile?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Col */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Academic Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-[#0EA5A4]/10 text-[#0EA5A4] rounded-lg"><GraduationCap size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{user?.student_profile?.roll_number || 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-[#0EA5A4]/10 text-[#0EA5A4] rounded-lg"><Calendar size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Session</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{user?.student_profile?.academic_session || '2023-2024'}</p>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 mt-8 border-b border-slate-100 dark:border-slate-700 pb-2">Parent / Guardian</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Father's Name</p>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white pl-6">{user?.student_profile?.father_name || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mother's Name</p>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white pl-6">{user?.student_profile?.mother_name || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Parent Phone</p>
                </div>
                <p className="font-semibold text-slate-800 dark:text-white pl-6">{user?.student_profile?.parent_phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={itemVariants} className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Security</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] outline-none"
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                <input 
                  type="password" 
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] outline-none"
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                <input 
                  type="password" 
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] outline-none"
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0EA5A4] text-white font-bold rounded-xl hover:bg-[#14B8A6] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Change Password
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
