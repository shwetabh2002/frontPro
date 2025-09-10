import { useState, useEffect, useCallback } from 'react';
import { companyService, type Company } from '../services/companyService';

interface UseCompanyReturn {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
  refreshCompany: () => Promise<void>;
  getCompanyName: () => string;
  getCompanyCurrency: () => string;
  getCompanyAddress: () => Company['address'] | null;
}

export const useCompany = (): UseCompanyReturn => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load company information
  const loadCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const companyData = await companyService.getCompany();
      setCompany(companyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load company information';
      setError(errorMessage);
      console.error('Error loading company:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh company information
  const refreshCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const companyData = await companyService.refreshCompany();
      setCompany(companyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh company information';
      setError(errorMessage);
      console.error('Error refreshing company:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load company on mount
  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  // Helper functions
  const getCompanyName = useCallback((): string => {
    return company?.name || companyService.getCompanyName();
  }, [company]);

  const getCompanyCurrency = useCallback((): string => {
    return company?.currency || companyService.getCompanyCurrency();
  }, [company]);

  const getCompanyAddress = useCallback((): Company['address'] | null => {
    return company?.address || companyService.getCompanyAddress();
  }, [company]);

  return {
    company,
    isLoading,
    error,
    refreshCompany,
    getCompanyName,
    getCompanyCurrency,
    getCompanyAddress,
  };
};

export default useCompany;
