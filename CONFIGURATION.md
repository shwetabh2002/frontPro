# Configuration Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment (development | production)
REACT_APP_ENVIRONMENT=development

# API Base URLs
REACT_APP_API_BASE_URL=http://localhost:3000

# Application Configuration
REACT_APP_APP_NAME=POS System
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_ANALYTICS=false
```

## API Configuration

The application uses a centralized API configuration system:

### Endpoints
- All API endpoints are defined in `src/config/api.ts`
- Endpoints are organized by feature (AUTH, USERS, INVENTORY, SALES)
- Use `API_CONFIG.ENDPOINTS.FEATURE.ENDPOINT_NAME` to reference endpoints

### HTTP Client
- Custom HTTP client with proper error handling
- Automatic timeout configuration
- Request/response interceptors
- Proper TypeScript typing

### Error Handling
- Centralized error messages in `src/constants/index.ts`
- Custom `ApiError` class for better error handling
- HTTP status code constants
- Localized error messages

## Coding Standards

### 1. Service Layer
- All API calls go through service classes
- Proper JSDoc documentation
- TypeScript interfaces for all data structures
- Consistent error handling

### 2. Constants
- All constants are centralized in `src/constants/index.ts`
- Use `as const` for type safety
- Organized by feature/domain

### 3. API Utils
- Reusable HTTP client
- Proper authentication handling
- Request timeout configuration
- Response validation

### 4. Error Handling
- Custom error classes
- Proper HTTP status code handling
- User-friendly error messages
- Logging for debugging

## Best Practices

1. **Always use API_CONFIG for endpoints**
2. **Use proper TypeScript interfaces**
3. **Handle errors gracefully**
4. **Document all public methods**
5. **Use constants for all strings**
6. **Validate API responses**
7. **Implement proper loading states**
8. **Use proper HTTP status codes**
