import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import type { User, AuthState, UserRole } from '@/types';

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    token: localStorage.getItem('access_token'),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: true,
  });

  // Verify stored token on mount (with 5s timeout so spinner never hangs)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // No token — show login immediately
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }
      try {
        // Race: profile fetch vs 5-second timeout
        const user = await Promise.race<User>([
          authService.getProfile(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        setState((prev) => ({ ...prev, user, isAuthenticated: true, isLoading: false }));
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        // Stale/expired token or backend unreachable — clear and show login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (identifier: string, password: string, rememberMe = false): Promise<string> => {
      const response = await authService.login({ identifier, password, remember_me: rememberMe });
      setState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.redirect_url;
    },
    []
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  const refresh = useCallback(async () => {
    if (state.token) {
      try {
        const user = await authService.getProfile();
        updateUser(user);
      } catch {
        await logout();
      }
    }
  }, [state.token, updateUser, logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
