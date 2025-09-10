import React from 'react';
import { useCompany } from '../hooks/useCompany';
import { companyService } from '../services/companyService';

interface CompanyInfoProps {
  showDetails?: boolean;
  className?: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { company, isLoading, error, refreshCompany } = useCompany();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-300 h-4 w-24 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-red-500 text-sm">Company info unavailable</span>
        <button
          onClick={refreshCompany}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const companyName = company?.name || companyService.getCompanyName();
  const companyCurrency = company?.currency || companyService.getCompanyCurrency();

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-gray-700">{companyName}</span>
        <span className="text-xs text-gray-500">({companyCurrency})</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
        <button
          onClick={refreshCompany}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Refresh
        </button>
      </div>
      
      {company && (
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Legal Name:</span>
            <span>{company.legalName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Code:</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {company.companyCode}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Currency:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
              {company.currency}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Email:</span>
            <span>{company.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Phone:</span>
            <span>{company.phone}</span>
          </div>
          {company.address && (
            <div className="pt-2 border-t border-gray-200">
              <div className="font-medium text-gray-700 mb-1">Address:</div>
              <div className="text-xs text-gray-600">
                <div>{company.address.street}</div>
                <div>{company.address.city}, {company.address.state} {company.address.postalCode}</div>
                <div>{company.address.country}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyInfo;
