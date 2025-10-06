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
  exportTo?: string;
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

// Sales Analytics Interfaces
export interface SalesAnalyticsSummary {
  totalInvoices: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalMoreExpense: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  paidInvoices: number;
  pendingInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  paidProfitAmount: number;
  paidProfitWithoutVAT: number;
  paidProfitWithVAT: number;
  pendingProfitAmount: number;
  pendingProfitWithoutVAT: number;
  pendingProfitWithVAT: number;
  averageInvoiceValue: number;
  averageProfitPerInvoice: number;
  averageProfitPerInvoiceWithoutVAT: number;
  averageProfitPerInvoiceWithVAT: number;
  minInvoiceValue: number;
  maxInvoiceValue: number;
  minProfitPerInvoice: number;
  minProfitPerInvoiceWithoutVAT: number;
  minProfitPerInvoiceWithVAT: number;
  maxProfitPerInvoice: number;
  maxProfitPerInvoiceWithoutVAT: number;
  maxProfitPerInvoiceWithVAT: number;
}

export interface TimeSeriesData {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  date: string;
  totalInvoices: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalMoreExpense: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  paidInvoices: number;
  pendingInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  paidProfitAmount: number;
  paidProfitWithoutVAT: number;
  paidProfitWithVAT: number;
  pendingProfitAmount: number;
  pendingProfitWithoutVAT: number;
  pendingProfitWithVAT: number;
  averageInvoiceValue: number;
  averageProfitPerInvoice: number;
  averageProfitPerInvoiceWithoutVAT: number;
  averageProfitPerInvoiceWithVAT: number;
}

export interface TopCustomer {
  _id: string;
  customerName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface SalesByStatus {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface SalesByCurrency {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface MonthlyTrend {
  _id: {
    year: number;
    month: number;
  };
  count: number;
  totalAmount: number;
}

export interface AdditionalAnalytics {
  topCustomers: TopCustomer[];
  salesByStatus: SalesByStatus[];
  salesByCurrency: SalesByCurrency[];
  monthlyTrend: MonthlyTrend[];
}

export interface AnalyticsFilters {
  dateFrom: string | null;
  dateTo: string | null;
  dateRange: {
    from: string | null;
    to: string | null;
    applied: boolean;
  };
  status: {
    value: string | null;
    applied: boolean;
    options: string[];
  };
  customerId: {
    value: string | null;
    applied: boolean;
    options: string[];
    availableCustomers: AvailableCustomer[];
  };
  createdBy: {
    value: string | null;
    applied: boolean;
    options: string[];
    availableEmployees: any[];
  };
  currency: {
    value: string | null;
    applied: boolean;
    options: string[];
    availableCurrencies: AvailableCurrency[];
  };
  groupBy: {
    value: string;
    applied: boolean;
    options: string[];
  };
  limit: {
    value: number;
    applied: boolean;
    type: string;
  };
  appliedFilters: AppliedFilters;
  query: QueryInfo;
}

export interface CurrencySummary {
  currency: string;
  totalInvoices: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalMoreExpense: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  paidInvoices: number;
  pendingInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  paidProfitAmount: number;
  paidProfitWithoutVAT: number;
  paidProfitWithVAT: number;
  pendingProfitAmount: number;
  pendingProfitWithoutVAT: number;
  pendingProfitWithVAT: number;
  averageInvoiceValue: number;
  averageProfitPerInvoice: number;
  averageProfitPerInvoiceWithoutVAT: number;
  averageProfitPerInvoiceWithVAT: number;
  minInvoiceValue: number;
  maxInvoiceValue: number;
  minProfitPerInvoice: number;
  minProfitPerInvoiceWithoutVAT: number;
  minProfitPerInvoiceWithVAT: number;
  maxProfitPerInvoice: number;
  maxProfitPerInvoiceWithoutVAT: number;
  maxProfitPerInvoiceWithVAT: number;
}

export interface CurrencyTimeSeriesData {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  date: string;
  currency: string;
  totalInvoices: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalMoreExpense: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  paidInvoices: number;
  pendingInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  paidProfitAmount: number;
  paidProfitWithoutVAT: number;
  paidProfitWithVAT: number;
  pendingProfitAmount: number;
  pendingProfitWithoutVAT: number;
  pendingProfitWithVAT: number;
  averageInvoiceValue: number;
  averageProfitPerInvoice: number;
  averageProfitPerInvoiceWithoutVAT: number;
  averageProfitPerInvoiceWithVAT: number;
}

export interface AvailableCustomer {
  customerId: string;
  customerName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface AvailableCurrency {
  currency: string;
  totalInvoices: number;
  totalAmount: number;
  totalProfit: number;
}

export interface CurrencyBreakdown {
  currency: string;
  invoices: number;
  amount: number;
  profit: number;
}

export interface AppliedFilters {
  count: number;
  list: any[];
  currencyBreakdown: CurrencyBreakdown[];
}

export interface QueryInfo {
  totalInvoices: number;
  hasData: boolean;
  timeSeriesPoints: number;
  currencyTimeSeriesPoints: number;
  currenciesFound: number;
  currencyList: string[];
}

export interface SalesAnalyticsData {
  summary: SalesAnalyticsSummary;
  currencySummaries: CurrencySummary[];
  timeSeries: TimeSeriesData[];
  currencyTimeSeries: CurrencyTimeSeriesData[];
  additionalAnalytics: AdditionalAnalytics;
  filters: AnalyticsFilters;
}

export interface SalesAnalyticsResponse {
  success: boolean;
  message: string;
  data: SalesAnalyticsData;
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

// Sales Analytics Filter Parameters
export interface SalesAnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  customerId?: string;
  createdBy?: string;
  currency?: string;
  groupBy?: string;
  limit?: string | number;
}

// Sales Analytics Service Function
export const getSalesAnalytics = async (filters?: SalesAnalyticsFilters): Promise<SalesAnalyticsData> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() 
      ? `${API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES.SALES_ANALYTICS}?${params.toString()}`
      : API_CONFIG.ENDPOINTS.CUSTOMER_INVOICES.SALES_ANALYTICS;
      
    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
};

// Quotation Analytics Interfaces
export interface QuotationAnalyticsSummary {
  totalQuotations: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  averageQuotationValue: number;
  averageProfitPerQuotation: number;
  averageProfitPerQuotationWithoutVAT: number;
  averageProfitPerQuotationWithVAT: number;
  minQuotationValue: number;
  maxQuotationValue: number;
  minProfitPerQuotation: number;
  minProfitPerQuotationWithoutVAT: number;
  minProfitPerQuotationWithVAT: number;
  maxProfitPerQuotation: number;
  maxProfitPerQuotationWithoutVAT: number;
  maxProfitPerQuotationWithVAT: number;
}

export interface QuotationStatusSummary {
  status: string;
  totalQuotations: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  averageQuotationValue: number;
  averageProfitPerQuotation: number;
  averageProfitPerQuotationWithoutVAT: number;
  averageProfitPerQuotationWithVAT: number;
  minQuotationValue: number;
  maxQuotationValue: number;
  minProfitPerQuotation: number;
  minProfitPerQuotationWithoutVAT: number;
  minProfitPerQuotationWithVAT: number;
  maxProfitPerQuotation: number;
  maxProfitPerQuotationWithoutVAT: number;
  maxProfitPerQuotationWithVAT: number;
}

export interface QuotationTimeSeriesData {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  date: string;
  totalQuotations: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  averageQuotationValue: number;
  averageProfitPerQuotation: number;
  averageProfitPerQuotationWithoutVAT: number;
  averageProfitPerQuotationWithVAT: number;
}

export interface QuotationStatusTimeSeriesData {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  date: string;
  status: string;
  totalQuotations: number;
  totalAmount: number;
  totalVatAmount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalAdditionalExpense: number;
  totalCostAmount: number;
  totalSellingAmount: number;
  totalNetRevenue: number;
  totalProfitAmount: number;
  totalProfitWithoutVAT: number;
  totalProfitWithVAT: number;
  averageQuotationValue: number;
  averageProfitPerQuotation: number;
  averageProfitPerQuotationWithoutVAT: number;
  averageProfitPerQuotationWithVAT: number;
}

export interface QuotationTopCustomer {
  _id: string;
  customerName: string;
  totalAmount: number;
  quotationCount: number;
}

export interface QuotationByStatus {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface QuotationByCurrency {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface QuotationMonthlyTrend {
  _id: {
    year: number;
    month: number;
  };
  count: number;
  totalAmount: number;
}

export interface QuotationCustomerStatusBreakdown {
  _id: string;
  customerName: string;
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  totalQuotations: number;
  totalAmount: number;
}

export interface QuotationStatusCount {
  _id: string;
  count: number;
  totalAmount: number;
}

export interface QuotationCustomerSummary {
  _id: string;
  customerName: string;
  totalQuotations: number;
  totalAmount: number;
  confirmedQuotations: number;
  confirmedAmount: number;
  draftQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
}

export interface QuotationCustomerAnalytics {
  customerStatusBreakdown: QuotationCustomerStatusBreakdown[];
  statusCounts: QuotationStatusCount[];
  customerSummary: QuotationCustomerSummary[];
}

export interface QuotationAdditionalAnalytics {
  topCustomers: QuotationTopCustomer[];
  quotationsByStatus: QuotationByStatus[];
  quotationsByCurrency: QuotationByCurrency[];
  monthlyTrend: QuotationMonthlyTrend[];
}

export interface QuotationFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  customerId?: string;
  createdBy?: string;
  currency?: string;
  groupBy?: string;
  limit?: string | number;
}

export interface QuotationAnalyticsData {
  summary: QuotationAnalyticsSummary;
  statusSummaries: QuotationStatusSummary[];
  timeSeries: QuotationTimeSeriesData[];
  statusTimeSeries: QuotationStatusTimeSeriesData[];
  additionalAnalytics: QuotationAdditionalAnalytics;
  customerAnalytics: QuotationCustomerAnalytics;
  filters: {
    dateFrom: string | null;
    dateTo: string | null;
    dateRange: {
      from: string | null;
      to: string | null;
      applied: boolean;
    };
    status: {
      value: string | null;
      applied: boolean;
      options: string[];
    };
    customerId: {
      value: string | null;
      applied: boolean;
      options: string[];
      availableCustomers: Array<{
        customerId: string;
        customerName: string;
        totalAmount: number;
        quotationCount: number;
      }>;
    };
    createdBy: {
      value: string | null;
      applied: boolean;
      options: string[];
      availableEmployees: any[];
    };
    currency: {
      value: string | null;
      applied: boolean;
      options: string[];
      availableCurrencies: Array<{
        currency: string;
        totalQuotations: number;
        totalAmount: number;
        totalProfit: number;
      }>;
    };
    groupBy: {
      value: string;
      applied: boolean;
      options: string[];
    };
    limit: {
      value: number;
      applied: boolean;
      type: string;
    };
    appliedFilters: {
      count: number;
      list: any[];
      statusBreakdown: Array<{
        status: string;
        quotations: number;
        amount: number;
        profit: number;
      }>;
    };
    query: {
      totalQuotations: number;
      hasData: boolean;
      timeSeriesPoints: number;
      statusTimeSeriesPoints: number;
      statusesFound: number;
      statusList: string[];
    };
  };
}

// Quotation Analytics Service Function
export const getQuotationAnalytics = async (filters?: QuotationFilters): Promise<QuotationAnalyticsData> => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() 
      ? `${API_CONFIG.ENDPOINTS.QUOTATIONS.ANALYTICS}?${params.toString()}`
      : API_CONFIG.ENDPOINTS.QUOTATIONS.ANALYTICS;
      
    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching quotation analytics:', error);
    throw error;
  }
};
