import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { receiptService, type Receipt, type ReceiptsParams } from '../../services/receiptService';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ReceiptPDFPreview from '../../components/ReceiptPDFPreview';
import CreateReceiptModal from '../../components/CreateReceiptModal';

const ReceiptsPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchReceipts = useCallback(async (page = 1, limit = 10, customParams?: Partial<ReceiptsParams>) => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: ReceiptsParams = {
        page,
        limit,
        search: (customParams?.search ?? searchTerm) || undefined,
        paymentMethod: (customParams?.paymentMethod ?? paymentMethodFilter) || undefined,
        currency: (customParams?.currency ?? currencyFilter) || undefined,
        sortBy: customParams?.sortBy ?? sortBy,
        sortOrder: customParams?.sortOrder ?? sortOrder,
      };

      const response = await receiptService.getReceipts(params);

      if (response.success) {
        setReceipts(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch receipts');
        showToast('Failed to fetch receipts', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      setError(error.message);
      showToast(error.message, 'error');
      
      // Handle token expiration
      if (error.message.includes('token') || error.message.includes('unauthorized')) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, showToast, dispatch, navigate]);

  useEffect(() => {
    fetchReceipts();
  }, []); // Only run on mount

  const handleSearch = () => {
    fetchReceipts(1, pagination.limit, {
      search: searchTerm,
      paymentMethod: paymentMethodFilter,
      currency: currencyFilter,
      sortBy,
      sortOrder,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPaymentMethodFilter('');
    setCurrencyFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    fetchReceipts(1, pagination.limit, {
      search: '',
      paymentMethod: '',
      currency: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchReceipts(newPage, pagination.limit);
  };

  const handleRefresh = () => {
    fetchReceipts(pagination.page, pagination.limit);
  };

  const handleViewReceipt = async (receipt: Receipt) => {
    try {
      setIsLoadingReceipt(true);
      const receiptDetails = await receiptService.getReceiptById(receipt._id);
      setSelectedReceipt(receiptDetails);
      setIsPreviewOpen(true);
    } catch (error: any) {
      console.error('Error fetching receipt details:', error);
      showToast(error.message || 'Failed to fetch receipt details', 'error');
    } finally {
      setIsLoadingReceipt(false);
    }
  };


  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedReceipt(null);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit card':
        return 'bg-blue-100 text-blue-800';
      case 'cheque':
        return 'bg-purple-100 text-purple-800';
      case 'tt':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const totalPages = pagination.pages;
    const currentPage = pagination.page;

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-2 text-sm font-medium border-t border-b ${
              i === currentPage
                ? 'bg-blue-50 text-blue-600 border-blue-500'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    );

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{pagination.total}</span>
              {' '}results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              {pages}
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && receipts.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and view payment receipts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Receipt</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search by receipt number, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="credit card">Credit Card</option>
                <option value="cheque">Cheque</option>
                <option value="tt">T/T</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Currencies</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt-desc">Date (Newest)</option>
                <option value="createdAt-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="receiptNumber-asc">Receipt Number (A-Z)</option>
                <option value="receiptNumber-desc">Receipt Number (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Search
            </Button>
            <Button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-medium mb-2">Error Loading Receipts</div>
            <div className="text-gray-500 mb-4">{error}</div>
            <Button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || paymentMethodFilter || currencyFilter
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first receipt.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Receipt Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quotation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {receipts.map((receipt, index) => (
                    <tr key={receipt._id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {receipt.receiptNumber}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {receipt.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {receipt.customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {receipt.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {receipt.customer.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {receipt.customer.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(receipt.paymentMethod)}`}>
                          {receipt.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(receipt.amount, receipt.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {receipt.currency}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(receipt.receiptDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(receipt.receiptDate).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {receipt.quotationId ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                {receipt.quotationId.quotationNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {receipt.quotationId.status}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleViewReceipt(receipt)}
                          disabled={isLoadingReceipt}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoadingReceipt ? (
                            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {isPreviewOpen && selectedReceipt && (
        <ReceiptPDFPreview
          receipt={selectedReceipt}
          onClose={handleClosePreview}
        />
      )}

      {/* Create Receipt Modal */}
      <CreateReceiptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onReceiptCreated={() => {
          fetchReceipts(pagination.page, pagination.limit);
        }}
      />
    </div>
  );
};

export default ReceiptsPage;
