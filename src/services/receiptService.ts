import apiClient from './apiClient';
import { API_CONFIG } from '../config/api';

export interface Receipt {
  _id: string;
  id: string;
  quotationId?: {
    _id: string;
    quotationNumber: string;
    status: string;
    totalAmount: number;
    bookingAmount: number;
    remainingAmount: number;
    id: string;
  };
  customer: {
    userId?: {
      _id: string;
      name: string;
      email: string;
      id: string;
    } | null;
    custId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    countryCode: string;
    trn?: string | null;
  };
  paymentMethod: string;
  receiptDate: string;
  amount: number;
  currency: string;
  description: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    id: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  receiptNumber: string;
  totalAmount: number;
  company?: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website: string;
    bankDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      iban: string;
      swiftCode: string;
      branch: string;
      address: string;
      _id: string;
    };
    termCondition: {
      export: {
        price: string;
        delivery: string;
        payment: string;
        validity: string;
      };
    };
  };
}

export interface ReceiptsResponse {
  success: boolean;
  message: string;
  data: Receipt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    totalReceipts: number;
    totalAmount: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  };
  filters: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface ReceiptsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  paymentMethod?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateReceiptData {
  customerId: string;
  quotationId: string;
  paymentMethod: string;
  receiptDate: string;
  amount: number;
  currency: string;
  description: string;
}

class ReceiptService {
  async getReceipts(params: ReceiptsParams = {}): Promise<ReceiptsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await apiClient.get<ReceiptsResponse>(
        `${API_CONFIG.ENDPOINTS.RECEIPTS.GET}?${queryParams.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch receipts');
    }
  }

  async getReceiptById(id: string): Promise<Receipt> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: Receipt }>(
        `${API_CONFIG.ENDPOINTS.RECEIPTS.GET_BY_ID}/${id}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching receipt:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch receipt');
    }
  }

  async createReceipt(data: CreateReceiptData): Promise<{ success: boolean; message: string; data: Receipt }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: Receipt }>(
        API_CONFIG.ENDPOINTS.RECEIPTS.CREATE,
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      throw new Error(error.response?.data?.message || 'Failed to create receipt');
    }
  }
}

export const receiptService = new ReceiptService();
