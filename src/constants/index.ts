// Application Constants
export const APP_CONSTANTS = {
  // Toast Configuration
  TOAST: {
    AUTO_DISMISS_DURATION: 5000, // 5 seconds
    PROGRESS_UPDATE_INTERVAL: 100, // 100ms
    PROGRESS_STEP: 2, // 2% per step
  },
  
  // Form Validation
  VALIDATION: {
    EMAIL_REGEX: /\S+@\S+\.\S+/,
    REQUIRED_FIELDS: ['name', 'email', 'phone'],
  },
  
  // Country Codes
  COUNTRY_CODES: [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+86', country: 'China' },
  ],
  
  // Default Values
  DEFAULTS: {
    COUNTRY_CODE: '+91',
    INVENTORY_FILTERS: {
      category: '',
      brand: '',
      model: '',
      year: '',
    },
    FILTER_SUMMARY: {
      category: [],
      brand: [],
      model: [],
      year: [],
    },
    PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 20,
      MAX_LIMIT: 100,
      ITEMS_PER_PAGE_OPTIONS: [20, 50, 100, 200],
    },
  },

  // External API Keys
  EXTERNAL_APIS: {
    OPENEXCHANGERATES: {
      APP_ID: process.env.REACT_APP_OPENEXCHANGERATES_APP_ID ,
      BASE_URL: process.env.REACT_APP_OPENEXCHANGERATES_BASE_URL,
    },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  CUSTOMER: {
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Email is invalid',
    PHONE_REQUIRED: 'Phone number is required',
    ALREADY_EXISTS: 'Customer with this email already exists',
    PHONE_ALREADY_EXISTS: 'Customer with this phone already exists',
    CREATE_FAILED: 'Failed to create customer. Please try again.',
  },
  INVENTORY: {
    FETCH_FAILED: 'Failed to fetch inventory data',
    NO_TOKEN: 'No access token found',
  },
  AUTH: {
    NO_TOKEN: 'No access token found',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'Unauthorized access',
  },
  GENERAL: {
    NETWORK_ERROR: 'Network error',
    REQUEST_TIMEOUT: 'Request timeout',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
  HTTP: {
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CUSTOMER: {
    CREATED: 'Customer saved successfully!',
    FETCHED: 'Customers loaded successfully!',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
