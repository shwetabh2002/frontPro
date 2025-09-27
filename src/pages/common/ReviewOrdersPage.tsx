import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import { getReviewOrders, ReviewOrdersResponse, ReviewOrdersFilters, approveOrder, rejectOrder, getQuotationById, updateQuotationDiscount } from '../../services/quotationService';
import { formatPrice } from '../../utils/currencyUtils';
import { useToast } from '../../contexts/ToastContext';
import QuotationPDF from '../../components/QuotationPDF';
import { SUCCESS_MESSAGES } from '../../constants';

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
  specifications: any;
  sellingPrice: number;
  condition: string;
  status: string;
  tags?: string[];
  vinNumbers: Array<{
    status: string;
    chasisNumber: string;
  }>;
  interiorColor: string;
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
    expenceType?: string;
    description?: string;
    amount?: number;
    currency?: string;
  };
  subtotal: number;
  totalDiscount: number;
  discount?: number;
  discountType?: string;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  deliveryAddress?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  updatedBy: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  VAT: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrdersSummary {
  totalOrders: number;
  underReview: number;
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

const ReviewOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [filters, setFilters] = useState<ReviewOrdersFilters>({
    search: '',
    status: '',
    currency: '',
    customerId: '',
    createdBy: '',
    dateFrom: '',
    dateTo: '',
    validTillFrom: '',
    validTillTo: '',
    sortBy: '-createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedOrderForPDF, setSelectedOrderForPDF] = useState<Order | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState({
    discount: 0,
    discountType: 'percentage'
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();

  // Fetch review orders from API
  const fetchOrders = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getReviewOrders(page, limit, {
        ...filters,
        search: searchTerm || undefined,
        page,
        limit
      });

      if (response.success) {
        setOrders(response.data as Order[]);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.pages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev
        });
        
        setSummary({
          totalOrders: response.summary.totalResults,
          underReview: response.summary.totalResults,
          availableFilters: response.summary.availableFilters,
          sortBy: response.summary.sortBy,
          totalResults: response.summary.totalResults,
          showingResults: response.summary.showingResults
        });
      } else {
        setError(response.message || 'Failed to fetch review orders');
        showToast('Failed to load review orders', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching review orders:', err);
      const errorMessage = err?.message || 'Failed to fetch review orders';
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
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      currency: '',
      customerId: '',
      createdBy: '',
      dateFrom: '',
      dateTo: '',
      validTillFrom: '',
      validTillTo: '',
      sortBy: '-createdAt'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle View as PDF
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

  // Handle PDF modal close
  const handlePDFModalClose = () => {
    setIsPDFModalOpen(false);
    setSelectedOrderForPDF(null);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (orderId: string) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  // Handle Approve order
  const handleApproveOrder = async (order: Order) => {
    setApprovingOrderId(order._id);
    setOpenDropdownId(null); // Close dropdown
    
    try {
      const response = await approveOrder(order._id);
      
      if (response.success) {
        showToast(SUCCESS_MESSAGES.QUOTATION.APPROVED, 'success');
        
        // Refresh the orders list to reflect the status change
        await fetchOrders(pagination.page, pagination.limit);
      } else {
        throw new Error(response.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already approved')) {
          showToast('This order has already been approved', 'warning');
        } else if (error.message.includes('not found')) {
          showToast('Order not found', 'error');
        } else {
          showToast(error.message || 'Failed to approve order', 'error');
        }
      } else {
        showToast('Failed to approve order', 'error');
      }
    } finally {
      setApprovingOrderId(null);
    }
  };

  // Handle Reject order
  const handleRejectOrder = async (order: Order) => {
    setRejectingOrderId(order._id);
    setOpenDropdownId(null); // Close dropdown
    
    try {
      const response = await rejectOrder(order._id);
      
      if (response.success) {
        showToast(SUCCESS_MESSAGES.QUOTATION.ORDER_REJECTED, 'success');
        
        // Refresh the orders list to reflect the status change
        await fetchOrders(pagination.page, pagination.limit);
      } else {
        throw new Error(response.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('already rejected')) {
          showToast('This order has already been rejected', 'warning');
        } else if (error.message.includes('not found')) {
          showToast('Order not found', 'error');
        } else {
          showToast(error.message || 'Failed to reject order', 'error');
        }
      } else {
        showToast('Failed to reject order', 'error');
      }
    } finally {
      setRejectingOrderId(null);
    }
  };

  // Handle edit order
  const handleEditOrder = async (order: Order) => {
    setIsLoadingPDF(true); // Reuse loading state
    try {
      const response = await getQuotationById(order._id);
      if (response.success) {
        setSelectedOrderForEdit(response.data);
        setEditFormData({
          discount: response.data.discount || order.discount || 0,
          discountType: response.data.discountType || order.discountType || 'percentage'
        });
        setIsEditModalOpen(true);
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

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
    setEditFormData({
      discount: 0,
      discountType: 'percentage'
    });
  };

  // Handle form input change
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle update discount
  const handleUpdateDiscount = async () => {
    if (!selectedOrderForEdit) return;

    setIsUpdating(true);
    try {
      const response = await updateQuotationDiscount(selectedOrderForEdit._id, editFormData);
      
      if (response && response.success === true) {
        showToast('Discount updated successfully!', 'success');
        handleEditModalClose();
        // Refresh the orders list
        await fetchOrders(pagination.page, pagination.limit);
      } else {
        showToast(response?.message || 'Failed to update discount', 'error');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      if (error instanceof Error) {
        showToast(error.message || 'Failed to update discount', 'error');
      } else {
        showToast('Failed to update discount', 'error');
      }
    } finally {
      setIsUpdating(false);
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

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  // Table columns configuration
  const columns = [
    {
      key: 'quotationNumber',
      header: 'Order Number',
      render: (value: string, order: Order) => (
        <div className="font-medium text-gray-900">{order.quotationNumber}</div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (value: OrderCustomer, order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{order.customer.name}</div>
          <div className="text-sm text-gray-500">{order.customer.email}</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value: number, order: Order) => (
        <div className="font-medium text-gray-900">
          {formatPrice(order.totalAmount, order.currency)}
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (value: OrderItem[], order: Order) => (
        <div className="text-sm text-gray-600">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, order: Order) => {
        const status = order.status.toLowerCase();
        const statusDisplayName = status === 'review' 
          ? 'Under Review' 
          : status === 'approved'
          ? 'Approved by Admin'
          : status === 'rejected'
          ? 'Rejected'
          : status === 'accepted'
          ? 'Customer Accepted'
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
      render: (value: any, order: Order) => {
        const status = order.status.toLowerCase();
        
        return (
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
            
            {/* Edit button only for review status */}
            {status === 'review' && (
              <Button
                onClick={() => handleEditOrder(order)}
                disabled={isLoadingPDF}
                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </>
                )}
              </Button>
            )}
            
            {/* 3-dots dropdown menu only for review status */}
            {status === 'review' && (
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
                        onClick={() => handleApproveOrder(order)}
                        disabled={approvingOrderId === order._id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          approvingOrderId === order._id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {approvingOrderId === order._id ? (
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
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order)}
                        disabled={rejectingOrderId === order._id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          rejectingOrderId === order._id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {rejectingOrderId === order._id ? (
                          <>
                            <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    },
  ];

  // Orders are already filtered by the API, so we just return them
  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  // Calculate dynamic counts from orders data
  const orderCounts = useMemo(() => {
    const counts = {
      total: orders.length,
      underReview: orders.filter(order => order.status.toLowerCase() === 'review').length,
      approved: orders.filter(order => order.status.toLowerCase() === 'approved').length,
      rejected: orders.filter(order => order.status.toLowerCase() === 'rejected').length,
      confirmed: orders.filter(order => order.status.toLowerCase() === 'confirmed').length,
      accepted: orders.filter(order => order.status.toLowerCase() === 'accepted').length
    };
    return counts;
  }, [orders]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => fetchOrders(pagination.page, pagination.limit)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Orders</h1>
              <p className="text-sm text-gray-600">Manage orders that are under review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          
          {/* Under Review */}
          {orderCounts.underReview > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{orderCounts.underReview}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Approved */}
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
          
          {/* Rejected */}
          {orderCounts.rejected > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{orderCounts.rejected}</p>
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
          
          {/* Customer Accepted */}
          {orderCounts.accepted > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{orderCounts.accepted}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </Button>
            
            {Object.values(filters).some(filter => filter) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && summary && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  {summary.availableFilters.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={filters.currency || ''}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  value={filters.customerId || ''}
                  onChange={(e) => handleFilterChange('customerId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Customers</option>
                  {summary.availableFilters.customers.map((customer) => (
                    <option key={customer} value={customer}>
                      {customer}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                <select
                  value={filters.createdBy || ''}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy || '-createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {summary.availableFilters.sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table
          data={filteredOrders}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No orders under review found"
        />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
              hasNextPage={pagination.hasNext}
              hasPrevPage={pagination.hasPrev}
            />
          </div>
        )}
      </div>

      {/* PDF Generation Modal */}
      {isPDFModalOpen && selectedOrderForPDF && (
        <QuotationPDF
          quotationData={selectedOrderForPDF}
          onClose={handlePDFModalClose}
          isFromOrdersPage={true}
        />
      )}

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrderForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Edit Order</h3>
                <p className="text-blue-100 text-sm mt-1">#{selectedOrderForEdit.quotationNumber}</p>
              </div>
              <button
                onClick={handleEditModalClose}
                className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-blue-600 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
                {/* Left Column - Order Overview */}
                <div className="bg-gray-50 p-6 border-r border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Order Overview
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-2">Customer</h5>
                      <p className="text-sm text-gray-900 font-medium">{selectedOrderForEdit.customer?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{selectedOrderForEdit.customer?.email || ''}</p>
                      <p className="text-xs text-gray-600">{selectedOrderForEdit.customer?.phone || ''}</p>
                    </div>

                    {/* Status & Dates */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-800">Status</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrderForEdit.status === 'review' ? 'bg-blue-100 text-blue-800' :
                          selectedOrderForEdit.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedOrderForEdit.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedOrderForEdit.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-600">
                        <div><span className="font-medium">Created:</span> {formatDate(selectedOrderForEdit.createdAt)}</div>
                        <div><span className="font-medium">Valid Till:</span> {formatDate(selectedOrderForEdit.validTill)}</div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-3">Financial Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatPrice(selectedOrderForEdit.subtotal, selectedOrderForEdit.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-red-600">-{formatPrice(selectedOrderForEdit.totalDiscount, selectedOrderForEdit.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VAT:</span>
                          <span className="font-medium">{formatPrice(selectedOrderForEdit.vatAmount, selectedOrderForEdit.currency)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-lg text-blue-600">{formatPrice(selectedOrderForEdit.totalAmount, selectedOrderForEdit.currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Items */}
                <div className="p-6 border-r border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Items ({selectedOrderForEdit.items?.length || 0})
                  </h4>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedOrderForEdit.items?.map((item: any, index: number) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium text-gray-900 text-sm">{item.name}</h6>
                          <span className="text-sm font-semibold text-green-600">
                            {formatPrice(item.sellingPrice, selectedOrderForEdit.currency)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div><span className="font-medium">Type:</span> {item.type}</div>
                          <div><span className="font-medium">Brand:</span> {item.brand} {item.model} ({item.year})</div>
                          <div><span className="font-medium">Color:</span> {item.color}</div>
                          <div><span className="font-medium">SKU:</span> {item.sku}</div>
                          {item.vinNumbers && item.vinNumbers.length > 0 && (
                            <div><span className="font-medium">VIN:</span> {item.vinNumbers.map((vin: any) => vin.chasisNumber).join(', ')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Edit Form */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Discount
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                      <select
                        value={editFormData.discountType}
                        onChange={(e) => handleEditFormChange('discountType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount {editFormData.discountType === 'percentage' ? '(%)' : 'Amount'}
                      </label>
                      <Input
                        type="number"
                        value={editFormData.discount}
                        onChange={(e) => handleEditFormChange('discount', parseFloat(e.target.value) || 0)}
                        placeholder={`Enter discount ${editFormData.discountType === 'percentage' ? 'percentage' : 'amount'}`}
                        min="0"
                        step={editFormData.discountType === 'percentage' ? '0.01' : '0.01'}
                        className="w-full"
                      />
                    </div>

                    {/* Preview Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="text-sm font-semibold text-blue-800 mb-3">Discount Preview</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Original Amount:</span>
                          <span className="font-medium">{formatPrice(selectedOrderForEdit.totalAmount, selectedOrderForEdit.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Discount:</span>
                          <span className="font-medium text-red-600">
                            {editFormData.discountType === 'percentage' 
                              ? `${editFormData.discount}%` 
                              : formatPrice(editFormData.discount, selectedOrderForEdit.currency)
                            }
                          </span>
                        </div>
                        <div className="border-t border-blue-200 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-blue-800">Final Amount:</span>
                            <span className="text-lg text-blue-900">
                              {formatPrice(
                                editFormData.discountType === 'percentage' 
                                  ? selectedOrderForEdit.totalAmount * (1 - editFormData.discount / 100)
                                  : selectedOrderForEdit.totalAmount - editFormData.discount,
                                selectedOrderForEdit.currency
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleUpdateDiscount}
                        disabled={isUpdating}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Discount'
                        )}
                      </Button>
                      <Button
                        onClick={handleEditModalClose}
                        className="w-full bg-gray-300 text-gray-700 hover:bg-gray-400 py-3 font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewOrdersPage;
