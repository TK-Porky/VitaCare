/**
 * Patient Store — VitaCare Pro
 */

import { create } from 'zustand';
import { patientService } from '../services/patient.service';
import type { PatientDetail } from '../types/api-responses';

interface PatientState {
  patients:        PatientDetail[];
  selectedPatient: PatientDetail | null;
  isLoading:       boolean;
  error:           string | null;

  fetchPatients:       (search?: string) => Promise<void>;
  fetchPatientById:    (id: string) => Promise<void>;
  updatePatient:       (id: string, updatedFields: Partial<PatientDetail>) => void;
  deletePatient:       (id: string) => void;
  clearSelectedPatient:() => void;
  clearError:          () => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients:        [],
  selectedPatient: null,
  isLoading:       false,
  error:           null,

  fetchPatients: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await patientService.getPatients(search);
      set({ patients: data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isLoading: false });
    }
  },

  fetchPatientById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await patientService.getPatientById(id);
      set({ selectedPatient: data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur', isLoading: false });
    }
  },

  updatePatient: (id, updatedFields) => {
    set((state) => {
      const updatedPatients = state.patients.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      const updatedSelected = state.selectedPatient && state.selectedPatient.id === id
        ? { ...state.selectedPatient, ...updatedFields }
        : state.selectedPatient;
      return { patients: updatedPatients, selectedPatient: updatedSelected };
    });
  },

  deletePatient: (id) => {
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== id),
      selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
    }));
  },

  clearSelectedPatient: () => set({ selectedPatient: null }),
  clearError: () => set({ error: null }),
}));
