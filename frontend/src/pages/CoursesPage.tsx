import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CoursesPage() {
  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101C] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <Link to="/" className="self-start mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0EA5A4] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg shadow-[#0EA5A4]/10 mb-6 inline-block">
            <BookOpen className="w-10 h-10 text-[#0EA5A4]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            Our Academic Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Comprehensive curriculum designed for excellence from Class 1 through Class 12.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {classes.map((cls) => (
            <motion.div
              key={cls}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-[#0EA5A4]/10 hover:border-[#0EA5A4]/30 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0EA5A4]/10 transition-colors">
                <GraduationCap className="w-6 h-6 text-slate-400 group-hover:text-[#0EA5A4] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
                Class {cls}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Core subjects including Mathematics, Science, English, and Social Studies tailored for Grade {cls}.
              </p>
              <Link to="/register" className="text-[#0EA5A4] text-sm font-semibold hover:text-[#14B8A6] transition-colors flex items-center gap-1">
                Apply for Admission &rarr;
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
