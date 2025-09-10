# Company Service Documentation

## Overview

The Company Service provides a centralized way to fetch, cache, and access company information throughout the POS application. It automatically loads company data when a user is authenticated and caches it in localStorage for performance.

## Features

- ✅ **Automatic Loading**: Company info loads when user authenticates
- ✅ **localStorage Caching**: 24-hour cache with automatic expiry
- ✅ **Error Handling**: Graceful fallbacks and retry mechanisms
- ✅ **TypeScript Support**: Full type safety with interfaces
- ✅ **React Hooks**: Easy integration with React components
- ✅ **Utility Functions**: Quick access to common company data

## API Endpoint

```
GET /companies/owner/company/documents
Authorization: Bearer <access_token>
```

## Usage Examples

### 1. Using the React Hook

```typescript
import { useCompany } from '../hooks/useCompany';

const MyComponent = () => {
  const { company, isLoading, error, refreshCompany } = useCompany();

  if (isLoading) return <div>Loading company info...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{company?.name}</h1>
      <p>Currency: {company?.currency}</p>
      <button onClick={refreshCompany}>Refresh</button>
    </div>
  );
};
```

### 2. Using Utility Functions

```typescript
import { 
  getCompanyName, 
  getCompanyCurrency, 
  formatCompanyAddress 
} from '../utils/companyUtils';

const companyName = getCompanyName(); // "Your Business Name"
const currency = getCompanyCurrency(); // "AED"
const address = formatCompanyAddress(); // "123 Your Business Street, Your City, Your State 12345, United Arab Emirates"
```

### 3. Using the Service Directly

```typescript
import { companyService } from '../services/companyService';

// Get company info (cached or fresh)
const company = await companyService.getCompany();

// Force refresh from API
const freshCompany = await companyService.refreshCompany();

// Get cached info only
const cached = companyService.getCachedCompanyInfo();

// Check if cache is valid
const isValid = companyService.isCacheValid();
```

## Data Structure

```typescript
interface Company {
  name: string;                    // "Your Business Name"
  legalName: string;               // "Your Business Name Inc."
  companyCode: string;             // "COMP-000001"
  email: string;                   // "info@yourbusiness.com"
  phone: string;                   // "+1-555-0000"
  fax: string;                     // "+1-555-0001"
  website: string;                 // "https://www.yourbusiness.com"
  address: CompanyAddress;         // Business address
  billingAddress: CompanyAddress;  // Billing address
  taxId: string;                   // "12-3456789"
  registrationNumber: string;      // "YB123456"
  currency: string;                // "AED"
  paymentTerms: string;            // "Due on Receipt"
  socialMedia: CompanySocialMedia; // Social media links
  termCondition: string;           // Terms and conditions
}

interface CompanyAddress {
  street: string;      // "123 Your Business Street"
  city: string;        // "Your City"
  state: string;       // "Your State"
  postalCode: string;  // "12345"
  country: string;     // "United Arab Emirates"
}
```

## Caching Strategy

- **Cache Duration**: 24 hours
- **Storage**: localStorage
- **Auto-refresh**: On app initialization when authenticated
- **Manual refresh**: Available via `refreshCompany()` method
- **Fallback**: Uses cached data if API fails

## Integration Points

### 1. App Initialization
Company info loads automatically in `SessionManager` when user is authenticated.

### 2. Layout Headers
Company name and currency displayed in both Admin and Employee layouts.

### 3. Customer Modal
Company information shown in customer registration modal.

### 4. Any Component
Use the `useCompany` hook or utility functions anywhere in the app.

## Error Handling

The service includes comprehensive error handling:

- **Network errors**: Graceful fallback to cached data
- **API errors**: User-friendly error messages
- **Cache errors**: Automatic cache clearing and retry
- **Loading states**: Proper loading indicators

## Performance Considerations

- **Lazy loading**: Company info only loads when needed
- **Caching**: Reduces API calls with 24-hour cache
- **Background loading**: Non-blocking initialization
- **Memory efficient**: Minimal memory footprint

## Future Enhancements

- [ ] Real-time company info updates
- [ ] Multi-company support
- [ ] Company settings management
- [ ] Offline mode support
- [ ] Company logo integration

## Troubleshooting

### Company info not loading?
1. Check if user is authenticated
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Try manual refresh with `refreshCompany()`

### Cache issues?
1. Clear localStorage manually
2. Use `companyService.clearCompanyCache()`
3. Force refresh with `refreshCompany()`

### TypeScript errors?
1. Ensure all interfaces are imported
2. Check API response structure matches interfaces
3. Update interfaces if API changes
