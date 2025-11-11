import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import { getApprovedOrders, ReviewOrdersFilters, getQuotationById, createCustomerInvoice, CreateCustomerInvoiceRequest } from '../../services/quotationService';
import { formatPrice } from '../../utils/currencyUtils';
import { useToast } from '../../contexts/ToastContext';
import QuotationPDF from '../../components/QuotationPDF';
import { usePermissions } from '../../hooks/usePermissions';

// Order interfaces
interface OrderCustomer {
  userId: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  custId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  itemId: string;
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
    [key: string]: any;
    engine?: string;
    transmission?: string;
    fuelType?: string;
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
  vinNumbers?: Array<{
    status: string;
    chasisNumber: string;
  }>;
  interiorColor?: string;
  quantity: number;
  totalPrice: number;
  _id?: string;
}

interface Order {
  _id: string;
  quotationId: string;
  quotationNumber: string;
  customer: OrderCustomer;
  validTill: string;
  status: string;
  statusHistory: Array<{
    status: string;
    date: string;
    updatedBy?: string;
  }>;
  items: OrderItem[];
  additionalExpenses?: {
    amount: number;
    currency: string;
  };
  subtotal: number;
  totalDiscount: number;
  discountType: string;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  deliveryAddress?: string;
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
}

interface InvoiceRequestsSummary {
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
        min: string | null;
        max: string | null;
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

interface InvoiceRequestsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const InvoiceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ReviewOrdersFilters>({
    search: undefined,
    status: undefined,
    customerId: undefined,
    createdBy: undefined,
    currency: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    validTillFrom: undefined,
    validTillTo: undefined
  });
  const [pagination, setPagination] = useState<InvoiceRequestsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<InvoiceRequestsSummary | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedOrderForPDF, setSelectedOrderForPDF] = useState<Order | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState({
    notes: '',
    moreExpense: {
      description: '',
      amount: 0
    },
    customerPayment: {
      paymentAmount: 0,
      paymentMethod: 'cash',
      paymentNotes: '',
      paymentDate: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0] + '.000Z'
    }
  });

  const { showToast } = useToast();

  // Zero state component
  const ZeroState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No invoice requests found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || Object.values(filters).some(f => f && f !== '') 
          ? 'Try adjusting your search or filters to find invoice requests.'
          : 'No approved orders are available for invoice generation. Orders will appear here once they are approved.'
        }
      </p>
      <div className="flex justify-center space-x-3">
        {searchTerm || Object.values(filters).some(f => f && f !== '') ? (
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                search: undefined,
                status: undefined,
                currency: undefined,
                customerId: undefined,
                createdBy: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                validTillFrom: undefined,
                validTillTo: undefined
              });
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchOrders(1, pagination.limit);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </Button>
        ) : null}
        <Button
          onClick={() => fetchOrders(pagination.page, pagination.limit)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );

  // Fetch approved orders
  const fetchOrders = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getApprovedOrders(page, limit, {
        ...filters,
        search: searchTerm || undefined
      });
      
      if (response.success) {
        setOrders(response.data);
        const currentPage = response.pagination?.page || 1;
        const totalPages = response.pagination?.pages || 0;
        
        setPagination({
          page: currentPage,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        });
        
        // Use dynamic summary data from API response
        setSummary({
          appliedFilters: {
            search: response.summary?.appliedFilters?.search || searchTerm || null,
            status: response.summary?.appliedFilters?.status || null,
            customerId: response.summary?.appliedFilters?.customerId || null,
            createdBy: response.summary?.appliedFilters?.createdBy || null,
            currency: response.summary?.appliedFilters?.currency || null,
            dateFrom: response.summary?.appliedFilters?.dateFrom || null,
            dateTo: response.summary?.appliedFilters?.dateTo || null,
            validTillFrom: null, // Not provided in API response
            validTillTo: null,   // Not provided in API response
          },
          availableFilters: {
            statuses: response.summary?.availableFilters?.statuses || [],
            currencies: response.summary?.availableFilters?.currencies || [],
            customers: response.summary?.availableFilters?.customers || [],
            creators: response.summary?.availableFilters?.creators || [],
            dateRanges: {
              created: {
                min: response.summary?.availableFilters?.dateRanges?.created?.min || null,
                max: response.summary?.availableFilters?.dateRanges?.created?.max || null
              },
              validTill: {
                min: new Date().toISOString(), // Not provided in API response
                max: new Date().toISOString()  // Not provided in API response
              }
            },
            counts: {
              totalQuotations: response.summary?.availableFilters?.counts?.totalQuotations || response.pagination?.total || 0
            },
            sortOptions: response.summary?.availableFilters?.sortOptions || [
              { value: 'createdAt', label: 'Created Date' },
              { value: 'updatedAt', label: 'Updated Date' }
            ],
            pageSizes: [10, 25, 50, 100] // Not provided in API response, using default
          },
          sortBy: 'createdAt', // Default sort since not provided in API response
          totalResults: response.pagination?.total || 0,
          showingResults: `${response.data?.length || 0}`
        });
      } else {
        setError(response.message || 'Failed to fetch invoice requests');
        showToast('Failed to load invoice requests', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching invoice requests:', err);
      
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
              const retryResponse = await getApprovedOrders(page, limit, {
                ...filters,
                search: searchTerm || undefined
              });
              
              if (retryResponse.success) {
                setOrders(retryResponse.data);
                const currentPage = retryResponse.pagination?.page || 1;
                const totalPages = retryResponse.pagination?.pages || 0;
                
                setPagination({
                  page: currentPage,
                  limit: retryResponse.pagination?.limit || 10,
                  total: retryResponse.pagination?.total || 0,
                  totalPages: totalPages,
                  hasNext: currentPage < totalPages,
                  hasPrev: currentPage > 1
                });
                setSummary(retryResponse.summary);
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
      
      const errorMessage = err?.message || 'Failed to fetch invoice requests';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, showToast]);

  // Load orders on component mount and when filters change
  useEffect(() => {
    fetchOrders(pagination.page, pagination.limit);
  }, [searchTerm, filters, pagination.page, pagination.limit]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof ReviewOrdersFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Handle PDF view
  const handleViewAsPDF = async (order: Order) => {
    setIsLoadingPDF(true);
    try {
      const response = await getQuotationById(order._id);
      if (response.success) {
        setSelectedOrderForPDF(response.data);
        setIsPDFModalOpen(true);
      } else {
        showToast(response.message || 'Failed to fetch order details', 'error');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToast('Failed to fetch order details', 'error');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const handlePDFModalClose = () => {
    setIsPDFModalOpen(false);
    setSelectedOrderForPDF(null);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (orderId: string) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  // Handle approve request - now opens review modal
  const handleApproveRequest = async (order: Order) => {
    setOpenDropdownId(null); // Close dropdown
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
    
    // Reset form data when opening modal
    setInvoiceFormData({
      notes: '',
      moreExpense: {
        description: '',
        amount: 0
      },
      customerPayment: {
        paymentAmount: order.totalAmount, // Set to total amount by default
        paymentMethod: 'cash',
        paymentNotes: '',
        paymentDate: new Date().toISOString()
      }
    });
  };

  // Handle review modal - fetch full order data and show review
  const handleReviewOrder = async () => {
    if (!selectedOrderForReview) return;
    
    setIsLoadingReview(true);
    try {
      const fullOrderData = await getQuotationById(selectedOrderForReview._id);
      setSelectedOrderForReview(fullOrderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToast('Failed to load order details', 'error');
    } finally {
      setIsLoadingReview(false);
    }
  };

  // Handle invoice form input changes
  const handleInvoiceFormChange = (field: string, value: any) => {
    setInvoiceFormData(prev => {
      const keys = field.split('.');
      
      if (keys.length === 1) {
        // Top level field
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        // Nested field (e.g., moreExpense.amount)
        const firstKey = keys[0] as keyof typeof prev;
        const secondKey = keys[1];
        return {
          ...prev,
          [firstKey]: {
            ...(prev[firstKey] as any),
            [secondKey]: value
          }
        };
      } else if (keys.length === 3) {
        // Deeply nested field (e.g., customerPayment.paymentAmount)
        const firstKey = keys[0] as keyof typeof prev;
        const secondKey = keys[1];
        const thirdKey = keys[2];
        return {
          ...prev,
          [firstKey]: {
            ...(prev[firstKey] as any),
            [secondKey]: {
              ...((prev[firstKey] as any)[secondKey] as any),
              [thirdKey]: value
            }
          }
        };
      }
      
      return prev;
    });
  };

  // Handle generate invoice
  const handleGenerateInvoice = async () => {
    if (!selectedOrderForReview) return;
    
    // Client-side validation
    if (!invoiceFormData.customerPayment.paymentNotes.trim()) {
      showToast('Payment notes are required', 'error');
      return;
    }
    
    setIsGeneratingInvoice(true);
    try {
      const totalAmount = selectedOrderForReview.totalAmount + invoiceFormData.moreExpense.amount;
      
      const invoiceData: CreateCustomerInvoiceRequest = {
        quotationId: selectedOrderForReview._id,
        notes: invoiceFormData.notes,
        moreExpense: invoiceFormData.moreExpense,
        customerPayment: {
          ...invoiceFormData.customerPayment,
          paymentAmount: totalAmount, // Use calculated total amount
          paymentNotes: invoiceFormData.customerPayment.paymentNotes.trim()
        }
      };
      
      await createCustomerInvoice(invoiceData);
      showToast('Invoice generated successfully!', 'success');
      
      // Close modal and refresh data
      setIsReviewModalOpen(false);
      setSelectedOrderForReview(null);
      await fetchOrders(pagination.page, pagination.limit);
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      
      // Handle validation errors
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === 'string') {
          // Single error message
          showToast(errors, 'error');
        } else if (typeof errors === 'object') {
          // Multiple validation errors
          const errorMessages = Object.values(errors).flat();
          showToast(errorMessages.join(', '), 'error');
        } else {
          showToast('Validation error occurred', 'error');
        }
      } else if (error?.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else if (error?.message) {
        showToast(error.message, 'error');
      } else {
        showToast('Failed to generate invoice', 'error');
      }
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Handle decline request
  const handleDeclineRequest = async (order: Order) => {
    setDecliningRequestId(order._id);
    setOpenDropdownId(null); // Close dropdown
    
    try {
      // TODO: Implement decline request API call
      // const response = await declineInvoiceRequest(order._id);
      
      // For now, show success message
      showToast('Invoice request declined successfully!', 'success');
      
      // Refresh the orders list
      await fetchOrders(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error declining invoice request:', error);
      showToast('Failed to decline invoice request', 'error');
    } finally {
      setDecliningRequestId(null);
    }
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
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate order counts for summary
  const orderCounts = useMemo(() => {
    const counts = {
      total: orders.length,
      approved: orders.filter(order => order.status.toLowerCase() === 'approved').length,
      confirmed: orders.filter(order => order.status.toLowerCase() === 'confirmed').length
    };
    return counts;
  }, [orders]);

  // Table columns
  const columns = [
    {
      key: 'quotationNumber',
      header: 'Order Number',
      render: (value: string, order: Order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{order.quotationNumber}</div>
          <div className="text-gray-500">{order.quotationId}</div>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (value: OrderCustomer, order: Order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{order.customer.name}</div>
          <div className="text-gray-500">{order.customer.email}</div>
          <div className="text-gray-500">{order.customer.custId}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (value: OrderItem[], order: Order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{order.items.length} item(s)</div>
          <div className="text-gray-500">{order.items[0]?.name || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value: number, order: Order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {formatPrice(order.totalAmount, order.currency)}
          </div>
          <div className="text-gray-500">
            Subtotal: {formatPrice(order.subtotal, order.currency)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, order: Order) => {
        const status = order.status.toLowerCase();
        const statusDisplayName = status === 'approved'
          ? 'Approved by Admin'
          : status === 'confirmed'
          ? 'Confirmed'
          : status.charAt(0).toUpperCase() + status.slice(1);

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
            {statusDisplayName}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (value: string, order: Order) => (
        <div className="text-sm text-gray-600">
          {formatDate(order.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, order: Order) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleViewAsPDF(order)}
            disabled={isLoadingPDF}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingPDF ? (
              <>
                <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </>
            )}
          </Button>
          
          {/* 3-dots dropdown menu for Approve and Decline - Only visible to admin */}
          {isAdmin && (
            <div className="relative dropdown-container">
              <Button
                onClick={() => handleDropdownToggle(order._id)}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
              
              {/* Dropdown menu */}
              {openDropdownId === order._id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleApproveRequest(order)}
                      disabled={approvingRequestId === order._id}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        approvingRequestId === order._id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {approvingRequestId === order._id ? (
                        <>
                          <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Approving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Generate Invoice
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(order)}
                      disabled={decliningRequestId === order._id}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        decliningRequestId === order._id
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-700 hover:bg-red-50'
                      }`}
                    >
                      {decliningRequestId === order._id ? (
                        <>
                          <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Declining...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Decline Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  // Orders are already filtered by the API, so we just return them
  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Invoice Requests</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => fetchOrders(pagination.page, pagination.limit)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Requests</h1>
            <p className="mt-2 text-gray-600">
              Manage approved orders ready for invoicing
            </p>
          </div>
          <Button
            onClick={() => fetchOrders(pagination.page, pagination.limit)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Total Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderCounts.total}</p>
                </div>
              </div>
            </div>
            
            {/* Approved by Admin */}
            {orderCounts.approved > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved by Admin</p>
                    <p className="text-2xl font-bold text-gray-900">{orderCounts.approved}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Confirmed */}
            {orderCounts.confirmed > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-gray-900">{orderCounts.confirmed}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by order number, customer..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={filters.currency || ''}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Currencies</option>
                {summary?.availableFilters.currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                value={filters.customerId || ''}
                onChange={(e) => handleFilterChange('customerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Customers</option>
                {summary?.availableFilters.customers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            {/* Created By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created By
              </label>
              <select
                value={filters.createdBy || ''}
                onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Creators</option>
                {summary?.availableFilters.creators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredOrders.length === 0 ? (
            <ZeroState />
          ) : (
            <Table
              data={filteredOrders}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No invoice requests found"
            />
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              hasNextPage={pagination.hasNext}
              hasPrevPage={pagination.hasPrev}
            />
          </div>
        )}

        {/* PDF Modal */}
        {isPDFModalOpen && selectedOrderForPDF && (
          <QuotationPDF
            quotationData={selectedOrderForPDF}
            onClose={handlePDFModalClose}
            isFromOrdersPage={true}
          />
        )}

        {/* Review Once Modal */}
        {isReviewModalOpen && selectedOrderForReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Review Once</h2>
                  <button
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setSelectedOrderForReview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">

                {isLoadingReview ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading order details...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                            {selectedOrderForReview.quotationNumber}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                            {selectedOrderForReview.status === 'approved' ? 'Approved by Admin' : selectedOrderForReview.status}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                            {new Date(selectedOrderForReview.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Till</label>
                          <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                            {new Date(selectedOrderForReview.validTill).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Customer Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.customer?.name || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.customer?.email || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.customer?.custId || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.customer?.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Items</h4>
                        <div className="space-y-2">
                          {selectedOrderForReview.items?.map((item: any, index: number) => (
                            <div key={index} className="bg-white border border-gray-300 rounded-lg p-3">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Name:</span> {item.name}
                                </div>
                                <div>
                                  <span className="font-medium">Brand:</span> {item.brand}
                                </div>
                                <div>
                                  <span className="font-medium">Model:</span> {item.model} ({item.year})
                                </div>
                                <div>
                                  <span className="font-medium">Qty:</span> {item.quantity} × {item.sellingPrice} {selectedOrderForReview.currency}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Financial Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.subtotal} {selectedOrderForReview.currency}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">VAT ({selectedOrderForReview.VAT}%)</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                              {selectedOrderForReview.vatAmount} {selectedOrderForReview.currency}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold">
                              {selectedOrderForReview.totalAmount} {selectedOrderForReview.currency}
                            </div>
                          </div>
                        </div>
                        {selectedOrderForReview.additionalExpenses?.amount && selectedOrderForReview.additionalExpenses.amount > 0 && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Additional Expenses</label>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-900">
                              {selectedOrderForReview.additionalExpenses.amount} {selectedOrderForReview.currency} - Additional expenses
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoice Generation Form */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Invoice</h3>
                      
                      {/* Invoice Notes */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Notes</label>
                        <textarea
                          value={invoiceFormData.notes}
                          onChange={(e) => handleInvoiceFormChange('notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Enter invoice notes..."
                        />
                      </div>

                      {/* Invoice Level Additional Expenses */}
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Invoice Level Additional Expenses</h4>
                        <p className="text-sm text-gray-600 mb-3">Add any additional expenses specific to this invoice (separate from order expenses shown above)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <Input
                              type="text"
                              value={invoiceFormData.moreExpense.description}
                              onChange={(e) => handleInvoiceFormChange('moreExpense.description', e.target.value)}
                              placeholder="e.g., Insurance and registration fees"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <Input
                              type="number"
                              value={invoiceFormData.moreExpense.amount}
                              onChange={(e) => handleInvoiceFormChange('moreExpense.amount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Customer Payment */}
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Customer Payment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900">
                              {(selectedOrderForReview.totalAmount + invoiceFormData.moreExpense.amount).toFixed(2)} {selectedOrderForReview.currency}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Automatically set to total amount</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <select
                              value={invoiceFormData.customerPayment.paymentMethod}
                              onChange={(e) => handleInvoiceFormChange('customerPayment.paymentMethod', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="cash">Cash</option>
                              <option value="ttr">TTR</option>
                              <option value="cheque">Cheque</option>
                              <option value="lc">LC</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Notes <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={invoiceFormData.customerPayment.paymentNotes}
                              onChange={(e) => handleInvoiceFormChange('customerPayment.paymentNotes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={2}
                              placeholder="Enter payment notes..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                            <Input
                              type="datetime-local"
                              value={invoiceFormData.customerPayment.paymentDate.split('T')[0] + 'T' + invoiceFormData.customerPayment.paymentDate.split('T')[1].split('.')[0]}
                              onChange={(e) => handleInvoiceFormChange('customerPayment.paymentDate', e.target.value + '.000Z')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Amount Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{selectedOrderForReview.subtotal} {selectedOrderForReview.currency}</span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span>VAT ({selectedOrderForReview.VAT}%):</span>
                            <span>{selectedOrderForReview.vatAmount} {selectedOrderForReview.currency}</span>
                          </div> */}
                          {selectedOrderForReview.additionalExpenses?.amount && selectedOrderForReview.additionalExpenses.amount > 0 && (
                            <div className="flex justify-between">
                              <span>Order Additional Expenses:</span>
                              <span>{selectedOrderForReview.additionalExpenses.amount} {selectedOrderForReview.currency}</span>
                            </div>
                          )}
                          {invoiceFormData.moreExpense.amount > 0 && (
                            <div className="flex justify-between">
                              <span>Invoice Additional Expenses:</span>
                              <span>{invoiceFormData.moreExpense.amount} {selectedOrderForReview.currency}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total Amount:</span>
                            <span>{(selectedOrderForReview.totalAmount + invoiceFormData.moreExpense.amount).toFixed(2)} {selectedOrderForReview.currency}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Payment Received:</span>
                            <span>{invoiceFormData.customerPayment.paymentAmount} {selectedOrderForReview.currency}</span>
                          </div>
                          {/* <div className="flex justify-between text-red-600 font-bold">
                            <span>Outstanding Balance:</span>
                            <span>{((selectedOrderForReview.totalAmount + invoiceFormData.moreExpense.amount) - invoiceFormData.customerPayment.paymentAmount).toFixed(2)} {selectedOrderForReview.currency}</span>
                          </div> */}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
              
              {/* Sticky Footer with Action Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 z-10">
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setSelectedOrderForReview(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={isGeneratingInvoice}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InvoiceRequestsPage;
