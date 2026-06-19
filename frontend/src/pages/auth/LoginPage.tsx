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
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter your username or email'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLES: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  { id: 'admin',   label: 'Admin',   icon: <Shield className="w-4 h-4" /> },
  { id: 'teacher', label: 'Teacher', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'student', label: 'Student', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'parent',  label: 'Parent',  icon: <Users className="w-4 h-4" /> },
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
    setValue,
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

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.07 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #0EA5A4, transparent)' }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #14B8A6, transparent)' }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* ── Card ── */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`glass rounded-3xl p-8 ${isDark ? 'glass-dark' : ''}`}
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 1px 8px rgba(14,165,164,0.06)' }}
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-6">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-16 h-16 rounded-2xl object-contain mb-4 shadow-lg shrink-0" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Welcome Back 👋
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mt-1 text-center">
              Sign in to your Apex Learning Hub account
            </p>
          </motion.div>

          {/* Role Selector */}
          <motion.div variants={itemVariants} className="mb-5">
            <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-3">
              Sign in as
            </p>
            <div className="grid grid-cols-4 gap-2">
              {ROLES.map((role) => (
                <motion.button
                  key={role.id}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 transition-all duration-200 text-xs font-semibold ${
                    selectedRole === role.id
                      ? 'role-btn-active'
                      : 'border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#1E293B] hover:border-[#0EA5A4] hover:text-[#0EA5A4]'
                  }`}
                >
                  {role.icon}
                  {role.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Google Button */}
          <motion.div variants={itemVariants}>
            <GoogleButton role={selectedRole} />
          </motion.div>

          {/* OR Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#334155]" />
            <span className="text-xs text-[#94A3B8] font-medium px-1">OR</span>
            <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#334155]" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Username / Email */}
            <motion.div variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="Enter username or email"
                  autoComplete="username"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all duration-200 input-focus-glow outline-none ${
                    errors.identifier
                      ? 'border-[#EF4444]'
                      : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'
                  }`}
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
            <motion.div variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] transition-all duration-200 input-focus-glow outline-none ${
                    errors.password
                      ? 'border-[#EF4444]'
                      : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'
                  }`}
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0EA5A4] transition-colors"
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

            {/* Remember Me + Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  {...register('remember_me')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#E2E8F0] text-[#0EA5A4] focus:ring-[#0EA5A4] cursor-pointer"
                />
                <span className="text-sm text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#0EA5A4] transition-colors">
                  Remember me
                </span>
              </label>
              <Link to="/forgot-password"
                className="text-sm text-[#0EA5A4] font-medium hover:underline transition-all">
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
                  className="mb-4 p-3 rounded-xl bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-800 text-[#EF4444] text-sm text-center"
                >
                  {errors.root.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading || loginSuccess}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 4px 20px rgba(14, 165, 164, 0.4)' }}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* Sign Up Link */}
          <motion.p variants={itemVariants} className="text-center mt-5 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0EA5A4] font-semibold hover:underline">
              Create account
            </Link>
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center mt-4 text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} Apex Learning Hub · Enterprise Authentication System
        </motion.p>
      </motion.div>
    </div>
  );
}
