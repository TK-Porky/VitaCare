import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { AddMedicationRequest, UpdateMedicationStatusRequest } from "../types/api-requests";
import { MedicationResponse } from "../types/api-responses";

// ================================================================================== //
// Medication Service
// Handles medication list, adding new medications and tracking dosage.
// ================================================================================== //

export const medicationService = {
  /**
   * Get list of active medications
   */
  async getMedications(): Promise<MedicationResponse[]> {
    const res = await apiClient.get<MedicationResponse[]>(API_ENDPOINTS.DASHBOARD.MEDICATIONS);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch medications");
    return res.data!;
  },

  /**
   * Add a new medication to the user's list
   */
  async addMedication(data: AddMedicationRequest): Promise<MedicationResponse> {
    const res = await apiClient.post<MedicationResponse>(API_ENDPOINTS.DASHBOARD.ADD_MEDICATION, data);
    if (!res.success) throw new Error(res.error ?? "Failed to add medication");
    return res.data!;
  },

  /**
   * Update medication intake status
   */
  async updateStatus(data: UpdateMedicationStatusRequest): Promise<void> {
    const res = await apiClient.patch(API_ENDPOINTS.DASHBOARD.UPDATE_MEDICATION(data.medicationId), data);
    if (!res.success) throw new Error(res.error ?? "Failed to update medication status");
  },

  /**
   * Remove a medication
   */
  async removeMedication(id: number): Promise<void> {
    const res = await apiClient.delete(API_ENDPOINTS.DASHBOARD.UPDATE_MEDICATION(id));
    if (!res.success) throw new Error(res.error ?? "Failed to remove medication");
  }
};
