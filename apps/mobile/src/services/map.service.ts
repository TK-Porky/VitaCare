import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { ClinicSearchRequest, ClinicsListQuery } from "../types/api-requests";
import { ClinicProviderResponse, ClinicsListResponse, ApiResponse } from "../types/api-responses";

// ================================================================================== //
// Map Service
// Handles clinic searches and location-based provider discovery.
// ================================================================================== //

/**
 * Mapper for backend MedecinDTO to frontend ClinicProvider
 */
const mapDoctorToClinic = (doctor: any): ClinicProviderResponse => {
  return {
    id: String(doctor.id),
    avatarUri: doctor.avatarUrl || doctor.photoUrl,
    doctorName: doctor.fullName || doctor.nomComplet || "Médecin",
    specialty: doctor.specialization || doctor.specialite || "Généraliste",
    price: doctor.consultationFee ? `${doctor.consultationFee} XCFA` : undefined,
    priceXCFA: doctor.consultationFee,
    clinicName: doctor.cabinet || doctor.clinicName || "Cabinet Médical",
    description: doctor.bio || doctor.description || "Spécialiste de santé qualifié.",
    hours: doctor.hours || doctor.heuresOuverture,
    days: doctor.days || doctor.joursOuverture,
    location: doctor.address || doctor.ville || "Yaoundé",
    coordinates: doctor.latitude && doctor.longitude ? {
      latitude: doctor.latitude,
      longitude: doctor.longitude,
    } : undefined,
    imageUri: doctor.serviceLocationImageUrl || doctor.cabinetPhotoUrl,
    rating: doctor.rating || 4.5, // Mock rating if not in DDTO
    reviewCount: doctor.reviewCount || 10,
  };
};

export const mapService = {
  /**
   * Search for clinics with filters and coordinates
   */
  async searchClinics(data: ClinicSearchRequest): Promise<ClinicProviderResponse[]> {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.CLINICS.SEARCH, data as any);
    if (!res.success || !res.data) throw new Error(res.error ?? "Failed to search clinics");
    
    const backendData = res.data.data || [];
    return backendData.map(mapDoctorToClinic);
  },

  /**
   * Get list of clinics with pagination and filtering
   */
  async getClinics(query?: ClinicsListQuery): Promise<ClinicsListResponse> {
    const res = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.CLINICS.LIST, query as any);
    if (!res.success || !res.data) throw new Error(res.error ?? "Failed to fetch clinics");
    
    const backendResponse = res.data;
    const doctors = Array.isArray(backendResponse.data) 
      ? backendResponse.data 
      : (backendResponse.data?.content || []);
    
    const pagination = backendResponse.data?.totalPages ? {
      page: backendResponse.data.number + 1,
      limit: backendResponse.data.size,
      total: backendResponse.data.totalElements,
      totalPages: backendResponse.data.totalPages,
    } : {
      page: 1,
      limit: doctors.length,
      total: doctors.length,
      totalPages: 1,
    };

    return {
      success: true,
      data: doctors.map(mapDoctorToClinic),
      pagination
    };
  },

  /**
   * Get specific clinic details by ID
   */
  async getClinicDetails(id: string): Promise<ClinicProviderResponse> {
    const res = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.CLINICS.DETAIL(id));
    if (!res.success || !res.data) throw new Error(res.error ?? "Failed to fetch clinic details");
    return mapDoctorToClinic(res.data.data);
  },

  /**
   * Get clinic availability for specific dates
   */
  async getClinicAvailability(id: string): Promise<ClinicProviderResponse['availability']> {
    const res = await apiClient.get<ApiResponse<any[]>>(API_ENDPOINTS.CLINICS.AVAILABILITY(id));
    if (!res.success || !res.data) throw new Error(res.error ?? "Failed to fetch clinic availability");
    return res.data.data;
  }
};

