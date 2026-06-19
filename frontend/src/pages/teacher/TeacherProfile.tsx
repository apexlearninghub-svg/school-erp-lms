import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Calendar, Shield, Save, Camera, MapPin, Loader2 } from 'lucide-react';
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

export function TeacherProfile({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '+1 234 567 8900', // Mock since it's not strictly on user model right now
    bio: 'Dedicated educator with 10+ years of experience in facilitating student engagement and deep understanding of complex subjects.',
    address: '123 Education Lane, Academic City, ST 12345'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save since we haven't built the full update profile endpoint yet
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }, 1000);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-y-auto pb-6 pr-2">
      <motion.div variants={itemVariants} className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-slate-900 to-[#0EA5A4] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-6">
            <div className="flex items-end gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] flex justify-center items-center text-4xl font-black text-white shadow-xl overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0) || 'T'
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-slate-900/80 text-white rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="pb-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{formData.full_name}</h1>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0EA5A4]/10 text-[#0EA5A4] rounded-lg uppercase tracking-wider">
                    <Shield size={14} /> Teacher Account
                  </span>
                  <span>{user?.teacher_profile?.employee_id || 'TCH-001'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-xl font-bold bg-[#0EA5A4] text-white hover:opacity-95 shadow-lg shadow-[#0EA5A4]/20 transition-all flex items-center gap-2">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-all">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">About Me</h3>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white resize-none"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {formData.bio}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center"><Mail size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Email Address</p>
                      {isEditing ? (
                        <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none text-sm font-semibold dark:text-white pb-1" />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{formData.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center"><Briefcase size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Department</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.teacher_profile?.department || 'Academics'}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center"><Calendar size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Joined</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center"><MapPin size={20} /></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Location</p>
                      {isEditing ? (
                        <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none text-sm font-semibold dark:text-white pb-1" />
                      ) : (
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{formData.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Qualifications</h3>
                <ul className="space-y-4">
                  {[
                    { degree: 'Master of Education (M.Ed.)', year: '2015', inst: 'State University' },
                    { degree: 'Bachelor of Science', year: '2012', inst: 'Tech Institute' }
                  ].map((q, idx) => (
                    <li key={idx} className="relative pl-6">
                      <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#0EA5A4]"></span>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{q.degree}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{q.inst} • {q.year}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {['Curriculum Design', 'Student Assessment', 'EdTech Integration', 'STEM', 'Mentoring'].map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
