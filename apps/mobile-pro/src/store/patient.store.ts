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

  clearSelectedPatient: () => set({ selectedPatient: null }),
  clearError: () => set({ error: null }),
}));
