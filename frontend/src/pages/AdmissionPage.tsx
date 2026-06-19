import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  GraduationCap, Loader2, User as UserIcon, Mail, Phone,
  Calendar, MapPin, ClipboardList, BookOpen, AlertCircle, LogOut,
  Briefcase, Award, FileText, Upload, Trash2, ChevronLeft, ChevronRight,
  CheckCircle2, Heart, ShieldAlert, Users, Camera, Hourglass, ShieldX
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { userService } from '@/services/authService';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import type { User } from '@/types';

// ─── Unified Schema & Validators ───────────────────────────────────────────

const phoneRegex = /^\d{10}$/;

const admissionSchema = z.object({
  // Common personal details (Always validated on first step)
  student_name: z.string().min(3, 'Full name is required (min 3 characters)'),
  father_name: z.string().min(3, 'Father name is required (min 3 characters)'),
  mother_name: z.string().min(3, 'Mother name is required (min 3 characters)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Must be a 10-digit number'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Please select a gender' }),
  blood_group: z.string().min(1, 'Please select a blood group'),
  address: z.string().min(5, 'Full residential address is required'),
  
  // Professional details (Teacher only, validated in Step 2)
  employee_id: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  joining_date: z.string().optional(),
  experience: z.string().optional(),
  specialization: z.string().optional(),
  
  // Educational qualifications (Teacher only, validated in Step 3)
  highest_qualification: z.string().optional(),
  university: z.string().optional(),
  graduation_year: z.string().optional(),
  certifications: z.string().optional(),
  
  // Emergency Contact (All roles, validated in Step 3 / 4)
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  emergency_relation: z.string().optional(),
  
  // Files / Document Uploads (Validated in Step 4 / 5)
  photo: z.string().optional(),
  aadhaar_card: z.string().optional(),
  resume: z.string().optional(),
  pan_card: z.string().optional(),
  other_docs: z.string().optional(),
  
  // Student specific details (Student only, validated in Step 2)
  class_applied: z.string().optional(),
  previous_gpa: z.string().optional(),
  guardian_name: z.string().optional(),
});

type AdmissionForm = z.infer<typeof admissionSchema>;

const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const DESIGNATIONS = [
  'Principal', 'Vice Principal', 'HOD', 'Senior Teacher',
  'Teacher', 'Assistant Teacher', 'Lab Assistant', 'Administrator'
];

const QUALIFICATIONS = [
  'Ph.D.', 'Post Graduate / Masters', 'Graduate / Bachelors', 'Diploma', 'High School'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

// ─── Step Indicator Component ───────────────────────────────────────────────

function StepIndicator({ steps, activeIndex }: { steps: string[], activeIndex: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8 px-2">
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center relative z-10">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: idx <= activeIndex ? '#0EA5A4' : '#E2E8F0',
                color: idx <= activeIndex ? '#FFFFFF' : '#292b2d',
                borderColor: idx === activeIndex ? '#0EA5A4' : 'transparent',
                boxShadow: idx === activeIndex ? '0 0 0 4px rgba(14, 165, 164, 0.2)' : 'none'
              }}
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300"
            >
              {idx < activeIndex ? <CheckCircle2 className="w-5 h-5 text-white" /> : idx + 1}
            </motion.div>
            <span className={`text-[10px] sm:text-xs font-semibold mt-2 text-center absolute -bottom-6 w-20 sm:w-28 transition-colors duration-300 ${
              idx <= activeIndex ? 'text-[#0EA5A4] dark:text-[#14B8A6] font-bold' : 'text-[#94A3B8] dark:text-[#475569]'
            }`}>
              {label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 bg-[#E2E8F0] dark:bg-[#334155] relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#0EA5A4]"
                initial={{ width: '0%' }}
                animate={{ width: idx < activeIndex ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdmissionPage() {
  const { user, refresh, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isTeacher = user?.role === 'teacher';

  // Define steps
  const steps = isTeacher
    ? ['Personal Info', 'Professional', 'Educational', 'Emergency', 'Documents']
    : ['Personal Info', 'Academic Info', 'Emergency', 'Documents'];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AdmissionForm>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      student_name: user?.full_name || '',
      email: user?.email || '',
    },
  });

  const formValues = watch();

  // Handle file base64 conversions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AdmissionForm) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = fieldName === 'resume' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size exceeds limit (${maxSize / 1024 / 1024}MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue(fieldName, base64String);
      clearErrors(fieldName);
      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName: keyof AdmissionForm) => {
    setValue(fieldName, '');
    toast.error('File removed');
  };

  // Helper to extract file metadata for UI display
  const getFileMetadata = (base64Str: string | undefined) => {
    if (!base64Str || !base64Str.startsWith('data:')) return null;
    const mime = base64Str.split(';')[0].split(':')[1];
    let ext = mime.split('/')[1] || 'bin';
    if (ext === 'jpeg') ext = 'jpg';
    return { ext: ext.toUpperCase(), isImage: mime.startsWith('image/') };
  };

  // Step-by-step custom wizard validator
  const handleNext = async () => {
    clearErrors();
    let isStepValid = true;

    if (currentStep === 0) {
      // Step 1: Personal Info
      isStepValid = await trigger(['student_name', 'father_name', 'mother_name', 'email', 'phone', 'dob', 'gender', 'blood_group', 'address']);
    } else if (currentStep === 1) {
      if (isTeacher) {
        // Step 2 (Teacher): Professional details
        if (!formValues.employee_id) {
          setError('employee_id', { type: 'manual', message: 'Employee ID is required' });
          isStepValid = false;
        }
        if (!formValues.designation) {
          setError('designation', { type: 'manual', message: 'Designation is required' });
          isStepValid = false;
        }
        if (!formValues.department) {
          setError('department', { type: 'manual', message: 'Department/Subject is required' });
          isStepValid = false;
        }
        if (!formValues.joining_date) {
          setError('joining_date', { type: 'manual', message: 'Joining date is required' });
          isStepValid = false;
        }
        if (!formValues.experience) {
          setError('experience', { type: 'manual', message: 'Total experience is required' });
          isStepValid = false;
        }
        if (!formValues.specialization) {
          setError('specialization', { type: 'manual', message: 'Specialization is required' });
          isStepValid = false;
        }
      } else {
        // Step 2 (Student): Academic details
        if (!formValues.class_applied) {
          setError('class_applied', { type: 'manual', message: 'Class applied for is required' });
          isStepValid = false;
        }
        if (!formValues.guardian_name) {
          setError('guardian_name', { type: 'manual', message: 'Guardian / Parent name is required' });
          isStepValid = false;
        }
      }
    } else if (currentStep === 2) {
      if (isTeacher) {
        // Step 3 (Teacher): Educational details
        if (!formValues.highest_qualification) {
          setError('highest_qualification', { type: 'manual', message: 'Highest qualification is required' });
          isStepValid = false;
        }
        if (!formValues.university) {
          setError('university', { type: 'manual', message: 'University/Institution is required' });
          isStepValid = false;
        }
        if (!formValues.graduation_year) {
          setError('graduation_year', { type: 'manual', message: 'Year of graduation is required' });
          isStepValid = false;
        } else if (!/^\d{4}$/.test(formValues.graduation_year)) {
          setError('graduation_year', { type: 'manual', message: 'Must be a 4-digit year' });
          isStepValid = false;
        }
      } else {
        // Step 3 (Student): Emergency Contact
        if (!formValues.emergency_name) {
          setError('emergency_name', { type: 'manual', message: 'Emergency contact name is required' });
          isStepValid = false;
        }
        if (!formValues.emergency_phone) {
          setError('emergency_phone', { type: 'manual', message: 'Emergency phone number is required' });
          isStepValid = false;
        } else if (!phoneRegex.test(formValues.emergency_phone)) {
          setError('emergency_phone', { type: 'manual', message: 'Must be a valid 10-digit number' });
          isStepValid = false;
        }
        if (!formValues.emergency_relation) {
          setError('emergency_relation', { type: 'manual', message: 'Relation is required' });
          isStepValid = false;
        }
      }
    } else if (currentStep === 3) {
      if (isTeacher) {
        // Step 4 (Teacher): Emergency Contact
        if (!formValues.emergency_name) {
          setError('emergency_name', { type: 'manual', message: 'Emergency contact name is required' });
          isStepValid = false;
        }
        if (!formValues.emergency_phone) {
          setError('emergency_phone', { type: 'manual', message: 'Emergency phone number is required' });
          isStepValid = false;
        } else if (!phoneRegex.test(formValues.emergency_phone)) {
          setError('emergency_phone', { type: 'manual', message: 'Must be a valid 10-digit number' });
          isStepValid = false;
        }
        if (!formValues.emergency_relation) {
          setError('emergency_relation', { type: 'manual', message: 'Relation is required' });
          isStepValid = false;
        }
      } else {
        // Step 4 (Student): Document uploads
        if (!formValues.aadhaar_card) {
          setError('aadhaar_card', { type: 'manual', message: 'Aadhaar Card document is required' });
          isStepValid = false;
        }
      }
    }

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please resolve validation errors before continuing.');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form submission
  const onSubmit = async (data: AdmissionForm) => {
    if (isTeacher) {
      if (!data.photo) {
        setError('photo', { type: 'manual', message: 'Profile photo is required' });
        toast.error('Please upload your profile photo.');
        return;
      }
      if (!data.aadhaar_card) {
        setError('aadhaar_card', { type: 'manual', message: 'Aadhaar Card document is required' });
        toast.error('Please upload your Aadhaar Card.');
        return;
      }
    } else {
      if (!data.aadhaar_card) {
        setError('aadhaar_card', { type: 'manual', message: 'Aadhaar Card document is required' });
        toast.error('Please upload your Aadhaar Card.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await userService.submitAdmission(data);
      toast.success('Admission Form submitted successfully!', { icon: '📝' });
      
      // Pull fresh user profile from server to get new admission data
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to submit admission details.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const slideVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50, transition: { duration: 0.25 } }),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 sm:p-6 transition-colors duration-300 font-sans">
      
      {/* Header bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10 mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0EA5A4, #14B8A6)' }}
          >
            <GraduationCap className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] bg-clip-text text-transparent">
            Apex Learning Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:text-red-500 dark:hover:border-red-500 transition-all bg-white dark:bg-[#1E293B] shadow-sm text-slate-600 dark:text-slate-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="glass rounded-3xl p-6 sm:p-10 dark:glass-dark border border-slate-200/50 dark:border-slate-800/50 shadow-xl relative overflow-hidden bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {isTeacher ? 'Teacher Onboarding File' : 'Student Admission Form'} 📝
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Welcome, <span className="font-bold text-[#0EA5A4]">{user?.full_name}</span>. Please complete your registration file to unlock your portal access.
            </p>
          </div>

          <StepIndicator steps={steps} activeIndex={currentStep} />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* ── STEP 1: Personal Information (All Roles) ──────────────── */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-[#0EA5A4]" /> Personal Information
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('student_name')}
                            type="text"
                            placeholder="Enter full name"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.student_name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.student_name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.student_name.message}
                          </p>
                        )}
                      </div>

                      {/* Father Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Father's Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('father_name')}
                            type="text"
                            placeholder="Enter father's name"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.father_name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.father_name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.father_name.message}
                          </p>
                        )}
                      </div>

                      {/* Mother Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Mother's Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('mother_name')}
                            type="text"
                            placeholder="Enter mother's name"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.mother_name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.mother_name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.mother_name.message}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="Enter email address"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.email ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('phone')}
                            type="tel"
                            placeholder="10-digit phone number"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.phone.message}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Date of Birth *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('dob')}
                            type="date"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.dob ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.dob && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.dob.message}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Gender *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('gender')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.gender ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.gender.message}
                          </p>
                        )}
                      </div>

                      {/* Blood Group */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Blood Group *
                        </label>
                        <div className="relative">
                          <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('blood_group')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.blood_group ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Blood Group</option>
                            {BLOOD_GROUPS.map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        {errors.blood_group && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.blood_group.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Residential Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <textarea
                          {...register('address')}
                          rows={3}
                          placeholder="Enter your full home address"
                          className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 resize-none transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                            errors.address ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                          }`}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2 (Teacher): Professional Details ───────────────── */}
                {isTeacher && currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#0EA5A4]" /> Professional Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Employee ID */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Employee ID *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('employee_id')}
                            type="text"
                            placeholder="Enter Employee ID"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.employee_id ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.employee_id && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.employee_id.message}
                          </p>
                        )}
                      </div>

                      {/* Designation */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Designation *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('designation')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.designation ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Designation</option>
                            {DESIGNATIONS.map(des => (
                              <option key={des} value={des}>{des}</option>
                            ))}
                          </select>
                        </div>
                        {errors.designation && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.designation.message}
                          </p>
                        )}
                      </div>

                      {/* Department / Subject */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Department / Subject *
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('department')}
                            type="text"
                            placeholder="e.g., Mathematics"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.department ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.department && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.department.message}
                          </p>
                        )}
                      </div>

                      {/* Joining Date */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Joining Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('joining_date')}
                            type="date"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.joining_date ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.joining_date && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.joining_date.message}
                          </p>
                        )}
                      </div>

                      {/* Total Experience */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Total Experience (Years) *
                        </label>
                        <div className="relative">
                          <ClipboardList className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('experience')}
                            type="number"
                            placeholder="e.g. 5"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.experience ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.experience && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.experience.message}
                          </p>
                        )}
                      </div>

                      {/* Specialization */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Specialization *
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('specialization')}
                            type="text"
                            placeholder="e.g., Algebra & Calculus"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.specialization ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.specialization && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.specialization.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 (Student): Academic Details ────────────────────── */}
                {!isTeacher && currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#0EA5A4]" /> Academic Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Class Applied For */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Class Applied For *
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('class_applied')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.class_applied ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Class</option>
                            {CLASSES.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        </div>
                        {errors.class_applied && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.class_applied.message}
                          </p>
                        )}
                      </div>

                      {/* Parent/Guardian Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Parent / Guardian Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('guardian_name')}
                            type="text"
                            placeholder="Full name of parent/guardian"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.guardian_name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.guardian_name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.guardian_name.message}
                          </p>
                        )}
                      </div>

                      {/* Previous GPA */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Previous GPA / Grade (Optional)
                        </label>
                        <div className="relative">
                          <ClipboardList className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('previous_gpa')}
                            type="text"
                            placeholder="e.g. 3.8 GPA or 92%"
                            className="form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10 text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 (Teacher): Educational Qualifications ──────────── */}
                {isTeacher && currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#0EA5A4]" /> Educational Qualifications
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Highest Qualification */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Highest Qualification *
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('highest_qualification')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.highest_qualification ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Qualification</option>
                            {QUALIFICATIONS.map(q => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>
                        {errors.highest_qualification && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.highest_qualification.message}
                          </p>
                        )}
                      </div>

                      {/* University */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          University / Institution *
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('university')}
                            type="text"
                            placeholder="University / School name"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.university ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.university && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.university.message}
                          </p>
                        )}
                      </div>

                      {/* Year of Graduation */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Year of Graduation *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('graduation_year')}
                            type="text"
                            maxLength={4}
                            placeholder="YYYY"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.graduation_year ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.graduation_year && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.graduation_year.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Additional Certifications */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Additional Certifications
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <textarea
                          {...register('certifications')}
                          rows={3}
                          placeholder="List any additional certifications or professional achievements (Optional)"
                          className="form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10 text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 resize-none transition-all focus:bg-white dark:focus:bg-[#0F172A]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 (Student) / STEP 4 (Teacher): Emergency Contact ── */}
                {((isTeacher && currentStep === 3) || (!isTeacher && currentStep === 2)) && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-[#0EA5A4]" /> Emergency Contact
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Contact Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('emergency_name')}
                            type="text"
                            placeholder="Enter emergency contact's full name"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.emergency_name ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.emergency_name && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.emergency_name.message}
                          </p>
                        )}
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Contact Phone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            {...register('emergency_phone')}
                            type="tel"
                            placeholder="10-digit phone number"
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 placeholder-slate-400 transition-all focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.emergency_phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          />
                        </div>
                        {errors.emergency_phone && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.emergency_phone.message}
                          </p>
                        )}
                      </div>

                      {/* Relation */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Relation *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            {...register('emergency_relation')}
                            className={`form-input-glass w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none bg-slate-50/50 dark:bg-slate-950/20 transition-all appearance-none focus:bg-white dark:focus:bg-[#0F172A] ${
                              errors.emergency_relation ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-[#0EA5A4] focus:ring-4 focus:ring-[#0EA5A4]/10'
                            }`}
                          >
                            <option value="">Select Relation</option>
                            {RELATIONS.map(rel => (
                              <option key={rel} value={rel}>{rel}</option>
                            ))}
                          </select>
                        </div>
                        {errors.emergency_relation && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.emergency_relation.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4 (Student) / STEP 5 (Teacher): Document Uploads ── */}
                {((isTeacher && currentStep === 4) || (!isTeacher && currentStep === 3)) && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#0EA5A4]" /> Document Uploads
                      </h2>
                    </div>

                    {/* Profile Photo upload slot */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {formValues.photo ? (
                            <img src={formValues.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        {formValues.photo && (
                          <button
                            type="button"
                            onClick={() => removeFile('photo')}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Profile Photo *
                        </h4>
                        <p className="text-xs text-slate-400">Upload a professional JPG or PNG (max 2MB)</p>
                        <div>
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0EA5A4] hover:bg-[#14B8A6] rounded-xl cursor-pointer shadow-md transition-all">
                            <Upload className="w-3.5 h-3.5" /> Choose Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'photo')}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {errors.photo && (
                          <p className="text-red-500 text-xs flex items-center justify-center md:justify-start gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.photo.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Files grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Aadhaar Card */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A2536]/30 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aadhaar Card *</h4>
                          {formValues.aadhaar_card && (
                            <button type="button" onClick={() => removeFile('aadhaar_card')} className="text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {formValues.aadhaar_card ? (
                          <div className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <FileText className="w-8 h-8 text-[#0EA5A4]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">Aadhaar Card</p>
                              <p className="text-[10px] text-slate-400">{getFileMetadata(formValues.aadhaar_card)?.ext} Format</p>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0EA5A4] dark:hover:border-[#0EA5A4] hover:bg-slate-50/50 dark:hover:bg-slate-900/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs font-bold text-[#0EA5A4]">Click to upload</span>
                            <span className="text-[10px] text-slate-400 mt-1">PDF/JPG/PNG (max 2MB)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileChange(e, 'aadhaar_card')}
                              className="hidden"
                            />
                          </label>
                        )}
                        {errors.aadhaar_card && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.aadhaar_card.message}
                          </p>
                        )}
                      </div>

                      {/* Resume / CV */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A2536]/30 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resume / CV</h4>
                          {formValues.resume && (
                            <button type="button" onClick={() => removeFile('resume')} className="text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {formValues.resume ? (
                          <div className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <FileText className="w-8 h-8 text-[#0EA5A4]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">Resume / CV</p>
                              <p className="text-[10px] text-slate-400">{getFileMetadata(formValues.resume)?.ext} Format</p>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0EA5A4] dark:hover:border-[#0EA5A4] hover:bg-slate-50/50 dark:hover:bg-slate-900/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs font-bold text-[#0EA5A4]">Click to upload</span>
                            <span className="text-[10px] text-slate-400 mt-1">PDF/DOC/DOCX (max 5MB)</span>
                            <input
                              type="file"
                              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => handleFileChange(e, 'resume')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* PAN Card */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A2536]/30 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">PAN Card</h4>
                          {formValues.pan_card && (
                            <button type="button" onClick={() => removeFile('pan_card')} className="text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {formValues.pan_card ? (
                          <div className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <FileText className="w-8 h-8 text-[#0EA5A4]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">PAN Card</p>
                              <p className="text-[10px] text-slate-400">{getFileMetadata(formValues.pan_card)?.ext} Format</p>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0EA5A4] dark:hover:border-[#0EA5A4] hover:bg-slate-50/50 dark:hover:bg-slate-900/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs font-bold text-[#0EA5A4]">Click to upload</span>
                            <span className="text-[10px] text-slate-400 mt-1">PDF/JPG/PNG (max 2MB)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileChange(e, 'pan_card')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Other Documents */}
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1A2536]/30 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Other Documents</h4>
                          {formValues.other_docs && (
                            <button type="button" onClick={() => removeFile('other_docs')} className="text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {formValues.other_docs ? (
                          <div className="p-3 bg-slate-50 dark:bg-[#1E293B] rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <FileText className="w-8 h-8 text-[#0EA5A4]" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">Supporting Document</p>
                              <p className="text-[10px] text-slate-400">{getFileMetadata(formValues.other_docs)?.ext} Format</p>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0EA5A4] dark:hover:border-[#0EA5A4] hover:bg-slate-50/50 dark:hover:bg-slate-900/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-xs font-bold text-[#0EA5A4]">Click to upload</span>
                            <span className="text-[10px] text-slate-400 mt-1">PDF/JPG/PNG (max 2MB)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileChange(e, 'other_docs')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Form actions and navigation buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0 || isLoading}
                className="flex items-center gap-1.5 px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#0EA5A4] hover:bg-[#14B8A6] shadow-lg shadow-[#0EA5A4]/10 hover:shadow-[#0EA5A4]/20 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const fields = Object.keys(formValues) as (keyof AdmissionForm)[];
                      fields.forEach(f => {
                        if (f !== 'student_name' && f !== 'email') setValue(f as any, '');
                      });
                      setCurrentStep(0);
                      toast.success('Form reset successful!');
                    }}
                    className="px-5 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Reset Form
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] shadow-lg shadow-[#0EA5A4]/20 hover:shadow-[#0EA5A4]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Submit Application
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
      
      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 pb-8 mt-6">
        &copy; {new Date().getFullYear()} Apex Learning Hub | All Rights Reserved
      </div>
    </div>
  );
}
