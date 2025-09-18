import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, API_RESPONSE_STATUS } from '../constants';
import { httpClient, getAuthToken, hasAuthToken, validateApiResponse, ApiError } from '../utils/apiUtils';

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

export const getQuotations = async (): Promise<any> => {
  try {
    if (!hasAuthToken()) {
      throw new ApiError('Authentication required', 401, 'Unauthorized', undefined);
    }

    const token = getAuthToken();
    if (!token) {
      throw new ApiError('Authentication token not found', 401, 'Unauthorized', undefined);
    }

    httpClient.setAuthToken(token);

    const response = await httpClient.get(API_CONFIG.ENDPOINTS.QUOTATIONS.GET_ALL);
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
