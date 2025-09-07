import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, API_RESPONSE_STATUS } from '../constants';
import { httpClient, getAuthToken, hasAuthToken, validateApiResponse, ApiError } from '../utils/apiUtils';

// Types
export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Customer {
  _id: string;
  custId: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
}

export interface GetCustomersResponse {
  success: boolean;
  message: string;
  data: {
    customers: Customer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Customer Service
export const customerService = {
  /**
   * Create a new customer
   * @param customerData - Customer data to create
   * @returns Promise<CustomerResponse>
   * @throws ApiError
   */
  async createCustomer(customerData: CreateCustomerData): Promise<CustomerResponse> {
    // Validate authentication
    if (!hasAuthToken()) {
      throw new ApiError(
        ERROR_MESSAGES.AUTH.NO_TOKEN,
        401,
        'Unauthorized'
      );
    }

    // Set auth token for this request
    const token = getAuthToken();
    if (token) {
      httpClient.setAuthToken(token);
    }

    try {
      const response = await httpClient.post<CustomerResponse>(
        API_CONFIG.ENDPOINTS.USERS.CUSTOMER,
        customerData
      );

      // Validate response structure
      if (!validateApiResponse<CustomerResponse>(response)) {
        throw new ApiError(
          ERROR_MESSAGES.CUSTOMER.CREATE_FAILED,
          500,
          'Invalid response format'
        );
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ERROR_MESSAGES.CUSTOMER.CREATE_FAILED,
        500,
        'Unknown error',
        error
      );
    }
  },

  /**
   * Get customers with pagination and search
   * @param params - Query parameters for pagination and search
   * @returns Promise<GetCustomersResponse>
   * @throws ApiError
   */
  async getCustomers(params: GetCustomersParams = {}): Promise<GetCustomersResponse> {
    // Validate authentication
    if (!hasAuthToken()) {
      throw new ApiError(
        ERROR_MESSAGES.AUTH.NO_TOKEN,
        401,
        'Unauthorized'
      );
    }

    // Set auth token for this request
    const token = getAuthToken();
    if (token) {
      httpClient.setAuthToken(token);
    }

    try {
      // Build query parameters
      const queryParams: Record<string, string | number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;

      const response = await httpClient.get<GetCustomersResponse>(
        API_CONFIG.ENDPOINTS.USERS.GET_CUSTOMERS,
        queryParams
      );

      // Validate response structure
      if (!validateApiResponse<GetCustomersResponse>(response)) {
        throw new ApiError(
          ERROR_MESSAGES.INVENTORY.FETCH_FAILED,
          500,
          'Invalid response format'
        );
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ERROR_MESSAGES.INVENTORY.FETCH_FAILED,
        500,
        'Unknown error',
        error
      );
    }
  },

  /**
   * Get customer by ID
   * @param customerId - Customer ID
   * @returns Promise<Customer>
   * @throws ApiError
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    // Validate authentication
    if (!hasAuthToken()) {
      throw new ApiError(
        ERROR_MESSAGES.AUTH.NO_TOKEN,
        401,
        'Unauthorized'
      );
    }

    // Set auth token for this request
    const token = getAuthToken();
    if (token) {
      httpClient.setAuthToken(token);
    }

    try {
      const response = await httpClient.get<{ success: boolean; data: Customer }>(
        `${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`
      );

      if (!response.success || !response.data) {
        throw new ApiError(
          ERROR_MESSAGES.HTTP.NOT_FOUND,
          404,
          'Customer not found'
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ERROR_MESSAGES.INVENTORY.FETCH_FAILED,
        500,
        'Unknown error',
        error
      );
    }
  },

  /**
   * Update customer
   * @param customerId - Customer ID
   * @param customerData - Updated customer data
   * @returns Promise<CustomerResponse>
   * @throws ApiError
   */
  async updateCustomer(customerId: string, customerData: Partial<CreateCustomerData>): Promise<CustomerResponse> {
    // Validate authentication
    if (!hasAuthToken()) {
      throw new ApiError(
        ERROR_MESSAGES.AUTH.NO_TOKEN,
        401,
        'Unauthorized'
      );
    }

    // Set auth token for this request
    const token = getAuthToken();
    if (token) {
      httpClient.setAuthToken(token);
    }

    try {
      const response = await httpClient.put<CustomerResponse>(
        `${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`,
        customerData
      );

      // Validate response structure
      if (!validateApiResponse<CustomerResponse>(response)) {
        throw new ApiError(
          ERROR_MESSAGES.CUSTOMER.CREATE_FAILED,
          500,
          'Invalid response format'
        );
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ERROR_MESSAGES.CUSTOMER.CREATE_FAILED,
        500,
        'Unknown error',
        error
      );
    }
  },

  /**
   * Delete customer
   * @param customerId - Customer ID
   * @returns Promise<void>
   * @throws ApiError
   */
  async deleteCustomer(customerId: string): Promise<void> {
    // Validate authentication
    if (!hasAuthToken()) {
      throw new ApiError(
        ERROR_MESSAGES.AUTH.NO_TOKEN,
        401,
        'Unauthorized'
      );
    }

    // Set auth token for this request
    const token = getAuthToken();
    if (token) {
      httpClient.setAuthToken(token);
    }

    try {
      await httpClient.delete(`${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
        500,
        'Unknown error',
        error
      );
    }
  },
};
