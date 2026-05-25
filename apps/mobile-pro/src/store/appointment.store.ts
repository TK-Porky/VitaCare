/**
 * Appointment Store — VitaCare Pro
 */

import { create } from 'zustand';
import { appointmentService } from '../services/appointment.service';
import type { ProAppointment } from '../types/api-responses';

interface AppointmentState {
  todayAppointments: ProAppointment[];
  weekAppointments:  ProAppointment[];
  selectedAppointment: ProAppointment | null;
  isLoading:         boolean;
  isActioning:       boolean;
  error:             string | null;

  fetchTodayAppointments:  () => Promise<void>;
  fetchWeekAppointments:   () => Promise<void>;
  fetchAppointmentById:    (id: string) => Promise<void>;
  confirmAppointment:      (id: string) => Promise<void>;
  cancelAppointment:       (id: string, reason?: string) => Promise<void>;
  completeAppointment:     (id: string, notes?: string) => Promise<void>;
  clearSelectedAppointment:() => void;
  clearError:              () => void;
}

/**
 * Update an appointment in a list by id
 */
function updateInList(list: ProAppointment[], updated: ProAppointment): ProAppointment[] {
  return list.map((a) => (a.id === updated.id ? updated : a));
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  todayAppointments:   [],
  weekAppointments:    [],
  selectedAppointment: null,
  isLoading:           false,
  isActioning:         false,
  error:               null,

  fetchTodayAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await appointmentService.getTodayAppointments();
      set({ todayAppointments: data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isLoading: false });
    }
  },

  fetchWeekAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await appointmentService.getWeekAppointments();
      set({ weekAppointments: data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isLoading: false });
    }
  },

  fetchAppointmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await appointmentService.getAppointmentById(id);
      set({ selectedAppointment: data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isLoading: false });
    }
  },

  confirmAppointment: async (id: string) => {
    set({ isActioning: true, error: null });
    try {
      const updated = await appointmentService.confirmAppointment(id);
      set((s) => ({
        todayAppointments:   updateInList(s.todayAppointments, updated),
        weekAppointments:    updateInList(s.weekAppointments,  updated),
        selectedAppointment: s.selectedAppointment?.id === id ? updated : s.selectedAppointment,
        isActioning: false,
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isActioning: false });
    }
  },

  cancelAppointment: async (id: string, reason?: string) => {
    set({ isActioning: true, error: null });
    try {
      const updated = await appointmentService.cancelAppointment(id, reason);
      set((s) => ({
        todayAppointments:   updateInList(s.todayAppointments, updated),
        weekAppointments:    updateInList(s.weekAppointments,  updated),
        selectedAppointment: s.selectedAppointment?.id === id ? updated : s.selectedAppointment,
        isActioning: false,
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isActioning: false });
    }
  },

  completeAppointment: async (id: string, notes?: string) => {
    set({ isActioning: true, error: null });
    try {
      const updated = await appointmentService.completeAppointment(id, notes);
      set((s) => ({
        todayAppointments:   updateInList(s.todayAppointments, updated),
        weekAppointments:    updateInList(s.weekAppointments,  updated),
        selectedAppointment: s.selectedAppointment?.id === id ? updated : s.selectedAppointment,
        isActioning: false,
      }));
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isActioning: false });
    }
  },

  clearSelectedAppointment: () => set({ selectedAppointment: null }),
  clearError: () => set({ error: null }),
}));
