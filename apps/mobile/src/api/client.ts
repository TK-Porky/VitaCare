/**
 * Client API pour la communication avec le backend VitaCare
 */

import { useAuthStore } from '../store/useAuthStore';
import { API_CONFIG, API_ENDPOINTS } from '../types/api-endpoints';
import { ApiResponse } from '../types/api-responses';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // ---------------------------------------------------------------------------
  // Méthodes HTTP principales
  // ---------------------------------------------------------------------------

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Récupérer les tokens du store Zustand
    const { token, logout } = useAuthStore.getState();
    
    // Préparer les headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      // Signal timeout si supporté par l'environnement
      ...(typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal 
        ? { signal: (AbortSignal as any).timeout(API_CONFIG.TIMEOUT) } 
        : {}),
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Gérer les erreurs d'authentification (401)
      if (response.status === 401) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.handleTokenRefresh();
            this.isRefreshing = false;
            this.onTokenRefreshed(newToken);
          } catch (error) {
            this.isRefreshing = false;
            logout(); // Déconnexion si le refresh échoue
            throw error;
          }
        }

        // Attendre que le token soit rafraîchi
        return new Promise((resolve) => {
          this.addRefreshSubscriber((newToken) => {
            const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
            resolve(this.request<T>(endpoint, { ...options, headers: retryHeaders }));
          });
        });
      }

      const data = await response.json();

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

  // ---------------------------------------------------------------------------
  // Refresh token
  // ---------------------------------------------------------------------------

  private async handleTokenRefresh(): Promise<string> {
    const { refreshToken, setAuth, user } = useAuthStore.getState();
    
    if (!refreshToken || !user) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setAuth(user, data.token, data.refreshToken || refreshToken);
        return data.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
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
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ---------------------------------------------------------------------------
  // Upload de fichiers
  // ---------------------------------------------------------------------------

  async upload<T = any>(
    endpoint: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // Format spécifique pour React Native fetch upload
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

    const { token } = useAuthStore.getState();
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

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message,
        error: !response.ok ? data.error || data.message : undefined,
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
