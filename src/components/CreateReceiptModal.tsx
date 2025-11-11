import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from './SimpleModal';
import Button from './Button';
import Input from './Input';
import { getAcceptedOrders, type OrdersResponse } from '../services/quotationService';
import { receiptService, type CreateReceiptData } from '../services/receiptService';
import { formatPrice } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { useToast } from '../contexts/ToastContext';
import Loader from './Loader';

// Order type based on QuotationResponse data structure
type Order = OrdersResponse['data'][0];

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptCreated: () => void;
}

const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({ isOpen, onClose, onReceiptCreated }) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Form data
  const [formData, setFormData] = useState({
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    receiptDate: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0] + '.000Z',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch accepted orders
  const fetchOrders = async (page: number = 1) => {
    setIsLoadingOrders(true);
    try {
      const response = await getAcceptedOrders(page, pagination.limit);
      if (response.success) {
        setOrders(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages,
        });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showToast(error.message || 'Failed to fetch orders', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders(1);
      setSelectedOrder(null);
      setFormData({
        amount: 0,
        description: '',
        paymentMethod: 'cash',
        receiptDate: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0] + '.000Z',
      });
      setErrors({});
      setSearchTerm('');
      setStatusFilter('');
      setCurrencyFilter('');
    }
  }, [isOpen]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm.trim()) {
      filtered = filtered.filter(order =>
        order.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (currencyFilter) {
      filtered = filtered.filter(order => order.currency === currencyFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, currencyFilter]);

  // Get unique statuses and currencies
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(orders.map(order => order.status));
    return Array.from(statuses);
  }, [orders]);

  const uniqueCurrencies = useMemo(() => {
    const currencies = new Set(orders.map(order => order.currency));
    return Array.from(currencies);
  }, [orders]);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      amount: 0,
      description: '',
      paymentMethod: 'cash',
      receiptDate: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0] + '.000Z',
    });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle amount input with capping at remaining amount
    if (name === 'amount' && selectedOrder) {
      const remainingAmount = (selectedOrder as any)?.remainingAmount;
      let amount = parseFloat(value) || 0;
      
      // Cap the amount at remaining amount if it exists
      if (remainingAmount !== undefined && remainingAmount !== null && amount > remainingAmount) {
        amount = remainingAmount;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: amount,
      }));
      
      // Clear existing error first
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      // Validate in real-time
      if (remainingAmount !== undefined && remainingAmount !== null) {
        if (amount > remainingAmount) {
          setErrors(prev => ({
            ...prev,
            [name]: `Amount cannot exceed remaining amount of ${formatPrice(remainingAmount, selectedOrder.currency)}`,
          }));
        } else if (amount <= 0 && value !== '') {
          setErrors(prev => ({
            ...prev,
            [name]: 'Amount must be greater than 0',
          }));
        }
      } else if (amount <= 0 && value !== '') {
        setErrors(prev => ({
          ...prev,
          [name]: 'Amount must be greater than 0',
        }));
      }
    } else {
      // Handle other fields
      const newValue = name === 'receiptDate' ? new Date(value).toISOString() : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));
      
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedOrder) {
      newErrors.order = 'Please select an order';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Check if amount exceeds remaining amount
    if (selectedOrder) {
      const remainingAmount = (selectedOrder as any)?.remainingAmount;
      if (remainingAmount !== undefined && remainingAmount !== null) {
        if (formData.amount > remainingAmount) {
          newErrors.amount = `Amount cannot exceed remaining amount of ${formatPrice(remainingAmount, selectedOrder.currency)}`;
        }
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.receiptDate) {
      newErrors.receiptDate = 'Receipt date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedOrder) {
      return;
    }

    setIsCreating(true);
    try {
      // Get customerId - use userId._id if available, otherwise use custId
      const customerId = selectedOrder.customer.userId?._id || selectedOrder.customer.custId;

      const receiptData: CreateReceiptData = {
        customerId: customerId,
        quotationId: selectedOrder._id, // Use the order's _id as quotationId
        paymentMethod: formData.paymentMethod,
        receiptDate: formData.receiptDate,
        amount: formData.amount,
        currency: selectedOrder.currency,
        description: formData.description,
      };

      await receiptService.createReceipt(receiptData);
      showToast('Receipt created successfully!', 'success');
      onReceiptCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      showToast(error.message || 'Failed to create receipt', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Receipt"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Order Selection Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Order</h3>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search by order number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
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
                {uniqueCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            {isLoadingOrders ? (
              <div className="flex justify-center items-center py-8">
                <Loader />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedOrder?._id === order._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.quotationNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {order.customer.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatPrice(order.totalAmount, order.currency)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800' :
                          order.status.toLowerCase() === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Button
                          onClick={() => handleOrderSelect(order)}
                          className={`px-3 py-1 text-xs ${
                            selectedOrder?._id === order._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedOrder?._id === order._id ? 'Selected' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Receipt Form Section - Only show when order is selected */}
        {selectedOrder && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h3>
            
            {/* Selected Order Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Order Number:</span>
                  <span className="ml-2 text-gray-900">{selectedOrder.quotationNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="ml-2 text-gray-900">{selectedOrder.customer.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Amount:</span>
                  <span className="ml-2 text-gray-900">{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Currency:</span>
                  <span className="ml-2 text-gray-900">{selectedOrder.currency}</span>
                </div>
                {(selectedOrder as any).bookingAmount !== undefined && (selectedOrder as any).bookingAmount !== null && (
                  <div>
                    <span className="font-medium text-gray-700">Balance:</span>
                    <span className="ml-2 text-gray-900 font-semibold">
                      {formatPrice((selectedOrder as any).bookingAmount, selectedOrder.currency)}
                    </span>
                  </div>
                )}
                {(selectedOrder as any).remainingAmount !== undefined && (selectedOrder as any).remainingAmount !== null && (
                  <div>
                    <span className="font-medium text-gray-700">Remaining Amount:</span>
                    <span className="ml-2 text-gray-900 font-semibold">
                      {formatPrice((selectedOrder as any).remainingAmount, selectedOrder.currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Date *
                </label>
                <Input
                  type="datetime-local"
                  name="receiptDate"
                  value={formData.receiptDate ? new Date(formData.receiptDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      receiptDate: dateValue ? new Date(dateValue).toISOString() : '',
                    }));
                  }}
                  className={`w-full ${errors.receiptDate ? 'border-red-500' : ''}`}
                />
                {errors.receiptDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.receiptDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedOrder.currency}) *
                </label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedValue = e.clipboardData.getData('text');
                    const pastedAmount = parseFloat(pastedValue) || 0;
                    const remainingAmount = (selectedOrder as any)?.remainingAmount;
                    
                    if (remainingAmount !== undefined && remainingAmount !== null) {
                      const cappedAmount = pastedAmount > remainingAmount ? remainingAmount : pastedAmount;
                      setFormData(prev => ({ ...prev, amount: cappedAmount }));
                      if (cappedAmount < pastedAmount) {
                        showToast(`Amount capped at remaining amount: ${formatPrice(remainingAmount, selectedOrder.currency)}`, 'info');
                      }
                    } else {
                      setFormData(prev => ({ ...prev, amount: pastedAmount }));
                    }
                  }}
                  placeholder="Enter receipt amount"
                  min="0"
                  max={(selectedOrder as any)?.remainingAmount !== undefined && (selectedOrder as any)?.remainingAmount !== null 
                    ? (selectedOrder as any).remainingAmount 
                    : undefined}
                  step="0.01"
                  className={`w-full ${errors.amount ? 'border-red-500' : ''}`}
                />
                {(selectedOrder as any)?.remainingAmount !== undefined && (selectedOrder as any)?.remainingAmount !== null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum: {formatPrice((selectedOrder as any).remainingAmount, selectedOrder.currency)}
                  </p>
                )}
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter receipt description"
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paymentMethod ? 'border-red-500' : ''
                  }`}
                >
                  <option value="cash">Cash</option>
                  {/* <option value="credit card">Credit Card</option> */}
                  <option value="cheque">Cheque</option>
                  <option value="tt">T/T</option>
                  {/* <option value="bank transfer">Bank Transfer</option> */}
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Receipt'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {errors.order && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.order}</p>
          </div>
        )}
      </div>
    </SimpleModal>
  );
};

export default CreateReceiptModal;

