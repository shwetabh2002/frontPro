import { companyService, type Company } from '../services/companyService';

/**
 * Utility functions for working with company information
 */

/**
 * Get company name with fallback
 */
export const getCompanyName = (): string => {
  return companyService.getCompanyName();
};

/**
 * Get company currency with fallback
 */
export const getCompanyCurrency = (): string => {
  return companyService.getCompanyCurrency();
};

/**
 * Get company address with fallback
 */
export const getCompanyAddress = (): Company['address'] | null => {
  return companyService.getCompanyAddress();
};

/**
 * Format company address as a single string
 */
export const formatCompanyAddress = (): string => {
  const address = getCompanyAddress();
  if (!address) return '';
  
  return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
};

/**
 * Get company contact information
 */
export const getCompanyContact = (): { email: string; phone: string; website: string } => {
  const cached = companyService.getCachedCompanyInfo();
  return {
    email: cached?.email || '',
    phone: cached?.phone || '',
    website: cached?.website || '',
  };
};

/**
 * Get company legal information
 */
export const getCompanyLegal = (): { legalName: string; taxId: string; registrationNumber: string } => {
  const cached = companyService.getCachedCompanyInfo();
  return {
    legalName: cached?.legalName || '',
    taxId: cached?.taxId || '',
    registrationNumber: cached?.registrationNumber || '',
  };
};

/**
 * Check if company information is available
 */
export const isCompanyInfoAvailable = (): boolean => {
  return companyService.isCacheValid();
};

/**
 * Force refresh company information
 */
export const refreshCompanyInfo = async (): Promise<Company> => {
  return companyService.refreshCompany();
};

export default {
  getCompanyName,
  getCompanyCurrency,
  getCompanyAddress,
  formatCompanyAddress,
  getCompanyContact,
  getCompanyLegal,
  isCompanyInfoAvailable,
  refreshCompanyInfo,
};
