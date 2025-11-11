import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

// API Error Class for better error handling
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// HTTP Client with proper error handling and timeouts
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      'Accept': API_CONFIG.HEADERS.ACCEPT,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl).toString();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.TIMEOUTS.REQUEST
    );

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new ApiError(
          errorData.message || this.getErrorMessage(response.status),
          response.status,
          response.statusText,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(
          ERROR_MESSAGES.GENERAL.REQUEST_TIMEOUT,
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'Request Timeout'
        );
      }

      throw new ApiError(
        ERROR_MESSAGES.GENERAL.NETWORK_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Network Error',
        error
      );
    }
  }

  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { message: this.getErrorMessage(response.status) };
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.HTTP.BAD_REQUEST;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.HTTP.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.HTTP.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.HTTP.INTERNAL_SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest<T>(url.pathname + url.search, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Set authorization header
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization header
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create HTTP client instance
export const httpClient = new HttpClient(process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000');

// Utility function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Utility function to check if token exists
export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};

// Utility function to validate API response
export const validateApiResponse = <T>(response: any): response is T => {
  return response && typeof response === 'object' && 'success' in response;
};
