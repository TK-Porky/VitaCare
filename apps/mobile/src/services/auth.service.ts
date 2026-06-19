import {
    signInWithPhoneNumber,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    getIdToken,
    ConfirmationResult,
    ApplicationVerifier,
    AuthError,
  } from "firebase/auth";
  import { firebaseAuth } from "../lib/firebase"; 
  import { apiClient } from "../lib/api.client";
  import { LoginEmailInput, RegisterInput } from "../schemas/auth.schema";
import { API_ENDPOINTS } from "../types/api-endpoints";
import type { ApiResponse } from "../types/api-responses";
  
  // ================================================================================== //
  // Types
  // ================================================================================== //
  
  // Auth Tokens
  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }

  // User Profile
  export interface UserProfile {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }

  export interface BackendAuthResponse {
      accessToken: string;
      refreshToken?: string;
      patient: UserProfile;
    }

    export interface BackendAuthResponseWrapper {
      success: boolean;
      message: string;
      data: BackendAuthResponse;
      statusCode: number;
      timestamp?: string;
  }
  
  // Auth Result
  export interface AuthResult {
    tokens: AuthTokens;
    user: UserProfile;
  }
  
  let _confirmationResult: ConfirmationResult | null = null;
  
  // ================================================================================== //
  // Helpers
  // ================================================================================== //

  /**
   * Map Firebase Auth errors to user-friendly messages
   */
  const mapAuthError = (error: any): string => {
    const code = (error as AuthError)?.code;
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/operation-not-allowed':
        return 'Opération non autorisée.';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible.';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé.';
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cet email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/invalid-verification-code':
        return 'Code de vérification invalide.';
      case 'auth/invalid-verification-id':
        return 'ID de vérification invalide.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      default:
        return error?.message ?? "Une erreur est survenue lors de l'authentification.";
    }
  };

  // ================================================================================== //
  // Service
  // ================================================================================== //
  export const authService = {
  
    /**
     * Send OTP
     * @param phone 
     * @param appVerifier 
     */
    async sendOtp(phone: string, appVerifier: ApplicationVerifier): Promise<void> {
      console.log("[MOCK-AUTH] Sending OTP to", phone);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
  
    /**
     * Verify OTP
     * @param code
     * @param fullName Optional fullName for registration
     */
    async verifyOtp(code: string, fullName?: string): Promise<AuthResult> {
      console.log("[MOCK-AUTH] Verifying OTP", code);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            tokens: { accessToken: "mock_access", refreshToken: "mock_refresh" },
            user: {
              id: "mock_user_id",
              fullName: fullName || "Utilisateur Test",
              email: "test@vitacare.cm",
              phone: "690000000",
              avatarUrl: "https://i.pravatar.cc/150?u=mock_user_id"
            }
          });
        }, 1000);
      });
    },
  
    /**
     * Login with email and password
     * @param data Login email input
     * @returns Auth result
     */
    async loginWithEmail(data: LoginEmailInput): Promise<AuthResult> {
      console.log("[MOCK-AUTH] Login with email", data.email);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            tokens: { accessToken: "mock_access", refreshToken: "mock_refresh" },
            user: {
              id: "mock_user_id",
              fullName: "Utilisateur Test",
              email: data.email,
              phone: "690000000",
              avatarUrl: "https://i.pravatar.cc/150?u=mock_user_id"
            }
          });
        }, 1000);
      });
    },
  
    /**
     * Register
     * @param data Register input
     * @returns Auth result
     */
    async register(data: RegisterInput): Promise<{ requiresOtp: boolean } | AuthResult> {
      if (data.mode === "phone") {
        return { requiresOtp: true };
      }
  
      console.log("[MOCK-AUTH] Register with email", data.email);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            tokens: { accessToken: "mock_access", refreshToken: "mock_refresh" },
            user: {
              id: "mock_user_id",
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              avatarUrl: "https://i.pravatar.cc/150?u=mock_user_id"
            }
          });
        }, 1000);
      });
    },
  
    /**
     * Forgot password
     * @param email Email
     * @returns Promise<void>
     */
    async forgotPassword(email: string): Promise<void> {
      console.log("[MOCK-AUTH] Forgot password for", email);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },

    /**
     * Verify password reset OTP
     * @param email Email
     * @param otp OTP code
     * @returns Promise<void>
     */
    async verifyPasswordResetOtp(email: string, otp: string): Promise<void> {
      console.log("[MOCK-AUTH] Verify password reset OTP", otp);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },

    /**
     * Reset password
     * @param data Reset data
     * @returns Promise<void>
     */
    async resetPassword(email: string, password: string): Promise<void> {
      console.log("[MOCK-AUTH] Resetting password for", email);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },

    /**
     * Logout
     * @returns Promise<void>
     */
    async logout(): Promise<void> {
      console.log("[MOCK-AUTH] Logout");
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
  };