import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { 
  UpdateProfileRequest, 
  UpdatePreferencesRequest,
  DeleteAccountRequest
} from "../types/api-requests";
import { UserProfileResponse } from "../types/api-responses";

/**
 * Profile Service
 * Handles all user profile and preference-related API calls.
 */
export const profileService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfileResponse> {
    const res = await apiClient.get<UserProfileResponse>(API_ENDPOINTS.USERS.PROFILE);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch profile");
    return res.data!;
  },

  /**
   * Update user profile data
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    const res = await apiClient.put<UserProfileResponse>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    if (!res.success) throw new Error(res.error ?? "Failed to update profile");
    return res.data!;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<void> {
    const res = await apiClient.put(API_ENDPOINTS.USERS.UPDATE_PREFERENCES, data);
    if (!res.success) throw new Error(res.error ?? "Failed to update preferences");
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(fileUri: string, fileName: string, fileType: string): Promise<{ avatarUrl: string }> {
    const res = await apiClient.upload<{ avatarUrl: string }>(
      API_ENDPOINTS.USERS.AVATAR,
      fileUri,
      fileName,
      fileType,
      'avatar'
    );
    if (!res.success) throw new Error(res.error ?? "Failed to upload avatar");
    return res.data!;
  },

  /**
   * Delete user account
   */
  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    const res = await apiClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT, data);
    if (!res.success) throw new Error(res.error ?? "Failed to delete account");
  }
};
