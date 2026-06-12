/**
 * API Endpoints Configuration for VitaCare Mobile App
 * 
 * This file contains all API endpoints used by the mobile application.
 * Endpoints are organized by feature areas for better maintainability.
 */

// ================================================================================== //
// API Configuration
// ================================================================================== //

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.100:8080/api',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  // ================================================================================== //
  // Authentication
  // ================================================================================== //
  AUTH: {
    LOGIN_PHONE: '/auth/patient/login/phone',
    LOGIN_EMAIL: '/auth/patient/login/email',
    REGISTER_PHONE: '/auth/patient/register/phone',
    REGISTER_EMAIL: '/auth/patient/register/email',
    LOGOUT: '/auth/patient/logout',
    REFRESH: '/auth/patient/refresh',
    FORGOT_PASSWORD: '/auth/patient/forgot-password',
    RESET_PASSWORD: '/auth/patient/reset-password',
    RESET_PASSWORD_VERIFY: '/auth/patient/reset-password-verify',
    CHANGE_PASSWORD: '/auth/patient/change-password',
    VERIFY_EMAIL: '/auth/patient/verify-email',
    RESEND_VERIFICATION: '/auth/patient/resend-verification',
  },

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  USERS: {
    PROFILE: '/users/patients/profile',
    UPDATE_PROFILE: '/users/patients/profile',
    PREFERENCES: '/users/patients/preferences',
    UPDATE_PREFERENCES: '/users/patients/preferences',
    AVATAR: '/users/patients/avatar',
    DELETE_ACCOUNT: '/users/patients/account',
  },

  // ---------------------------------------------------------------------------
  // Cliniques et professionnels (Mapped to Doctors in backend)
  // ---------------------------------------------------------------------------
  CLINICS: {
    LIST: '/doctors',
    DETAIL: (id: string | number) => `/doctors/${id}`,
    SEARCH: '/doctors/search',
    AVAILABILITY: (id: string | number) => `/doctors/${id}/availabilities`,
    REVIEWS: (id: string | number) => `/doctors/${id}/reviews`,
    CREATE_REVIEW: (id: string | number) => `/doctors/${id}/reviews`,
    AVAILABLE_SLOTS: (id: string | number) => `/doctors/${id}/available-slots`,
  },

  // ---------------------------------------------------------------------------
  // Réservations
  // ---------------------------------------------------------------------------
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    UPDATE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    AVAILABLE_SLOTS: '/bookings/available-slots',
  },

  // ---------------------------------------------------------------------------
  // Rendez-vous (backend réel)
  // ---------------------------------------------------------------------------
  APPOINTMENTS: {
    LIST: '/patients/appointments',
    CREATE: '/appointments',
    DETAIL: (id: string | number) => `/appointments/${id}`,
    CANCEL: (id: string | number) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string | number) => `/appointments/${id}/reschedule`,
  },

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    OVERVIEW: '/dashboard',
    STATS: '/dashboard/stats',
    MEDICATIONS: '/dashboard/medications',
    APPOINTMENTS: '/dashboard/appointments',
    OBSERVANCES: '/dashboard/observances',
    UPDATE_MEDICATION: (id: string) => `/dashboard/medications/${id}`,
    ADD_MEDICATION: '/dashboard/medications',
    UPDATE_OBSERVANCE: (id: string) => `/dashboard/observances/${id}`,
  },

  // ---------------------------------------------------------------------------
  // Paiements
  // ---------------------------------------------------------------------------
  PAYMENTS: {
    CREATE: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
    VALIDATE: (id: string) => `/payments/${id}/validate`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
    REFUND: '/payments/refund',
    HISTORY: '/payments/history',
    METHODS: '/payments/methods',
    SAVED_CARDS: '/payments/cards',
    ADD_CARD: '/payments/cards',
    DELETE_CARD: (id: string) => `/payments/cards/${id}`,
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    UPDATE_PREFERENCES: '/notifications/preferences',
    REGISTER_DEVICE: '/notifications/register-device',
    UNREGISTER_DEVICE: '/notifications/unregister-device',
  },

  // ---------------------------------------------------------------------------
  // Recherche
  // ---------------------------------------------------------------------------
  SEARCH: {
    GLOBAL: '/search',
    CLINICS: '/search/clinics',
    DOCTORS: '/search/doctors',
    SPECIALTIES: '/search/specialties',
    SUGGESTIONS: '/search/suggestions',
  },

  // ---------------------------------------------------------------------------
  // Reviews et ratings
  // ---------------------------------------------------------------------------
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    DETAIL: (id: string) => `/reviews/${id}`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    USER_REVIEWS: '/reviews/user',
  },

  // ---------------------------------------------------------------------------
  // Support et signalements
  // ---------------------------------------------------------------------------
  SUPPORT: {
    CONTACT: '/support/contact',
    REPORT: '/support/report',
    TICKETS: '/support/tickets',
    TICKET_DETAIL: (id: string) => `/support/tickets/${id}`,
    FAQ: '/support/faq',
  },

  // ---------------------------------------------------------------------------
  // Fichiers et uploads
  // ---------------------------------------------------------------------------
  UPLOADS: {
    AVATAR: '/uploads/avatar',
    DOCUMENT: '/uploads/document',
    IMAGE: '/uploads/image',
    MULTIPLE: '/uploads/multiple',
  },

  // ---------------------------------------------------------------------------
  // Configuration et références
  // ---------------------------------------------------------------------------
  CONFIG: {
    SPECIALTIES: '/config/specialties',
    LOCATIONS: '/config/locations',
    PAYMENT_METHODS: '/config/payment-methods',
    REASONS: '/config/reasons',
    LANGUAGES: '/config/languages',
    CURRENCIES: '/config/currencies',
  },

} as const;

// ---------------------------------------------------------------------------
// Types pour les endpoints dynamiques
// ---------------------------------------------------------------------------

export type DynamicEndpoint<T extends string> = T extends `${infer _}/${infer _}`
  ? T
  : never;

export type EndpointParams = {
  clinicId: string;
  bookingId: string;
  appointmentId: string;
  paymentId: string;
  reviewId: string;
  medicationId: string;
  observanceId: string;
  notificationId: string;
  ticketId: string;
  cardId: string;
};

// ---------------------------------------------------------------------------
// Construction d'URL
// ---------------------------------------------------------------------------

export const buildUrl = (
  endpoint: string,
  params?: Partial<EndpointParams>,
  queryParams?: Record<string, string | number | boolean>
): string => {
  let url = endpoint;

  // Remplacer les paramètres dynamiques
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  // Ajouter les query parameters
  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

// ---------------------------------------------------------------------------
// Méthodes HTTP
// ---------------------------------------------------------------------------

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

// ---------------------------------------------------------------------------
// Configuration des requêtes
// ---------------------------------------------------------------------------

export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';
}

// ---------------------------------------------------------------------------
// Codes d'erreur HTTP
// ---------------------------------------------------------------------------

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatus = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
