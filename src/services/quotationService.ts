import { API_CONFIG } from '../config/api';
import { httpClient, getAuthToken, hasAuthToken, ApiError } from '../utils/apiUtils';

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

// Service functions
export const createQuotation = async (quotationData: CreateQuotationData): Promise<QuotationResponse> => {
  try {
    // Check if user is authenticated
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    // Get auth token and set it in the request
    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    // Set the auth token for this request
    httpClient.setAuthToken(token);

    console.log('📋 Creating quotation with data:', quotationData);

    const response = await httpClient.post<QuotationResponse>(
      API_CONFIG.ENDPOINTS.QUOTATIONS.CREATE,
      quotationData
    );

    console.log('✅ Quotation created successfully:', response);

    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    // Add pagination parameters to the API call
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.QUOTATIONS.GET_ALL}?${params}`);
    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.QUOTATIONS.GET_BY_ID}/${quotationId}`);
    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.put(`${API_CONFIG.ENDPOINTS.QUOTATIONS.UPDATE}/${quotationId}`, quotationData);
    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.delete(`${API_CONFIG.ENDPOINTS.QUOTATIONS.DELETE}/${quotationId}`);
    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.patch<QuotationResponse>(`/quotations/${quotationId}/accept`);
    
    if (!response.success) {
      // Handle specific case when quotation is already accepted
      if (response.message === 'Quotation is already accepted') {
        throw new ApiError(
          'This quotation has already been accepted by the customer',
          400,
          'Already Accepted',
          response
        );
      }
      
      throw new ApiError(
        response.message || 'Failed to accept quotation',
        400,
        'Bad Request',
        response
      );
    }

    return response;
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
    if (!hasAuthToken()) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.patch<QuotationResponse>(`/quotations/${quotationId}/reject`);
    
    if (!response.success) {
      // Handle specific case when quotation is already rejected
      if (response.message === 'Quotation is already rejected') {
        throw new ApiError(
          'This quotation has already been rejected by the customer',
          400,
          'Already Rejected',
          response
        );
      }
      
      throw new ApiError(
        response.message || 'Failed to reject quotation',
        400,
        'Bad Request',
        response
      );
    }

    return response;
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
