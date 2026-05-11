import { create } from "zustand";
import { ApplicationVerifier } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import * as SecureStore from "expo-secure-store";
import { authService, type AuthResult, type UserProfile } from "../services/auth.service";
import { apiClient } from "../lib/api.client";
import type { LoginEmailInput, LoginPhoneInput, OtpInput, RegisterInput } from "../schemas/auth.schema";
import { router } from "expo-router";

// ================================================================================== //
// Constants
// ================================================================================== //

const KEYS = {
  ACCESS_TOKEN:  "vitacare_access_token",
  REFRESH_TOKEN: "vitacare_refresh_token",
} as const;

// ================================================================================== //
// State Interface
// ================================================================================== //

interface AuthState {
  user:          UserProfile | null;
  accessToken:   string | null;
  isLoading:     boolean;
  error:         string | null;
  isHydrated:    boolean; // Become True when SecureStore is read at boot

  // Actions
  hydrate:          () => Promise<void>;
  sendOtp:          (phone: string, verifier: ApplicationVerifier, fullName?: string) => Promise<void>;
  verifyOtp:        (code: string, fullName?: string) => Promise<void>;
  loginWithEmail:   (data: LoginEmailInput) => Promise<void>;
  register:         (data: RegisterInput, verifier?: ApplicationVerifier) => Promise<void>;
  forgotPassword:   (email: string) => Promise<void>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<void>;
  resetPassword:    (email: string, password: string) => Promise<void>;
  logout:           () => Promise<void>;
  clearError:       () => void;
}

// ================================================================================== //
// Helpers
// ================================================================================== //

/**
 * Save access and refresh tokens to secure storage
 * @param tokens - The tokens to save
 * @throws Error if saving fails
 */
async function saveTokens(tokens: AuthResult["tokens"]) {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.ACCESS_TOKEN,  tokens.accessToken),
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
  ]);
}

/**
 * Clear access and refresh tokens from secure storage
 * @throws Error if clearing fails
 */ 
async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
  ]);
}

/**
 * Handle authentication result by saving tokens and updating state
 * @param result - The authentication result
 * @param set - The set function to update state
 * @throws Error if saving tokens fails
 */
async function handleAuthResult(result: AuthResult, set: (s: Partial<AuthState>) => void) {
  await saveTokens(result.tokens);
  set({ user: result.user, accessToken: result.tokens.accessToken, error: null });
}

// ================================================================================== //
// Store
// ================================================================================== //

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  accessToken: null,
  isLoading:   false,
  error:       null,
  isHydrated:  false,

  /**
   * Hydrate the store with data from secure storage - called on app boot
   */
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
      if (token) {
        // Fetch user profile to verify token and get user data
        const res = await apiClient.get<UserProfile>('/users/patients/profile');
        if (res.success && res.data) {
          set({ accessToken: token, user: res.data });
        } else {
          await clearTokens(); // token expiré ou invalide
        }
      }
    } catch {
      await clearTokens();
    } finally {
      set({ isHydrated: true });
    }
  },

  /**
   * Send OTP to the provided phone number
   * @param phone - The phone number to send OTP to
   * @param verifier - The Firebase ApplicationVerifier (Recaptcha)
   * @param fullName - Optional fullName for registration
   */
  sendOtp: async (phone: string, verifier: ApplicationVerifier, fullName?: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.sendOtp(phone, verifier);
      router.push({ 
        pathname: "/(auth)/otp", 
        params: { phone, fullName: fullName || "" } 
      });
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de l'envoi du SMS." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Verify OTP and complete authentication
   * @param code - The 6-digit OTP code
   * @param fullName - Optional fullName for registration
   */
  verifyOtp: async (code: string, fullName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyOtp(code, fullName);
      await handleAuthResult(result, set);
      router.replace("/(main)");
    } catch (e: any) {
      set({ error: e?.message ?? "Code invalide ou expiré." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Login with email and password
   * @param data - The email and password to login with
   */
  loginWithEmail: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.loginWithEmail(data);
      await handleAuthResult(result, set);
      router.replace("/(main)");
    } catch (e: any) {
      set({ error: e?.message ?? "Email ou mot de passe incorrect." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Register a new user
   * @param data - The registration data
   * @param verifier - Optional verifier for phone registration
   */
  register: async (data, verifier) => {
    set({ isLoading: true, error: null });
    try {
      if (data.mode === 'phone') {
        if (!verifier) {
          throw new Error("Un vérificateur d'application est requis pour l'inscription par téléphone.");
        }
        // Use get() to access current state if needed, but here we just call sendOtp helper
        await get().sendOtp(data.phone!, verifier, data.fullName);
        return;
      }

      const result = await authService.register(data);
      if (result && !('requiresOtp' in result)) {
        await handleAuthResult(result, set);
        router.replace('/(auth)/onboarding-location');
      }
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de l'inscription." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Forgot password
   * @param email - The email to send forgot password email to
   */
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(email);
    } catch (e: any) {
      set({ error: e?.message ?? "Impossible d'envoyer l'email." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Verify password reset OTP
   * @param email - The user's email
   * @param otp - The OTP code sent to the email
   */
  verifyPasswordResetOtp: async (email: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyPasswordResetOtp(email, otp);
    } catch (e: any) {
      set({ error: e?.message ?? "Code invalide ou expiré." });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Reset password with the provided email and new password
   * @param email - The user's email
   * @param password - The new password
   */
  resetPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email, password);
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de la réinitialisation du mot de passe." });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    await clearTokens();
    set({ user: null, accessToken: null, isLoading: false, error: null });
    router.replace("/(auth)");
  },

  clearError: () => set({ error: null }),
}));

// Set logout handler for API client
apiClient.setLogoutHandler(() => {
  useAuthStore.getState().logout();
});