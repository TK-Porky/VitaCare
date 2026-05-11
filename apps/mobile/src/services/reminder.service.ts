import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { UpdateNotificationPreferencesRequest, MarkNotificationsReadRequest } from "../types/api-requests";
import { NotificationResponse, NotificationsListResponse } from "../types/api-responses";

/**
 * Reminder/Notification Service
 * Handles user notifications, reminders and push notification registration.
 */
export const reminderService = {
  /**
   * Get list of notifications for the user
   */
  async getNotifications(): Promise<NotificationsListResponse> {
    const res = await apiClient.get<NotificationResponse[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch notifications");
    return res as NotificationsListResponse;
  },

  /**
   * Mark specific notifications or all notifications as read
   */
  async markAsRead(data?: MarkNotificationsReadRequest): Promise<void> {
    const endpoint = data?.notificationIds?.length 
      ? API_ENDPOINTS.NOTIFICATIONS.MARK_READ 
      : API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ;
      
    const res = await apiClient.post(endpoint, data);
    if (!res.success) throw new Error(res.error ?? "Failed to mark notifications as read");
  },

  /**
   * Get current notification preferences
   */
  async getPreferences(): Promise<UpdateNotificationPreferencesRequest> {
    const res = await apiClient.get<UpdateNotificationPreferencesRequest>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch notification preferences");
    return res.data!;
  },

  /**
   * Update notification preferences (push, email, sms)
   */
  async updatePreferences(data: UpdateNotificationPreferencesRequest): Promise<void> {
    const res = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.UPDATE_PREFERENCES, data);
    if (!res.success) throw new Error(res.error ?? "Failed to update notification preferences");
  },

  /**
   * Register device for push notifications
   */
  async registerDevice(deviceToken: string, platform: 'ios' | 'android'): Promise<void> {
    const res = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, { deviceToken, platform });
    if (!res.success) throw new Error(res.error ?? "Failed to register device");
  },

  /**
   * Unregister device from push notifications
   */
  async unregisterDevice(deviceToken: string): Promise<void> {
    const res = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.UNREGISTER_DEVICE, { deviceToken });
    if (!res.success) throw new Error(res.error ?? "Failed to unregister device");
  }
};
