import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'email_verification';
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle auto-send OTP on mount if missing session helper
  useEffect(() => {
    if (!email) {
      toast.error('Invalid verification link. Missing email.');
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const pasteOtp = pasteData.split('');
      setOtp(pasteOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode,
        purpose
      });

      setIsSuccess(true);
      toast.success('OTP verified successfully!');

      setTimeout(() => {
        if (purpose === 'password_reset') {
          // Pass the reset token to ForgotPassword reset screen
          navigate(`/forgot-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(res.data.reset_token)}`);
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Verification failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setErrorMessage('');
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP code has been sent.');
      setCountdown(60);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to resend OTP.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <div className={`glass rounded-3xl p-8 ${isDark ? 'glass-dark' : ''} shadow-2xl`}>
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Email Verified!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    {purpose === 'password_reset' 
                      ? 'Redirecting to reset password screen...' 
                      : 'Your account is active. Redirecting to login...'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-gradient-to-br from-[#0EA5A4] to-[#14B8A6] text-white">
                    <ShieldCheck className="w-9 h-9" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                    Verify Your Email
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    We sent a secure 6-digit OTP code to <br />
                    <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  {/* Verification inputs */}
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { if (el) inputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        className="w-12 h-14 text-center text-2xl font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white rounded-xl focus:border-[#0EA5A4] outline-none transition-all input-focus-glow"
                      />
                    ))}
                  </div>

                  {errorMessage && (
                    <div className="p-3 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-rose-500 text-xs font-bold">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0EA5A4]/20"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </form>

                {/* Resend details */}
                <div className="flex flex-col items-center gap-2 text-center text-sm">
                  {countdown > 0 ? (
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Resend code in <strong className="text-[#0EA5A4]">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={isResending}
                      className="flex items-center gap-2 text-[#0EA5A4] hover:underline font-bold transition-all"
                    >
                      {isResending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Resend Verification Code
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white mt-4 text-xs font-bold"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
