// store/medication.store.ts

import { create } from "zustand";
import { medicationService } from "../services/medication.service";
import { StoreMedicationResponse } from "../types/api-responses";

/**
 * Medication Store - Manages the store/marketplace catalog state
 * 
 * @remarks
 * This store handles the medication catalog displayed in the marketplace.
 * It only provides read operations since the /api/medications endpoint is read-only.
 */
interface MedicationState {
  // State
  medications: StoreMedicationResponse[];
  isLoading: boolean;
  error: string | null;
  searchResults: StoreMedicationResponse[];
  isSearching: boolean;

  // Actions
  fetchMedications: (params?: { category?: string; page?: number; limit?: number }) => Promise<void>;
  fetchMedicationDetails: (id: string) => Promise<StoreMedicationResponse | null>;
  searchMedications: (query: string, filters?: { category?: string }) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  // ── Initial State ──
  medications: [],
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,

  // ── Actions ──

  /**
   * Fetch all medications from the catalog
   */
  fetchMedications: async (params?) => {
    set({ isLoading: true, error: null });
    try {
      const medications = await medicationService.getStoreMedications(params);
      set({ medications, error: null });
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch medications" });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Fetch a specific medication by ID
   */
  fetchMedicationDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const medication = await medicationService.getStoreMedication(id);
      return medication;
    } catch (e: any) {
      set({ error: e.message || "Failed to fetch medication details" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Search for medications in the catalog
   */
  searchMedications: async (query: string, filters?: { category?: string }) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, isLoading: true, error: null });
    try {
      const result = await medicationService.searchMedications(query, filters);
      set({ 
        searchResults: result || [],
        isSearching: true,
        error: null 
      });
    } catch (e: any) {
      set({ 
        error: e.message || "Failed to search medications",
        searchResults: []
      });
      console.error("Error searching medications:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Clear search results and exit search mode
   */
  clearSearch: () => {
    set({ 
      searchResults: [], 
      isSearching: false,
      error: null
    });
  },

  /**
   * Clear any error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set({
      medications: [],
      isLoading: false,
      error: null,
      searchResults: [],
      isSearching: false,
    });
  },
}));