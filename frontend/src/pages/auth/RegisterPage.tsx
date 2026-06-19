import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Eye, EyeOff, Loader2, UserPlus, GraduationCap,
  Shield, BookOpen, Users, Mail, User as UserIcon,
  Lock, ArrowLeft,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, _ and - allowed'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/\d/, 'Must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character'),
  confirm_password: z.string(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const ROLES: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, desc: 'System administrator' },
  { id: 'teacher', label: 'Teacher', icon: <BookOpen className="w-5 h-5" />, desc: 'Faculty member' },
  { id: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" />, desc: 'Enrolled student' },
  { id: 'parent', label: 'Parent', icon: <Users className="w-5 h-5" />, desc: 'Parent / Guardian' },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'strength-weak' };
  if (score === 2) return { score, label: 'Fair', color: 'strength-fair' };
  if (score === 3) return { score, label: 'Good', color: 'strength-good' };
  return { score, label: 'Strong', color: 'strength-strong' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  });

  const watchedPassword = watch('password', '');
  const watchedRole = watch('role');
  const strength = useMemo(() => getPasswordStrength(watchedPassword || ''), [watchedPassword]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('Account created! Verification code sent to email.', { duration: 4000 });
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; details?: Record<string, string> } } };
      const details = error?.response?.data?.details;
      if (details) {
        Object.entries(details).forEach(([field, msg]) => {
          setError(field as keyof RegisterForm, { message: msg });
        });
      } else {
        const message = error?.response?.data?.error || 'Registration failed.';
        setError('root', { message });
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  };


  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4 py-10">
      <div className="absolute top-5 right-5 z-20"><ThemeToggle /></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        <motion.div
          className={`glass ${isDark ? 'glass-dark' : ''} rounded-3xl p-8 shadow-xl`}
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="relative text-center mb-8 flex flex-col items-center">
            <Link to="/" className="absolute left-0 top-0 p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            </Link>
            
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-lg shrink-0" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">Create Account</h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mt-1.5 font-medium">Join Apex Learning Hub today</p>
          </motion.div>

          {/* Role Selector */}
          <motion.div variants={itemVariants} className="mb-6">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-3">I am a</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <motion.button
                  key={role.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setValue('role', role.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    watchedRole === role.id
                      ? 'role-btn-active'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-[#0EA5A4] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {role.icon}
                  <div>
                    <div className="text-sm font-semibold">{role.label}</div>
                    <div className={`text-xs ${watchedRole === role.id ? 'text-white/70' : 'text-[#94A3B8]'}`}>{role.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Full Name */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...register('full_name')}
                  placeholder="John Smith"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all outline-none input-focus-glow
                    ${errors.full_name ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                />
              </div>
              {errors.full_name && <p className="text-[#EF4444] text-xs mt-1.5">{errors.full_name.message}</p>}
            </motion.div>

            {/* Email + Username Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@school.edu"
                    className={`w-full pl-10 pr-3 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all outline-none input-focus-glow
                      ${errors.email ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                  />
                </div>
                {errors.email && <p className="text-[#EF4444] text-xs mt-1.5">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm font-medium">@</span>
                  <input
                    {...register('username')}
                    placeholder="johnsmith"
                    className={`w-full pl-8 pr-3 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all outline-none input-focus-glow
                      ${errors.username ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                  />
                </div>
                {errors.username && <p className="text-[#EF4444] text-xs mt-1.5">{errors.username.message}</p>}
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all outline-none input-focus-glow
                    ${errors.password ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                />
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0EA5A4] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
              {/* Password Strength Meter */}
              {watchedPassword && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-[#E2E8F0] dark:bg-[#334155]'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.score <= 1 ? 'text-[#EF4444]' : strength.score === 2 ? 'text-[#F59E0B]' : strength.score === 3 ? 'text-[#3B82F6]' : 'text-[#22C55E]'}`}>
                    Password strength: {strength.label}
                  </p>
                </motion.div>
              )}
              {errors.password && <p className="text-[#EF4444] text-xs mt-1">{errors.password.message}</p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...register('confirm_password')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all outline-none input-focus-glow
                    ${errors.confirm_password ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                />
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0EA5A4] transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
              {errors.confirm_password && <p className="text-[#EF4444] text-xs mt-1.5">{errors.confirm_password.message}</p>}
            </motion.div>

            {/* Root Error */}
            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] text-sm text-center"
                >
                  {errors.root.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                style={{ boxShadow: '0 4px 20px rgba(14, 165, 164, 0.4)' }}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Create Account</>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center mt-5 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0EA5A4] font-semibold hover:underline">Sign in</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
