import React, { useState, useEffect } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CustomerModal from '../../components/CustomerModal';
import CustomerDetailsModal from '../../components/CustomerDetailsModal';
import { customerService, type Customer } from '../../services/customerService';

const CustomersPage: React.FC = () => {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCreateQuotationModalOpen, setIsCreateQuotationModalOpen] = useState(false);
  const [quotationCustomerData, setQuotationCustomerData] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch customers from API
  const fetchCustomers = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomers({
        page,
        limit: 10,
        search: search || undefined,
      });

      if (response.success) {
        setCustomers(response.data.customers);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchCustomers(1, searchTerm);
        setCurrentPage(1);
      } else {
        fetchCustomers(1);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCustomers(page, searchTerm);
  };

  // Handle customer modal close and refresh data
  const handleCustomerModalClose = () => {
    setIsAddCustomerModalOpen(false);
    // Refresh the current page
    fetchCustomers(currentPage, searchTerm);
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleCustomerDetailsModalClose = () => {
    setIsCustomerDetailsModalOpen(false);
    setSelectedCustomerId(null);
  };

  const handleCreateQuotation = (customerId: string) => {
    // Find the customer data and populate the modal
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setQuotationCustomerData(customer);
      setIsCreateQuotationModalOpen(true);
    }
  };

  const handleQuotationModalClose = () => {
    setIsCreateQuotationModalOpen(false);
    setQuotationCustomerData(null);
    // Refresh customers list after modal closes
    fetchCustomers(currentPage, searchTerm);
  };

  const filteredCustomers = customers;

  const columns = [
    { 
      key: 'custId', 
      header: 'Customer ID',
      render: (value: string) => (
        <div className="text-amber-400 text-xs font-bold font-mono bg-gradient-to-r from-gray-900 to-black border border-amber-500 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-3 h-3 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {value}
          </div>
        </div>
      )
    },
    { 
      key: 'name', 
      header: 'Customer Name',
      render: (value: string) => (
        <div className="font-semibold text-gray-100">
          {value}
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Phone Number',
      render: (value: string) => (
        <div className="text-gray-300 text-sm font-mono">
          {value}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border ${
          value === 'active' 
            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 shadow-md' 
            : 'bg-gradient-to-r from-gray-800 to-black text-gray-300 border-gray-600 shadow-md'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            value === 'active' ? 'bg-amber-500' : 'bg-gray-500'
          }`}></div>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Created Date',
      render: (value: string) => (
        <div className="text-gray-300 text-sm">
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: Customer) => (
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" className="bg-gray-800 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black shadow-md hover:shadow-lg text-xs px-2 py-1 transition-all duration-200">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-800 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black shadow-md hover:shadow-lg text-xs px-2 py-1 transition-all duration-200"
            onClick={() => handleViewCustomer(item._id)}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-800 border-green-500 text-green-400 hover:bg-green-500 hover:text-black shadow-md hover:shadow-lg text-xs px-2 py-1 transition-all duration-200"
            onClick={() => handleCreateQuotation(item._id)}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Quotation
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 to-amber-600/10 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex items-center">
              <div className="p-2.5 bg-gradient-to-br from-gray-900 to-black border border-amber-500 rounded-lg shadow-lg mr-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  All Customer 
                </h1>
                <p className="text-sm text-gray-600 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Manage your automotive customer relationships and data.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="primary"
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black font-bold shadow-xl hover:shadow-2xl border border-amber-400"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-xl border border-amber-500/30 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Search Customers"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="bg-gray-800 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-black shadow-lg hover:shadow-xl">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-xl border border-amber-500/30 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg mr-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-amber-400">
                Customer List ({filteredCustomers.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-amber-400 bg-gray-800 px-3 py-1.5 rounded-full border border-amber-500">
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                `Showing ${filteredCustomers.length} of ${pagination.totalItems} customers`
              )}
            </div>
          </div>
          
          {error ? (
            <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium">Error loading customers</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => fetchCustomers(currentPage, searchTerm)}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={filteredCustomers}
                emptyMessage="No customers found matching your search criteria."
              />
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Page {pagination.currentPage} of {pagination.totalPages} 
                      ({pagination.totalItems} total customers)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || isLoading}
                      className="shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className="shadow-md hover:shadow-lg"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="shadow-md hover:shadow-lg"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={handleCustomerModalClose}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isCustomerDetailsModalOpen}
        onClose={handleCustomerDetailsModalClose}
        customerId={selectedCustomerId}
      />

      {/* Create Quotation Modal */}
      <CustomerModal
        isOpen={isCreateQuotationModalOpen}
        onClose={handleQuotationModalClose}
        prePopulatedData={quotationCustomerData}
        mode="quotation"
      />
    </div>
  );
};

export default CustomersPage;
