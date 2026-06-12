import { apiClient } from "../lib/api.client";
import { API_ENDPOINTS } from "../types/api-endpoints";
import {
  AppointmentsListQuery,
  CreateAppointmentRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
} from "../types/api-requests";
import {
  AppointmentResponse,
} from "../types/api-responses";

function unwrapBackendData<T>(res: any): T {
  if (!res.success) throw new Error(res.error ?? "Request failed");
  const body = res.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

export const appointmentService = {

  async getAll(): Promise<AppointmentResponse[]> {
    const res = await apiClient.get<any>(API_ENDPOINTS.APPOINTMENTS.LIST);
    return unwrapBackendData<AppointmentResponse[]>(res);
  },

  async getById(id: number | string): Promise<AppointmentResponse> {
    const res = await apiClient.get<any>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id));
    return unwrapBackendData<AppointmentResponse>(res);
  },

  async create(data: CreateAppointmentRequest): Promise<AppointmentResponse> {
    const payload = {
      doctorId: Number(data.providerId),
      dateTime: `${data.date}T${data.time}:00`,
      reason: data.reason,
      paymentMethod: data.paymentMethod,
    };
    const res = await apiClient.post<any>(API_ENDPOINTS.APPOINTMENTS.CREATE, payload);
    return unwrapBackendData<AppointmentResponse>(res);
  },

  async cancel(id: number | string, reason?: string): Promise<void> {
    const res = await apiClient.patch(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), { cancellationReason: reason ?? '' });
    if (!res.success) throw new Error(res.error ?? "Failed to cancel appointment");
  },

  async reschedule(id: number | string, data: RescheduleAppointmentRequest): Promise<AppointmentResponse> {
    const payload = {
      newStartTime: `${data.newDate}T${data.newTime}:00`,
      reason: data.reason ?? '',
    };
    const res = await apiClient.patch<any>(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE(id), payload);
    return unwrapBackendData<AppointmentResponse>(res);
  },
};
