/**
 * Client API Handler
 * 
 * This class handles all API requests with automatic token management and retry logic.
 */

import { API_CONFIG, API_ENDPOINTS } from '../types/api-endpoints';
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
    // DISCONNECTED FOR BRANDING/REDESIGN
    console.log(`[MOCK-API] ${options.method || 'GET'} ${endpoint}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {} as T,
          message: "Mock data for branding branch",
          statusCode: 200,
        });
      }, 500);
    });

    /* Original implementation commented out
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    */
  }
  async upload<T = any>(
    endpoint: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    // DISCONNECTED FOR BRANDING/REDESIGN
    console.log(`[MOCK-UPLOAD] ${endpoint}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {} as T,
          message: "Mock upload success for branding branch",
          statusCode: 200,
        });
      }, 1000);
    });

    /* Original implementation commented out
    const formData = new FormData();
...
    */
  }

}

export const apiClient = new ApiClient();
export default apiClient;
