import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/Pagination';
import { getApprovedOrders, ReviewOrdersFilters, getQuotationById } from '../../services/quotationService';
import { formatPrice } from '../../utils/currencyUtils';
import { useToast } from '../../contexts/ToastContext';
import QuotationPDF from '../../components/QuotationPDF';

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
    status: string[] | null;
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

interface InvoiceRequestsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const InvoiceRequestsPage: React.FC = () => {
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

  const { showToast } = useToast();

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
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.pages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev
        });
        
        setSummary({
          appliedFilters: {
            ...response.summary.appliedFilters,
            status: Array.isArray(response.summary.appliedFilters.status) 
              ? response.summary.appliedFilters.status 
              : response.summary.appliedFilters.status
          },
          availableFilters: response.summary.availableFilters,
          sortBy: response.summary.sortBy,
          totalResults: response.summary.totalResults,
          showingResults: response.summary.showingResults
        });
      } else {
        setError(response.message || 'Failed to fetch invoice requests');
        showToast('Failed to load invoice requests', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching invoice requests:', err);
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

  // Handle approve request
  const handleApproveRequest = async (order: Order) => {
    setApprovingRequestId(order._id);
    setOpenDropdownId(null); // Close dropdown
    
    try {
      // TODO: Implement approve request API call
      // const response = await approveInvoiceRequest(order._id);
      
      // For now, show success message
      showToast('Invoice request approved successfully!', 'success');
      
      // Refresh the orders list
      await fetchOrders(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error approving invoice request:', error);
      showToast('Failed to approve invoice request', 'error');
    } finally {
      setApprovingRequestId(null);
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
          
          {/* 3-dots dropdown menu for Approve and Decline */}
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
                        Approve Request
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Requests</h1>
          <p className="mt-2 text-gray-600">
            Manage approved orders ready for invoicing
          </p>
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
          <Table
            data={filteredOrders}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No invoice requests found"
          />
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
      </div>
    </div>
  );
};

export default InvoiceRequestsPage;
