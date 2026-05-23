/**
 * Appointment Service — VitaCare Pro
 */

import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { ProAppointment } from '../types/api-responses';

// ================================================================================== //
// Mock Data
// ================================================================================== //

const MOCK_APPOINTMENTS: ProAppointment[] = [
  {
    id: 'apt-001', date: '2026-05-23', time: '09:00', duration: 30,
    status: 'confirmed', reason: 'Fièvre persistante',
    patient: { id: 'pat-001', fullName: 'Pierre Kamto',  phone: '+237 6 55 111 222', gender: 'male' },
    fee: 5000, currency: 'XAF',
    createdAt: '2026-05-20T07:00:00Z', updatedAt: '2026-05-20T07:00:00Z',
  },
  {
    id: 'apt-002', date: '2026-05-23', time: '10:30', duration: 30,
    status: 'confirmed', reason: 'Contrôle post-opératoire',
    patient: { id: 'pat-002', fullName: 'Marie Ngo',     phone: '+237 6 78 234 567', gender: 'female' },
    fee: 5000, currency: 'XAF',
    createdAt: '2026-05-20T08:00:00Z', updatedAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'apt-003', date: '2026-05-23', time: '14:00', duration: 45,
    status: 'pending', reason: 'Douleurs abdominales',
    patient: { id: 'pat-003', fullName: 'Alain Fopa',    phone: '+237 6 90 345 678', gender: 'male' },
    fee: 5000, currency: 'XAF',
    createdAt: '2026-05-21T10:00:00Z', updatedAt: '2026-05-21T10:00:00Z',
  },
  {
    id: 'apt-004', date: '2026-05-23', time: '15:30', duration: 30,
    status: 'cancelled', reason: 'Visite de routine',
    patient: { id: 'pat-004', fullName: 'Claire Biyong', phone: '+237 6 88 456 789', gender: 'female' },
    fee: 5000, currency: 'XAF',
    createdAt: '2026-05-19T09:00:00Z', updatedAt: '2026-05-22T14:00:00Z',
  },
  {
    id: 'apt-005', date: '2026-05-24', time: '08:30', duration: 30,
    status: 'confirmed', reason: 'Renouvellement ordonnance',
    patient: { id: 'pat-005', fullName: 'Samuel Atangana', phone: '+237 6 72 567 890', gender: 'male' },
    fee: 5000, currency: 'XAF',
    createdAt: '2026-05-22T11:00:00Z', updatedAt: '2026-05-22T11:00:00Z',
  },
];

const USE_MOCK = true;

// Mock state storage for updates
let mockAppointments = [...MOCK_APPOINTMENTS];

// ================================================================================== //
// Service
// ================================================================================== //

export const appointmentService = {

  async getTodayAppointments(): Promise<ProAppointment[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const today = new Date().toISOString().split('T')[0];
      return mockAppointments.filter((a) => a.date === today || a.date === '2026-05-23');
    }
    const res = await apiClient.get<ProAppointment[]>(API_ENDPOINTS.APPOINTMENTS.TODAY);
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async getWeekAppointments(): Promise<ProAppointment[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockAppointments;
    }
    const res = await apiClient.get<ProAppointment[]>(API_ENDPOINTS.APPOINTMENTS.WEEK);
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async getAppointmentById(id: string): Promise<ProAppointment> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const apt = mockAppointments.find((a) => a.id === id);
      if (!apt) throw new Error('Rendez-vous introuvable');
      return apt;
    }
    const res = await apiClient.get<ProAppointment>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id));
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },

  async confirmAppointment(id: string): Promise<ProAppointment> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      mockAppointments = mockAppointments.map((a) =>
        a.id === id ? { ...a, status: 'confirmed' as const, updatedAt: new Date().toISOString() } : a
      );
      return mockAppointments.find((a) => a.id === id)!;
    }
    const res = await apiClient.post<ProAppointment>(API_ENDPOINTS.APPOINTMENTS.CONFIRM(id));
    if (!res.success) throw new Error(res.error ?? 'Erreur lors de la confirmation');
    return res.data!;
  },

  async cancelAppointment(id: string, reason?: string): Promise<ProAppointment> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      mockAppointments = mockAppointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const, notes: reason, updatedAt: new Date().toISOString() } : a
      );
      return mockAppointments.find((a) => a.id === id)!;
    }
    const res = await apiClient.post<ProAppointment>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), { reason });
    if (!res.success) throw new Error(res.error ?? 'Erreur lors de l\'annulation');
    return res.data!;
  },

  async completeAppointment(id: string, notes?: string): Promise<ProAppointment> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      mockAppointments = mockAppointments.map((a) =>
        a.id === id ? { ...a, status: 'completed' as const, notes, updatedAt: new Date().toISOString() } : a
      );
      return mockAppointments.find((a) => a.id === id)!;
    }
    const res = await apiClient.post<ProAppointment>(API_ENDPOINTS.APPOINTMENTS.COMPLETE(id), { notes });
    if (!res.success) throw new Error(res.error ?? 'Erreur');
    return res.data!;
  },
};
