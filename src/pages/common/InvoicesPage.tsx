import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useToast } from '../../contexts/ToastContext';
import { getInvoices, getInvoiceById, Invoice, InvoicePagination, InvoiceSummary, GetInvoicesParams } from '../../services/invoiceService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import InvoicePDF from '../../components/InvoicePDF';

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<InvoicePagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GetInvoicesParams>({});
  const [sortBy, setSortBy] = useState('-createdAt');
  const [pageSize, setPageSize] = useState(10);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedInvoiceForPDF, setSelectedInvoiceForPDF] = useState<Invoice | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

  // Fetch invoices with proper auth handling
  const fetchInvoices = async (page: number = 1, limit: number = 10, customFilters?: GetInvoicesParams, customSearch?: string, customSort?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getInvoices(
        page,
        limit,
        {
          ...(customFilters || filters),
          search: (customSearch !== undefined ? customSearch : searchTerm) || undefined,
          sortBy: customSort || sortBy
        }
      );
      
      if (response.success) {
        setInvoices(response.data);
        setPagination(response.pagination);
        setSummary(response.summary);
      } else {
        setError(response.message || 'Failed to fetch invoices');
        showToast(response.message || 'Failed to fetch invoices', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      
      // Handle auth errors
      if (err?.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (refreshResponse.ok) {
            // Retry the original request
            const retryResponse = await getInvoices(
              page,
              limit,
              {
                ...(customFilters || filters),
                search: (customSearch !== undefined ? customSearch : searchTerm) || undefined,
                sortBy: customSort || sortBy
              }
            );
            
            if (retryResponse.success) {
              setInvoices(retryResponse.data);
              setPagination(retryResponse.pagination);
              setSummary(retryResponse.summary);
              return;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // If refresh fails, logout and redirect to login
        await dispatch(logout() as any);
        navigate('/login');
        showToast('Session expired. Please login again.', 'error');
        return;
      }
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch invoices';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Fetch with new search term
    fetchInvoices(1, pagination.limit, undefined, value);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof GetInvoicesParams, value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Fetch with new filters
    fetchInvoices(1, pagination.limit, newFilters);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    // Fetch with new sort
    fetchInvoices(1, pagination.limit, undefined, undefined, value);
  };

  // Handle page size change
  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPagination(prev => ({ ...prev, page: 1, limit: value }));
    // Fetch with new page size
    fetchInvoices(1, value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    // Fetch with new page
    fetchInvoices(page, pagination.limit);
  };

  // Handle view invoice
  const handleViewInvoice = async (invoice: Invoice) => {
    setIsLoadingPDF(true);
    try {
      const fullInvoiceData = await getInvoiceById(invoice._id);
      setSelectedInvoiceForPDF(fullInvoiceData);
      setIsPDFModalOpen(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      showToast('Failed to load invoice details', 'error');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // Handle PDF modal close
  const handlePDFModalClose = () => {
    setIsPDFModalOpen(false);
    setSelectedInvoiceForPDF(null);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'fully_paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  // Zero state component
  const ZeroState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || Object.values(filters).some(f => f) 
          ? 'Try adjusting your search or filters to find invoices.'
          : 'Get started by creating your first invoice from the Invoice Requests page.'
        }
      </p>
      <div className="flex justify-center space-x-3">
        {searchTerm || Object.values(filters).some(f => f) ? (
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilters({});
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/invoice-requests')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Invoice Requests
          </Button>
        )}
        <Button
          onClick={() => fetchInvoices(pagination.page, pagination.limit)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-gray-600">Manage and track all customer invoices</p>
          </div>
          <Button
            onClick={() => fetchInvoices(pagination.page, pagination.limit, filters, searchTerm, sortBy)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>


        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search by invoice number, customer..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="w-full"
              />
      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {summary?.availableFilters.statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <select
                value={filters.customerId || ''}
                onChange={(e) => handleFilterChange('customerId', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Customers</option>
                {summary?.availableFilters.customers.map(customer => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={filters.currency || ''}
                onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Currencies</option>
                {summary?.availableFilters.currencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {summary?.availableFilters.sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {summary?.availableFilters.pageSizes.map(size => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                      setPagination(prev => ({ ...prev, page: 1 }));
                      fetchInvoices(1, pageSize, {}, '');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear All Filters</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {summary?.showingResults}
          </div>
        </div>
      </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => fetchInvoices(pagination.page, pagination.limit)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? 'Retrying...' : 'Try Again'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        {invoices.length === 0 && !isLoading && !error ? (
          <ZeroState />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.finalTotal, invoice.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(invoice.customerPayment.paymentAmount, invoice.currency)} paid
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(invoice.customerPayment.paymentStatus)}`}>
                          {invoice.customerPayment.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewInvoice(invoice)}
                            disabled={isLoadingPDF}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {isLoadingPDF ? 'Loading...' : 'View'}
                          </Button>
                          <Button
                            onClick={() => {
                              // TODO: Implement download invoice
                              showToast('Download invoice functionality coming soon', 'info');
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePageSizeChange}
              hasNextPage={pagination.hasNext}
              hasPrevPage={pagination.hasPrev}
              isLoading={isLoading}
            />
        </div>
        )}

        {/* PDF Modal */}
        {isPDFModalOpen && selectedInvoiceForPDF && (
          <InvoicePDF
            invoiceData={selectedInvoiceForPDF}
            onClose={handlePDFModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;