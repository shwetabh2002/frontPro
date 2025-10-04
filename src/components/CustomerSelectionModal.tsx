import React, { useState, useEffect, useCallback } from 'react';
import SimpleModal from './SimpleModal';
import { customerService, type Customer } from '../services/customerService';
import { useToast } from '../contexts/ToastContext';
import Loader from './Loader';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelected: (customer: Customer) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onCustomerSelected
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers({
        page: 1,
        limit: 100, // Get more customers for selection
        search: ''
      });
      
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers');
      showToast('Failed to fetch customers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch customers on modal open
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, fetchCustomers]);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.trn && customer.trn.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelected(customer);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setError(null);
    onClose();
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Customer"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, phone, or TRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader />
            <span className="ml-2 text-gray-600">Loading customers...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customers List */}
        {!isLoading && !error && (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No customers found matching your search' : 'No customers available'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <p>{customer.email}</p>
                          <p>{customer.phone}</p>
                          {customer.trn && <p>TRN: {customer.trn}</p>}
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </SimpleModal>
  );
};

export default CustomerSelectionModal;
