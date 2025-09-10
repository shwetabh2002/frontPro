import { httpClient, getAuthToken } from '../utils/apiUtils';
import { API_CONFIG, buildApiUrl } from '../config/api';
import { ERROR_MESSAGES } from '../constants';

// Types
export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CompanySocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface Company {
  name: string;
  legalName: string;
  companyCode: string;
  email: string;
  phone: string;
  fax: string;
  website: string;
  address: CompanyAddress;
  billingAddress: CompanyAddress;
  taxId: string;
  registrationNumber: string;
  currency: string;
  paymentTerms: string;
  socialMedia: CompanySocialMedia;
  termCondition: string;
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  data: Company;
}

// Local Storage Keys
const COMPANY_STORAGE_KEY = 'company_info';
const COMPANY_CACHE_EXPIRY_KEY = 'company_cache_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class CompanyService {
  /**
   * Get company information from API
   */
  async getCompanyInfo(): Promise<Company> {
    try {
      console.log('🏢 Fetching company information...');
      
      // Get and set auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error(ERROR_MESSAGES.COMPANY.NO_TOKEN);
      }
      httpClient.setAuthToken(token);
      console.log('🔑 Using auth token for company API:', token.substring(0, 20) + '...');
      
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.COMPANIES.GET_COMPANY_DOCUMENTS);
      const response = await httpClient.get<CompanyResponse>(url);
      
      if (response.success && response.data) {
        console.log('✅ Company information fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || ERROR_MESSAGES.COMPANY.FETCH_FAILED);
      }
    } catch (error) {
      console.error('❌ Error fetching company information:', error);
      throw error;
    }
  }

  /**
   * Get company information from localStorage (cached)
   */
  getCachedCompanyInfo(): Company | null {
    try {
      const cached = localStorage.getItem(COMPANY_STORAGE_KEY);
      const expiry = localStorage.getItem(COMPANY_CACHE_EXPIRY_KEY);
      
      if (!cached || !expiry) {
        return null;
      }
      
      const now = Date.now();
      const cacheExpiry = parseInt(expiry, 10);
      
      if (now > cacheExpiry) {
        console.log('🕒 Company cache expired, clearing...');
        this.clearCompanyCache();
        return null;
      }
      
      const companyData = JSON.parse(cached);
      console.log('📦 Company information loaded from cache');
      return companyData;
    } catch (error) {
      console.error('❌ Error reading company cache:', error);
      this.clearCompanyCache();
      return null;
    }
  }

  /**
   * Cache company information in localStorage
   */
  cacheCompanyInfo(company: Company): void {
    try {
      const expiry = Date.now() + CACHE_DURATION;
      localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
      localStorage.setItem(COMPANY_CACHE_EXPIRY_KEY, expiry.toString());
      console.log('💾 Company information cached successfully');
    } catch (error) {
      console.error('❌ Error caching company information:', error);
    }
  }

  /**
   * Clear company cache from localStorage
   */
  clearCompanyCache(): void {
    try {
      localStorage.removeItem(COMPANY_STORAGE_KEY);
      localStorage.removeItem(COMPANY_CACHE_EXPIRY_KEY);
      console.log('🗑️ Company cache cleared');
    } catch (error) {
      console.error('❌ Error clearing company cache:', error);
    }
  }

  /**
   * Get company information (cached or fresh)
   * This is the main method to use throughout the app
   */
  async getCompany(): Promise<Company> {
    // Try to get from cache first
    const cached = this.getCachedCompanyInfo();
    if (cached) {
      return cached;
    }

    // If not in cache or expired, fetch from API
    const company = await this.getCompanyInfo();
    this.cacheCompanyInfo(company);
    return company;
  }

  /**
   * Force refresh company information from API
   */
  async refreshCompany(): Promise<Company> {
    console.log('🔄 Force refreshing company information...');
    this.clearCompanyCache();
    return this.getCompany();
  }

  /**
   * Check if company cache is valid
   */
  isCacheValid(): boolean {
    const expiry = localStorage.getItem(COMPANY_CACHE_EXPIRY_KEY);
    if (!expiry) return false;
    
    const now = Date.now();
    const cacheExpiry = parseInt(expiry, 10);
    return now <= cacheExpiry;
  }

  /**
   * Get company name (quick access)
   */
  getCompanyName(): string {
    const cached = this.getCachedCompanyInfo();
    return cached?.name || 'Company';
  }

  /**
   * Get company currency (quick access)
   */
  getCompanyCurrency(): string {
    const cached = this.getCachedCompanyInfo();
    return cached?.currency || 'USD';
  }

  /**
   * Get company address (quick access)
   */
  getCompanyAddress(): CompanyAddress | null {
    const cached = this.getCachedCompanyInfo();
    return cached?.address || null;
  }
}

// Export singleton instance
export const companyService = new CompanyService();
export default companyService;
