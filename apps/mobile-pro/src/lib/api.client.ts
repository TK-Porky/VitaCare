/**
 * Client API — VitaCare Pro
 * Gestion des requêtes HTTP avec refresh token automatique et intercepteur 401.
 */

import { API_CONFIG, API_ENDPOINTS } from '../types/api-endpoints';
import { ApiResponse } from '../types/api-responses';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY  = 'vitacare_pro_access_token';
const REFRESH_TOKEN_KEY = 'vitacare_pro_refresh_token';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private onLogout?: () => void;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    };
  }

  setLogoutHandler(fn: () => void) {
    this.onLogout = fn;
  }

  private async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  // ================================================================================== //
  // Core Request
  // ================================================================================== //

  private async request<T = any>(
    endpoint: string,
    options:  RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url   = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers,
      ...(typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? { signal: (AbortSignal as any).timeout(API_CONFIG.TIMEOUT) }
        : {}),
    };

    try {
      console.log(`[PRO API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);

      // Handle 401 — refresh flow
      if (response.status === 401) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.handleTokenRefresh();
            this.isRefreshing = false;
            this.onTokenRefreshed(newToken);
          } catch {
            this.isRefreshing = false;
            this.onLogout?.();
            throw new Error('Session expirée');
          }
        }
        return new Promise((resolve) => {
          this.addRefreshSubscriber((newToken) => {
            const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
            resolve(this.request<T>(endpoint, { ...options, headers: retryHeaders }));
          });
        });
      }

      const data = await response.json();

      return {
        success:    response.ok,
        data:       response.ok ? data : undefined,
        message:    data.message,
        error:      !response.ok ? data.error || data.message : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[PRO API] Request error:', error);
      if (error instanceof Error) {
        return {
          success:    false,
          error:      error.name === 'AbortError' ? 'La requête a expiré' : error.message,
          statusCode: error.name === 'AbortError' ? 408 : 0,
        };
      }
      return { success: false, error: 'Une erreur inattendue est survenue', statusCode: 500 };
    }
  }

  // ================================================================================== //
  // Token Refresh
  // ================================================================================== //

  private async handleTokenRefresh(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (response.ok && data.accessToken) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      return data.accessToken;
    }
    throw new Error('Token refresh failed');
  }

  // ================================================================================== //
  // HTTP Methods
  // ================================================================================== //

  async get<T = any>(
    endpoint: string,
    params?:  Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) sp.append(k, String(v));
      });
      const qs = sp.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body:   data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body:   data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body:   data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body:   data ? JSON.stringify(data) : undefined,
    });
  }

  async upload<T = any>(
    endpoint:    string,
    fileUri:     string,
    fileName:    string,
    fileType:    string,
    fieldName:   string = 'file',
    extraData?:  Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    // @ts-ignore
    formData.append(fieldName, { uri: fileUri, name: fileName, type: fileType });
    if (extraData) {
      Object.entries(extraData).forEach(([k, v]) => formData.append(k, String(v)));
    }

    const token = await this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body:   formData,
      });
      const data = await response.json();
      return {
        success:    response.ok,
        data:       response.ok ? data : undefined,
        message:    data.message,
        error:      !response.ok ? data.error || data.message : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error:   error instanceof Error ? error.message : 'Upload failed',
        statusCode: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// Helpers for token management (used by auth.store)
export const TOKEN_KEYS = {
  ACCESS:  'vitacare_pro_access_token',
  REFRESH: 'vitacare_pro_refresh_token',
} as const;
