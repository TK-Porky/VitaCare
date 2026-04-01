// Patient
export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;        // ISO 8601
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  nationalId?: string;        // CNI camerounaise
}

// Professionnel de santé
export interface Doctor {
  id: string;
  fullName: string;
  specialty: MedicalSpecialty;
  registrationNumber: string; // Ordre national des médecins du Cameroun
  location: {
    city: string;
    region: CameroonRegion;
    address: string;
  };
  availableSlots?: TimeSlot[];
}

// Rendez-vous
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;        // ISO 8601
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

// Traitement / Ordonnance
export interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  prescribedAt: string;
  medications: Medication[];
  diagnosis?: string;
  followUpDate?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface TimeSlot {
  start: string;              // ISO 8601
  end: string;
}

// Enums
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type MedicalSpecialty =
  | 'general_practice'
  | 'pediatrics'
  | 'gynecology'
  | 'cardiology'
  | 'dermatology'
  | 'ophthalmology'
  | 'dentistry'
  | 'psychiatry'
  | 'surgery';

export type CameroonRegion =
  | 'centre' | 'littoral' | 'ouest' | 'nord_ouest' | 'sud_ouest'
  | 'nord' | 'adamaoua' | 'est' | 'sud' | 'extreme_nord';