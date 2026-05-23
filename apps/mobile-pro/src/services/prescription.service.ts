/**
 * Prescription Service — VitaCare Pro
 */

import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { Prescription, CreatePrescriptionRequest } from '../types/api-responses';

// ================================================================================== //
// Mock Data
// ================================================================================== //

let mockPrescriptions: Prescription[] = [
  {
    id:           'rx-001',
    patientId:    'pat-001',
    patient:      { id: 'pat-001', fullName: 'Pierre Kamto', phone: '+237 6 55 111 222', gender: 'male' },
    appointmentId:'apt-001',
    medications: [
      { name: 'Amlodipine',   dosage: '5mg',   frequency: '1 fois par jour', duration: '30 jours', instructions: 'À prendre le matin' },
      { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: '1 fois par jour', duration: '30 jours' },
    ],
    notes:    'Contrôle de la tension dans 1 mois.',
    issuedAt: '2026-05-10T09:30:00Z',
    validUntil:'2026-06-10T00:00:00Z',
    createdAt:'2026-05-10T09:30:00Z',
  },
  {
    id:        'rx-002',
    patientId: 'pat-003',
    patient:   { id: 'pat-003', fullName: 'Alain Fopa', phone: '+237 6 90 345 678', gender: 'male' },
    medications: [
      { name: 'Metformine', dosage: '850mg', frequency: '2 fois par jour', duration: '90 jours', instructions: 'À prendre pendant les repas' },
    ],
    notes:    'Régime alimentaire strict. Prochain contrôle dans 3 mois.',
    issuedAt: '2026-05-01T14:00:00Z',
    validUntil:'2026-08-01T00:00:00Z',
    createdAt:'2026-05-01T14:00:00Z',
  },
];

const USE_MOCK = true;

// ================================================================================== //
// Service
// ================================================================================== //

export const prescriptionService = {

  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      if (patientId) return mockPrescriptions.filter((p) => p.patientId === patientId);
      return mockPrescriptions;
    }

    const endpoint = patientId
      ? API_ENDPOINTS.PRESCRIPTIONS.BY_PATIENT(patientId)
      : API_ENDPOINTS.PRESCRIPTIONS.LIST;
    const res = await apiClient.get<Prescription[]>(endpoint);
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async getPrescriptionById(id: string): Promise<Prescription> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const rx = mockPrescriptions.find((p) => p.id === id);
      if (!rx) throw new Error('Prescription introuvable');
      return rx;
    }
    const res = await apiClient.get<Prescription>(API_ENDPOINTS.PRESCRIPTIONS.DETAIL(id));
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async createPrescription(data: CreatePrescriptionRequest): Promise<Prescription> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const newRx: Prescription = {
        id:            `rx-${Date.now()}`,
        patientId:     data.patientId,
        patient:       { id: data.patientId, fullName: 'Patient', phone: '' },
        appointmentId: data.appointmentId,
        medications:   data.medications,
        notes:         data.notes,
        validUntil:    data.validUntil,
        issuedAt:      new Date().toISOString(),
        createdAt:     new Date().toISOString(),
      };
      mockPrescriptions = [newRx, ...mockPrescriptions];
      return newRx;
    }
    const res = await apiClient.post<Prescription>(API_ENDPOINTS.PRESCRIPTIONS.CREATE, data);
    if (!res.success) throw new Error(res.error ?? 'Erreur lors de la création de la prescription');
    return res.data!;
  },
};
