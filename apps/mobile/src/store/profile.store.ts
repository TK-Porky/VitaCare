import { create } from "zustand";
import { profileService } from "../services/profile.service";
import { UpdateProfileInput, ChangePasswordInput, UpdatePreferencesInput } from "../schemas/profile.schema";
import { useAuthStore } from "./auth.store";

interface ProfileState {
  isLoading: boolean;
  error: string | null;
  success: boolean;

  // Actions
  updateProfile: (data: UpdateProfileInput) => Promise<void>;
  changePassword: (data: ChangePasswordInput) => Promise<void>;
  updatePreferences: (data: UpdatePreferencesInput) => Promise<void>;
  uploadAvatar: (fileUri: string, fileName: string, fileType: string) => Promise<void>;
  clearState: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isLoading: false,
  error: null,
  success: false,

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    set({ isLoading: true, error: null, success: false });
    try {
      // Note: Map input names to API request names if they differ
      // API expects firstName, lastName, phone, address...
      const [firstName, ...lastNameParts] = data.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const updatedUser = await profileService.updateProfile({
        firstName,
        lastName,
        phone: data.phone,
        address: data.location,
      });

      // Update auth store user data
      useAuthStore.getState().hydrate(); // Or manually set if hydrate is too heavy
      
      set({ success: true });
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de la mise à jour du profil." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Change user password
   */
  changePassword: async (data) => {
    set({ isLoading: true, error: null, success: false });
    try {
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      set({ success: true });
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors du changement de mot de passe." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (data) => {
    set({ isLoading: true, error: null, success: false });
    try {
      if (data.language) {
        await profileService.updatePreferences({
          language: data.language,
        });
      }
      
      if (data.notifications !== undefined || 
          data.medicationReminders !== undefined || 
          data.appointmentReminders !== undefined || 
          data.promotions !== undefined) {
        await profileService.updateNotificationPreferences({
          push: data.notifications,
          medicationReminders: data.medicationReminders,
          appointmentReminders: data.appointmentReminders,
          promotions: data.promotions,
        });
      }

      set({ success: true });
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de la mise à jour des préférences." });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (fileUri, fileName, fileType) => {
    set({ isLoading: true, error: null, success: false });
    try {
      await profileService.uploadAvatar(fileUri, fileName, fileType);
      await useAuthStore.getState().hydrate();
      set({ success: true });
    } catch (e: any) {
      set({ error: e?.message ?? "Erreur lors de l'envoi de l'avatar." });
    } finally {
      set({ isLoading: false });
    }
  },

  clearState: () => set({ error: null, success: false, isLoading: false }),
}));
