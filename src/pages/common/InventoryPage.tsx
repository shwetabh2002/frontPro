import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService, type AdvancedInventoryFilters, type AdvancedInventoryResponse, type InventoryItem, type DetailedInventoryItem } from '../../services/inventoryService';
import InventoryItemPopup from '../../components/InventoryItemPopup';

const InventoryPage: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<AdvancedInventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdvancedInventoryFilters>({
    page: 1,
    limit: 20
  });
  
  // Search and filter UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<AdvancedInventoryFilters>({});
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<DetailedInventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);

  const loadInventoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading inventory with filters:', filters);
      const data = await inventoryService.getInventoryItems(filters);
      console.log('✅ Inventory data loaded successfully:', data);
      setInventoryData(data);
    } catch (err) {
      console.error('❌ Error loading inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 to-amber-600/10 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex items-center">
              <div className="p-2.5 bg-gradient-to-br from-gray-900 to-black border border-amber-500 rounded-lg shadow-lg mr-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500 bg-clip-text text-transparent m-0 p-0 text-left">
                  Inventory Management
                </h1>
                <p className="text-sm text-gray-600 font-medium m-0 p-0 text-left">
                  Manage your automotive inventory with advanced filtering and search.
                </p>
              </div>
            </div>
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-amber-500/30">
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
                className="block w-full pl-10 pr-3 py-3 border border-amber-500/50 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 text-amber-400 border border-amber-500/50 rounded-lg hover:bg-amber-500/10 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && inventoryData && (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-amber-500/30">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={selectedFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Types</option>
                {inventoryData.data.summary.types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
              <select
                value={selectedFilters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Brands</option>
                {inventoryData.data.summary.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <select
                value={selectedFilters.model || ''}
                onChange={(e) => handleFilterChange('model', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Models</option>
                {inventoryData.data.summary.models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select
                value={selectedFilters.year || ''}
                onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Years</option>
                {inventoryData.data.summary.years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <select
                value={selectedFilters.color || ''}
                onChange={(e) => handleFilterChange('color', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Colors</option>
                {inventoryData.data.summary.colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
              <select
                value={selectedFilters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Conditions</option>
                {inventoryData.data.summary.conditions.map((condition) => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Statuses</option>
                {inventoryData.data.summary.statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
              <input
                type="number"
                value={selectedFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Min Price"
                className="w-full px-3 py-2 bg-gray-800 border border-amber-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <span className="text-amber-400 font-medium">Loading inventory...</span>
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
            <h3 className="text-lg font-bold text-amber-400">
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
                <div key={item._id} className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
                  {/* Item Header */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                    <div className="text-xs text-gray-400">{item.brand} {item.model} {item.year}</div>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color:</span>
                      <span className="text-white">{item.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Qty:</span>
                      <span className="text-white font-medium">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-amber-400 font-bold">
                        ${item.sellingPrice ? item.sellingPrice.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-between items-center mt-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.condition === 'new' ? 'bg-green-500/20 text-green-400' :
                      item.condition === 'used' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.condition}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewItem(item)}
                    disabled={isLoadingItem}
                    className="w-full mt-3 px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingItem ? 'Loading...' : 'View Details'}
                  </button>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(inventoryData.data.pagination.currentPage - 1)}
                  disabled={!inventoryData.data.pagination.hasPrevPage}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-400">
                  {inventoryData.data.pagination.currentPage} of {inventoryData.data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(inventoryData.data.pagination.currentPage + 1)}
                  disabled={!inventoryData.data.pagination.hasNextPage}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
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
    </div>
  );
};

export default InventoryPage;