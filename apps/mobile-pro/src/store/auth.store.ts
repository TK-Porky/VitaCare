/**
 * Auth Store — VitaCare Pro
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';
import { apiClient, TOKEN_KEYS } from '../lib/api.client';
import { profileService } from '../services/profile.service';
import { router } from 'expo-router';
import type { ProfessionalProfile } from '../types/api-responses';

// ================================================================================== //
// Helpers
// ================================================================================== //

async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEYS.ACCESS,  accessToken),
    SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken),
  ]);
}

async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
    SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH),
  ]);
}

// ================================================================================== //
// State Interface
// ================================================================================== //

interface AuthState {
  user:        ProfessionalProfile | null;
  accessToken: string | null;
  isLoading:   boolean;
  error:       string | null;
  isHydrated:  boolean;

  // Actions
  hydrate:       () => Promise<void>;
  loginWithEmail:(email: string, password: string) => Promise<void>;
  logout:        () => Promise<void>;
  clearError:    () => void;
}

// ================================================================================== //
// Store
// ================================================================================== //

export const useAuthStore = create<AuthState>((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   false,
  error:       null,
  isHydrated:  false,

  /**
   * Hydrate from secure storage on app boot
   */
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (token) {
        const profile = await profileService.getProfile();
        set({ accessToken: token, user: profile });
      }
    } catch {
      await clearTokens();
    } finally {
      set({ isHydrated: true });
    }
  },

  /**
   * Login with email and password
   */
  loginWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.loginWithEmail(email, password);
      await saveTokens(result.tokens.accessToken, result.tokens.refreshToken);
      set({ user: result.user, accessToken: result.tokens.accessToken, error: null });
      router.replace('/(main)');
    } catch (e: any) {
      set({ error: e?.message ?? 'Email ou mot de passe incorrect.' });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    await clearTokens();
    set({ user: null, accessToken: null, isLoading: false, error: null });
    router.replace('/(auth)');
  },

  clearError: () => set({ error: null }),
}));

// Register logout handler for 401 auto-logout
apiClient.setLogoutHandler(() => {
  useAuthStore.getState().logout();
});
