/**
 * Types des réponses API — VitaCare Pro (Portail Professionnel)
 */

// ================================================================================== //
// Générique
// ================================================================================== //

export interface ApiResponse<T = any> {
  success:    boolean;
  data?:      T;
  message?:   string;
  error?:     string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

// ================================================================================== //
// Authentification
// ================================================================================== //

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface ProfessionalProfile {
  id:          string;
  fullName:    string;
  email:       string;
  phone?:      string;
  avatarUrl?:  string;
  specialty:   string;
  licenseNumber: string;
  clinicName?:   string;
  clinicAddress?:string;
  bio?:        string;
  languages?:  string[];
  consultationFee?: number;
  currency?:   string;
}

export interface AuthResult {
  tokens: AuthTokens;
  user:   ProfessionalProfile;
}

// ================================================================================== //
// Rendez-vous
// ================================================================================== //

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface PatientSummary {
  id:          string;
  fullName:    string;
  avatarUrl?:  string;
  phone?:      string;
  email?:      string;
  dateOfBirth?:string;
  gender?:     'male' | 'female' | 'other';
}

export interface ProAppointment {
  id:          string;
  date:        string;          // ISO date string
  time:        string;          // HH:mm
  duration:    number;          // minutes
  status:      AppointmentStatus;
  reason:      string;
  notes?:      string;
  patient:     PatientSummary;
  fee?:        number;
  currency?:   string;
  createdAt:   string;
  updatedAt:   string;
}

export interface AppointmentsListResponse extends PaginatedResponse<ProAppointment> {}

// ================================================================================== //
// Prescriptions
// ================================================================================== //

export interface PrescriptionMedication {
  name:         string;
  dosage:       string;          // ex: "500mg"
  frequency:    string;          // ex: "2 fois par jour"
  duration:     string;          // ex: "7 jours"
  instructions?:string;
}

export interface Prescription {
  id:            string;
  patientId:     string;
  patient:       PatientSummary;
  appointmentId?:string;
  medications:   PrescriptionMedication[];
  notes?:        string;
  issuedAt:      string;
  validUntil?:   string;
  createdAt:     string;
}

export type CreatePrescriptionRequest = {
  patientId:      string;
  appointmentId?: string;
  medications:    PrescriptionMedication[];
  notes?:         string;
  validUntil?:    string;
};

// ================================================================================== //
// Dashboard
// ================================================================================== //

export interface DashboardStats {
  totalToday:      number;
  confirmedToday:  number;
  pendingToday:    number;
  cancelledToday:  number;
  completedToday:  number;
  totalThisWeek:   number;
  totalPatients:   number;
  occupancyRate:   number; // 0-100
}

export interface WeeklySlot {
  date:       string;          // ISO
  dayLabel:   string;          // ex: "Lun"
  total:      number;
  confirmed:  number;
  pending:    number;
}

export interface DashboardOverview {
  professional:     ProfessionalProfile;
  stats:            DashboardStats;
  weeklySlots:      WeeklySlot[];
  nextAppointment?: ProAppointment;
  todayAppointments: ProAppointment[];
}

// ================================================================================== //
// Patients
// ================================================================================== //

export interface PatientDetail extends PatientSummary {
  address?:           string;
  bloodType?:         string;
  allergies?:         string[];
  medicalHistory?:    string;
  lastVisit?:         string;
  totalAppointments:  number;
}

export interface PatientHistory {
  appointments: ProAppointment[];
  prescriptions: Prescription[];
}

// ================================================================================== //
// Profil professionnel
// ================================================================================== //

export interface UpdateProfileRequest {
  fullName?:       string;
  phone?:          string;
  bio?:            string;
  clinicName?:     string;
  clinicAddress?:  string;
  consultationFee?:number;
  languages?:      string[];
}

export interface Schedule {
  monday?:    DaySchedule;
  tuesday?:   DaySchedule;
  wednesday?: DaySchedule;
  thursday?:  DaySchedule;
  friday?:    DaySchedule;
  saturday?:  DaySchedule;
  sunday?:    DaySchedule;
}

export interface DaySchedule {
  isOpen:    boolean;
  openTime:  string;   // HH:mm
  closeTime: string;   // HH:mm
  breakStart?:string;
  breakEnd?:  string;
}

// ================================================================================== //
// Erreurs
// ================================================================================== //

export interface ValidationError {
  field:   string;
  message: string;
}

export interface ApiErrorResponse extends ApiResponse {
  errors?:    ValidationError[];
  errorCode?: string;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
