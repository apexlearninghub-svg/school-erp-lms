import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A101C] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Link to="/" className="self-start mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0EA5A4] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg shadow-[#0EA5A4]/10 mb-6 inline-block">
            <Mail className="w-10 h-10 text-[#0EA5A4]" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            We're here to help and answer any question you might have. We look forward to hearing from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-[#0EA5A4]/10 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
                <a href="tel:+918928772435"><h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Phone Number</h3>
                <p className="text-slate-600 dark:text-slate-400">+91 9421554793</p>
                <p className="text-slate-600 dark:text-slate-400">+91 8928772435</p></a>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-[#0EA5A4]/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
               <a href="mailto:apexlearninghub2020@gmail.com"><h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Email Address</h3>
                <p className="text-slate-600 dark:text-slate-400">apexlearninghub2020@gmail.com</p></a>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ x: 5 }}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-[#0EA5A4]/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#0EA5A4]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Office Address</h3>
                 <a href="https://maps.app.goo.gl/UhYGeb6NUFumRkJm9"> <p className="text-sm text-gray-300 mt-1 leading-relaxed">2nd Floor, 'Guru mauli',<br />Near HP Petrol Pump, Meri - Rasbihari link Road<br />Nashik 422003</p></a>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#1E293B] p-8 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-6">Send us a Message</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#0EA5A4] transition-colors text-slate-800 dark:text-white" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input type="email" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#0EA5A4] transition-colors text-slate-800 dark:text-white" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                <textarea rows={4} className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-[#0EA5A4] transition-colors text-slate-800 dark:text-white resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#0EA5A4] hover:bg-[#14B8A6] text-white font-bold rounded-xl shadow-lg shadow-[#0EA5A4]/20 transition-all">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
