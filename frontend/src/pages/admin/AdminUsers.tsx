import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, UserPlus, MoreVertical, Loader2, X, Clipboard, Check } from 'lucide-react';
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

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'parent'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [rollNumber, setRollNumber] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStudents();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const url = roleFilter === 'all' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
      const res = await api.get(url);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/users?role=student');
      setStudents(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setUsername('');
    setClassName('Class 10');
    setRollNumber('');
    setFatherName('');
    setMotherName('');
    setPhoneNumber('');
    setOccupation('');
    setAddress('');
    setSelectedStudentId('');
    setCreatedCredentials(null);
    setCopied(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !username) {
      toast.error('Name, email, and username are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalType === 'student') {
        const res = await api.post('/admin/student/create', {
          full_name: fullName,
          email,
          username,
          class_name: className,
          roll_number: rollNumber,
          father_name: fatherName,
          mother_name: motherName
        });
        setCreatedCredentials(res.data.credentials);
        toast.success('Student account created successfully!');
      } else {
        const res = await api.post('/admin/parent/create', {
          full_name: fullName,
          email,
          username,
          phone_number: phoneNumber,
          occupation,
          address,
          student_id: selectedStudentId || null
        });
        setCreatedCredentials(res.data.credentials);
        toast.success('Parent account created and linked successfully!');
      }
      fetchUsers();
      fetchStudents();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create account.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-[#0EA5A4]" /> User Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage all students, teachers, parents, and staff accounts</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:border-[#0EA5A4] transition-colors dark:text-white"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="parent">Parents</option>
            <option value="staff">Staff</option>
            <option value="admin">Admins</option>
          </select>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex justify-center items-center gap-2 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-md shadow-[#0EA5A4]/20"
          >
            <UserPlus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0EA5A4] mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-white font-bold text-sm">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-white">{user.full_name}</p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                        user.role === 'student' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                    </td>
                    <td className="p-4">
                      {user.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
          <p className="text-xs font-semibold text-slate-500">Showing {filteredUsers.length} users</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800">Prev</button>
            <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800">Next</button>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-2xl rounded-3xl w-full max-w-xl overflow-hidden z-10 relative flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Add New Account</h3>
                  <p className="text-xs text-slate-500">Create new student or parent user login</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {createdCredentials ? (
                /* Success / Credentials screen */
                <div className="p-8 text-center space-y-6 overflow-y-auto">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white">Account Credentials Generated</h4>
                    <p className="text-sm text-slate-500 mt-1">Credentials have been set up in the system. Copy them below to share.</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 text-left space-y-3 font-mono relative max-w-md mx-auto">
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-4 top-4 p-2 text-slate-400 hover:text-[#0EA5A4] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      title="Copy Credentials"
                    >
                      {copied ? <Check size={16} className="text-emerald-500" /> : <Clipboard size={16} />}
                    </button>
                    <div>
                      <span className="text-xs text-slate-400 block uppercase font-sans font-bold">Username</span>
                      <span className="text-sm text-slate-800 dark:text-white font-bold">{createdCredentials.username}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block uppercase font-sans font-bold">Temporary Password</span>
                      <span className="text-sm text-slate-800 dark:text-white font-bold">{createdCredentials.password}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full max-w-xs bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-[#0EA5A4]/25"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Interactive Form Screen */
                <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Account Type Tabs */}
                  <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setModalType('student')}
                      className={`py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'student' ? 'bg-white dark:bg-slate-800 text-[#0EA5A4] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      Student Account
                    </button>
                    <button 
                      type="button"
                      onClick={() => setModalType('parent')}
                      className={`py-2 rounded-xl text-sm font-bold transition-all ${modalType === 'parent' ? 'bg-white dark:bg-slate-800 text-[#0EA5A4] shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      Parent Account
                    </button>
                  </div>

                  {/* Common Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                      <input 
                        type="text" 
                        required
                        placeholder="johndoe"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="johndoe@school.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                    />
                  </div>

                  {/* Student Specific Fields */}
                  {modalType === 'student' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Class Name</label>
                          <select 
                            value={className}
                            onChange={e => setClassName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Roll Number (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="S102"
                            value={rollNumber}
                            onChange={e => setRollNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Father's Name</label>
                          <input 
                            type="text" 
                            placeholder="Robert Doe"
                            value={fatherName}
                            onChange={e => setFatherName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Mother's Name</label>
                          <input 
                            type="text" 
                            placeholder="Mary Doe"
                            value={motherName}
                            onChange={e => setMotherName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parent Specific Fields */}
                  {modalType === 'parent' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                          <input 
                            type="text" 
                            placeholder="+1234567890"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Occupation</label>
                          <input 
                            type="text" 
                            placeholder="Engineer"
                            value={occupation}
                            onChange={e => setOccupation(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                        <input 
                          type="text" 
                          placeholder="123 Main St"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                        />
                      </div>
                      
                      {/* Linking Student Select Dropdown */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Link Student (Child)</label>
                        <select 
                          value={selectedStudentId}
                          onChange={e => setSelectedStudentId(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none focus:border-[#0EA5A4] dark:text-white"
                        >
                          <option value="">-- No Linked Student --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name} (@{s.username})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#0EA5A4]/20 flex items-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create Account
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
