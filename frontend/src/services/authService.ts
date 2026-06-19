import api from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '@/types';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(registerData: RegisterData): Promise<{ message: string; user_id: string }> {
    const signupData = {
      full_name: registerData.full_name,
      email: registerData.email,
      username: registerData.username,
      password: registerData.password,
      role: registerData.role
    };
    const { data } = await api.post('/auth/register', signupData);
    return data;
  },

  async googleLogin(token: string, role: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/google-login', { token, role });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/profile');
    return data.user;
  },

  async forgotPassword(email: string): Promise<{ message: string; email: string; reset_token?: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(reset_token: string, new_password: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { reset_token, new_password });
    return data;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/profile');
    return data.user;
  },

  async updateProfile(updates: Partial<User>): Promise<{ message: string; user: User }> {
    const { data } = await api.put('/user/profile', updates);
    return data;
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async submitAdmission(admissionData: any): Promise<{ message: string; user: User }> {
    const { data } = await api.post('/user/admission', admissionData);
    return data;
  },

  async getAdmissions(): Promise<{ admissions: any[] }> {
    const { data } = await api.get<{ admissions: any[] }>('/admissions');
    return data;
  },

  async updateAdmissionStatus(admissionId: string, status: 'approved' | 'rejected'): Promise<any> {
    const { data } = await api.put(`/admissions/${admissionId}/status`, { status });
    return data;
  }
};

// ─── AI Exam & Test Service ──────────────────────────────────────────────────

export const examService = {
  async generateTest(testParams: {
    title: string;
    subject: string;
    difficulty: string;
    count: number;
    prompt: string;
    duration: number;
    correct_marks: number;
    negative_marks: number;
    passing_marks: number;
    is_timed: boolean;
  }): Promise<{ message: string; test: any }> {
    const { data } = await api.post('/generate-test', testParams);
    return data;
  },

  async editTest(testId: string, testData: any): Promise<{ message: string; test: any }> {
    const { data } = await api.put(`/tests/${testId}`, testData);
    return data;
  },

  async deleteTest(testId: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/tests/${testId}`);
    return data;
  },

  async publishTest(testId: string, classes: string[]): Promise<{ message: string }> {
    const { data } = await api.post('/publish-test', { test_id: testId, classes });
    return data;
  },

  async getTests(): Promise<{ tests: any[] }> {
    const { data } = await api.get<{ tests: any[] }>('/tests');
    return data;
  },

  async startTest(testId: string): Promise<{ result_id: string; test: any; questions: any[] }> {
    const { data } = await api.post('/start-test', { test_id: testId });
    return data;
  },

  async saveAnswer(resultId: string, questionId: string, selectedOption: string): Promise<any> {
    const { data } = await api.post('/save-answer', {
      result_id: resultId,
      question_id: questionId,
      selected_option: selectedOption,
    });
    return data;
  },

  async submitTest(resultId: string): Promise<{ message: string; result: any }> {
    const { data } = await api.post('/submit-test', { result_id: resultId });
    return data;
  },

  async getResult(resultId: string): Promise<{ result: any }> {
    const { data } = await api.get<{ result: any }>('/result', {
      params: { result_id: resultId },
    });
    return data;
  },

  async getResultsList(): Promise<{ results: any[] }> {
    const { data } = await api.get<{ results: any[] }>('/result');
    return data;
  },

  async getDashboardStats(): Promise<any> {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },

  async getNotifications(): Promise<{ notifications: any[] }> {
    const { data } = await api.get<{ notifications: any[] }>('/notifications');
    return data;
  },

  async markNotificationsRead(): Promise<{ message: string }> {
    const { data } = await api.post('/notifications/read');
    return data;
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  async getDashboardAnalytics(): Promise<any> {
    const { data } = await api.get('/dashboard/analytics');
    return data;
  },

  async getAttendance(): Promise<any> {
    const { data } = await api.get('/attendance');
    return data;
  },

  async getHomework(): Promise<{ homework: any[] }> {
    const { data } = await api.get('/homework');
    return data;
  },

  async submitHomework(hwId: string, formData: FormData): Promise<any> {
    const { data } = await api.post(`/homework/${hwId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getStudyMaterials(): Promise<{ materials: any[] }> {
    const { data } = await api.get('/study-materials');
    return data;
  },

  async downloadStudyMaterial(id: string): Promise<any> {
    const { data } = await api.post(`/study-materials/${id}/download`);
    return data;
  },

  async getLeaderboard(): Promise<any> {
    const { data } = await api.get('/leaderboard');
    return data;
  },

  async getCalendarEvents(): Promise<any> {
    const { data } = await api.get('/calendar/events');
    return data;
  },

  async changePassword(passwordData: any): Promise<any> {
    const { data } = await api.put('/user/password', passwordData);
    return data;
  }
};
