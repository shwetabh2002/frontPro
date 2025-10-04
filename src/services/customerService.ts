import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES } from '../constants';
import { apiClientService } from '../services/apiClient';

// Types
export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  countryCode: string;
  trn?: string;
}

export interface Customer {
  _id: string;
  custId: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  type: string;
  status: string;
  address: string;
  trn?: string;
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

export interface Quotation {
  _id: string;
  quotationId: string;
  quotationNumber: string;
  validTill: string;
  status: string;
  currency: string;
  bookingAmount?: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface QuotationsData {
  data: Quotation[];
  statistics: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export interface CustomerDetails {
  customer: Customer;
  quotations: QuotationsData;
}

export interface CustomerDetailsResponse {
  success: boolean;
  message: string;
  data: CustomerDetails;
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
    try {
      const response = await apiClientService.post<CustomerResponse>(
        API_CONFIG.ENDPOINTS.USERS.CUSTOMER,
        customerData
      );

      return response;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to create customer');
    }
  },

  /**
   * Get customers with pagination and search
   * @param params - Query parameters for pagination and search
   * @returns Promise<GetCustomersResponse>
   * @throws ApiError
   */
  async getCustomers(params: GetCustomersParams = {}): Promise<GetCustomersResponse> {
    try {
      // Build query parameters
      const queryParams: Record<string, string | number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;

      const response = await apiClientService.get<GetCustomersResponse>(
        API_CONFIG.ENDPOINTS.USERS.GET_CUSTOMERS,
        { params: queryParams }
      );

      return response;
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
  },

  /**
   * Get customer by ID
   * @param customerId - Customer ID
   * @returns Promise<Customer>
   * @throws ApiError
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    try {
      const response = await apiClientService.get<{ success: boolean; data: Customer }>(
        `${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`
      );

      if (!response.success || !response.data) {
        throw new Error('Customer not found');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch customer');
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
    try {
      const response = await apiClientService.put<CustomerResponse>(
        `${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`,
        customerData
      );

      return response;
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  },

  /**
   * Get customer details with quotations
   * @param customerId - Customer ID
   * @returns Promise<CustomerDetailsResponse>
   * @throws ApiError
   */
  async getCustomerDetails(customerId: string): Promise<CustomerDetailsResponse> {
    try {
      const response = await apiClientService.get<CustomerDetailsResponse>(
        `${API_CONFIG.ENDPOINTS.USERS.GET_CUSTOMER_DETAILS}/${customerId}`
      );

      return response;
    } catch (error: any) {
      console.error('Error fetching customer details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch customer details');
    }
  },

  /**
   * Delete customer
   * @param customerId - Customer ID
   * @returns Promise<DeleteCustomerResponse>
   * @throws ApiError
   */
  async deleteCustomer(customerId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      customerId?: string;
      customerName?: string;
      deletedAt?: string;
      activeQuotations?: Array<{
        quotationId: string;
        quotationNumber: string;
        status: string;
      }>;
    };
    activeQuotations?: Array<{
      quotationId: string;
      quotationNumber: string;
      status: string;
    }>;
  }> {
    try {
      const response = await apiClientService.delete(`${API_CONFIG.ENDPOINTS.USERS.CUSTOMER}/${customerId}`);
      console.log('Raw API response:', response); // Debug log
      
      // Ensure we have a valid response structure
      if (response && response.data) {
        return response.data;
      } else {
        // If response structure is unexpected, create a success response
        return {
          success: true,
          message: 'Customer deleted successfully',
          data: {
            customerId: customerId,
            customerName: 'Unknown',
            deletedAt: new Date().toISOString()
          }
        };
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      
      // Handle 400 status code with business logic error (active quotations)
      if (error.response?.status === 400 && error.response?.data?.success === false) {
        return error.response.data;
      }
      
      // If it's a business logic error (has active quotations), return the error response
      if (error.response?.data?.success === false) {
        return error.response.data;
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  },
};
