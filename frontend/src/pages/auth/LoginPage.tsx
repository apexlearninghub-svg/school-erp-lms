import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Eye, EyeOff, Loader2, LogIn, Shield,
  GraduationCap, BookOpen, Users, User as UserIcon,
  CheckCircle2, Sparkles, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const loginSchema = z.object({
  identifier:  z.string().min(3, 'Enter your username or email'),
  password:    z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLES: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'admin',   label: 'Admin',   icon: <Shield className="w-4 h-4" />,        desc: 'Manage school operations' },
  { id: 'teacher', label: 'Teacher', icon: <BookOpen className="w-4 h-4" />,      desc: 'Teach & assess students' },
  { id: 'student', label: 'Student', icon: <GraduationCap className="w-4 h-4" />, desc: 'Learn & take exams' },
  { id: 'parent',  label: 'Parent',  icon: <Users className="w-4 h-4" />,         desc: 'Track your child' },
];

const FEATURES = [
  { icon: '🎓', text: 'Smart AI-powered learning' },
  { icon: '📊', text: 'Real-time analytics & reports' },
  { icon: '🔒', text: 'Enterprise-grade security' },
  { icon: '📱', text: 'Works on all devices' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember_me: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    clearErrors();
    try {
      const redirectUrl = await login(data.identifier, data.password, data.remember_me);
      setLoginSuccess(true);
      toast.success('Welcome back! Redirecting...', { icon: '🎉', duration: 2000 });
      setTimeout(() => navigate(redirectUrl), 1500);
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        response?: { data?: { error?: string; email?: string } };
      };
      const errorData = error?.response?.data;
      if (errorData?.error === 'Verify Your Email First' && errorData?.email) {
        toast.error('Please verify your email address first.');
        navigate(`/verify-email?email=${encodeURIComponent(errorData.email)}`);
        return;
      }
      const message = errorData?.error || error.message || 'Invalid username or password.';
      setError('root', { message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    hidden:  { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  };
  const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 ${isDark ? 'bg-[#0F172A]' : 'bg-[#f8faff]'} relative overflow-hidden`}>

        {/* Mobile gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #862fe7, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ff5fe4, transparent)', transform: 'translate(-30%, 30%)' }} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          {/* Logo for mobile */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo.png" alt="Apex Learning Hub" className="w-9 h-9 rounded-[12px] object-contain" />
            <span className="font-bold text-[#111827] dark:text-white">Apex Learning Hub</span>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={itemVariants}
            className={`rounded-[32px] p-8 ${
              isDark
                ? 'bg-[#1E293B] border border-[#334155]'
                : 'bg-white border border-[#d8e0ea]'
            } shadow-[0_20px_60px_rgba(0,0,0,0.08)]`}
          >
            {/* Heading */}
            <motion.div variants={itemVariants} className="mb-7">
              <h2 className="text-2xl font-bold text-[#111827] dark:text-white">Welcome back 👋</h2>
              <p className="text-sm text-[#6b7589] dark:text-[#94A3B8] mt-1">
                Sign in to your account to continue
              </p>
            </motion.div>

            {/* Role Selector */}
            <motion.div variants={itemVariants} className="mb-6">
              <p className="text-xs font-semibold text-[#6b7589] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
                Sign in as
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLES.map(role => (
                  <motion.button
                    key={role.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={[
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-[14px] border-2 transition-all duration-150 text-xs font-semibold',
                      selectedRole === role.id
                        ? 'border-[#862fe7] bg-[#ebdafd] text-[#862fe7] dark:bg-[rgba(134,47,231,0.18)] dark:border-[#862fe7] dark:text-[#ad6df4]'
                        : 'border-[#d8e0ea] dark:border-[#334155] text-[#6b7589] dark:text-[#94A3B8] bg-white dark:bg-[#1E293B] hover:border-[#862fe7]/40',
                    ].join(' ')}
                  >
                    <span className={selectedRole === role.id ? 'text-[#862fe7] dark:text-[#ad6df4]' : 'text-[#6b7589]'}>
                      {role.icon}
                    </span>
                    {role.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Google OAuth */}
            <motion.div variants={itemVariants}>
              <GoogleButton role={selectedRole} />
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-[#d8e0ea] dark:bg-[#334155]" />
              <span className="text-xs text-[#6b7589] font-medium px-1">OR CONTINUE WITH EMAIL</span>
              <div className="flex-1 h-px bg-[#d8e0ea] dark:bg-[#334155]" />
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Username / Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-[#111827] dark:text-[#F1F5F9] mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7589]" />
                  <input
                    {...register('identifier')}
                    type="text"
                    placeholder="Enter username or email"
                    autoComplete="username"
                    className={[
                      'w-full pl-10 pr-4 py-3 rounded-[12px] border text-sm',
                      'bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F1F5F9]',
                      'placeholder-[#6b7589] transition-all duration-150 outline-none',
                      'focus:ring-2 focus:ring-[rgba(134,47,231,0.2)] focus:border-[#862fe7]',
                      errors.identifier
                        ? 'border-[#EF4444]'
                        : 'border-[#d8e0ea] dark:border-[#334155]',
                    ].join(' ')}
                  />
                </div>
                {errors.identifier && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[#EF4444] text-xs mt-1.5">
                    {errors.identifier.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-[#111827] dark:text-[#F1F5F9] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7589]" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={[
                      'w-full pl-10 pr-12 py-3 rounded-[12px] border text-sm',
                      'bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F1F5F9]',
                      'placeholder-[#6b7589] transition-all duration-150 outline-none',
                      'focus:ring-2 focus:ring-[rgba(134,47,231,0.2)] focus:border-[#862fe7]',
                      errors.password
                        ? 'border-[#EF4444]'
                        : 'border-[#d8e0ea] dark:border-[#334155]',
                    ].join(' ')}
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7589] hover:text-[#862fe7] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[#EF4444] text-xs mt-1.5">
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember + Forgot */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    {...register('remember_me')}
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#d8e0ea] text-[#862fe7] focus:ring-[#862fe7] cursor-pointer"
                  />
                  <span className="text-sm text-[#6b7589] dark:text-[#94A3B8] group-hover:text-[#862fe7] transition-colors">
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#862fe7] font-medium hover:underline transition-all">
                  Forgot password?
                </Link>
              </motion.div>

              {/* Root Error */}
              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 rounded-[12px] bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-800 text-[#EF4444] text-sm text-center"
                  >
                    {errors.root.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading || loginSuccess}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full btn-primary py-3.5 rounded-[12px] text-sm font-semibold flex items-center justify-center gap-2 mt-2"
              >
                <AnimatePresence mode="wait">
                  {loginSuccess ? (
                    <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Redirecting...</span>
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div key="loading" className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Sign Up */}
            <motion.p variants={itemVariants} className="text-center mt-5 text-sm text-[#6b7589] dark:text-[#94A3B8]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#862fe7] font-semibold hover:underline">
                Create account
              </Link>
            </motion.p>
          </motion.div>

          {/* Footer */}
          <motion.p variants={itemVariants} className="text-center mt-5 text-xs text-[#6b7589] dark:text-[#94A3B8]">
            © {new Date().getFullYear()} Apex Learning Hub · Enterprise Authentication
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
