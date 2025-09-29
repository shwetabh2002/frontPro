import { API_CONFIG } from '../config/api';
import apiClient from './apiClient';
import { ApiError } from '../utils/apiUtils';

// Types
export interface QuotationItem {
  itemId: string;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  sku: string;
  description: string;
  specifications?: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    [key: string]: any;
  };
  sellingPrice: number;
  condition: string;
  status: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  tags?: string[];
  quantity: number;
  vinNumbers?: Array<{
    status: string;
    chasisNumber: string;
  }>;
  interiorColor?: string;
}

export interface CreateQuotationData {
  custId: string;
  items: QuotationItem[];
  additionalExpenses?: {
    expenceType: 'shipping' | 'accessories' | 'Rta Fees' | 'COO Fees' | 'Customs' | 'Insurance' | 'Other' | 'none';
    description: string;
    amount: number;
  };
  discount: number;
  discountType: 'fixed' | 'percentage';
  VAT: number;
  currency: string;
  notes?: string;
}

export interface QuotationResponse {
  success: boolean;
  message: string;
  data: {
    quotationId: string;
    quotationNumber: string;
    customer: {
      userId: {
        _id: string;
        name: string;
        email: string;
        id: string;
      };
      custId: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    validTill: string;
    status: string;
    statusHistory: Array<{
      status: string;
      date: string;
      _id: string;
      id: string;
    }>;
    items: Array<QuotationItem & {
      totalPrice: number;
      _id: string;
    }>;
    subtotal: number;
    totalDiscount: number;
    discountType: 'amount' | 'percentage';
    vatAmount: number;
    totalAmount: number;
    currency: string;
    termsAndConditions: string;
    notes?: string;
    deliveryAddress: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
      id: string;
    };
    updatedBy: {
      _id: string;
      name: string;
      email: string;
      id: string;
    };
    VAT: number;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    id: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: QuotationResponse['data'][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    appliedFilters: {
      search: string | null;
      status: string | null;
      customerId: string | null;
      createdBy: string | null;
      currency: string | null;
      dateFrom: string | null;
      dateTo: string | null;
      validTillFrom: string | null;
      validTillTo: string | null;
    };
    availableFilters: {
      statuses: string[];
      currencies: string[];
      customers: string[];
      creators: string[];
      dateRanges: {
        created: {
          min: string | null;
          max: string | null;
        };
        validTill: {
          min: string;
          max: string;
        };
      };
      counts: {
        totalQuotations: number;
      };
      sortOptions: Array<{
        value: string;
        label: string;
      }>;
      pageSizes: number[];
    };
    sortBy: string;
    totalResults: number;
    showingResults: string;
  };
}

// Service functions
export const createQuotation = async (quotationData: CreateQuotationData): Promise<QuotationResponse> => {
  try {
    console.log('📋 Creating quotation with data:', quotationData);

    const response = await apiClient.post<QuotationResponse>(
      API_CONFIG.ENDPOINTS.QUOTATIONS.CREATE,
      quotationData
    );

    console.log('✅ Quotation created successfully:', response);

    return response.data;
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to create quotation',
      500,
      'Internal Server Error',
      error
    );
  }
};

export const getQuotations = async (page: number = 1, limit: number = 10): Promise<any> => {
  try {
    // Add pagination parameters to the API call
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.QUOTATIONS.GET_ALL}?${params}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching quotations:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to fetch quotations',
        500,
        'Internal Server Error',
        error
      );
  }
};

export const getQuotationById = async (quotationId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.QUOTATIONS.GET_BY_ID}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch quotation',
      500,
      'Internal Server Error',
      error
    );
  }
};

export const updateQuotation = async (quotationId: string, quotationData: Partial<CreateQuotationData>): Promise<any> => {
  try {
    const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.QUOTATIONS.UPDATE}/${quotationId}`, quotationData);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to update quotation',
        500,
        'Internal Server Error',
        error
      );
  }
};

export const deleteQuotation = async (quotationId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.QUOTATIONS.DELETE}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to delete quotation',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Accept a quotation
 * @param quotationId - The ID of the quotation to accept
 * @returns Promise<QuotationResponse>
 */
export const acceptQuotation = async (quotationId: string): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.patch<QuotationResponse>(`/quotations/${quotationId}/accept`);
    
    if (!response.data.success) {
      // Handle specific case when quotation is already accepted
      if (response.data.message === 'Quotation is already accepted') {
        throw new ApiError(
          'This quotation has already been accepted by the customer',
          400,
          'Already Accepted',
          response.data
        );
      }
      
      throw new ApiError(
        response.data.message || 'Failed to accept quotation',
        400,
        'Bad Request',
        response.data
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error accepting quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to accept quotation',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Reject a quotation
 * @param quotationId - The ID of the quotation to reject
 * @returns Promise<QuotationResponse>
 */
export const rejectQuotation = async (quotationId: string): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.patch<QuotationResponse>(`/quotations/${quotationId}/reject`);
    
    if (!response.data.success) {
      // Handle specific case when quotation is already rejected
      if (response.data.message === 'Quotation is already rejected') {
        throw new ApiError(
          'This quotation has already been rejected by the customer',
          400,
          'Already Rejected',
          response.data
        );
      }
      
      throw new ApiError(
        response.data.message || 'Failed to reject quotation',
        400,
        'Bad Request',
        response.data
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to reject quotation',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Get accepted orders (sales orders)
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Promise<OrdersResponse>
 */
export const getAcceptedOrders = async (page: number = 1, limit: number = 10): Promise<OrdersResponse> => {
  try {
    const response = await apiClient.get<OrdersResponse>(`/quotations/accepted-orders?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching accepted orders:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch accepted orders',
      500,
      'Internal Server Error',
      error
    );
  }
};

export const updateAcceptedOrder = async (orderId: string, updateData: any): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.put<QuotationResponse>(`/quotations/accepted-orders/${orderId}`, updateData);
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to update accepted order',
        400,
        'Bad Request',
        response.data
      );
    }
    return response.data;
  } catch (error) {
    console.error('Error updating accepted order:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to update accepted order',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Send order for review
 * @param orderId - The ID of the order to send for review
 * @returns Promise<QuotationResponse>
 */
export const sendOrderForReview = async (orderId: string): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.patch<QuotationResponse>(`/quotations/${orderId}/send-review`);
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to send order for review',
        400,
        'Bad Request',
        response.data
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error sending order for review:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to send order for review',
      500,
      'Internal Server Error',
      error
    );
  }
};

// Review Orders Response Interface
export interface ReviewOrdersResponse {
  success: boolean;
  message: string;
  data: QuotationResponse['data'][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    appliedFilters: {
      search: string | null;
      status: string | null;
      customerId: string | null;
      createdBy: string | null;
      currency: string | null;
      dateFrom: string | null;
      dateTo: string | null;
      validTillFrom: string | null;
      validTillTo: string | null;
    };
    availableFilters: {
      statuses: string[];
      currencies: string[];
      customers: string[];
      creators: string[];
      dateRanges: {
        created: {
          min: string | null;
          max: string | null;
        };
        validTill: {
          min: string;
          max: string;
        };
      };
      counts: {
        totalQuotations: number;
      };
      sortOptions: Array<{
        value: string;
        label: string;
      }>;
      pageSizes: number[];
    };
    sortBy: string;
    totalResults: number;
    showingResults: string;
  };
}

// Review Orders Filters Interface
export interface ReviewOrdersFilters {
  search?: string;
  status?: string;
  customerId?: string;
  createdBy?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  validTillFrom?: string;
  validTillTo?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Get review orders
 * @param page - Page number
 * @param limit - Items per page
 * @param filters - Optional filters
 * @returns Promise<ReviewOrdersResponse>
 */
export const getReviewOrders = async (
  page: number = 1,
  limit: number = 10,
  filters: ReviewOrdersFilters = {}
): Promise<ReviewOrdersResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    const response = await apiClient.get<ReviewOrdersResponse>(`/quotations/review-orders?${queryParams.toString()}`);
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to fetch review orders',
        400,
        'Bad Request',
        response.data
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching review orders:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch review orders',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Approve order
 * @param orderId - The ID of the order to approve
 * @returns Promise<QuotationResponse>
 */
export const approveOrder = async (orderId: string): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.patch<QuotationResponse>(`/quotations/${orderId}/approve`);
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to approve order',
        400,
        'Bad Request',
        response.data
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error approving order:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to approve order',
      500,
      'Internal Server Error',
      error
    );
  }
};

/**
 * Reject order
 * @param orderId - The ID of the order to reject
 * @returns Promise<QuotationResponse>
 */
export const rejectOrder = async (orderId: string): Promise<QuotationResponse> => {
  try {
    const response = await apiClient.patch<QuotationResponse>(`/quotations/${orderId}/reject`);
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to reject order',
        400,
        'Bad Request',
        response.data
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error rejecting order:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to reject order',
      500,
      'Internal Server Error',
      error
    );
  }
};

// Get approved orders for invoice requests
export const getApprovedOrders = async (
  page: number = 1,
  limit: number = 10,
  filters: ReviewOrdersFilters = {}
): Promise<ReviewOrdersResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined && value !== '')
      )
    });
    
    const response = await apiClient.get<ReviewOrdersResponse>(`/quotations/approved-orders?${params}`);
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.message || 'Failed to fetch approved orders',
        400,
        'Bad Request',
        response.data
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching approved orders:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to fetch approved orders',
      500,
      'Internal Server Error',
      error
    );
  }
};

// Update discount for accepted quotation
export const updateQuotationDiscount = async (quotationId: string, discountData: { discount: number; discountType: string }): Promise<any> => {
  try {
    const response = await apiClient.put(`/quotations/accepted-orders/${quotationId}`, discountData);
    return response.data;
  } catch (error) {
    console.error('Error updating quotation discount:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to update quotation discount',
      500,
      'Internal Server Error',
      error
    );
  }
};

// Customer Invoice interfaces
export interface MoreExpense {
  description: string;
  amount: number;
}

export interface CustomerPayment {
  paymentAmount: number;
  paymentMethod: string;
  paymentNotes: string;
  paymentDate: string;
}

export interface CreateCustomerInvoiceRequest {
  quotationId: string;
  notes: string;
  moreExpense: MoreExpense;
  customerPayment: CustomerPayment;
}

export interface CreateCustomerInvoiceResponse {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Create customer invoice
 * @param invoiceData - Invoice data including quotationId, notes, moreExpense, and customerPayment
 * @returns Promise with invoice creation response
 */
export const createCustomerInvoice = async (invoiceData: CreateCustomerInvoiceRequest): Promise<CreateCustomerInvoiceResponse> => {
  try {
    console.log('Creating customer invoice:', invoiceData);
    
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES.CREATE, invoiceData);
    
    console.log('Customer invoice created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer invoice:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to create customer invoice',
      500,
      'Internal Server Error',
      error
    );
  }
};

