import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2.5 rounded-xl border transition-all duration-200 ${
        isDark
          ? 'bg-[#1E293B] border-[#334155] hover:border-[#0EA5A4] text-[#F1F5F9]'
          : 'bg-white border-[#E2E8F0] hover:border-[#0EA5A4] text-[#0F172A]'
      } shadow-sm`}
    >
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  );
}

function AnimatedIcon({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      key={isDark ? 'moon' : 'sun'}
      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-[#94A3B8]" />
      ) : (
        <Sun className="w-4 h-4 text-[#F59E0B]" />
      )}
    </motion.div>
  );
}
