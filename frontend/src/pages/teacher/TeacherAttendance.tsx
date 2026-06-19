import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, Save, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export function TeacherAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch classes
    api.get('/teacher/classes').then(res => {
      setClasses(res.data.classes || []);
      if (res.data.classes?.length > 0) {
        setSelectedClass(res.data.classes[0].name);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // In a real app we'd have /teacher/students?class=className
        // Mocking students for the selected class since the endpoint isn't fully returning them yet
        const mockStudents = Array.from({length: 15}, (_, i) => ({
          id: `stu_${i}`,
          full_name: `Student ${i + 1}`,
          roll_number: `R-${100 + i}`
        }));
        setStudents(mockStudents);
        
        // Default everyone to present
        const defaultAtt: Record<string, string> = {};
        mockStudents.forEach(s => defaultAtt[s.id] = 'present');
        setAttendance(defaultAtt);
      } catch (err) {
        toast.error('Failed to load class list');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleMark = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // In a real app we would send the batch or iterate
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock network delay
      toast.success(`Attendance saved for ${selectedClass} on ${date}`);
    } catch (err) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-[#0EA5A4]" /> Attendance Registry
          </h2>
          <p className="text-slate-500 text-sm mt-1">Mark and monitor daily student attendance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white"
          >
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white">Class List</h3>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving || students.length === 0}
            className="flex items-center gap-2 bg-[#0EA5A4] hover:bg-[#0EA5A4]/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-md shadow-[#0EA5A4]/20 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Register
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">No students found for this class.</div>
          ) : (
            <div className="space-y-2 pr-2">
              {students.map((student, i) => (
                <div key={student.id} className="flex flex-col sm:flex-row justify-between items-center p-3 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex justify-center items-center font-bold text-xs text-slate-600 dark:text-slate-300">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{student.full_name}</p>
                      <p className="text-xs text-slate-500">Roll: {student.roll_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleMark(student.id, 'present')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        attendance[student.id] === 'present' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 size={14} /> P
                    </button>
                    <button 
                      onClick={() => handleMark(student.id, 'absent')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        attendance[student.id] === 'absent' 
                          ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <XCircle size={14} /> A
                    </button>
                    <button 
                      onClick={() => handleMark(student.id, 'late')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        attendance[student.id] === 'late' 
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Clock size={14} /> L
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
