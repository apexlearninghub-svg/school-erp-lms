import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const OTPVerificationPage = lazy(() => import('@/pages/auth/OTPVerificationPage'));

const HomePage = lazy(() => import('@/pages/HomePage'));
const AdmissionPage = lazy(() => import('@/pages/AdmissionPage'));
const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));
const TeacherDashboard = lazy(() => import('@/pages/dashboard/TeacherDashboard'));
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard'));
const ParentDashboard = lazy(() => import('@/pages/dashboard/ParentDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] dark:bg-[#0F172A]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#862fe7] animate-spin" />
        <p className="text-sm text-[#6b7589] font-medium">Loading...</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public Routes ── */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><CoursesPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />

        {/* ── Guest Routes ── */}
        <Route path="/login" element={<GuestRoute><PageTransition><LoginPage /></PageTransition></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><PageTransition><RegisterPage /></PageTransition></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><PageTransition><ForgotPasswordPage /></PageTransition></GuestRoute>} />
        <Route path="/verify-email" element={<GuestRoute><PageTransition><OTPVerificationPage /></PageTransition></GuestRoute>} />

        {/* ── Protected Routes ── */}
        <Route
          path="/admission"
          element={<ProtectedRoute><PageTransition><AdmissionPage /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/teacher/dashboard"
          element={<ProtectedRoute allowedRoles={['teacher']}><PageTransition><TeacherDashboard /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/student/dashboard"
          element={<ProtectedRoute allowedRoles={['student']}><PageTransition><StudentDashboard /></PageTransition></ProtectedRoute>}
        />
        <Route
          path="/parent/dashboard"
          element={<ProtectedRoute allowedRoles={['parent']}><PageTransition><ParentDashboard /></PageTransition></ProtectedRoute>}
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              gutter={8}
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                  background: 'white',
                  color: '#111827',
                },
                success: {
                  iconTheme: { primary: '#862fe7', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: 'white' },
                },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
