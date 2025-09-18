import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService, type AdvancedInventoryFilters, type AdvancedInventoryResponse, type InventoryItem, type DetailedInventoryItem, type CreateInventoryItemData } from '../../services/inventoryService';
import InventoryItemPopup from '../../components/InventoryItemPopup';
import AddProductModal from '../../components/AddProductModal';
import InventoryEditModal from '../../components/InventoryEditModal';
import { useToast } from '../../contexts/ToastContext';

const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [inventoryData, setInventoryData] = useState<AdvancedInventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdvancedInventoryFilters>({
    page: 1,
    limit: 10
  });
  
  // Search and filter UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<AdvancedInventoryFilters>({});

  // Modal states
  const [selectedItem, setSelectedItem] = useState<DetailedInventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  
  // Add product modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Edit product modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [editingItem, setEditingItem] = useState<DetailedInventoryItem | null>(null);

  const loadInventoryData = async (customFilters?: AdvancedInventoryFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = customFilters || filters;
      console.log('🔍 Loading inventory with filters:', filtersToUse);
      const data = await inventoryService.getInventoryItems(filtersToUse);
      console.log('✅ Inventory data loaded successfully:', data);
      setInventoryData(data);
    } catch (err) {
      console.error('❌ Error loading inventory:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [filters]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({
      ...prev,
      search: term || undefined,
      page: 1 // Reset to first page on search
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof AdvancedInventoryFilters, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined, // Set to undefined if empty value
      page: 1 // Reset to first page on filter change
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({});
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 20
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // Handle view item details
  const handleViewItem = async (item: InventoryItem) => {
    setIsLoadingItem(true);
    try {
      console.log('🔍 Loading detailed item data for:', item._id);
      const response = await inventoryService.getInventoryItemById(item._id);
      setSelectedItem(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('❌ Error loading item details:', err);
      console.log('🔄 Falling back to basic item data from list');
      
      // Fallback: Use the basic item data from the list
      // Convert InventoryItem to DetailedInventoryItem format
      const fallbackItem: DetailedInventoryItem = {
        ...item,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        },
        images: [],
        createdBy: item.createdBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        },
        updatedBy: item.updatedBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        },
        compatibility: [],
        __v: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profitMargin: '0.00',
        stockStatus: 'unknown',
        totalValue: 0,
        id: item._id
      };
      
      setSelectedItem(fallbackItem);
      setIsModalOpen(true);
      setError('Using basic item data - detailed information unavailable');
    } finally {
      setIsLoadingItem(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Handle edit item - fetch latest data first
  const handleEditItem = async (item: InventoryItem) => {
    setIsLoadingItem(true);
    try {
      console.log('🔍 Loading latest item data for editing:', item._id);
      const response = await inventoryService.getInventoryItemById(item._id);
      setEditingItem(response.data);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('❌ Error loading latest item data for editing:', err);
      console.log('🔄 Falling back to basic item data from list');
      
      // Fallback: Convert InventoryItem to DetailedInventoryItem format
      const fallbackItem: DetailedInventoryItem = {
        ...item,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        },
        images: [],
        createdBy: item.createdBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        },
        updatedBy: item.updatedBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        },
        compatibility: [],
        __v: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profitMargin: '0.00',
        stockStatus: 'unknown',
        totalValue: 0,
        id: item._id
      };
      
      setEditingItem(fallbackItem);
      setIsEditModalOpen(true);
      setError('Using basic item data - latest information unavailable');
    } finally {
      setIsLoadingItem(false);
    }
  };

  // Handle add product
  const handleAddProduct = async (productData: CreateInventoryItemData) => {
    setIsCreatingProduct(true);
    try {
      console.log('🔍 Creating product:', productData);
      const response = await inventoryService.createInventoryItem(productData);
      console.log('✅ Product created successfully:', response);
      
      // Refresh inventory data
      await loadInventoryData();
      
      // Close modal
      setIsAddModalOpen(false);
      
      // Show success toast
      showToast(`Product "${productData.name}" added successfully!`, 'success', 4000);
      setError(null);
    } catch (err) {
      console.error('❌ Error creating product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (itemId: string, productData: Partial<CreateInventoryItemData>) => {
    setIsUpdatingProduct(true);
    try {
      console.log('🔍 Updating product:', itemId, productData);
      const response = await inventoryService.updateInventoryItem(itemId, productData);
      console.log('✅ Product updated successfully:', response);
      
      // Refresh inventory data
      await loadInventoryData();
      
      // Close modal
      setIsEditModalOpen(false);
      setEditingItem(null);
      
      // Show success toast
      showToast(`Product "${productData.name}" updated successfully!`, 'success', 4000);
      setError(null);
    } catch (err) {
      console.error('❌ Error updating product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100/10 to-slate-200/10 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex items-center">
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-500 rounded-lg shadow-lg mr-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-slate-800 m-0 p-0 text-left">
                  Inventory Management
                </h1>
                <p className="text-sm text-slate-600 font-medium m-0 p-0 text-left">
                  Manage your automotive inventory with advanced filtering and search.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
        <button 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-300">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, brand, model, SKU, or description..."
                className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
          </div>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && inventoryData && (
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-300">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {inventoryData.data.summary.types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={selectedFilters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {inventoryData.data.summary.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={selectedFilters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Models</option>
                {inventoryData.data.summary.models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedFilters.year || ''}
                onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {inventoryData.data.summary.years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select
                value={selectedFilters.color || ''}
                onChange={(e) => handleFilterChange('color', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Colors</option>
                {inventoryData.data.summary.colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedFilters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                {inventoryData.data.summary.conditions.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {inventoryData.data.summary.statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={selectedFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Min Price"
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-blue-400 font-medium">Loading inventory...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <div className="text-red-400 font-medium mb-2">Error Loading Inventory</div>
          <div className="text-red-300 text-sm">{error}</div>
          <button
            onClick={loadInventoryData}
            className="mt-4 px-4 py-2 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Inventory Content */}
      {!isLoading && !error && inventoryData && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-blue-700">
              Inventory Items ({inventoryData.data.pagination.totalItems})
            </h3>
            <div className="text-sm text-gray-400">
              Page {inventoryData.data.pagination.currentPage} of {inventoryData.data.pagination.totalPages}
            </div>
          </div>

          {/* Inventory Grid */}
          {inventoryData.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {inventoryData.data.items.map((item) => (
                <div key={item._id} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition-colors shadow-sm">
                  {/* Item Header */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                    <div className="text-xs text-gray-600">{item.brand} {item.model} {item.year}</div>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-2 mt-3 text-xs">
                      <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'car' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type?.toUpperCase() || 'N/A'}
                      </span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="text-gray-800">{item.color}</span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-600">Qty:</span>
                      <span className="text-gray-800 font-medium">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-blue-600 font-bold">
                        ${item.sellingPrice ? item.sellingPrice.toLocaleString() : 'N/A'}
                      </span>
                      </div>
                        </div>

                  {/* Status Badges */}
                  <div className="flex justify-between items-center mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.condition === 'new' ? 'bg-emerald-500/20 text-emerald-700' :
                      item.condition === 'used' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.condition}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'active' ? 'bg-emerald-500/20 text-emerald-700' :
                      item.status === 'inactive' ? 'bg-red-500/20 text-red-700' :
                      'bg-slate-500/20 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                    </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleViewItem(item)}
                      disabled={isLoadingItem}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoadingItem ? 'Loading...' : 'View Details'}
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      disabled={isLoadingItem}
                      className="px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      title={isLoadingItem ? "Loading..." : "Edit Item"}
                    >
                      {isLoadingItem ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No inventory items found</div>
              <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {inventoryData.data.pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(inventoryData.data.pagination.currentPage - 1)}
                  disabled={!inventoryData.data.pagination.hasPrevPage}
                  className="px-3 py-2 bg-white text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const currentPage = inventoryData.data.pagination.currentPage;
                  const totalPages = inventoryData.data.pagination.totalPages;
                  const pages = [];
                  
                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'bg-blue-500 text-white font-semibold'
                          : 'bg-white text-gray-800 hover:bg-blue-50'
                      }`}
                    >
                      1
                    </button>
                  );

                  // Show ellipsis if current page is far from start
                  if (currentPage > 4) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  // Show pages around current page
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = startPage; i <= endPage; i++) {
                    if (i !== 1 && i !== totalPages) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === i
                              ? 'bg-blue-500 text-white font-semibold'
                              : 'bg-white text-gray-800 hover:bg-blue-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  }

                  // Show ellipsis if current page is far from end
                  if (currentPage < totalPages - 3) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-400">
                        ...
                </span>
                    );
                  }

                  // Always show last page (if more than 1 page)
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? 'bg-blue-500 text-white font-semibold'
                            : 'bg-white text-gray-800 hover:bg-blue-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(inventoryData.data.pagination.currentPage + 1)}
                  disabled={!inventoryData.data.pagination.hasNextPage}
                  className="px-3 py-2 bg-white text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Item Popup */}
      <InventoryItemPopup
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
        isLoading={isCreatingProduct}
      />

      {/* Edit Product Modal */}
      <InventoryEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleUpdateProduct}
        isLoading={isUpdatingProduct}
        item={editingItem}
      />
    </div>
  );
};

export default InventoryPage;