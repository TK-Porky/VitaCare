/**
 * Auth Service — VitaCare Pro
 * Authentification email uniquement pour les professionnels de santé.
 * Les mocks sont utilisés tant que le backend pro n'est pas prêt.
 */

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getIdToken,
  AuthError,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { AuthResult, ProfessionalProfile } from '../types/api-responses';

// ================================================================================== //
// Mock Data (utilisé quand le backend n'est pas prêt)
// ================================================================================== //

const MOCK_PROFESSIONAL: ProfessionalProfile = {
  id:            'pro-001',
  fullName:      'Dr. Jean-Claude Mbarga',
  email:         'dr.mbarga@vitacare.cm',
  phone:         '+237 6 55 123 456',
  avatarUrl:     undefined,
  specialty:     'Médecine Générale',
  licenseNumber: 'ONMC-2024-1234',
  clinicName:    'Clinique Sainte-Marie',
  clinicAddress: 'Rue de la Paix, Yaoundé',
  bio:           'Médecin généraliste avec 15 ans d\'expérience.',
  languages:     ['Français', 'Anglais'],
  consultationFee: 5000,
  currency:      'XAF',
};

const MOCK_AUTH_RESULT: AuthResult = {
  tokens: {
    accessToken:  'mock-pro-access-token',
    refreshToken: 'mock-pro-refresh-token',
  },
  user: MOCK_PROFESSIONAL,
};

// ================================================================================== //
// Error Mapping
// ================================================================================== //

const mapAuthError = (error: any): string => {
  const code = (error as AuthError)?.code;
  switch (code) {
    case 'auth/invalid-email':       return 'Adresse email invalide.';
    case 'auth/user-not-found':      return 'Aucun compte trouvé avec cet email.';
    case 'auth/wrong-password':      return 'Mot de passe incorrect.';
    case 'auth/user-disabled':       return 'Ce compte a été désactivé.';
    case 'auth/too-many-requests':   return 'Trop de tentatives. Veuillez réessayer plus tard.';
    default: return error?.message ?? "Une erreur est survenue lors de l'authentification.";
  }
};

// ================================================================================== //
// Use mock flag — set to false when the pro backend is ready
// ================================================================================== //

const USE_MOCK = true;

// ================================================================================== //
// Service
// ================================================================================== //

export const authService = {

  /**
   * Connexion email / mot de passe
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    if (USE_MOCK) {
      // Simulate a short delay
      await new Promise((r) => setTimeout(r, 800));
      if (email && password) return MOCK_AUTH_RESULT;
      throw new Error('Email ou mot de passe invalide.');
    }

    try {
      const credential    = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const firebaseToken = await getIdToken(credential.user);

      const res = await apiClient.post<AuthResult>(
        API_ENDPOINTS.AUTH.LOGIN_EMAIL,
        { firebaseToken }
      );
      if (!res.success) throw new Error(res.error ?? 'Erreur serveur');
      return res.data!;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  },

  /**
   * Réinitialisation du mot de passe (envoi email)
   */
  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      const res = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      if (!res.success) throw new Error(res.error ?? 'Erreur serveur');
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  },

  /**
   * Vérification du code OTP de réinitialisation
   */
  async verifyPasswordResetOtp(email: string, otp: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (otp !== '000000') throw new Error('Code invalide ou expiré.');
      return;
    }

    const res = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD_VERIFY, { email, otp });
    if (!res.success) throw new Error(res.error ?? 'Code invalide ou expiré');
  },

  /**
   * Réinitialisation du mot de passe avec nouveau mot de passe
   */
  async resetPassword(email: string, password: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return;
    }

    const res = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, password });
    if (!res.success) throw new Error(res.error ?? 'Erreur lors de la réinitialisation');
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    if (!USE_MOCK) {
      await signOut(firebaseAuth).catch(() => {});
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    }
  },
};
