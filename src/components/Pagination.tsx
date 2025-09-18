import React from 'react';
import { APP_CONSTANTS } from '../constants';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  hasNextPage,
  hasPrevPage,
  isLoading = false,
  className = ""
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`bg-white border border-slate-300 rounded-lg p-4 ${className}`}>
      {/* Items per page selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-slate-700">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={isLoading}
            className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-slate-700 text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50"
          >
            {APP_CONSTANTS.DEFAULTS.PAGINATION.ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-slate-700">
          Showing {startItem}-{endItem} of {totalItems.toLocaleString()} items
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            hasPrevPage && !isLoading
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-slate-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white hover:scale-105'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            hasNextPage && !isLoading
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading page {currentPage}...
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
