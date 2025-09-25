import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { updateAcceptedOrder } from '../services/quotationService';
import { useToast } from '../contexts/ToastContext';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
  onSuccess: () => void;
}

interface EditableFields {
  deliveryAddress: string;
  discount: number;
  discountType: string;
  additionalExpenses: {
    expenceType: string;
    description: string;
    amount: number;
  };
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess
}) => {
  const [formData, setFormData] = useState<EditableFields>({
    deliveryAddress: '',
    discount: 0,
    discountType: 'fixed',
    additionalExpenses: {
      expenceType: '',
      description: '',
      amount: 0
    }
  });

  const [originalData, setOriginalData] = useState<EditableFields | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && orderData) {
      const initialData: EditableFields = {
        deliveryAddress: orderData.deliveryAddress || '',
        discount: orderData.totalDiscount || 0,
        discountType: orderData.discountType || 'fixed',
        additionalExpenses: {
          expenceType: orderData.additionalExpenses?.expenceType || '',
          description: orderData.additionalExpenses?.description || '',
          amount: orderData.additionalExpenses?.amount || 0
        }
      };
      
      setFormData(initialData);
      setOriginalData({
        ...initialData,
        additionalExpenses: { ...initialData.additionalExpenses }
      }); // Create a deep copy
    }
  }, [isOpen, orderData]);

  // Function to get only changed fields
  const getChangedFields = (): any => {
    if (!originalData) return {};

    const changes: any = {};

    // Check delivery address
    if (formData.deliveryAddress !== originalData.deliveryAddress) {
      changes.deliveryAddress = formData.deliveryAddress;
    }

    // Check discount
    if (Number(formData.discount) !== Number(originalData.discount)) {
      changes.discount = Number(formData.discount);
    }
    if (formData.discountType !== originalData.discountType) {
      changes.discountType = formData.discountType;
    }

    // Check additional expenses
    const expenseChanges: any = {};
    if (formData.additionalExpenses.expenceType !== originalData.additionalExpenses.expenceType) {
      expenseChanges.expenceType = formData.additionalExpenses.expenceType;
    }
    if (formData.additionalExpenses.description !== originalData.additionalExpenses.description) {
      expenseChanges.description = formData.additionalExpenses.description;
    }
    if (Number(formData.additionalExpenses.amount) !== Number(originalData.additionalExpenses.amount)) {
      expenseChanges.amount = Number(formData.additionalExpenses.amount);
    }

    if (Object.keys(expenseChanges).length > 0) {
      changes.additionalExpenses = expenseChanges;
    }

    // Debug logging for change detection
    console.log('Change detection debug:');
    console.log('Delivery address changed:', formData.deliveryAddress !== originalData.deliveryAddress);
    console.log('Discount changed:', Number(formData.discount) !== Number(originalData.discount));
    console.log('Discount type changed:', formData.discountType !== originalData.discountType);
    console.log('Expense type changed:', formData.additionalExpenses.expenceType !== originalData.additionalExpenses.expenceType);
    console.log('Expense description changed:', formData.additionalExpenses.description !== originalData.additionalExpenses.description);
    console.log('Expense amount changed:', Number(formData.additionalExpenses.amount) !== Number(originalData.additionalExpenses.amount));

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const changes = getChangedFields();
    
    // Debug logging
    console.log('Form Data:', formData);
    console.log('Original Data:', originalData);
    console.log('Changes detected:', changes);
    console.log('Number of changes:', Object.keys(changes).length);
    
    if (Object.keys(changes).length === 0) {
      showToast('No changes detected', 'info');
      return;
    }

    setIsLoading(true);
    try {
      await updateAcceptedOrder(orderData._id, changes);
      showToast('Order updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Information (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information (Read-only)</h3>
              
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {orderData.quotationNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {orderData.status === 'accepted' ? 'Customer Accepted' : orderData.status}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Till</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {new Date(orderData.validTill).toLocaleDateString()}
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
                      {orderData.customer?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {orderData.customer?.email || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {orderData.customer?.custId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {orderData.customer?.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {orderData.items?.map((item: any, index: number) => (
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
                          <span className="font-medium">Qty:</span> {item.quantity} × {item.sellingPrice} {orderData.currency}
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
                      {orderData.subtotal} {orderData.currency}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VAT ({orderData.VAT}%)</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {orderData.vatAmount} {orderData.currency}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold">
                      {orderData.totalAmount} {orderData.currency}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editable Fields</h3>
              
              {/* Delivery Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter delivery address..."
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount</label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                    placeholder="Discount amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>

              {/* Additional Expenses */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Additional Expenses</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
                    <Input
                      type="text"
                      value={formData.additionalExpenses.expenceType}
                      onChange={(e) => handleInputChange('additionalExpenses.expenceType', e.target.value)}
                      placeholder="e.g., shipping, handling"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <Input
                      type="number"
                      value={formData.additionalExpenses.amount}
                      onChange={(e) => handleInputChange('additionalExpenses.amount', parseFloat(e.target.value) || 0)}
                      placeholder="Amount"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.additionalExpenses.description}
                    onChange={(e) => handleInputChange('additionalExpenses.description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Expense description..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
