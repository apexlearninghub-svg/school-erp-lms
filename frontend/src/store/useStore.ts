import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface ExamState {
  activeResultId: string | null;
  activeTest: any | null;
  activeQuestions: any[];
  activeAnswers: Record<string, string>; // questionId -> selectedOption
  examTimeRemaining: number; // in seconds
  isExamActive: boolean;
  
  startExam: (resultId: string, test: any, questions: any[], remainingSeconds: number) => void;
  setAnswer: (questionId: string, option: string) => void;
  tickTimer: () => void;
  clearActiveExam: () => void;
}

interface UIState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

type GlobalStore = AuthState & ExamState & UIState;

export const useStore = create<GlobalStore>((set, get) => ({
  // ─── Auth State ───
  user: (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('access_token'),
  accessToken: localStorage.getItem('access_token'),

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    set({ user, accessToken: token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },

  // ─── Active Exam State ───
  activeResultId: null,
  activeTest: null,
  activeQuestions: [],
  activeAnswers: {},
  examTimeRemaining: 0,
  isExamActive: false,

  startExam: (resultId, test, questions, remainingSeconds) => {
    // Load pre-saved answers from questions if any
    const initialAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.selected_option) {
        initialAnswers[q.id] = q.selected_option;
      }
    });

    set({
      activeResultId: resultId,
      activeTest: test,
      activeQuestions: questions,
      activeAnswers: initialAnswers,
      examTimeRemaining: remainingSeconds,
      isExamActive: true,
    });
  },

  setAnswer: (questionId, option) => {
    set((state) => ({
      activeAnswers: {
        ...state.activeAnswers,
        [questionId]: option,
      },
    }));
  },

  tickTimer: () => {
    set((state) => {
      if (state.examTimeRemaining <= 1) {
        return { examTimeRemaining: 0, isExamActive: false };
      }
      return { examTimeRemaining: state.examTimeRemaining - 1 };
    });
  },

  clearActiveExam: () => {
    set({
      activeResultId: null,
      activeTest: null,
      activeQuestions: [],
      activeAnswers: {},
      examTimeRemaining: 0,
      isExamActive: false,
    });
  },

  // ─── UI / Theme State ───
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    });
  },
}));
