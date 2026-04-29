import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) => 
        set({ 
          user, 
          token, 
          refreshToken: refreshToken || null, 
          isAuthenticated: true,
          isLoading: false 
        }),

      updateUser: (userData) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => 
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false,
          isLoading: false 
        }),

      completeOnboarding: () =>
        set((state) => ({
          user: state.user ? { ...state.user, onboardingCompleted: true } : null
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
