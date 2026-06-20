// services/medication.service.ts

import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { 
  StoreMedicationResponse,
  MedicationFormResponse
} from "../types/api-responses";

/**
 * Build query string helper
 */
const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Medication Service - Store/Marketplace Catalog
 * 
 * @remarks
 * This service handles the medication catalog (store/marketplace).
 * All endpoints are read-only (GET only) as per the API documentation.
 * 
 * Endpoints:
 * - GET /api/medications - List all medications
 * - GET /api/medications/{id} - Get medication details
 * - GET /api/medications/{id}/forms - Get medication forms
 * - GET /api/medications/search - Search medications
 */
export const medicationService = {
  /**
   * Get all store medications (marketplace catalog)
   * @param params - Optional filters (search, category, etc.)
   * @returns List of medications from the catalog
   * 
   * @example
   * // Get all medications
   * const medications = await medicationService.getStoreMedications();
   * 
   * // Search medications
   * const results = await medicationService.getStoreMedications({ search: 'paracetamol' });
   */
  async getStoreMedications(params?: { 
    search?: string; 
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<StoreMedicationResponse[]> {
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.MEDICATIONS.LIST}${queryString}`;
    
    const res = await apiClient.get<StoreMedicationResponse[]>(url);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch medications");
    return res.data ?? [];
  },

  /**
   * Get a specific store medication by ID
   * @param id - Medication ID
   * @returns Medication details
   * 
   * @example
   * const medication = await medicationService.getStoreMedication('med_123');
   */
  async getStoreMedication(id: string): Promise<StoreMedicationResponse> {
    const res = await apiClient.get<StoreMedicationResponse>(
      API_ENDPOINTS.MEDICATIONS.GET(id)
    );
    if (!res.success) throw new Error(res.error ?? "Failed to fetch medication details");
    return res.data!;
  },

  /**
   * Get available forms of a medication
   * @param id - Medication ID
   * @returns List of available forms (tablet, capsule, syrup, etc.)
   * 
   * @example
   * const forms = await medicationService.getMedicationForms('med_123');
   * // Returns: ['Comprimé', 'Gélule', 'Sirop']
   */
  async getMedicationForms(id: string): Promise<MedicationFormResponse> {
    const res = await apiClient.get<MedicationFormResponse>(
      API_ENDPOINTS.MEDICATIONS.FORMS(id)
    );
    if (!res.success) throw new Error(res.error ?? "Failed to fetch medication forms");
    return res.data!;
  },

  /**
   * Search for medications in the store catalog
   * @param query - Search query string
   * @param filters - Optional filters (category, etc.)
   * @returns List of matching medications
   * 
   * @example
   * // Simple search
   * const results = await medicationService.searchMedications('doliprane');
   * 
   * // Search with filters
   * const results = await medicationService.searchMedications('antibiotic', { 
   *   category: 'antibiotics' 
   * });
   */
  async searchMedications(
    query: string,
    filters?: { category?: string; page?: number; limit?: number }
  ): Promise<StoreMedicationResponse[]> {
    const params = { q: query, ...filters };
    const queryString = buildQueryString(params);
    const url = `${API_ENDPOINTS.MEDICATIONS.SEARCH}${queryString}`;
    
    const res = await apiClient.get<StoreMedicationResponse[]>(url);
    if (!res.success) throw new Error(res.error ?? "Failed to search medications");
    return res.data ?? [];
  },

  /**
   * Get medications by category
   * @param category - Category name
   * @returns List of medications in the category
   * 
   * @example
   * const antibiotics = await medicationService.getMedicationsByCategory('antibiotics');
   */
  async getMedicationsByCategory(category: string): Promise<StoreMedicationResponse[]> {
    const queryString = buildQueryString({ category });
    const url = `${API_ENDPOINTS.MEDICATIONS.LIST}${queryString}`;
    
    const res = await apiClient.get<StoreMedicationResponse[]>(url);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch medications by category");
    return res.data ?? [];
  },
};