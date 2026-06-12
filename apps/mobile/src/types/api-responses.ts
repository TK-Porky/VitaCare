import { ClinicProvider } from './clinicProvider';
import { Appointment } from './appointment';

/**
 * Types des réponses API pour la communication avec le backend VitaCare
 */

// ---------------------------------------------------------------------------
// Réponses génériques
// ---------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Authentification
// ---------------------------------------------------------------------------

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  message: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Cliniques et professionnels
// ---------------------------------------------------------------------------

export type ClinicProviderResponse = ClinicProvider;

export interface ClinicsListResponse extends PaginatedResponse<ClinicProviderResponse> {}

export interface ClinicDetailResponse extends ApiResponse<ClinicProviderResponse> {}

// ---------------------------------------------------------------------------
// Réservations
// ---------------------------------------------------------------------------

export interface BookingRequest {
  providerId: string;
  date: string; // ISO date string
  time: string; // HH:mm format
  reason: string;
  paymentMethod: 'now' | 'later';
  paymentProvider?: 'mobile_money' | 'orange_money' | 'card';
}

export interface BookingResponse {
  id: string;
  providerId: string;
  date: string;
  time: string;
  reason: string;
  paymentMethod: string;
  paymentProvider?: string;
  status: 'confirmed' | 'pending' | 'paid' | 'cancelled';
  total: number;
  currency: string;
  createdAt: string;
  provider: ClinicProvider;
}

export interface TimeSlotsResponse {
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
}

// ---------------------------------------------------------------------------
// Rendez-vous
// ---------------------------------------------------------------------------

export interface AppointmentResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorAvatarUrl: string | null;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  dateTime: string;
  date: string;
  time: string;
  status: string;
  reason: string | null;
  total: number | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  doctorNotes: string | null;
  createdAt: string;
}

export interface AppointmentsListResponse {
  items: AppointmentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentDetailResponse {
  data: AppointmentResponse;
}

export interface RescheduleRequest {
  newDate: string;
  newTime: string;
  reason?: string;
}

export interface CancelRequest {
  reason?: string;
  refundRequested?: boolean;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStatsResponse {
  total: number;
  completed: number;
  pending: number;
  observance: number;
}

export interface MedicationResponse {
  id: string;
  name: string;
  time: string;
  dosage: string;
  status: 'taken' | 'missed' | 'pending';
  nextDose?: string;
  remainingDays?: number;
}

export interface ObservanceResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface DashboardResponse extends ApiResponse<{
  currentUser: string;
  currentDate: string;
  stats: DashboardStatsResponse;
  streak: number;
  activeMedications: number;
  monthlyProgress: number;
  medications: MedicationResponse[];
  appointments: AppointmentResponse[];
  observances: ObservanceResponse[];
  appointmentsToday: {
    doctorName: string;
    clinic: string;
    date: string;
    time: string;
  }[];
}> {}

// ---------------------------------------------------------------------------
// Paiements
// ---------------------------------------------------------------------------

export interface PaymentRequest {
  appointmentId: string;
  method: 'mobile_money' | 'orange_money' | 'card';
  amount: number;
  currency: string;
  phone?: string;
  cardToken?: string;
}

export interface PaymentResponse {
  id: string;
  appointmentId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  method: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentMethodsResponse {
  availableMethods: ('mobile_money' | 'orange_money' | 'card')[];
  defaultMethod?: string;
  savedCards?: {
    id: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  }[];
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  type: 'appointment' | 'medication' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationsListResponse extends PaginatedResponse<NotificationResponse> {}

export interface MarkNotificationReadResponse extends ApiResponse<null> {}

// ---------------------------------------------------------------------------
// Profil utilisateur
// ---------------------------------------------------------------------------

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    language: string;
    notifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Erreurs spécifiques
// ---------------------------------------------------------------------------

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse extends ApiResponse {
  errors?: ValidationError[];
  errorCode?: string;
}

// ---------------------------------------------------------------------------
// Types d'état pour les requêtes
// ---------------------------------------------------------------------------

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T = any> {
  status: RequestStatus;
  data?: T;
  error?: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}
