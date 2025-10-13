import React from 'react';
import { DetailedInventoryItem } from '../services/inventoryService';
import { usePermissions } from '../hooks/usePermissions';

interface InventoryItemPopupProps {
  item: DetailedInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const InventoryItemPopup: React.FC<InventoryItemPopupProps> = ({ item, isOpen, onClose }) => {
  const { canViewCostPrice } = usePermissions();
  
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-300 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{item.name}</h2>
              <p className="text-sm text-slate-600">{item.brand} {item.model} • {item.year}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Main Content Grid - More Horizontal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">SKU</span>
                    <span className="text-gray-800 font-mono text-xs bg-blue-300/50 px-2 py-1 rounded">{item.sku}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Type</span>
                    <span className="text-gray-800 capitalize">{item.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Category</span>
                    <span className="text-gray-800">{item.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Brand</span>
                    <span className="text-gray-800 font-medium">{item.brand}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Model</span>
                    <span className="text-gray-800">{item.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Year</span>
                    <span className="text-gray-800 font-medium">{item.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <span className="text-gray-600">Color</span>
                    <span className="text-gray-800">{item.color}</span>
                  </div>
                  {item.interiorColor && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                      <span className="text-gray-600">Interior</span>
                      <span className="text-gray-800">{item.interiorColor}</span>
                    </div>
                  )}
                  {item.supplierId && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Supplier</span>
                      <span className="text-gray-800 font-medium">
                        {item.supplierId.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status & Condition
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Condition</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.condition === 'new' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' :
                      item.condition === 'used' ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30' :
                      'bg-gray-500/20 text-gray-600 border border-gray-500/30'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' :
                      item.status === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-gray-500/20 text-gray-600 border border-gray-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Stock</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.inStock ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 border border-red-500/30'
                    }`}>
                      {item.inStock ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Pricing & Stock */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-300">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Pricing & Stock
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-200/50 rounded-lg p-4">
                    {canViewCostPrice() && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 text-sm">Cost Price</span>
                        <span className="text-gray-800 font-mono">${item.costPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 text-sm font-medium">Selling Price</span>
                      <span className="text-blue-400 font-bold text-lg">${item.sellingPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-200/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-gray-800">{item.quantity}</div>
                    <div className="text-sm text-gray-600">Available Quantity</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
              </div>

              {/* Dimensions */}
              {item.dimensions && (item.dimensions.length > 0 || item.dimensions.width > 0 || item.dimensions.height > 0 || item.dimensions.weight > 0) && (
                <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-200/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{item.dimensions.length} cm</div>
                      <div className="text-xs text-gray-600">Length</div>
                    </div>
                    <div className="bg-blue-200/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{item.dimensions.width} cm</div>
                      <div className="text-xs text-gray-600">Width</div>
                    </div>
                    <div className="bg-blue-200/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{item.dimensions.height} cm</div>
                      <div className="text-xs text-gray-600">Height</div>
                    </div>
                    <div className="bg-blue-200/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{item.dimensions.weight} kg</div>
                      <div className="text-xs text-gray-600">Weight</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - VIN Numbers & Tags */}
            <div className="space-y-6">
              {/* VIN Numbers */}
              {item.vinNumber && item.vinNumber.length > 0 && (
                <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    VIN Numbers ({item.vinNumber.length})
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {item.vinNumber.map((vin, index) => (
                      <div key={index} className="bg-blue-200/50 rounded-lg p-3 border border-gray-700/30">
                        <div className="text-sm font-mono text-gray-800 break-all">{vin.chasisNumber}</div>
                        <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                          vin.status === 'active' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-500/20 text-amber-700'
                        }`}>
                          {vin.status}
                        </div>
                        {vin.quotation && (
                          <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                            <div className="text-xs text-gray-600">Quotation Details:</div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">ID:</span>
                                <span className="text-xs text-blue-400 font-mono">{vin.quotation.quotationId}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Customer:</span>
                                <span className="text-xs text-gray-800">{vin.quotation.customerName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600">Status:</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  vin.quotation.status === 'draft' ? 'bg-amber-500/20 text-amber-700' :
                                  vin.quotation.status === 'sent' ? 'bg-blue-500/20 text-blue-700' :
                                  vin.quotation.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-700' :
                                  vin.quotation.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-600'
                                }`}>
                                  {vin.quotation.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-blue-100/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Metadata
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-200/50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Created</div>
                      <div className="text-sm text-gray-800">By: {item.createdBy.name}</div>
                      <div className="text-xs text-gray-600">Date: {new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-blue-200/50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Last Updated</div>
                      <div className="text-sm text-gray-800">By: {item.updatedBy.name}</div>
                      <div className="text-xs text-gray-600">Date: {new Date(item.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemPopup;
