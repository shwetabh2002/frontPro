// API Configuration Constants
export const API_CONFIG = {
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    
    // Users
    USERS: {
      CUSTOMER: '/users/customer',
      GET_CUSTOMERS: '/users/get-customer',
      GET_CUSTOMER_DETAILS: '/users/get-customer',
      PROFILE: '/users/profile',
      SUPPLIER: '/users/supplier',
    },
    
    // Inventory
    INVENTORY: {
      INVENTORY: '/inventory',
      REQUIREMENTS_CARS: '/inventory/requirements-cars',
      ITEMS: '/inventory/items',
      CATEGORIES: '/inventory/categories',
      GET_BY_ID: '/inventory',
    },
    
    // Sales
    SALES: {
      ORDERS: '/sales/orders',
      INVOICES: '/sales/invoices',
      QUOTATIONS: '/sales/quotations',
    },
    
    // Companies
    COMPANIES: {
      GET_COMPANY_DOCUMENTS: '/companies/owner/company/documents',
    },
    
    // Quotations
    QUOTATIONS: {
      CREATE: '/quotations',
      GET_ALL: '/quotations',
      GET_BY_ID: '/quotations',
      UPDATE: '/quotations',
      DELETE: '/quotations',
    },
    
    // Customer Invoices
    CUSTOMER_INVOICES: {
      CREATE: '/customer-invoices',
      GET_ALL: '/customer-invoices',
      GET_BY_ID: '/customer-invoices',
    },
  },
  
  // HTTP Headers
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
  },
  
  // Timeouts
  TIMEOUTS: {
    REQUEST: 30000, // 30 seconds
    REFRESH: 5000,  // 5 seconds
  },
} as const;

// Global function to get API base URL based on environment
export const getApiBaseUrl = (): string => {
  // Use custom environment variable for environment detection
  const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
  
  if (environment === 'production') {
    return process.env.REACT_APP_API_BASE_URL_PRODUCTION || 'https://my-backend-7rrf.onrender.com';
  }
  
  // Development or any other environment
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
};

// API URL Builder Utility
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const baseUrl = getApiBaseUrl();
  const url = new URL(endpoint, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};
