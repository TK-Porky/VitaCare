import { create } from "zustand";
import { medicationService } from "../services/medication.service";
import { MedicationResponse } from "../types/api-responses";
import { AddMedicationRequest, UpdateMedicationStatusRequest } from "../types/api-requests";

interface MedicationState {
  medications: MedicationResponse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMedications: () => Promise<void>;
  addMedication: (data: AddMedicationRequest) => Promise<void>;
  updateStatus: (data: UpdateMedicationStatusRequest) => Promise<void>;
  removeMedication: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  isLoading: false,
  error: null,

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const medications = await medicationService.getMedications();
      set({ medications });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addMedication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMedication = await medicationService.addMedication(data);
      set((state) => ({ medications: [newMedication, ...state.medications] }));
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await medicationService.updateStatus(data);
      set((state) => ({
        medications: state.medications.map((m) =>
          m.id === data.medicationId ? { ...m, status: data.status } : m
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  removeMedication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await medicationService.removeMedication(id);
      set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
      }));
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
