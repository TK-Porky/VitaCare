/**
 * Profile Service — VitaCare Pro
 */

import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { ProfessionalProfile, UpdateProfileRequest } from '../types/api-responses';

const USE_MOCK = true;

export const profileService = {

  async getProfile(): Promise<ProfessionalProfile> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        id:            'pro-001',
        fullName:      'Dr. Jean-Claude Mbarga',
        email:         'dr.mbarga@vitacare.cm',
        phone:         '+237 6 55 123 456',
        specialty:     'Médecine Générale',
        licenseNumber: 'ONMC-2024-1234',
        clinicName:    'Clinique Sainte-Marie',
        clinicAddress: 'Rue de la Paix, Yaoundé',
        bio:           'Médecin généraliste avec 15 ans d\'expérience.',
        languages:     ['Français', 'Anglais'],
        consultationFee: 5000,
        currency:      'XAF',
      };
    }
    const res = await apiClient.get<ProfessionalProfile>(API_ENDPOINTS.USERS.PROFILE);
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfessionalProfile> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { ...(await profileService.getProfile()), ...data };
    }
    const res = await apiClient.put<ProfessionalProfile>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async updateAvatar(fileUri: string): Promise<string> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      return fileUri;
    }
    const res = await apiClient.upload<{ avatarUrl: string }>(
      API_ENDPOINTS.USERS.AVATAR,
      fileUri,
      'avatar.jpg',
      'image/jpeg',
      'avatar'
    );
    if (!res.success) throw new Error(res.error ?? 'Erreur upload');
    return res.data!.avatarUrl;
  },
};
