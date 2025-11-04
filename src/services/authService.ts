import axios from 'axios';
import { getApiBaseUrl, API_CONFIG } from '../config/api';
import { apiClientService } from './apiClient';

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('permissions');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      type: 'admin' | 'employee';
      status: string;
      roleIds: string[];
      roles: Array<{
        _id: string;
        name: string;
        permissions: string[];
        description: string;
      }>;
    };
    permissions: string[];
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ data: LoginResponse['data'] }> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens and user data in localStorage
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    localStorage.setItem('permissions', JSON.stringify(response.data.data.permissions));
    
    return { data: response.data.data };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      this.clearAuthState();
    }
  },

  async getCurrentUser(): Promise<{ data: LoginResponse['data']['user'] }> {
    const response = await api.get('/auth/me');
    return response;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getPermissions(): string[] {
    const permissions = localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : [];
  },

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Initialize auth state from localStorage
  initializeAuthState(): any {
    const userData = this.getUserData();
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const permissions = this.getPermissions();

    if (userData && accessToken && refreshToken) {
      return {
        user: userData,
        accessToken,
        refreshToken,
        permissions,
        isAuthenticated: true,
      };
    }

    return null;
  },

  // Validate and refresh token if needed
  async validateAndRefreshToken(): Promise<{ isValid: boolean; newAccessToken?: string }> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return { isValid: false };
    }

    // If token is not expired, it's valid
    if (!this.isTokenExpired()) {
      return { isValid: true };
    }

    // Token is expired, try to refresh
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      const { accessToken: newAccessToken } = response.data.data;
      localStorage.setItem('accessToken', newAccessToken);
      
      return { isValid: true, newAccessToken };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state on refresh failure
      this.clearAuthState();
      return { isValid: false };
    }
  },

  // Clear all auth data
  clearAuthState(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('permissions');
  },

  // Background token refresh
  startBackgroundRefresh(): void {
    // Check token every 5 minutes
    setInterval(async () => {
      if (this.isAuthenticated() && this.isTokenExpired()) {
        try {
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            console.log('Token refreshed successfully');
          }
        } catch (error) {
          console.error('Background token refresh failed:', error);
          // Don't redirect here, let the interceptor handle it
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiClientService.put<{ success: boolean; message: string; data: any }>(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
        }
      );
      return response;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },
};
