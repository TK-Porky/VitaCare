// ─── Notification Types ────────────────────────────────────────────────────

export type NotificationCategory =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'treatment_reminder'
  | 'treatment_refill'
  | 'health_tip'
  | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface VitaCareNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  priority: NotificationPriority;
  createdAt: string;           // ISO 8601
  readAt?: string;
  scheduledFor?: string;       // ISO 8601 — for scheduled local notifs
  data?: Record<string, unknown>; // deep-link payload
}

export interface NotificationPreferences {
  appointmentReminders: boolean;
  treatmentReminders: boolean;
  healthTips: boolean;
  reminderLeadTimeMinutes: number; // how many minutes before appointment
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  appointmentReminders: true,
  treatmentReminders: true,
  healthTips: true,
  reminderLeadTimeMinutes: 60,
};
