import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Mail, Loader2, ArrowLeft,
  Lock, Eye, EyeOff, CheckCircle2,
  KeyRound, GraduationCap,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';

type Step = 'email' | 'reset' | 'success';

const emailSchema = z.object({ email: z.string().email('Please enter a valid email address') });
const resetSchema = z.object({
  new_password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/\d/, 'Must contain number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const STEP_LABELS: Record<Step, string> = {
  email: 'Enter Email',
  reset: 'Reset Password',
  success: 'Done',
};
const STEPS: Step[] = ['email', 'reset', 'success'];

function StepIndicator({ current }: { current: Step }) {
  const activeIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 mb-7">
      {STEPS.filter(s => s !== 'success').map((step, idx) => (
        <React.Fragment key={step}>
          <div className={`flex items-center gap-1.5 ${idx <= activeIdx ? 'text-[#0EA5A4]' : 'text-[#94A3B8]'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              idx < activeIdx ? 'bg-[#0EA5A4] text-white' :
              idx === activeIdx ? 'bg-[#0EA5A4] text-white ring-4 ring-[#0EA5A4]/20' :
              'bg-[#E2E8F0] dark:bg-[#334155] text-[#94A3B8]'
            }`}>
              {idx < activeIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{STEP_LABELS[step]}</span>
          </div>
          {idx < 1 && <div className={`flex-1 h-px transition-all duration-300 ${idx < activeIdx ? 'bg-[#0EA5A4]' : 'bg-[#E2E8F0] dark:bg-[#334155]'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  
  const [step, setStep] = useState<Step>('email');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    if (tokenParam) {
      setResetToken(tokenParam);
      setStep('reset');
    }
  }, [tokenParam]);

  const handleEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      toast.success('Password recovery OTP sent to email!', { duration: 4000 });
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}&purpose=password_reset`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'No account associated with this email address was found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, data.new_password);
      setStep('success');
      toast.success('Password reset successfully!');
    } catch {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
  };

  const cardContent = () => {
    switch (step) {
      case 'email':
        return (
          <motion.div key="email" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #0EA5A4, #14B8A6)' }}>
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Forgot Password?</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mt-1">Enter your email to reset your password</p>
            </div>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate>
              <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Email Address</label>
              <div className="relative mb-5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  {...emailForm.register('email')}
                  type="email"
                  placeholder="Enter your registered email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] outline-none input-focus-glow transition-all
                    ${emailForm.formState.errors.email ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-[#EF4444] text-xs -mt-3 mb-3">{emailForm.formState.errors.email.message}</p>
              )}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ boxShadow: '0 4px 20px rgba(14,165,164,0.4)' }}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Mail className="w-4 h-4" /> Verify Email</>}
              </motion.button>
            </form>
          </motion.div>
        );

      case 'reset':
        return (
          <motion.div key="reset" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #0EA5A4, #14B8A6)' }}>
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">New Password</h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mt-1">Choose a strong new password</p>
            </div>
            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    {...resetForm.register('new_password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] outline-none input-focus-glow transition-all
                      ${resetForm.formState.errors.new_password ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0EA5A4]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.new_password && <p className="text-[#EF4444] text-xs mt-1">{resetForm.formState.errors.new_password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    {...resetForm.register('confirm_password')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#94A3B8] outline-none input-focus-glow transition-all
                      ${resetForm.formState.errors.confirm_password ? 'border-[#EF4444]' : 'border-[#E2E8F0] dark:border-[#334155] focus:border-[#0EA5A4]'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0EA5A4]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirm_password && <p className="text-[#EF4444] text-xs mt-1">{resetForm.formState.errors.confirm_password.message}</p>}
              </div>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ boxShadow: '0 4px 20px rgba(14,165,164,0.4)' }}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <><KeyRound className="w-4 h-4" /> Reset Password</>}
              </motion.button>
            </form>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Password Reset!</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mb-6">Your password has been updated. You can now sign in.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm"
              style={{ boxShadow: '0 4px 20px rgba(14,165,164,0.4)' }}
            >
              Back to Login
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-5 right-5 z-20"><ThemeToggle /></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`glass ${isDark ? 'glass-dark' : ''} rounded-3xl p-8 shadow-xl`} style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
          {/* Back + Logo */}
          <div className="flex items-center gap-3 mb-5">
            {step !== 'success' && (
              <button
                onClick={() => {
                  if (step === 'email') navigate('/login');
                  else if (step === 'reset') setStep('email');
                }}
                className="p-2 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
              </button>
            )}
            <div className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5A4, #14B8A6)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          </div>

          {step !== 'success' && <StepIndicator current={step} />}

          <AnimatePresence mode="wait">
            {cardContent()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
