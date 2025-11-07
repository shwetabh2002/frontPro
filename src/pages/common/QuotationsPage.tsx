import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import CustomerModal from '../../components/CustomerModal';
import QuotationPDF from '../../components/QuotationPDF';
import ConfirmationModal from '../../components/ConfirmationModal';
import { getQuotations, getQuotationById, acceptQuotation, rejectQuotation, deleteQuotation } from '../../services/quotationService';
import { formatPrice, getCurrencySymbol } from '../../utils/currencyUtils';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, QUOTATION_STATUS } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';

// Quotation interfaces specific to this page
interface QuotationCustomer {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  custId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface QuotationSupplier {
  _id: string;
  name: string;
  email: string;
  custId: string;
}

interface QuotationItem {
  itemId: string;
  supplierId?: QuotationSupplier;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  sku: string;
  description: string;
  specifications?: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    [key: string]: any;
  };
  sellingPrice: number;
  condition: string;
  status: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  tags?: string[];
  quantity: number;
  vinNumbers?: Array<{
    status: string;
    chasisNumber: string;
  }>;
  interiorColor?: string;
  totalPrice: number;
}

interface QuotationAdditionalExpenses {
  expenceType: string;
  description: string;
  amount: number;
  currency: string;
}

interface QuotationStatusHistory {
  status: string;
  date: string;
}

interface Quotation {
  _id: string;
  quotationId: string;
  quotationNumber: string;
  customer: QuotationCustomer;
  validTill: string;
  status: string;
  statusHistory: QuotationStatusHistory[];
  items: QuotationItem[];
  additionalExpenses?: QuotationAdditionalExpenses;
  subtotal: number;
  totalDiscount: number;
  discountType: string;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  deliveryAddress: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  VAT: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface QuotationsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface QuotationsSummary {
  appliedFilters: {
    search: string | null;
    status: string | null;
    customerId: string | null;
    createdBy: string | null;
    currency: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    validTillFrom: string | null;
    validTillTo: string | null;
  };
  availableFilters: {
    statuses: string[];
    currencies: string[];
    customers: string[];
    creators: string[];
    dateRanges: {
      created: {
        min: string;
        max: string;
      };
      validTill: {
        min: string;
        max: string;
      };
    };
    counts: {
      totalQuotations: number;
    };
    sortOptions: Array<{
      value: string;
      label: string;
    }>;
    pageSizes: number[];
  };
  sortBy: string;
  totalResults: number;
  showingResults: string;
}

interface QuotationsResponse {
  success: boolean;
  message: string;
  data: Quotation[];
  pagination: QuotationsPagination;
  summary: QuotationsSummary;
}

const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<QuotationsPagination>({
    page: 1,
    limit: 10, // Default, will be updated from API response
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<QuotationsSummary | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
    customerId: '',
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    validTillFrom: '',
    validTillTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateQuotationModalOpen, setIsCreateQuotationModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedQuotationData, setSelectedQuotationData] = useState<any>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingQuotationId, setDeletingQuotationId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const { showToast } = useToast();
  const { isAdmin } = usePermissions();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zero state component
  const ZeroState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || Object.values(filters).some(f => f && f !== '') 
          ? 'Try adjusting your search or filters to find quotations.'
          : 'No quotations have been created yet. Get started by creating your first quotation.'
        }
      </p>
      <div className="flex justify-center space-x-3">
        {searchTerm || Object.values(filters).some(f => f && f !== '') ? (
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                status: '',
                currency: '',
                customerId: '',
                createdBy: '',
                dateFrom: '',
                dateTo: '',
                validTillFrom: '',
                validTillTo: ''
              });
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchQuotations(1, pagination.limit);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={() => setIsCreateQuotationModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Quotation
          </Button>
        )}
        <Button
          onClick={() => fetchQuotations(pagination.page, pagination.limit)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if the click is outside any dropdown
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch quotations from API
  const fetchQuotations = async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getQuotations(page, limit);
      
      if (response.success) {
        setQuotations(response.data);
        setPagination(response.pagination);
        setSummary(response.summary);
        
        // Clear any previous errors
        setError(null);
        
      } else {
        const errorMsg = response.message || 'Failed to fetch quotations';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        console.error('API returned error:', response);
      }
    } catch (err: any) {
      console.error('Error fetching quotations:', err);
      
      // Handle authentication errors
      if (err?.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.data.accessToken);
              localStorage.setItem('refreshToken', refreshData.data.refreshToken);
              
              // Retry the original request
              const retryResponse = await getQuotations(page, limit);
              if (retryResponse.success) {
                setQuotations(retryResponse.data);
                setPagination(retryResponse.pagination);
                setSummary(retryResponse.summary);
                setError(null);
                return;
              }
            }
          }
          
          // If refresh fails, redirect to login
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        }
      }
      
      let errorMessage = 'Failed to fetch quotations';
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error') || err.message.includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to view quotations.';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'Quotations service not found. Please try again later.';
        } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
          errorMessage = 'Server error occurred. Please try again in a few moments.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load quotations on component mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  // Filter quotations based on search term and filters using useMemo
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(quotation => 
        quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(quotation => quotation.status === filters.status);
    }

    // Apply currency filter
    if (filters.currency) {
      filtered = filtered.filter(quotation => quotation.currency === filters.currency);
    }

    // Apply customer filter
    if (filters.customerId) {
      filtered = filtered.filter(quotation => quotation.customer.custId === filters.customerId);
    }

    // Apply created by filter
    if (filters.createdBy) {
      filtered = filtered.filter(quotation => quotation.createdBy.name === filters.createdBy);
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(quotation => 
        new Date(quotation.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(quotation => 
        new Date(quotation.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Apply valid till filters
    if (filters.validTillFrom) {
      filtered = filtered.filter(quotation => 
        new Date(quotation.validTill) >= new Date(filters.validTillFrom)
      );
    }

    if (filters.validTillTo) {
      filtered = filtered.filter(quotation => 
        new Date(quotation.validTill) <= new Date(filters.validTillTo)
      );
    }

    return filtered;
  }, [searchTerm, filters, quotations]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: '',
      currency: '',
      customerId: '',
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      validTillFrom: '',
      validTillTo: ''
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '') || searchTerm.trim() !== '';
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // Prevent page change if trying to go beyond available pages
    if (page < 1 || page > pagination.pages) {
      return;
    }

    // Prevent next page if no more pages available
    if (page > pagination.page && !pagination.hasNext) {
      return;
    }

    // Prevent previous page if on first page
    if (page < pagination.page && !pagination.hasPrev) {
      return;
    }
    // Fetch quotations for the new page
    fetchQuotations(page, pagination.limit);
  };

  // Handle create quotation modal
  const handleCreateQuotation = () => {
    setIsCreateQuotationModalOpen(true);
  };

  const handleCreateQuotationModalClose = () => {
    setIsCreateQuotationModalOpen(false);
    // Refresh quotations list after modal closes
    fetchQuotations(pagination.page, pagination.limit);
  };

  // Handle view quotation (PDF generation)
  const handleViewQuotation = async (quotationId: string) => {
    setIsLoadingPDF(true);
    try {
      const response = await getQuotationById(quotationId);
      if (response.success) {
        setSelectedQuotationData(response.data);
        setIsPDFModalOpen(true);
      } else {
        showToast(response.message || 'Failed to fetch quotation details', 'error');
      }
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      showToast('Failed to fetch quotation details', 'error');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const handlePDFModalClose = () => {
    setIsPDFModalOpen(false);
    setSelectedQuotationData(null);
  };

  const handleDropdownToggle = (quotationId: string) => {
    setOpenDropdownId(openDropdownId === quotationId ? null : quotationId);
  };

  const handleStatusUpdate = async (quotationId: string, status: string) => {
    try {
      setOpenDropdownId(null);
      setUpdatingStatusId(quotationId);
      
      if (status === QUOTATION_STATUS.ACCEPTED) {
        await acceptQuotation(quotationId);
        showToast(SUCCESS_MESSAGES.QUOTATION.ACCEPTED, 'success');
      } else if (status === QUOTATION_STATUS.REJECTED) {
        await rejectQuotation(quotationId);
        showToast(SUCCESS_MESSAGES.QUOTATION.REJECTED, 'success');
      }
      
      // Refresh the quotations list to reflect the updated status
      await fetchQuotations(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error updating quotation status:', error);
      showToast(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteQuotation = (quotation: Quotation) => {
    setQuotationToDelete(quotation);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;

    try {
      setDeletingQuotationId(quotationToDelete._id);
      const response = await deleteQuotation(quotationToDelete._id);
      
      if (response.success) {
        showToast(`Quotation ${quotationToDelete.quotationNumber} deleted successfully`, 'success');
        // Refresh the quotations list
        await fetchQuotations(pagination.page, pagination.limit);
        // Close modal and reset state
        setIsDeleteModalOpen(false);
        setQuotationToDelete(null);
      } else {
        showToast(response.message || 'Failed to delete quotation', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      showToast(error.message || 'Failed to delete quotation. Please try again.', 'error');
    } finally {
      setDeletingQuotationId(null);
    }
  };

  const handleDeleteModalClose = () => {
    if (!deletingQuotationId) {
      setIsDeleteModalOpen(false);
      setQuotationToDelete(null);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'quotationNumber',
      header: 'Quotation #',
      render: (value: any, quotation: Quotation) => (
        <div className="font-semibold text-blue-900">
          {quotation.quotationNumber}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (value: any, quotation: Quotation) => (
        <div>
          <div className="font-medium text-gray-900">{quotation.customer.name}</div>
          <div className="text-sm text-gray-500">{quotation.customer.email}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (value: any, quotation: Quotation) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{quotation.items.length} item(s)</div>
          <div className="text-gray-500">
            {quotation.items.slice(0, 2).map((item, index) => (
              <div key={index} className="truncate max-w-xs">
                {item.brand} {item.model} ({item.quantity}x)
              </div>
            ))}
            {quotation.items.length > 2 && (
              <div className="text-blue-600">+{quotation.items.length - 2} more</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value: any, quotation: Quotation) => (
        <div className="text-right">
          <div className="font-bold text-green-600">
            {formatPrice(quotation.totalAmount, quotation.currency)}
          </div>
          <div className="text-sm text-gray-500">
            {quotation.currency}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: any, quotation: Quotation) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(quotation.status)}`}>
          {quotation.status.toLowerCase() === 'accepted' 
            ? 'Customer Accepted' 
            : quotation.status.toLowerCase() === 'review'
            ? 'Under Review'
            : quotation.status.toLowerCase() === 'approved'
            ? 'Approved by Admin'
            : quotation.status.toLowerCase() === 'confirmed'
            ? 'Confirmed'
            : quotation.status.toLowerCase() === 'rejected'
            ? 'Rejected'
            : quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)
          }
        </span>
      )
    },
    {
      key: 'validTill',
      header: 'Valid Until',
      render: (value: any, quotation: Quotation) => (
        <div className="text-sm">
          <div className="text-gray-900">{formatDate(quotation.validTill)}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, quotation: Quotation) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleViewQuotation(quotation._id)}
            disabled={isLoadingPDF}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Button>
          
          {/* Delete button - Only visible to admin */}
          {isAdmin && (
            <Button
              onClick={() => handleDeleteQuotation(quotation)}
              disabled={deletingQuotationId === quotation._id}
              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingQuotationId === quotation._id ? (
                <>
                  <svg className="w-4 h-4 mr-1 animate-spin inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Quotation
                </>
              )}
            </Button>
          )}
        </div>
      )
    }
  ];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Unable to Load Quotations</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {error.includes('Failed to fetch') 
              ? 'There was a problem connecting to the server. Please check your internet connection and try again.'
              : error.includes('Authentication') 
              ? 'Your session has expired. Please refresh the page and log in again.'
              : error.includes('500') || error.includes('Internal Server Error')
              ? 'The server encountered an unexpected error. Please try again in a few moments.'
              : error.includes('404') || error.includes('Not Found')
              ? 'The quotations service is currently unavailable. Please try again later.'
              : error
            }
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => fetchQuotations(pagination.page, pagination.limit)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
            <div className="text-sm text-gray-500">
              If the problem persists, please contact support
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
              <p className="mt-2 text-gray-600">
                Manage and track all quotations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => fetchQuotations()}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <Button
                onClick={handleCreateQuotation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Quotation
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search quotations by number, customer name, email, or status..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </Button>
            {hasActiveFilters() && (
              <Button
                onClick={handleClearFilters}
                className="text-red-600 hover:text-red-800 px-3 py-2"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && summary && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    {summary.availableFilters.statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={filters.currency}
                    onChange={(e) => handleFilterChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Currencies</option>
                    {summary.availableFilters.currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={filters.customerId}
                    onChange={(e) => handleFilterChange('customerId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Customers</option>
                    {summary.availableFilters.customers.map((customerId) => (
                      <option key={customerId} value={customerId}>
                        {customerId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Created By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <select
                    value={filters.createdBy}
                    onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Creators</option>
                    {summary.availableFilters.creators.map((creator) => (
                      <option key={creator} value={creator}>
                        {creator}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Valid Till From Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={filters.validTillFrom}
                    onChange={(e) => handleFilterChange('validTillFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Valid Till To Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                  <input
                    type="date"
                    value={filters.validTillTo}
                    onChange={(e) => handleFilterChange('validTillTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredQuotations.length === 0 ? (
            <ZeroState />
          ) : (
            <Table
              data={filteredQuotations}
              columns={columns}
              emptyMessage="No quotations found"
            />
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={(itemsPerPage) => {
                setPagination(prev => ({ ...prev, limit: itemsPerPage, page: 1 }));
                fetchQuotations(1, itemsPerPage);
              }}
              hasNextPage={pagination.hasNext}
              hasPrevPage={pagination.hasPrev}
            />
          </div>
        )}

        {/* Pagination Info */}
        {pagination.pages > 1 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} 
            {!pagination.hasNext && (
              <span className="ml-2 text-blue-600 font-medium">• Last page reached</span>
            )}
            {!pagination.hasPrev && pagination.page === 1 && (
              <span className="ml-2 text-blue-600 font-medium">• First page</span>
            )}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">{summary.showingResults}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalResults}</div>
                <div className="text-sm text-gray-500">Total Quotations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredQuotations.filter(q => q.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-500">Draft</div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      <CustomerModal
        isOpen={isCreateQuotationModalOpen}
        onClose={handleCreateQuotationModalClose}
        mode="quotation"
        allowCustomerCreation={true}
      />

      {/* PDF Generation Modal */}
      {isPDFModalOpen && selectedQuotationData && (
        <QuotationPDF
          quotationData={selectedQuotationData}
          onClose={handlePDFModalClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message={`Are you sure you want to permanently delete quotation ${quotationToDelete?.quotationNumber}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={deletingQuotationId !== null}
        variant="danger"
      />
    </div>
  );
};

export default QuotationsPage;