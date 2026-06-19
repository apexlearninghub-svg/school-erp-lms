// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  has_submitted_admission: boolean;
  admission_status?: 'pending' | 'approved' | 'rejected';
  student_profile?: {
    father_name: string;
    mother_name: string;
    class_name: string;
    roll_number: string;
    class_id?: string;
  };
  teacher_profile?: {
    employee_id: string;
    designation: string;
    department: string;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginCredentials {
  identifier: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  role: UserRole;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
  redirect_url: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: Record<string, string>;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

// ─── Forgot Password Flow Types ──────────────────────────────────────────────

export type ForgotPasswordStep = 'email' | 'otp' | 'reset' | 'success';

export interface ForgotPasswordState {
  step: ForgotPasswordStep;
  email: string;
  reset_token: string;
}

// ─── Login History ────────────────────────────────────────────────────────────

export interface LoginHistoryEntry {
  id: string;
  ip_address: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  success: boolean;
  method: string;
  created_at: string;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';
