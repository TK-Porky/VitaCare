/**
 * Client API pour la communication avec le backend VitaCare
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, buildUrl, HTTP_METHODS } from '../types/api-endpoints';
import { ApiResponse, ApiErrorResponse } from '../types/api-responses';

// ---------------------------------------------------------------------------
// Configuration et constantes
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@vitacare_access_token',
  REFRESH_TOKEN: '@vitacare_refresh_token',
  USER_DATA: '@vitacare_user_data',
} as const;

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // ---------------------------------------------------------------------------
  // Gestion des tokens
  // ---------------------------------------------------------------------------

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // ---------------------------------------------------------------------------
  // Méthodes HTTP principales
  // ---------------------------------------------------------------------------

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Récupérer le token d'accès
    const token = await this.getAccessToken();
    
    // Préparer les headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Préparer la configuration de la requête
    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      // Gérer les erreurs d'authentification
      if (response.status === 401) {
        await this.handleTokenRefresh();
        // Réessayer la requête avec le nouveau token
        return this.request<T>(endpoint, options);
      }

      // Retourner la réponse formatée
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message,
        error: !response.ok ? data.error || data.message : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[API] Request error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'La requête a expiré',
            statusCode: 408,
          };
        }
        
        return {
          success: false,
          error: error.message,
          statusCode: 0,
        };
      }

      return {
        success: false,
        error: 'Une erreur inattendue est survenue',
        statusCode: 500,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Refresh token
  // ---------------------------------------------------------------------------

  private async handleTokenRefresh(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      await this.clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await this.setAccessToken(data.token);
        await this.setRefreshToken(data.refreshToken);
      } else {
        await this.clearTokens();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Méthodes HTTP publiques
  // ---------------------------------------------------------------------------

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
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: Omit<RequestInit, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T = any>(
    endpoint: string,
    options: Omit<RequestInit, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  // ---------------------------------------------------------------------------
  // Upload de fichiers
  // ---------------------------------------------------------------------------

  async upload<T = any>(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT * 2), // Timeout plus long pour les uploads
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message,
        error: !response.ok ? data.error || data.message : undefined,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('[API] Upload error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        statusCode: 0,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Méthodes utilitaires
  // ---------------------------------------------------------------------------

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  async isAuthorized(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

// ---------------------------------------------------------------------------
// Instance singleton
// ---------------------------------------------------------------------------

export const apiClient = new ApiClient();

// ---------------------------------------------------------------------------
// Hooks et utilitaires React
// ---------------------------------------------------------------------------

export const useApiClient = () => {
  return {
    client: apiClient,
    isAuthenticated: apiClient.isAuthorized(),
    healthCheck: apiClient.healthCheck(),
  };
};

export default apiClient;
