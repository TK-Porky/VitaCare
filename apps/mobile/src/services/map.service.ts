import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { ClinicSearchRequest, ClinicsListQuery } from "../types/api-requests";
import { ClinicProviderResponse, ClinicsListResponse } from "../types/api-responses";

// ================================================================================== //
// Map Service
// Handles clinic searches and location-based provider discovery.
// ================================================================================== //

export const mapService = {
  /**
   * Search for clinics with filters and coordinates
   */
  async searchClinics(data: ClinicSearchRequest): Promise<ClinicProviderResponse[]> {
    const res = await apiClient.post<ClinicProviderResponse[]>(API_ENDPOINTS.CLINICS.SEARCH, data);
    if (!res.success) throw new Error(res.error ?? "Failed to search clinics");
    return res.data!;
  },

  /**
   * Get list of clinics with pagination and filtering
   */
  async getClinics(query?: ClinicsListQuery): Promise<ClinicsListResponse> {
    const res = await apiClient.get<ClinicProviderResponse[]>(API_ENDPOINTS.CLINICS.LIST, query as any);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch clinics");
    return res as ClinicsListResponse;
  },

  /**
   * Get specific clinic details by ID
   */
  async getClinicDetails(id: string): Promise<ClinicProviderResponse> {
    const res = await apiClient.get<ClinicProviderResponse>(API_ENDPOINTS.CLINICS.DETAIL(id));
    if (!res.success) throw new Error(res.error ?? "Failed to fetch clinic details");
    return res.data!;
  },

  /**
   * Get clinic availability for specific dates
   */
  async getClinicAvailability(id: string): Promise<ClinicProviderResponse['availability']> {
    const res = await apiClient.get<ClinicProviderResponse['availability']>(API_ENDPOINTS.CLINICS.AVAILABILITY(id));
    if (!res.success) throw new Error(res.error ?? "Failed to fetch clinic availability");
    return res.data!;
  }
};
