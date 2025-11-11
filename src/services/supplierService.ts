import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { apiClientService } from './apiClient';

// Types
export interface Supplier {
  _id: string;
  name: string;
  countryCode: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  custId: string;
  __v: number;
  id: string;
}

export interface SupplierPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SupplierResponse {
  success: boolean;
  message: string;
  data: {
    suppliers: Supplier[];
    pagination: SupplierPagination;
  };
}

export interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  address: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  _id: string;
}

// API Functions
export const getSuppliers = async (): Promise<SupplierResponse> => {
  try {
    const response = await apiClientService.get(API_CONFIG.ENDPOINTS.USERS.SUPPLIER);
    
    // Handle different response structures
    if (response.data && response.data.suppliers && response.data.pagination) {
      // Response is already in the correct format
      return {
        success: true,
        message: SUCCESS_MESSAGES.SUPPLIER.FETCHED,
        data: response.data
      };
    } else if (response.data && Array.isArray(response.data)) {
      // Response is just an array of suppliers, wrap it
      return {
        success: true,
        message: SUCCESS_MESSAGES.SUPPLIER.FETCHED,
        data: {
          suppliers: response.data,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      };
    } else {
      // Handle direct response format (suppliers + pagination at root level)
      const directResponse = response.data as any;
      if (directResponse && directResponse.suppliers && directResponse.pagination) {
        return {
          success: true,
          message: SUCCESS_MESSAGES.SUPPLIER.FETCHED,
          data: {
            suppliers: directResponse.suppliers,
            pagination: directResponse.pagination
          }
        };
      }
      
      // Fallback for unexpected structure
      throw new Error(ERROR_MESSAGES.SUPPLIER.FETCH_FAILED);
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error(ERROR_MESSAGES.SUPPLIER.FETCH_FAILED);
  }
};

export const createSupplier = async (supplierData: CreateSupplierData): Promise<Supplier> => {
  try {
    const response = await apiClientService.post(API_CONFIG.ENDPOINTS.USERS.SUPPLIER, supplierData);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw new Error(ERROR_MESSAGES.SUPPLIER.CREATE_FAILED);
  }
};

export const updateSupplier = async (supplierData: UpdateSupplierData): Promise<Supplier> => {
  try {
    const { _id, ...updateData } = supplierData;
    const response = await apiClientService.put(`${API_CONFIG.ENDPOINTS.USERS.SUPPLIER}/${_id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw new Error(ERROR_MESSAGES.SUPPLIER.UPDATE_FAILED);
  }
};

export const deleteSupplier = async (supplierId: string): Promise<void> => {
  try {
    await apiClientService.delete(`${API_CONFIG.ENDPOINTS.USERS.SUPPLIER}/${supplierId}`);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw new Error(ERROR_MESSAGES.SUPPLIER.DELETE_FAILED);
  }
};

export const getSupplierById = async (supplierId: string): Promise<Supplier> => {
  try {
    const response = await apiClientService.get(`${API_CONFIG.ENDPOINTS.USERS.SUPPLIER}/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw new Error(ERROR_MESSAGES.SUPPLIER.FETCH_FAILED);
  }
};
