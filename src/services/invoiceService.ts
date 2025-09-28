import apiClient from './apiClient';
import { API_CONFIG } from '../config/api';

// Invoice Types
export interface InvoiceItem {
  _id: string;
  itemId: {
    _id: string;
    description: string;
  };
  supplierId?: {
    _id: string;
    name: string;
    email: string;
    custId: string;
  };
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  sku: string;
  description: string;
  specifications: {
    engine: string;
    transmission: string;
    fuelType: string;
  };
  sellingPrice: number;
  condition: string;
  status: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  tags: string[];
  vinNumbers: Array<{
    status: string;
    chasisNumber: string;
    _id: string;
  }>;
  interiorColor: string;
  quantity: number;
  totalPrice: number;
}

export interface InvoiceCustomer {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  name: string;
  email: string;
  custId: string;
  phone: string;
  address: string;
}

export interface InvoiceAdditionalExpenses {
  description?: string;
  amount: number;
  expenceType?: string;
}

export interface InvoiceMoreExpense {
  description: string;
  amount: number;
}

export interface InvoiceCustomerPayment {
  paymentStatus: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentNotes: string;
}

export interface InvoiceCreatedBy {
  _id: string;
  name: string;
  email: string;
}

export interface Invoice {
  _id: string;
  quotationId: {
    _id: string;
    quotationNumber: string;
  };
  quotationNumber: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: string;
  discountAmount: number;
  additionalExpenses: InvoiceAdditionalExpenses;
  moreExpense: InvoiceMoreExpense;
  totalAmount: number;
  VAT: number;
  vatAmount: number;
  finalTotal: number;
  currency: string;
  status: string;
  customerPayment: InvoiceCustomerPayment;
  paymentTerms: string;
  dueDate: string;
  notes: string;
  createdBy: InvoiceCreatedBy;
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  invoiceId?: string;
  invoiceNumber: string;
  __v: number;
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface InvoiceAppliedFilters {
  search?: string | null;
  status?: string | null;
  customerId?: string | null;
  createdBy?: string | null;
  currency?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  dueDateFrom?: string | null;
  dueDateTo?: string | null;
}

export interface InvoiceAvailableFilters {
  statuses: string[];
  currencies: string[];
  customers: string[];
  creators: string[];
  dateRanges: {
    created: {
      min: string;
      max: string;
    };
    dueDate: {
      min: string;
      max: string;
    };
  };
  counts: {
    totalInvoices: number;
    totalAmount: number;
    averageAmount: number;
  };
  sortOptions: Array<{
    value: string;
    label: string;
  }>;
  pageSizes: number[];
}

export interface InvoiceSummary {
  appliedFilters: InvoiceAppliedFilters;
  availableFilters: InvoiceAvailableFilters;
  sortBy: string;
  totalResults: number;
  showingResults: string;
}

export interface GetInvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  pagination: InvoicePagination;
  summary: InvoiceSummary;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  createdBy?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
}

// Invoice Service Functions
export const getInvoices = async (
  page: number = 1,
  limit: number = 10,
  filters: GetInvoicesParams = {}
): Promise<GetInvoicesResponse> => {
  try {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES.GET_ALL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const getInvoiceById = async (invoiceId: string): Promise<Invoice> => {
  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES.GET_BY_ID}/${invoiceId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    throw error;
  }
};
