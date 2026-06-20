import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Shield, BookOpen, Users,
  ArrowRight, CheckCircle, Award, Sparkles,
  Phone, Mail, MapPin, Send, Star, CheckSquare,
  MessageCircle, Menu, X
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all contact fields.');
      return;
    }
    toast.success('Thank you! Your message has been sent successfully.', { icon: '✉️' });
    setContactForm({ name: '', email: '', message: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const stats = [
    { number: '1500+', label: 'Active Students' },
    { number: '98%', label: 'Exam Success Rate' },
    { number: '75+', label: 'Expert Teachers' },
    { number: '10K+', label: 'AI Tests Generated' },
  ];

  const features = [
    {
      title: 'AI Test Generator',
      desc: 'Teachers can upload chapters or type prompts to dynamically generate custom MCQ exams in seconds using Gemini API.',
      icon: <Sparkles className="w-6 h-6 text-[#0EA5A4]" />,
    },
    {
      title: 'Online Examination Platform',
      desc: 'Interactive exam UI with auto-saving, countdown timers, strict navigation constraints, and auto-submission.',
      icon: <CheckSquare className="w-6 h-6 text-[#0EA5A4]" />,
    },
    {
      title: 'Student Admissions Tracker',
      desc: 'Sleek multi-step registration for students and teachers, with dashboard tracking, and admin approvals.',
      icon: <Users className="w-6 h-6 text-[#0EA5A4]" />,
    },
    {
      title: 'Instant Analytics & Ranks',
      desc: 'Calculate scores, percentages, and dynamic class/school ranks instantly. Detailed chart reports for everyone.',
      icon: <Award className="w-6 h-6 text-[#0EA5A4]" />,
    },
  ];

  const testimonials = [
    {
      name: 'Mrs. Evelyn Clark',
      role: 'High School Chemistry Teacher',
      text: 'The AI Test Generator saved me hours of test preparation. I uploaded my chapter notes, and Gemini generated a highly accurate set of questions instantly!',
      stars: 5,
    },
    {
      name: 'David Miller',
      role: 'Grade 11 Student',
      text: 'Taking exams online feels smooth and transparent. I get my score breakdown, explanation of wrong answers, and rank immediately after submitting!',
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-300 font-sans">
      
      {/* ── Navbar Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0F172A]/70 border-b border-[#E2E8F0] dark:border-[#334155]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-contain shadow-md shadow-[#0EA5A4]/20 bg-white flex-shrink-0" />
            <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] bg-clip-text text-transparent leading-tight hidden min-[360px]:block whitespace-nowrap">
              Apex Learning Hub
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-[#0EA5A4] transition-colors">Home</Link>
            <Link to="/courses" className="hover:text-[#0EA5A4] transition-colors">Courses</Link>
            <Link to="/about" className="hover:text-[#0EA5A4] transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-[#0EA5A4] transition-colors">Contact</Link>
            <Link to="/login" className="hover:text-[#0EA5A4] transition-colors">ERP Connect</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to={`/${user?.role}/dashboard`}
                className="text-xs sm:text-sm font-semibold bg-[#0EA5A4] text-white hover:bg-[#14B8A6] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg shadow-[#0EA5A4]/15 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-cover" />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold bg-white/20">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline">{user?.full_name?.split(' ')[0]}'s Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold hover:text-[#0EA5A4] transition-colors px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold bg-[#0EA5A4] text-white hover:bg-[#14B8A6] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg shadow-[#0EA5A4]/15 transition-all whitespace-nowrap"
                >
                  Apply Online
                </Link>
              </>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Menu ── */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#0F172A] px-6 py-4 space-y-4 shadow-xl"
          >
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4]">Home</Link>
            <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4]">Courses</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4]">About Us</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4]">Contact</Link>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0EA5A4]">ERP Connect</Link>
          </motion.div>
        )}
      </motion.header>

      {/* ── Hero Section ── */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white dark:from-[#0F172A] dark:to-[#151F32]">
        <div className="absolute top-[10%] left-[-10%] w-96 h-96 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #0EA5A4, transparent)' }} />
        <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #14B8A6, transparent)' }} />

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto flex flex-col items-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0EA5A4]/10 text-[#0EA5A4] border border-[#0EA5A4]/20 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Platform
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6"
            >
              Smart School System{' '}
              <span className="bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] bg-clip-text text-transparent">
                Powered by AI
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-10"
            >
              Experience the future of education management. An enterprise-grade platform integrated with a robust AI-Powered Test Generator, secure multi-role dashboards, student onboarding, and real-time online examinations.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 font-bold bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-slate-100 px-8 py-4 rounded-2xl shadow-xl transition-all group"
              >
                Apply for Admission
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#0EA5A4] hover:text-[#0EA5A4] px-8 py-4 rounded-2xl transition-all shadow-sm"
              >
                Access Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── School Introduction (About) ── */}
      <section id="about" className="py-20 bg-white dark:bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="Apex Learning Hub Logo" className="w-8 h-8 object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Shaping Minds, Building Futures at Apex Hub
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Apex Learning Hub is dedicated to providing high-quality, inclusive education through modern pedagogical methods and state-of-the-art tools. We build an environment where technology supports growth, helping teachers educate better and letting students focus on real learning.
            </p>
            <div className="space-y-3">
              {[
                'Innovative curriculum integrated with AI tools',
                'Advanced virtual exam classrooms and analytics',
                'Seamless student onboarding and profiling workflows',
              ].map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0EA5A4]" />
                  <span className="text-sm font-semibold">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-slate-900 flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-[#0EA5A4]/5 backdrop-blur-sm" />
              <div className="relative z-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/20">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white text-lg font-bold">Standard of Excellence</h4>
                <p className="text-slate-300 text-xs max-w-sm">Combining traditional educational virtues with next-generation digital intelligence.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards Grid ── */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-[#0F172A]/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Modern ERP Features
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Explore the key ERP modules designed to streamline teaching, learning, and admin operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B]/60 hover:border-[#0EA5A4] dark:hover:border-[#0EA5A4] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0EA5A4]/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistics Counters ── */}
      <section className="py-20 bg-white dark:bg-[#0F172A]/80 border-y border-slate-100 dark:border-slate-850">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center space-y-2"
              >
                <h3 className="text-4xl lg:text-5xl font-black text-[#0EA5A4]">{stat.number}</h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admission Open Banner ── */}
      <section id="admissions" className="py-20 bg-gradient-to-r from-[#0EA5A4]/10 to-[#14B8A6]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass rounded-3xl p-8 lg:p-12 border border-[#0EA5A4]/20 bg-white/60 dark:bg-[#1E293B]/60 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-500 mb-4 animate-pulse">
                Admissions Open 2026-27
              </div>
              <h3 className="text-2xl lg:text-3xl font-black mb-4">
                Secure Online Admission Application
              </h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] max-w-xl text-sm leading-relaxed">
                Step into a digitized future of academic excellence. Register a student or parent account, submit the detailed onboarding forms, and track approval status instantly.
              </p>
            </div>
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 font-bold bg-[#0EA5A4] text-white hover:bg-[#14B8A6] rounded-2xl shadow-xl shadow-[#0EA5A4]/15 transition-all shrink-0"
            >
              Apply Online Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white dark:bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Loved by Teachers & Students
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8]">
              Read how our system simplifies daily academic workflows and enhances test generation efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1A2536]/30 flex flex-col justify-between"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div>
                  <h4 className="text-sm font-extrabold">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-20 bg-slate-50 dark:bg-[#0F172A]/35">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Get In Touch</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Have questions about online admissions, exam portals, or system integration? Contact us anytime.</p>
            
            <div className="space-y-4 text-sm font-semibold">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0EA5A4]" />
                <span>+919421554793</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0EA5A4]" />
                <span>apexlearninghub2020@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#0EA5A4]" />
                <span>2nd Floor, 'Guru mauli',<br />Near HP Petrol Pump, Meri - Rasbihari link Road<br />Nashik 422003</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151F32] space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm outline-none bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="Your email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm outline-none bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message</label>
              <textarea
                placeholder="Type your message here..."
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm outline-none bg-slate-50/50 dark:bg-slate-900/50 text-[#0F172A] dark:text-white focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10 resize-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0EA5A4] hover:bg-[#14B8A6] text-white font-bold rounded-xl shadow-lg shadow-[#0EA5A4]/10 transition-all"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] text-slate-800 dark:text-white mt-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-200 dark:border-slate-800 pb-10">
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-bold border-b-2 border-[#0EA5A4] inline-block pb-1">Quick Links</h4>
            <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 mt-4 font-medium">
              <Link to="/" className="hover:text-[#0EA5A4] transition-colors">Home</Link>
              <Link to="/courses" className="hover:text-[#0EA5A4] transition-colors">Courses</Link>
              <Link to="/about" className="hover:text-[#0EA5A4] transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-[#0EA5A4] transition-colors">Contact</Link>
              <Link to="/login" className="hover:text-[#0EA5A4] transition-colors">ERP Connect</Link>
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4 flex flex-col items-start md:items-center">
            <h4 className="text-xl font-bold border-b-2 border-transparent inline-block pb-1">Follow Us</h4>
            <div className="flex gap-3 mt-4">
              <a href="https://wa.me/919421554793" className="p-2 border border-slate-300 dark:border-slate-700 rounded hover:bg-[#25D366] hover:border-[#25D366] dark:hover:bg-[#25D366] dark:hover:border-[#25D366] transition-all group">
                <svg className="w-5 h-5 fill-current text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/share/183weznzH8/" className="p-2 border border-gray-600 rounded hover:bg-[#1877F2] hover:border-[#1877F2] transition-all group">
                <svg className="w-5 h-5 fill-current text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/apex-learning-hub/" className="p-2 border border-gray-600 rounded hover:bg-[#0077B5] hover:border-[#0077B5] transition-all group">
                <svg className="w-5 h-5 fill-current text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.instagram.com/apexlearninghub?utm_source=qr&igsh=eXloamM1MTJ1MTU=" className="p-2 border border-gray-600 rounded hover:bg-[#E4405F] hover:border-[#E4405F] transition-all group">
                <svg className="w-5 h-5 fill-current text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-white shrink-0 mt-1" />
              <div>
               <a href="tel:+919421554793"><h4 className="font-bold text-sm">Contact</h4>
                <p className="text-sm text-gray-300 mt-1">+91 9421554793<br />+91 8928772435</p></a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-white shrink-0 mt-1" />
              <div>
                <a href="mailto:apexlearninghub2020@gmail.com"><h4 className="font-bold text-sm">Email Us</h4>
               <p className="text-sm text-gray-300 mt-1">apexlearninghub2020@gmail.com</p></a> 
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-white shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-sm">Address</h4>
               <a href="https://maps.app.goo.gl/UhYGeb6NUFumRkJm9"> <p className="text-sm text-gray-300 mt-1 leading-relaxed">2nd Floor, 'Guru mauli',<br />Near HP Petrol Pump, Meri - Rasbihari link Road<br />Nashik 422003</p></a>
              </div>
            </div>
          </div>
          
        </div>
         
        <div className="max-w-7xl mx-auto px-6 pt-6 text-center text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} Apex Learning Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
