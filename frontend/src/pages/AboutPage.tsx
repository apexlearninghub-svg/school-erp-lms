import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101C] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Link to="/" className="self-start mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0EA5A4] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg shadow-[#0EA5A4]/10 mb-6 inline-block">
            <Users className="w-10 h-10 text-[#0EA5A4]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            About Apex Learning Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            Empowering the next generation with modern education and cutting-edge technology.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-12">
          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1E293B] p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-16 h-16 bg-[#0EA5A4]/10 rounded-2xl flex items-center justify-center shrink-0">
                <Target className="w-8 h-8 text-[#0EA5A4]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-3">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  At Apex Learning Hub, our mission is to provide an accessible, high-quality, and holistic education system. We believe in harnessing the power of artificial intelligence and digital tools to streamline learning, making it more interactive and effective for students, teachers, and parents alike.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1E293B] p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-3">Our Vision</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  We envision a world where education knows no boundaries. By providing an enterprise-grade school management platform, we aim to bridge the gap between traditional learning and modern technology, ensuring every student has the tools they need to succeed in a rapidly evolving digital landscape.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
