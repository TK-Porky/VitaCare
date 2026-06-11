import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import { 
  AppointmentsListQuery, 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest
} from "../types/api-requests";
import { 
  AppointmentResponse, 
  AppointmentsListResponse,
  AppointmentDetailResponse
} from "../types/api-responses";

// ================================================================================== //
// Appointment Service
// Handles all appointment-related API calls.
// ================================================================================== //

export const appointmentService = {
  /**
   * Get list of appointments with optional filtering
   */
  async getAppointments(query?: AppointmentsListQuery): Promise<AppointmentsListResponse> {
    const res = await apiClient.get<AppointmentResponse[]>(API_ENDPOINTS.APPOINTMENTS.LIST, query as any);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch appointments");
    return res as AppointmentsListResponse;
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(id: string): Promise<AppointmentResponse> {
    const res = await apiClient.get<AppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id));
    if (!res.success) throw new Error(res.error ?? "Failed to fetch appointment details");
    return res.data!;
  },

  /**
   * Create a new appointment
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    const res = await apiClient.post<AppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.CREATE, data);
    if (!res.success) throw new Error(res.error ?? "Failed to create appointment");
    return res.data!;
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<AppointmentResponse> {
    const res = await apiClient.put<AppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.UPDATE(id), data);
    if (!res.success) throw new Error(res.error ?? "Failed to update appointment");
    return res.data!;
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string, data: CancelAppointmentRequest): Promise<void> {
    const res = await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), data);
    if (!res.success) throw new Error(res.error ?? "Failed to cancel appointment");
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(id: string, data: RescheduleAppointmentRequest): Promise<AppointmentResponse> {
    const res = await apiClient.patch<AppointmentResponse>(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(id), data);
    if (!res.success) throw new Error(res.error ?? "Failed to reschedule appointment");
    return res.data!;
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<AppointmentResponse[]> {
    const res = await apiClient.get<AppointmentResponse[]>(API_ENDPOINTS.APPOINTMENTS.UPCOMING);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch upcoming appointments");
    return res.data!;
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<AppointmentResponse[]> {
    const res = await apiClient.get<AppointmentResponse[]>(API_ENDPOINTS.APPOINTMENTS.TODAY);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch today's appointments");
    return res.data!;
  },

  /**
   * Get past appointments
   */
  async getPastAppointments(): Promise<AppointmentResponse[]> {
    const res = await apiClient.get<AppointmentResponse[]>(API_ENDPOINTS.APPOINTMENTS.PAST);
    if (!res.success) throw new Error(res.error ?? "Failed to fetch past appointments");
    return res.data!;
  }
};
