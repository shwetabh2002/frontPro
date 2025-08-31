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
      PROFILE: '/users/profile',
    },
    
    // Inventory
    INVENTORY: {
      REQUIREMENTS_CARS: '/inventory/requirements-cars',
      ITEMS: '/inventory/items',
      CATEGORIES: '/inventory/categories',
    },
    
    // Sales
    SALES: {
      ORDERS: '/sales/orders',
      INVOICES: '/sales/invoices',
      QUOTATIONS: '/sales/quotations',
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

// Global function to get API base URL based on NODE_ENV
export const getApiBaseUrl = (): string => {
  // Use custom environment variable for environment detection
  const environment = "production";
  
  if (environment === 'production') {
    return process.env.REACT_APP_API_BASE_URL_PRODUCTION || 'http://localhost:3000';
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
