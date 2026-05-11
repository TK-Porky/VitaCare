import { create } from "zustand";
import { mapService } from "../services/map.service";
import { ClinicProviderResponse } from "../types/api-responses";
import { ClinicSearchRequest, ClinicsListQuery } from "../types/api-requests";

interface MapState {
  clinics: ClinicProviderResponse[];
  searchResults: ClinicProviderResponse[];
  selectedClinic: ClinicProviderResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchClinics: (query?: ClinicsListQuery) => Promise<void>;
  searchClinics: (data: ClinicSearchRequest) => Promise<void>;
  fetchClinicById: (id: string) => Promise<void>;
  setSelectedClinic: (clinic: ClinicProviderResponse | null) => void;
  clearError: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  clinics: [],
  searchResults: [],
  selectedClinic: null,
  isLoading: false,
  error: null,

  fetchClinics: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mapService.getClinics(query);
      set({ clinics: response.data ?? [] });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  searchClinics: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const results = await mapService.searchClinics(data);
      set({ searchResults: results });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchClinicById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const clinic = await mapService.getClinicDetails(id);
      set({ selectedClinic: clinic });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedClinic: (selectedClinic) => set({ selectedClinic }),
  clearError: () => set({ error: null }),
}));
