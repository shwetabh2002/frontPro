import React from 'react';
import { DetailedInventoryItem } from '../services/inventoryService';

interface InventoryItemModalProps {
  item: DetailedInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-amber-500/30">
          <h2 className="text-2xl font-bold text-amber-400">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">SKU:</span>
                  <span className="text-white font-mono">{item.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Brand:</span>
                  <span className="text-white">{item.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">{item.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Year:</span>
                  <span className="text-white">{item.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Color:</span>
                  <span className="text-white">{item.color}</span>
                </div>
                {item.interiorColor && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interior Color:</span>
                    <span className="text-white">{item.interiorColor}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Pricing & Stock</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost Price:</span>
                  <span className="text-white">${item.costPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selling Price:</span>
                  <span className="text-amber-400 font-bold">${item.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Margin:</span>
                  <span className="text-green-400">{item.profitMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value:</span>
                  <span className="text-white">${item.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white font-medium">{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Stock Level:</span>
                  <span className="text-white">{item.minStockLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.stockStatus === 'in_stock' ? 'bg-green-500/20 text-green-400' :
                    item.stockStatus === 'low_stock' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.stockStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Condition & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Condition:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.condition === 'new' ? 'bg-green-500/20 text-green-400' :
                    item.condition === 'used' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.condition}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">In Stock:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.inStock ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Dimensions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Length:</span>
                  <span className="text-white">{item.dimensions.length} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Width:</span>
                  <span className="text-white">{item.dimensions.width} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Height:</span>
                  <span className="text-white">{item.dimensions.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white">{item.dimensions.weight} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* VIN Numbers */}
          {item.vinNumber && item.vinNumber.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">VIN Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.vinNumber.map((vin, index) => (
                  <div key={vin._id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm font-mono text-white">{vin.chasisNumber}</div>
                    <div className={`text-xs mt-1 ${
                      vin.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {vin.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.images.map((image, index) => (
                  <div key={image._id} className="bg-gray-800/50 rounded-lg p-3">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-sm text-gray-400">{image.alt}</div>
                    {image.isPrimary && (
                      <div className="text-xs text-amber-400 mt-1">Primary Image</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
            <div className="space-y-2 text-sm">
              <h4 className="text-amber-400 font-medium">Created</h4>
              <div className="text-gray-400">By: {item.createdBy.name}</div>
              <div className="text-gray-400">Date: {new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="space-y-2 text-sm">
              <h4 className="text-amber-400 font-medium">Last Updated</h4>
              <div className="text-gray-400">By: {item.updatedBy.name}</div>
              <div className="text-gray-400">Date: {new Date(item.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemModal;
