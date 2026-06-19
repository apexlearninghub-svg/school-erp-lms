import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/types';

interface GoogleButtonProps {
  role?: UserRole;
}

// This component handles Google One Tap / OAuth redirect flow
export function GoogleButton({ role = 'student' }: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id') {
      toast.error('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in .env');
      return;
    }

    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve; });
    }

    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            try {
              const result = await authService.googleLogin(response.credential, role);
              if (result.user) updateUser(result.user);
              toast.success('Signed in with Google!', { icon: '🎉' });
              setTimeout(() => navigate(result.redirect_url), 1000);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback: use popup
            window.google.accounts.id.renderButton(
              document.getElementById('google-btn-container'),
              { theme: 'outline', size: 'large', width: '100%' }
            );
            resolve();
          }
        });
      });
    } catch {
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-[#0EA5A4] hover:shadow-md transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-[#94A3B8] border-t-[#0EA5A4] rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#0EA5A4] transition-colors">
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </span>
    </motion.button>
  );
}

// Extend window type for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement | null, options: object) => void;
        };
      };
    };
  }
}
