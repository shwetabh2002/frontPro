import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import EditOrderModal from '../../components/EditOrderModal';
import QuotationPDF from '../../components/QuotationPDF';
import CustomerSelectionModal from '../../components/CustomerSelectionModal';
import CustomerModal from '../../components/CustomerModal';
import { getAcceptedOrders, getQuotationById, sendOrderForReview, deleteQuotation } from '../../services/quotationService';
import { formatPrice } from '../../utils/currencyUtils';
import { useToast } from '../../contexts/ToastContext';
import { SUCCESS_MESSAGES, QUOTATION_STATUS } from '../../constants';
import ConfirmationModal from '../../components/ConfirmationModal';
import { type Customer } from '../../services/customerService';

// Order interfaces
interface OrderCustomer {
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
    expenceType?: string;
    description?: string;
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
  __v: number;
  id?: string;
}

interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrdersSummary {
  appliedFilters: {
    search: string | null;
    status: string | null;
    customerId: string | null;
    createdBy: string | null;
    currency: string | null;
    dateFrom: string | null;
    dateTo: string | null;
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
    };
    counts: {
      totalQuotations: number;
      statusCounts: {
        [key: string]: number;
      };
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


const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
    customerId: '',
    createdBy: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedOrderForPDF, setSelectedOrderForPDF] = useState<any>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [sendingForReviewId, setSendingForReviewId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Quotation creation states
  const [isCustomerSelectionModalOpen, setIsCustomerSelectionModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { showToast } = useToast();

  // Zero state component
  const ZeroState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || Object.values(filters).some(f => f) 
          ? 'Try adjusting your search or filters to find orders.'
          : 'No orders have been created yet. Orders will appear here once they are created.'
        }
      </p>
      <div className="flex justify-center space-x-3">
        {searchTerm || Object.values(filters).some(f => f) ? (
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                status: '',
                currency: '',
                customerId: '',
                createdBy: '',
                dateFrom: '',
                dateTo: ''
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

  // Fetch orders from API
  const fetchOrders = async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAcceptedOrders(page, limit);
      
      if (response.success) {
        setOrders(response.data);
        setPagination(response.pagination);
        
        // Calculate status counts from the orders data
        const statusCounts: { [key: string]: number } = {};
        response.data.forEach((order: Order) => {
          const status = order.status.toLowerCase();
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Update summary with calculated status counts
        const updatedSummary: OrdersSummary = {
          ...response.summary,
          availableFilters: {
            ...response.summary.availableFilters,
            counts: {
              totalQuotations: response.summary.totalResults,
              statusCounts: (response.summary.availableFilters.counts as any)?.statusCounts || {}
            }
          }
        };
        
        setSummary(updatedSummary as any);
        setError(null);
      } else {
        const errorMsg = response.message || 'Failed to fetch orders';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        console.error('API returned error:', response);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      
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
              const retryResponse = await getAcceptedOrders(page, limit);
              if (retryResponse.success) {
                setOrders(retryResponse.data);
                setPagination({
                  page: retryResponse.pagination.page,
                  limit: retryResponse.pagination.limit,
                  total: retryResponse.pagination.total,
                  pages: retryResponse.pagination.pages,
                  hasNext: retryResponse.pagination.hasNext,
                  hasPrev: retryResponse.pagination.hasPrev
                });
                setSummary(retryResponse.summary as any);
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
      
      let errorMessage = 'Failed to fetch orders';
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error') || err.message.includes('fetch')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to view orders.';
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

  // Filter orders based on search term and filters using useMemo
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(order => 
        order.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.custId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.model.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply currency filter
    if (filters.currency) {
      filtered = filtered.filter(order => order.currency === filters.currency);
    }

    // Apply customer filter
    if (filters.customerId) {
      filtered = filtered.filter(order => order.customer.custId === filters.customerId);
    }

    // Apply created by filter
    if (filters.createdBy) {
      filtered = filtered.filter(order => order.createdBy.name === filters.createdBy);
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.createdAt) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }, [searchTerm, filters, orders]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
      dateTo: ''
    });
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '') || searchTerm.trim() !== '';
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    setSelectedOrderForEdit(order);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
  };

  const handleEditSuccess = () => {
    // Refresh the orders list after successful edit
    fetchOrders(pagination.page, pagination.limit);
  };

  // Handle quotation creation flow
  const handleCreateQuotation = () => {
    setIsCustomerSelectionModalOpen(true);
  };

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerSelectionModalOpen(false);
    setIsQuotationModalOpen(true);
  };

  const handleQuotationModalClose = () => {
    setIsQuotationModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleQuotationCreated = () => {
    // Refresh the orders list after successful quotation creation
    fetchOrders(pagination.page, pagination.limit);
    showToast('Orders page refreshed to show new quotation', 'success');
  };

  // Handle dropdown toggle
  const handleDropdownToggle = (orderId: string) => {
    setOpenDropdownId(openDropdownId === orderId ? null : orderId);
  };

  // Handle send for review / reapproval
  const handleSendForReview = async (order: Order) => {
    setOpenDropdownId(null);
    setSendingForReviewId(order._id);
    
    const isRejected = order.status.toLowerCase() === 'rejected';
    
    try {
      await sendOrderForReview(order._id);
      showToast(
        isRejected 
          ? 'Order sent for reapproval successfully' 
          : SUCCESS_MESSAGES.QUOTATION.SENT_FOR_REVIEW, 
        'success'
      );
      
      // Refresh the orders list to get updated status
      await fetchOrders(pagination.page, pagination.limit);
    } catch (error: any) {
      console.error('Error sending order for review/reapproval:', error);
      showToast(
        error?.message || (isRejected ? 'Failed to send order for reapproval' : 'Failed to send order for review'),
        'error'
      );
    } finally {
      setSendingForReviewId(null);
    }
  };

  // Handle view as PDF
  const handleViewAsPDF = async (order: Order) => {
    setOpenDropdownId(null);
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

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteQuotation(orderToDelete._id);
      showToast(`Order ${orderToDelete.quotationNumber} deleted successfully`, 'success');
      
      // Refresh the orders list
      await fetchOrders(pagination.page, pagination.limit);
      
      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Failed to delete order. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  // Handle pagination
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
    // Fetch orders for the new page
    fetchOrders(page, pagination.limit);
  };

  // Format date helper
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
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
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
        <div className="font-medium text-gray-900">
          {order.quotationNumber}
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (value: any, order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{order.customer.name}</div>
          <div className="text-sm text-gray-500">{order.customer.custId}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (value: any, order: Order) => (
        <div>
          {order.items.map((item, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium">{item.name}</div>
              <div className="text-gray-500">{item.brand} {item.model} ({item.year})</div>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (value: number, order: Order) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatPrice(order.totalAmount, order.currency)}
          </div>
          <div className="text-sm text-gray-500">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, order: Order) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
          {order.status.toLowerCase() === 'accepted' 
            ? 'Customer Accepted' 
            : order.status.toLowerCase() === 'review'
            ? 'Under Review'
            : order.status.toLowerCase() === 'approved'
            ? 'Approved by Admin'
            : order.status.toLowerCase() === 'confirmed'
            ? 'Confirmed'
            : order.status.charAt(0).toUpperCase() + order.status.slice(1)
          }
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Order Date',
      render: (value: string, order: Order) => (
        <div className="text-sm text-gray-900">
          {formatDate(order.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, order: Order) => {
        const status = order.status.toLowerCase();
        
        // Actions for accepted, booked, and rejected status (Edit + Send for Review/Reapproval + PDF)
        if (status === 'accepted' || status === 'booked' || status === 'rejected') {
          const isRejected = status === 'rejected';
          
          return (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleEditOrder(order)}
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              
              {/* 3-dots dropdown menu for Send for Review/Reapproval and PDF actions */}
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
                        onClick={() => handleSendForReview(order)}
                        disabled={sendingForReviewId === order._id}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          sendingForReviewId === order._id
                            ? 'text-gray-400 cursor-not-allowed'
                            : isRejected
                            ? 'text-orange-700 hover:bg-orange-50'
                            : 'text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {sendingForReviewId === order._id ? (
                          <>
                            <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isRejected ? 'Sending for Reapproval...' : 'Sending...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isRejected ? 'Send for Reapproval' : 'Send for Review'}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewAsPDF(order)}
                        disabled={isLoadingPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingPDF ? (
                          <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                        {isLoadingPDF ? 'Loading...' : 'View as PDF'}
                      </button>
                      
                      {/* Delete option - only for rejected orders */}
                      {isRejected && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Actions for all other statuses (PDF only)
        return (
          <div className="flex items-center space-x-2">
            {/* 3-dots dropdown menu for PDF actions */}
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
                      onClick={() => handleViewAsPDF(order)}
                      disabled={isLoadingPDF}
                      className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingPDF ? (
                        <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                      {isLoadingPDF ? 'Loading...' : 'View as PDF'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchOrders()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
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
            <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
            <p className="mt-2 text-gray-600">
              View and manage all accepted quotations (sales orders)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleCreateQuotation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Order</span>
            </Button>
            <Button
              onClick={() => fetchOrders()}
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search orders by number, customer name, email, or status..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {status.toLowerCase() === 'accepted' 
                          ? 'Customer Accepted' 
                          : status.toLowerCase() === 'review'
                          ? 'Under Review'
                          : status.toLowerCase() === 'approved'
                          ? 'Approved by Admin'
                          : status.charAt(0).toUpperCase() + status.slice(1)
                        }
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
              </div>
            </div>
          )}
      </div>

      {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredOrders.length === 0 ? (
            <ZeroState />
          ) : (
            <Table
              data={filteredOrders}
              columns={columns}
              emptyMessage="No orders found"
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
                fetchOrders(1, itemsPerPage);
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
            
            {/* Total Orders */}
            <div className="mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{summary.totalResults}</div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
            </div>

            {/* Status Counts */}
            <div className={`grid gap-4 ${
              summary.availableFilters.statuses.length === 1 ? 'grid-cols-1' :
              summary.availableFilters.statuses.length === 2 ? 'grid-cols-2' :
              summary.availableFilters.statuses.length === 3 ? 'grid-cols-3' :
              summary.availableFilters.statuses.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
              summary.availableFilters.statuses.length === 5 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
            }`}>
              {summary.availableFilters.statuses.map((status) => {
                const count = summary.availableFilters.counts?.statusCounts?.[status] || 0;
                const statusDisplayName = status.toLowerCase() === 'accepted' 
                  ? 'Customer Accepted' 
                  : status.toLowerCase() === 'review'
                  ? 'Under Review'
                  : status.toLowerCase() === 'approved'
                  ? 'Approved by Admin'
                  : status.toLowerCase() === 'confirmed'
                  ? 'Confirmed'
                  : status.toLowerCase() === 'rejected'
                  ? 'Rejected'
                  : status.charAt(0).toUpperCase() + status.slice(1);

                const statusColor = status.toLowerCase() === 'accepted' 
                  ? 'text-green-600' 
                  : status.toLowerCase() === 'review'
                  ? 'text-blue-600'
                  : status.toLowerCase() === 'approved'
                  ? 'text-purple-600'
                  : status.toLowerCase() === 'confirmed'
                  ? 'text-indigo-600'
                  : status.toLowerCase() === 'rejected'
                  ? 'text-red-600'
                  : 'text-gray-600';

                return (
                  <div key={status} className="text-center">
                    <div className={`text-2xl font-bold ${statusColor}`}>{count}</div>
                    <div className="text-sm text-gray-500">{statusDisplayName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {isEditModalOpen && selectedOrderForEdit && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          orderData={selectedOrderForEdit}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* PDF Generation Modal */}
      {isPDFModalOpen && selectedOrderForPDF && (
        <QuotationPDF
          quotationData={selectedOrderForPDF}
          onClose={handlePDFModalClose}
          isFromOrdersPage={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order ${orderToDelete?.quotationNumber}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={isCustomerSelectionModalOpen}
        onClose={() => setIsCustomerSelectionModalOpen(false)}
        onCustomerSelected={handleCustomerSelected}
      />

      {/* Quotation Creation Modal */}
      {isQuotationModalOpen && selectedCustomer && (
        <CustomerModal
          isOpen={isQuotationModalOpen}
          onClose={handleQuotationModalClose}
          prePopulatedData={selectedCustomer}
          mode="quotation"
          allowCustomerCreation={false}
          showBookingAmount={true}
          quotationStatus="booked"
          onQuotationCreated={handleQuotationCreated}
        />
      )}
    </div>
  );
};

export default OrdersPage;