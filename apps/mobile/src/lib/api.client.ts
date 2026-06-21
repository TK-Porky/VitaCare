/**
 * Client API Handler
 * 
 * This class handles all API requests with automatic token management and retry logic.
 */

import { API_CONFIG } from '../types/api-endpoints';
import { ApiResponse } from '../types/api-responses';
import * as SecureStore from 'expo-secure-store';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private onLogout?: () => void;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set the logout handler
   * @param fn The function to call when the user is logged out
   */
  setLogoutHandler(fn: () => void) {
    this.onLogout = fn;
  }

  /**
   * Get the access token from secure storage
   * @returns The access token or null if not found
   */
  private async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync('vitacare_access_token');
  }

  /**
   * Notify all subscribers that the token has been refreshed
   * @param token The new access token
   */
  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Add a subscriber to be notified when the token is refreshed
   * @param callback The function to call when the token is refreshed
   */
  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // ================================================================================== //
  // Request
  // ================================================================================== //

  /**
   * Make a request to the API
   * @param endpoint The endpoint to request
   * @param options The request options
   * @returns The response from the API
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Get the auth state
    const token = await this.getToken();
    
    // Set the headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers,
      // Request timeout
      ...(typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal 
        ? { signal: (AbortSignal as any).timeout(API_CONFIG.TIMEOUT) } 
        : {}),
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle authentication errors (401 or 403)
      if (response.status === 401 || response.status === 403) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.handleTokenRefresh();
            // Retry the current request with the new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...options, headers });
            this.isRefreshing = false;
            // Notify other waiting subscribers
            this.onTokenRefreshed(newToken);
            // Process the retry response
            const retryText = await retryResponse.text();
            let retryData: any = {};
            try {
              retryData = retryText ? JSON.parse(retryText) : {};
            } catch (err) {
              console.warn('[API] Retry response is not valid JSON:', retryText);
            }
            const retryBody = retryResponse.ok ? retryData : undefined;
            return {
              success: retryResponse.ok,
              data: retryBody?.data ?? retryBody,
              message: retryBody?.message,
              error: !retryResponse.ok ? retryData.error || retryData.message || `HTTP Error ${retryResponse.status}` : undefined,
              statusCode: retryResponse.status,
            };
          } catch (error) {
            this.isRefreshing = false;
            this.onLogout?.(); // Logout if refresh fails
            throw new Error('Session expirée');
          }
        }

        // Another request is already refreshing; queue this one
        return new Promise((resolve) => {
          this.addRefreshSubscriber((newToken) => {
            const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
            resolve(this.request<T>(endpoint, { ...options, headers: retryHeaders }));
          });
        });
      }

      const text = await response.text();
      let data: any = {};
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.warn('[API] Response is not valid JSON:', text);
      }

      const body = response.ok ? data : undefined;
      return {
        success: response.ok,
        data: body?.data ?? body,
        message: body?.message,
        error: !response.ok ? data.error || data.message || `HTTP Error ${response.status}` : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[API] Request error:', error);
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.name === 'AbortError' ? 'La requête a expiré' : error.message,
          statusCode: error.name === 'AbortError' ? 408 : 0,
        };
      }

      return {
        success: false,
        error: 'Une erreur inattendue est survenue',
        statusCode: 500,
      };
    }
  }

  // ================================================================================== //
  // Refresh Token
  // ================================================================================== //

  private async handleTokenRefresh(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync('vitacare_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.warn('[API] Refresh response is not valid JSON:', text);
    }
    // Backend wraps in ApiResponse: { success, data: { accessToken, expiresIn } }
    const accessToken = data.data?.accessToken || data.accessToken;
    if (response.ok && accessToken) {
      await SecureStore.setItemAsync('vitacare_access_token', accessToken);
      return accessToken;
    }
    throw new Error('Token refresh failed');
  }

  // ================================================================================== //
  // HTTP Methods
  // ================================================================================== //

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns ApiResponse
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns ApiResponse
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns ApiResponse
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns ApiResponse
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param data - Optional request body
   * @returns ApiResponse
   */
  async delete<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ================================================================================== //
  // Upload
  // ================================================================================== //

  async upload<T = any>(
    endpoint: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // Specific format for React Native fetch upload
    // @ts-ignore
    formData.append(fieldName, {
      uri: fileUri,
      name: fileName,
      type: fileType,
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const text = await response.text();
      let data: any = {};
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.warn('[API] Upload response is not valid JSON:', text);
      }

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message,
        error: !response.ok ? data.error || data.message || `Upload HTTP Error ${response.status}` : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        statusCode: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
