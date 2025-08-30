// API Configuration Constants
export const API_CONFIG = {
  // Base URLs - Environment-based configuration
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  
  // Environment-specific configurations
  ENVIRONMENT: {
    DEVELOPMENT: {
      BASE_URL: process.env.REACT_APP_API_BASE_URL,
      DESCRIPTION: 'Local development server'
    },
    PRODUCTION: {
      BASE_URL: process.env.REACT_APP_API_BASE_URL_PRODUCTION,
      DESCRIPTION: 'Production backend server'
    }
  },
  
  // Debug API_CONFIG
  _debug: () => {
    console.log('🔍 API_CONFIG debug:', {
      BASE_URL: API_CONFIG.BASE_URL,
      ENVIRONMENT: API_CONFIG.ENVIRONMENT,
      ENDPOINTS: Object.keys(API_CONFIG.ENDPOINTS)
    });
  },
  
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

// API URL Builder Utility
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const baseUrl = API_CONFIG.BASE_URL;
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

// Environment Check Utilities
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Debug environment detection
console.log('🔍 Environment detection constants:');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 isDevelopment:', isDevelopment);
console.log('🔍 isProduction:', isProduction);
console.log('🔍 isTest:', isTest);

// Get current environment configuration
export const getCurrentEnvironment = () => {
  console.log('🔍 getCurrentEnvironment called');
  console.log('🔍 isProduction:', isProduction);
  console.log('🔍 isDevelopment:', isDevelopment);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  
  if (isProduction) {
    console.log('🔍 Returning PRODUCTION environment');
    return API_CONFIG.ENVIRONMENT.PRODUCTION;
  }
  console.log('🔍 Returning DEVELOPMENT environment');
  return API_CONFIG.ENVIRONMENT.DEVELOPMENT;
};

// Get API base URL for current environment
export const getApiBaseUrl = () => {
  console.log('🔍 getApiBaseUrl called');
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  const fallbackUrl = getCurrentEnvironment().BASE_URL;
  const finalUrl = envUrl || fallbackUrl;
  
  console.log('🔍 getApiBaseUrl details:', {
    envUrl,
    fallbackUrl,
    finalUrl
  });
  
  return finalUrl;
};

// Enhanced logging for API configuration
export const logApiConfig = () => {
  console.log('🔍 logApiConfig function called');
  
  const currentEnv = getCurrentEnvironment();
  const baseUrl = getApiBaseUrl();
  const nodeEnv = process.env.NODE_ENV || 'undefined';
  
  console.log('🔍 Environment variables:', {
    NODE_ENV: nodeEnv,
    REACT_APP_API_BASE_URL: process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API_BASE_URL : process.env.REACT_APP_API_BASE_URL_PRODUCTION,
    currentEnv,
    baseUrl
  });
  
  console.log('🚀 ========================================');
  console.log('🚀 POS APP STARTUP - API CONFIGURATION');
  console.log('🚀 ========================================');
  
  // Clear environment status
  if (nodeEnv === 'development') {
    console.log('🟢 CONNECTED TO: LOCAL DEVELOPMENT ENVIRONMENT');
    console.log('🟢 NODE_ENV: development');
    console.log('🟢 Backend: Localhost Server');
  } else if (nodeEnv === 'production') {
    console.log('🔴 CONNECTED TO: PRODUCTION ENVIRONMENT');
    console.log('🔴 NODE_ENV: production');
    console.log('🔴 Backend: Production Server');
  } else {
    console.log('🟡 CONNECTED TO: UNKNOWN ENVIRONMENT');
    console.log('🟡 NODE_ENV: ' + nodeEnv);
    console.log('🟡 Backend: Fallback Configuration');
  }
  
  console.log('🚀 ========================================');
  console.log(`🔗 API Base URL: ${baseUrl}`);
  console.log(`📝 Environment Config: ${currentEnv.DESCRIPTION}`);
  console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
  console.log('🚀 ========================================');
  
  // Additional environment info
  if (isDevelopment) {
    console.log('🔧 Development Mode Active');
    console.log('📊 Available Endpoints:');
    Object.entries(API_CONFIG.ENDPOINTS).forEach(([category, endpoints]) => {
      console.log(`   ${category}:`);
      Object.entries(endpoints).forEach(([name, endpoint]) => {
        console.log(`     ${name}: ${baseUrl}${endpoint}`);
      });
    });
  }
  
  if (isProduction) {
    console.log('🚀 Production Mode Active');
    console.log('🔒 Using Production Backend');
  }
  
  console.log('🚀 ========================================');
};

// App startup logging function
export const logAppStartup = () => {
  const nodeEnv = process.env.NODE_ENV || 'undefined';
  
  console.log('🎯 ========================================');
  console.log('🎯 POS APPLICATION STARTING UP');
  console.log('🎯 ========================================');
  
  // Show environment status immediately
  if (nodeEnv === 'development') {
    console.log('🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢');
    console.log('🟢 RUNNING IN LOCAL DEVELOPMENT MODE 🟢');
    console.log('🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢 🟢');
  } else if (nodeEnv === 'production') {
    console.log('🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴');
    console.log('🔴 RUNNING IN PRODUCTION MODE 🔴');
    console.log('🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴');
  } else {
    console.log('🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡');
    console.log('🟡 RUNNING IN UNKNOWN MODE 🟡');
    console.log('🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡 🟡');
  }
  
  console.log('🎯 ========================================');
  
  // Log environment details
  logApiConfig();
  
  // Log build information
  console.log('📦 Build Information:');
  console.log(`   Version: ${process.env.REACT_APP_VERSION || '0.1.0'}`);
  console.log(`   Build Time: ${process.env.REACT_APP_BUILD_TIME || 'Unknown'}`);
  console.log(`   Git Commit: ${process.env.REACT_APP_GIT_COMMIT || 'Unknown'}`);
  
  // Log feature flags and configurations
  console.log('⚙️  Feature Configuration:');
  console.log(`   Debug Mode: ${isDevelopment ? 'Enabled' : 'Disabled'}`);
  console.log(`   API Timeout: ${API_CONFIG.TIMEOUTS.REQUEST}ms`);
  console.log(`   Refresh Timeout: ${API_CONFIG.TIMEOUTS.REFRESH}ms`);
  
  // Log connection test
  console.log('🔍 Connection Test:');
  console.log(`   Testing connection to: ${getApiBaseUrl()}`);
  
  console.log('🎯 ========================================');
  console.log('🎯 App is ready! Check console for API details.');
  console.log('🎯 ========================================');
  
  // Final environment summary
  console.log('📋 ========================================');
  console.log('📋 ENVIRONMENT SUMMARY');
  console.log('📋 ========================================');
  if (nodeEnv === 'development') {
    console.log('🟢 ENVIRONMENT: LOCAL DEVELOPMENT');
    console.log('🟢 BACKEND: http://localhost:3000');
    console.log('🟢 MODE: Debug Enabled');
  } else if (nodeEnv === 'production') {
    console.log('🔴 ENVIRONMENT: PRODUCTION');
    console.log('🔴 BACKEND: https://my-backend-7rrf.onrender.com');
    console.log('🔴 MODE: Production Optimized');
  } else {
    console.log('🟡 ENVIRONMENT: UNKNOWN');
    console.log('🟡 BACKEND: Fallback URL');
    console.log('🟡 MODE: Undefined');
  }
  console.log('📋 ========================================');
};

// Quick environment status check
export const showEnvironmentStatus = () => {
  const nodeEnv = process.env.NODE_ENV || 'undefined';
  const baseUrl = getApiBaseUrl();
  
  console.log('🔍 ========================================');
  console.log('🔍 CURRENT ENVIRONMENT STATUS');
  console.log('🔍 ========================================');
  
  if (nodeEnv === 'development') {
    console.log('🟢 STATUS: LOCAL DEVELOPMENT');
    console.log('🟢 NODE_ENV: ' + nodeEnv);
    console.log('🟢 BACKEND: ' + baseUrl);
    console.log('🟢 DESCRIPTION: Local development server');
  } else if (nodeEnv === 'production') {
    console.log('🔴 STATUS: PRODUCTION');
    console.log('🔴 NODE_ENV: ' + nodeEnv);
    console.log('🔴 BACKEND: ' + baseUrl);
    console.log('🔴 DESCRIPTION: Production backend server');
  } else {
    console.log('🟡 STATUS: UNKNOWN');
    console.log('🟡 NODE_ENV: ' + nodeEnv);
    console.log('🟡 BACKEND: ' + baseUrl);
    console.log('🟡 DESCRIPTION: Fallback configuration');
  }
  
  console.log('🔍 ========================================');
};

// Test API connection
export const testApiConnection = async () => {
  const baseUrl = getApiBaseUrl();
  
  try {
    console.log('🔍 Testing API connection...');
    const response = await fetch(`${baseUrl}/health`, { 
      method: 'GET',
      mode: 'cors',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      console.log('✅ API Connection: SUCCESS');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Response Time: ${Date.now()}ms`);
    } else {
      console.log('⚠️  API Connection: PARTIAL');
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ API Connection: FAILED');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('   This might be normal if the backend is not running');
  }
  
  console.log('🔍 Connection test completed');
};

// Log all available API endpoints
export const logAllEndpoints = () => {
  const baseUrl = getApiBaseUrl();
  
  console.log('📚 ========================================');
  console.log('📚 AVAILABLE API ENDPOINTS');
  console.log('📚 ========================================');
  console.log(`🔗 Base URL: ${baseUrl}`);
  console.log('');
  
  Object.entries(API_CONFIG.ENDPOINTS).forEach(([category, endpoints]) => {
    console.log(`📁 ${category.toUpperCase()}:`);
    Object.entries(endpoints).forEach(([name, endpoint]) => {
      const fullUrl = `${baseUrl}${endpoint}`;
      console.log(`   🔸 ${name}: ${fullUrl}`);
    });
    console.log('');
  });
  
  console.log('📚 ========================================');
};
