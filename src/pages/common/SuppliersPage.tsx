import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { getSuppliers, Supplier, SupplierResponse } from '../../services/supplierService';
import { useToast } from '../../contexts/ToastContext';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants';
import AddSupplierModal from '../../components/AddSupplierModal';

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [suppliersData, setSuppliersData] = useState<SupplierResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  // Zero state component
  const ZeroState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
      <p className="text-gray-500 mb-6">
        {searchTerm 
          ? 'Try adjusting your search to find suppliers.'
          : 'No suppliers have been added yet. Get started by adding your first supplier.'
        }
      </p>
      <div className="flex justify-center space-x-3">
        {searchTerm ? (
          <button
            onClick={() => {
              setSearchTerm('');
              loadSuppliers();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Search
          </button>
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Supplier
          </button>
        )}
        <button
          onClick={() => loadSuppliers()}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );

  // Load suppliers data
  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getSuppliers();
      
      // Handle different response structures
      if (response && (response as any).suppliers && (response as any).pagination) {
        // Response is already in the correct format (direct suppliers + pagination)
        const wrappedResponse: SupplierResponse = {
          success: true,
          message: 'Suppliers retrieved successfully',
          data: {
            suppliers: (response as any).suppliers,
            pagination: (response as any).pagination
          }
        };
        setSuppliersData(wrappedResponse);
      } else if (response.data && response.data.suppliers && response.data.pagination) {
        // Response is in the expected wrapped format
        setSuppliersData(response);
      } else {
        // Create fallback structure
        const fallbackResponse: SupplierResponse = {
          success: response.success || false,
          message: response.message || 'No data available',
          data: {
            suppliers: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        };
        setSuppliersData(fallbackResponse);
      }
    } catch (err: any) {
      console.error('❌ Error loading suppliers:', err);
      
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
              const retryResponse = await getSuppliers();
              if (retryResponse) {
                setSuppliersData(retryResponse);
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
      
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.SUPPLIER.FETCH_FAILED;
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove showToast dependency to prevent infinite loop

  useEffect(() => {
    loadSuppliers();
  }, []); // Remove loadSuppliers dependency to prevent infinite loop

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implement search functionality when API supports it
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    // TODO: Implement clear filters when more filters are added
  };

  // Handle refresh
  const handleRefresh = () => {
    loadSuppliers();
  };

  // Handle add supplier success
  const handleAddSupplierSuccess = () => {
    loadSuppliers();
    showToast(SUCCESS_MESSAGES.SUPPLIER.CREATED, 'success');
  };

  // Handle edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  // Handle edit supplier success
  const handleEditSupplierSuccess = () => {
    loadSuppliers();
    showToast(SUCCESS_MESSAGES.SUPPLIER.UPDATED, 'success');
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSupplier(null);
  };

  // Handle view supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // Handle close view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingSupplier(null);
  };

  // Handle mode change from view to edit
  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    if (newMode === 'edit' && viewingSupplier) {
      // Switch from view to edit mode
      setEditingSupplier(viewingSupplier);
      setViewingSupplier(null);
      setIsViewModalOpen(false);
      setIsEditModalOpen(true);
    }
  };


  const formatPhoneNumber = (countryCode: string, phone: string) => {
    // Remove country code from phone if it's already included
    const cleanPhone = phone.replace(countryCode, '').trim();
    return `${countryCode} ${cleanPhone}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-700';
      case 'inactive':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-slate-500/20 text-slate-700';
    }
  };

  if (isLoading && !suppliersData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading suppliers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Add error boundary for this component
  if (error && !suppliersData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Suppliers</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Component-level error boundary
  if (componentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Component Error</h3>
              <p className="text-slate-600 mb-4">{componentError}</p>
              <button
                onClick={() => {
                  setComponentError(null);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Suppliers</h1>
                  <p className="text-slate-600 mt-1">Manage your supplier network</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className={`w-4 h-4 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search suppliers by name, email, or phone..."
                className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {suppliersData?.data?.pagination && (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-blue-700">
                Suppliers ({suppliersData.data.pagination.totalItems || 0})
              </h3>
              <div className="text-sm text-gray-400">
                Page {suppliersData.data.pagination.currentPage || 1} of {suppliersData.data.pagination.totalPages || 1}
              </div>
            </div>
          </div>
        )}


        {/* Suppliers List */}
        {suppliersData?.data?.suppliers && suppliersData.data.suppliers.length > 0 ? (
          <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
            {/* List Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-blue-800">
                <div className="col-span-3">Supplier Details</div>
                <div className="col-span-2">Contact Info</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Address</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-blue-100">
              {suppliersData.data.suppliers.map((supplier, index) => (
                <div key={supplier._id} className={`px-6 py-4 hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Supplier Details */}
                    <div className="col-span-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{supplier.name}</h4>
                        <div className="text-xs text-gray-600">ID: {supplier.custId}</div>
                        <div className="text-xs text-gray-500">Type: {supplier.type}</div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-800 truncate">{supplier.email}</div>
                        <div className="text-xs text-gray-600">Email</div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-800 font-medium">
                          {formatPhoneNumber(supplier.countryCode, supplier.phone)}
                        </div>
                        <div className="text-xs text-gray-600">Phone</div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="col-span-3">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-800 truncate">{supplier.address}</div>
                        <div className="text-xs text-gray-600">Address</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium w-fit ${getStatusBadgeColor(supplier.status)}`}>
                        {supplier.status?.toUpperCase() || 'N/A'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                          title="View Supplier"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                          title="Edit Supplier"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ZeroState />
        )}

        {/* Pagination */}
        {suppliersData?.data?.pagination && suppliersData.data.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={() => {/* TODO: Add pagination functionality */}}
                disabled={!suppliersData.data.pagination?.hasPrevPage}
                className="px-3 py-2 bg-white text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: suppliersData.data.pagination?.totalPages || 0 }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {/* TODO: Add pagination functionality */}}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === suppliersData.data.pagination?.currentPage
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'bg-white text-gray-800 hover:bg-blue-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => {/* TODO: Add pagination functionality */}}
                disabled={!suppliersData.data.pagination?.hasNextPage}
                className="px-3 py-2 bg-white text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSupplierSuccess}
        mode="create"
      />
      
      {/* Edit Supplier Modal */}
      <AddSupplierModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSupplierSuccess}
        editSupplier={editingSupplier}
        mode="edit"
      />
      
      {/* View Supplier Modal */}
      <AddSupplierModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onSuccess={() => {}} // No success action needed for view mode
        editSupplier={viewingSupplier}
        mode="view"
        onModeChange={handleModeChange}
      />
    </>
  );
};

export default SuppliersPage;
