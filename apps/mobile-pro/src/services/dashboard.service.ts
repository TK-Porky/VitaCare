/**
 * Dashboard Service — VitaCare Pro
 */

import { apiClient } from '../lib/api.client';
import { API_ENDPOINTS } from '../types/api-endpoints';
import type { DashboardOverview } from '../types/api-responses';

// ================================================================================== //
// Mock Data
// ================================================================================== //

const MOCK_DASHBOARD: DashboardOverview = {
  professional: {
    id:            'pro-001',
    fullName:      'Dr. Jean-Claude Mbarga',
    email:         'dr.mbarga@vitacare.cm',
    specialty:     'Médecine Générale',
    licenseNumber: 'ONMC-2024-1234',
    clinicName:    'Clinique Sainte-Marie',
  },
  stats: {
    totalToday:      8,
    confirmedToday:  5,
    pendingToday:    2,
    cancelledToday:  1,
    completedToday:  0,
    totalThisWeek:   34,
    totalPatients:   127,
    occupancyRate:   75,
  },
  weeklySlots: [
    { date: '2026-05-19', dayLabel: 'Lun', total: 6,  confirmed: 5, pending: 1 },
    { date: '2026-05-20', dayLabel: 'Mar', total: 8,  confirmed: 6, pending: 2 },
    { date: '2026-05-21', dayLabel: 'Mer', total: 7,  confirmed: 7, pending: 0 },
    { date: '2026-05-22', dayLabel: 'Jeu', total: 5,  confirmed: 4, pending: 1 },
    { date: '2026-05-23', dayLabel: 'Ven', total: 8,  confirmed: 5, pending: 2 },
    { date: '2026-05-24', dayLabel: 'Sam', total: 4,  confirmed: 3, pending: 1 },
    { date: '2026-05-25', dayLabel: 'Dim', total: 0,  confirmed: 0, pending: 0 },
  ],
  nextAppointment: {
    id:        'apt-002',
    date:      '2026-05-23',
    time:      '10:30',
    duration:  30,
    status:    'confirmed',
    reason:    'Contrôle post-opératoire',
    notes:     undefined,
    patient: {
      id:       'pat-002',
      fullName: 'Marie Ngo',
      phone:    '+237 6 78 234 567',
    },
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },
  todayAppointments: [
    {
      id:        'apt-001',
      date:      '2026-05-23',
      time:      '09:00',
      duration:  30,
      status:    'confirmed',
      reason:    'Fièvre persistante',
      patient: {
        id:       'pat-001',
        fullName: 'Pierre Kamto',
        phone:    '+237 6 55 111 222',
        gender:   'male',
      },
      fee:       5000,
      currency:  'XAF',
      createdAt: '2026-05-20T07:00:00Z',
      updatedAt: '2026-05-20T07:00:00Z',
    },
    {
      id:        'apt-002',
      date:      '2026-05-23',
      time:      '10:30',
      duration:  30,
      status:    'confirmed',
      reason:    'Contrôle post-opératoire',
      patient: {
        id:       'pat-002',
        fullName: 'Marie Ngo',
        phone:    '+237 6 78 234 567',
        gender:   'female',
      },
      fee:       5000,
      currency:  'XAF',
      createdAt: '2026-05-20T08:00:00Z',
      updatedAt: '2026-05-20T08:00:00Z',
    },
    {
      id:        'apt-003',
      date:      '2026-05-23',
      time:      '14:00',
      duration:  45,
      status:    'pending',
      reason:    'Douleurs abdominales',
      patient: {
        id:       'pat-003',
        fullName: 'Alain Fopa',
        phone:    '+237 6 90 345 678',
        gender:   'male',
      },
      fee:       5000,
      currency:  'XAF',
      createdAt: '2026-05-21T10:00:00Z',
      updatedAt: '2026-05-21T10:00:00Z',
    },
    {
      id:        'apt-004',
      date:      '2026-05-23',
      time:      '15:30',
      duration:  30,
      status:    'cancelled',
      reason:    'Visite de routine',
      patient: {
        id:       'pat-004',
        fullName: 'Claire Biyong',
        phone:    '+237 6 88 456 789',
        gender:   'female',
      },
      fee:       5000,
      currency:  'XAF',
      createdAt: '2026-05-19T09:00:00Z',
      updatedAt: '2026-05-22T14:00:00Z',
    },
  ],
};

const USE_MOCK = true;

// ================================================================================== //
// Service
// ================================================================================== //

export const dashboardService = {

  async getOverview(): Promise<DashboardOverview> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      return MOCK_DASHBOARD;
    }

    const res = await apiClient.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW);
    if (!res.success) throw new Error(res.error ?? 'Erreur lors du chargement du tableau de bord');
    return res.data!;
  },
};
