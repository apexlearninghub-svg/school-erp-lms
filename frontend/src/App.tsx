import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute, GuestRoute } from '@/routes/ProtectedRoute';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
    </div>
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
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  background: 'white',
                  color: '#0F172A',
                },
                success: {
                  iconTheme: { primary: '#0EA5A4', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: 'white' },
                },
              }}
            />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public Routes ── */}
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* ── Guest Routes ── */}
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                <Route path="/verify-email" element={<GuestRoute><OTPVerificationPage /></GuestRoute>} />

                {/* ── Protected Routes ── */}
                <Route
                  path="/admission"
                  element={<ProtectedRoute><AdmissionPage /></ProtectedRoute>}
                />
                <Route
                  path="/admin/dashboard"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/teacher/dashboard"
                  element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/student/dashboard"
                  element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/parent/dashboard"
                  element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>}
                />

                {/* ── Fallback ── */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
