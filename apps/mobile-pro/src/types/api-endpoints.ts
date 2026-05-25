/**
 * API Endpoints — VitaCare Pro (Portail Professionnel)
 */

// ================================================================================== //
// API Configuration
// ================================================================================== //

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.vitacare.cm',
  TIMEOUT:  30000,
} as const;

// ================================================================================== //
// Endpoints
// ================================================================================== //

export const API_ENDPOINTS = {

  // ---------------------------------------------------------------------------
  // Authentification Professionnelle (email uniquement)
  // ---------------------------------------------------------------------------
  AUTH: {
    LOGIN_EMAIL:             '/auth/professional/login/email',
    LOGOUT:                  '/auth/professional/logout',
    REFRESH:                 '/auth/professional/refresh',
    FORGOT_PASSWORD:         '/auth/professional/forgot-password',
    RESET_PASSWORD:          '/auth/professional/reset-password',
    RESET_PASSWORD_VERIFY:   '/auth/professional/reset-password-verify',
    CHANGE_PASSWORD:         '/auth/professional/change-password',
  },

  // ---------------------------------------------------------------------------
  // Profil du professionnel
  // ---------------------------------------------------------------------------
  USERS: {
    PROFILE:        '/users/professionals/profile',
    UPDATE_PROFILE: '/users/professionals/profile',
    AVATAR:         '/users/professionals/avatar',
    DELETE_ACCOUNT: '/users/professionals/account',
    SCHEDULE:       '/users/professionals/schedule',
    UPDATE_SCHEDULE:'/users/professionals/schedule',
  },

  // ---------------------------------------------------------------------------
  // Rendez-vous du professionnel
  // ---------------------------------------------------------------------------
  APPOINTMENTS: {
    LIST:               '/professionals/appointments',
    TODAY:              '/professionals/appointments/today',
    WEEK:               '/professionals/appointments/week',
    DETAIL:  (id: string) => `/professionals/appointments/${id}`,
    CONFIRM: (id: string) => `/professionals/appointments/${id}/confirm`,
    CANCEL:  (id: string) => `/professionals/appointments/${id}/cancel`,
    COMPLETE:(id: string) => `/professionals/appointments/${id}/complete`,
    UPCOMING:           '/professionals/appointments/upcoming',
  },

  // ---------------------------------------------------------------------------
  // Patients suivis
  // ---------------------------------------------------------------------------
  PATIENTS: {
    LIST:              '/professionals/patients',
    DETAIL: (id: string) => `/professionals/patients/${id}`,
    HISTORY:(id: string) => `/professionals/patients/${id}/history`,
    SEARCH:            '/professionals/patients/search',
  },

  // ---------------------------------------------------------------------------
  // Prescriptions
  // ---------------------------------------------------------------------------
  PRESCRIPTIONS: {
    LIST:               '/professionals/prescriptions',
    CREATE:             '/professionals/prescriptions',
    DETAIL: (id: string) => `/professionals/prescriptions/${id}`,
    UPDATE: (id: string) => `/professionals/prescriptions/${id}`,
    BY_PATIENT:(patientId: string) => `/professionals/patients/${patientId}/prescriptions`,
  },

  // ---------------------------------------------------------------------------
  // Dashboard professionnel
  // ---------------------------------------------------------------------------
  DASHBOARD: {
    OVERVIEW: '/professionals/dashboard',
    STATS:    '/professionals/dashboard/stats',
  },

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  NOTIFICATIONS: {
    LIST:            '/notifications',
    MARK_READ:       '/notifications/mark-read',
    MARK_ALL_READ:   '/notifications/mark-all-read',
    REGISTER_DEVICE: '/notifications/register-device',
  },

} as const;

// ---------------------------------------------------------------------------
// HTTP Helpers
// ---------------------------------------------------------------------------

export const HTTP_METHODS = {
  GET:    'GET',
  POST:   'POST',
  PUT:    'PUT',
  PATCH:  'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

export const HTTP_STATUS_CODES = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
