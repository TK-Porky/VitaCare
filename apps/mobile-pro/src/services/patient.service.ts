/**
 * Patient Service — VitaCare Pro
 */

import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { PatientDetail, PatientHistory } from '../types/api-responses';

// ================================================================================== //
// Mock Data
// ================================================================================== //

const MOCK_PATIENTS: PatientDetail[] = [
  {
    id: 'pat-001', fullName: 'Pierre Kamto', phone: '+237 6 55 111 222',
    email: 'pierre.kamto@email.cm', gender: 'male',
    dateOfBirth: '1985-03-12', bloodType: 'O+',
    allergies: ['Pénicilline'],
    medicalHistory: 'Hypertension traitée depuis 2018.',
    lastVisit: '2026-05-10', totalAppointments: 12,
  },
  {
    id: 'pat-002', fullName: 'Marie Ngo', phone: '+237 6 78 234 567',
    email: 'marie.ngo@email.cm', gender: 'female',
    dateOfBirth: '1990-07-25', bloodType: 'A+',
    allergies: [],
    medicalHistory: 'Appendicectomie en 2022.',
    lastVisit: '2026-04-28', totalAppointments: 5,
  },
  {
    id: 'pat-003', fullName: 'Alain Fopa', phone: '+237 6 90 345 678',
    email: undefined, gender: 'male',
    dateOfBirth: '1978-11-03', bloodType: 'B+',
    allergies: ['Aspirine'],
    medicalHistory: 'Diabète type 2 diagnostiqué en 2020.',
    lastVisit: '2026-05-01', totalAppointments: 8,
  },
  {
    id: 'pat-004', fullName: 'Claire Biyong', phone: '+237 6 88 456 789',
    email: 'c.biyong@email.cm', gender: 'female',
    dateOfBirth: '1995-02-14', bloodType: 'AB+',
    allergies: [],
    medicalHistory: 'Suivi gynécologique régulier.',
    lastVisit: '2026-05-15', totalAppointments: 3,
  },
  {
    id: 'pat-005', fullName: 'Samuel Atangana', phone: '+237 6 72 567 890',
    email: 's.atangana@email.cm', gender: 'male',
    dateOfBirth: '1960-09-08', bloodType: 'O-',
    allergies: ['Ibuprofen'],
    medicalHistory: 'Asthme chronique, insuffisance cardiaque légère.',
    lastVisit: '2026-05-20', totalAppointments: 24,
  },
];

const USE_MOCK = true;

// ================================================================================== //
// Service
// ================================================================================== //

export const patientService = {

  async getPatients(search?: string): Promise<PatientDetail[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (search) {
        const q = search.toLowerCase();
        return MOCK_PATIENTS.filter((p) => p.fullName.toLowerCase().includes(q));
      }
      return MOCK_PATIENTS;
    }
    const res = await apiClient.get<PatientDetail[]>(
      API_ENDPOINTS.PATIENTS.LIST,
      search ? { search } : undefined
    );
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async getPatientById(id: string): Promise<PatientDetail> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const patient = MOCK_PATIENTS.find((p) => p.id === id);
      if (!patient) throw new Error('Patient introuvable');
      return patient;
    }
    const res = await apiClient.get<PatientDetail>(API_ENDPOINTS.PATIENTS.DETAIL(id));
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async getPatientHistory(patientId: string): Promise<PatientHistory> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { appointments: [], prescriptions: [] };
    }
    const res = await apiClient.get<PatientHistory>(API_ENDPOINTS.PATIENTS.HISTORY(patientId));
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },
};
