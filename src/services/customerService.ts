import { API_CONFIG, buildApiUrl } from '../config/api';
import { ERROR_MESSAGES } from '../constants';

// Types
export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
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

// Customer Service
export const customerService = {
  async createCustomer(customerData: CreateCustomerData): Promise<CustomerResponse> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error(ERROR_MESSAGES.INVENTORY.NO_TOKEN);
    }

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS.CUSTOMER);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        'Accept': API_CONFIG.HEADERS.ACCEPT,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};
