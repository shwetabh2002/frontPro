import React, { useState } from 'react';
import { CreateInventoryItemData } from '../services/inventoryService';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInventoryItemData) => Promise<void>;
  isLoading: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateInventoryItemData>({
    name: '',
    type: 'car',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    interiorColor: '',
    description: '',
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    inStock: true,
    condition: 'new',
    status: 'active',
    vinNumber: [],
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0
    }
  });

  const [vinNumbers, setVinNumbers] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation function
  const validateField = (name: string, value: any, formData: CreateInventoryItemData): string => {
    switch (name) {
      case 'name':
        return !value?.trim() ? 'Product name is required' : '';
      case 'category':
        return !value?.trim() ? 'Category is required' : '';
      case 'brand':
        return !value?.trim() ? 'Brand is required' : '';
      case 'model':
        return !value?.trim() ? 'Model is required' : '';
      case 'color':
        return !value?.trim() ? 'Color is required' : '';
      case 'description':
        return !value?.trim() ? 'Description is required' : '';
      case 'costPrice':
        if (value <= 0) return 'Cost price must be greater than 0';
        if (formData.sellingPrice > 0 && value >= formData.sellingPrice) {
          return 'Cost price must be less than selling price';
        }
        return '';
      case 'sellingPrice':
        if (value <= 0) return 'Selling price must be greater than 0';
        if (formData.costPrice > 0 && value <= formData.costPrice) {
          return 'Selling price must be greater than cost price';
        }
        return '';
      case 'quantity':
        return value <= 0 ? 'Quantity must be greater than 0' : '';
      case 'dimensions.length':
        return value <= 0 ? 'Length must be greater than 0' : '';
      case 'dimensions.width':
        return value <= 0 ? 'Width must be greater than 0' : '';
      case 'dimensions.height':
        return value <= 0 ? 'Height must be greater than 0' : '';
      case 'dimensions.weight':
        return value <= 0 ? 'Weight must be greater than 0' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newFormData: CreateInventoryItemData;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1];
      newFormData = {
        ...formData,
        dimensions: {
          ...formData.dimensions,
          [dimensionField]: parseFloat(value) || 0
        }
      };
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      newFormData = { ...formData, [name]: checked };
    } else if (type === 'number') {
      newFormData = { ...formData, [name]: parseFloat(value) || 0 };
    } else {
      newFormData = { ...formData, [name]: value };
    }
    
    setFormData(newFormData);
    
    // Real-time validation
    const errorMessage = validateField(name, newFormData[name as keyof CreateInventoryItemData], newFormData);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
    
    // Cross-field validation for pricing
    if (name === 'costPrice' || name === 'sellingPrice') {
      const costPriceError = validateField('costPrice', newFormData.costPrice, newFormData);
      const sellingPriceError = validateField('sellingPrice', newFormData.sellingPrice, newFormData);
      setErrors(prev => ({
        ...prev,
        costPrice: costPriceError,
        sellingPrice: sellingPriceError
      }));
    }
  };

  const handleVinNumberChange = (index: number, value: string) => {
    const newVinNumbers = [...vinNumbers];
    newVinNumbers[index] = value;
    setVinNumbers(newVinNumbers);
    
    // Update form data with VIN numbers
    const validVinNumbers = newVinNumbers.filter(vin => vin.trim() !== '');
    setFormData(prev => ({
      ...prev,
      vinNumber: validVinNumbers.map(vin => ({
        status: 'active' as const,
        chasisNumber: vin.trim()
      })),
      quantity: validVinNumbers.length
    }));
  };

  const addVinNumber = () => {
    setVinNumbers(prev => [...prev, '']);
  };

  const removeVinNumber = (index: number) => {
    const newVinNumbers = vinNumbers.filter((_, i) => i !== index);
    setVinNumbers(newVinNumbers);
    
    // Update form data
    const validVinNumbers = newVinNumbers.filter(vin => vin.trim() !== '');
    setFormData(prev => ({
      ...prev,
      vinNumber: validVinNumbers.map(vin => ({
        status: 'active' as const,
        chasisNumber: vin.trim()
      })),
      quantity: validVinNumbers.length
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0';
    if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
    if (formData.costPrice >= formData.sellingPrice) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }
    // Type-specific validation
    if (formData.type === 'car') {
      // For cars, validate VIN numbers
      if (vinNumbers.every(vin => vin.trim() === '')) {
        newErrors.vinNumber = 'At least one VIN number is required for cars';
      }
    } else if (formData.type === 'part') {
      // For parts, validate quantity
      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0 for parts';
      }
    }
    
    // Dimensions are optional for both types - no validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data based on type
      let submitData: CreateInventoryItemData;
      
      if (formData.type === 'car') {
        // For cars: use VIN numbers and auto-calculate quantity
        const validVinNumbers = vinNumbers.filter(vin => vin.trim() !== '');
        submitData = {
          ...formData,
          vinNumber: validVinNumbers.map(vin => ({
            status: 'active' as const,
            chasisNumber: vin.trim()
          })),
          quantity: validVinNumbers.length
        };
      } else {
        // For parts: use manual quantity and empty VIN array
        submitData = {
          ...formData,
          vinNumber: [],
          quantity: formData.quantity || 0
        };
      }
      
      await onSubmit(submitData);
      // Reset form on success
      setFormData({
        name: '',
        type: 'car',
        category: '',
        subcategory: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        interiorColor: '',
        description: '',
        costPrice: 0,
        sellingPrice: 0,
        quantity: 0,
        inStock: true,
        condition: 'new',
        status: 'active',
        vinNumber: [],
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        }
      });
      setVinNumbers(['']);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-amber-500/30 max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-amber-500/20 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl border border-amber-500/30">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Add New Product
              </h2>
              <p className="text-sm text-gray-300 font-medium">Create a new inventory item with comprehensive details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information - 3 Column Layout */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-amber-400">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.name ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.name}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none hover:border-gray-500 transition-all duration-200"
                    >
                      <option value="car">Car</option>
                      <option value="part">Part</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.category ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="e.g., Sedan, SUV, Engine"
                    />
                    {errors.category && <p className="text-red-400 text-xs mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.category}
                    </p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none hover:border-gray-500 transition-all duration-200"
                      placeholder="e.g., small-size, luxury"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.brand ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="e.g., Toyota, Honda"
                    />
                    {errors.brand && <p className="text-red-400 text-xs mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.brand}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.model ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="e.g., Camry, Civic"
                    />
                    {errors.model && <p className="text-red-400 text-xs mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.model}
                    </p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max="2030"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none hover:border-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color *</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.color ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="e.g., Silver, Black"
                    />
                    {errors.color && <p className="text-red-400 text-xs mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.color}
                    </p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Interior Color</label>
                    <input
                      type="text"
                      name="interiorColor"
                      value={formData.interiorColor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-amber-500 focus:outline-none hover:border-gray-500 transition-all duration-200"
                      placeholder="e.g., Black, Beige"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Appearance & Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., Silver, Black"
                  />
                  {errors.color && <p className="text-red-400 text-xs mt-1">{errors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Interior Color</label>
                  <input
                    type="text"
                    name="interiorColor"
                    value={formData.interiorColor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., Black, Beige"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Enter product description"
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condition *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-600 bg-gray-800 border-gray-600 rounded focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">In Stock</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-400">Pricing Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cost Price *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.costPrice ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.costPrice && <p className="text-red-400 text-xs mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.costPrice}
                  </p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Selling Price *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                        errors.sellingPrice ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.sellingPrice && <p className="text-red-400 text-xs mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.sellingPrice}
                  </p>}
                </div>
              </div>
              
              {/* Price validation message */}
              {formData.costPrice > 0 && formData.sellingPrice > 0 && (
                <div className={`p-3 rounded-xl border ${
                  formData.sellingPrice > formData.costPrice 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                        formData.sellingPrice > formData.costPrice 
                          ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      } />
                    </svg>
                    {formData.sellingPrice > formData.costPrice 
                      ? `Profit Margin: $${(formData.sellingPrice - formData.costPrice).toFixed(2)} (${(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%)`
                      : 'Selling price must be greater than cost price'
                    }
                  </div>
                </div>
              )}
            </div>

            {/* VIN Numbers Section - Only for cars */}
            {formData.type === 'car' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-400">VIN Numbers & Quantity</h3>
                  <div className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                    {vinNumbers.filter(vin => vin.trim() !== '').length} QTYs
                  </div>
                </div>
              
              <div className="space-y-3">
                {vinNumbers.map((vin, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-600/50">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={vin}
                        onChange={(e) => handleVinNumberChange(index, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-all duration-200"
                        placeholder={`VIN Number ${index + 1}`}
                      />
                    </div>
                    {vinNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVinNumber(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addVinNumber}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-200 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add VIN Number</span>
                </button>
                
                {errors.vinNumber && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.vinNumber}
                </p>}
              </div>
            </div>
            )}

            {/* Quantity Section - Only for parts */}
            {formData.type === 'part' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-400">Quantity</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                      errors.quantity ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="Enter quantity"
                    min="1"
                  />
                  {errors.quantity && <p className="text-red-400 text-xs mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.quantity}
                  </p>}
                </div>
              </div>
            )}

            {/* Dimensions Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-400">Physical Dimensions</h3>
                <span className="text-sm text-gray-400">(Optional)</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Length (cm)</label>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                      errors.dimensions ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Width (cm)</label>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                      errors.dimensions ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                      errors.dimensions ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="dimensions.weight"
                    value={formData.dimensions.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-amber-500 focus:outline-none transition-all duration-200 ${
                      errors.dimensions ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                    }`}
                    placeholder="0.0"
                  />
                </div>
              </div>
              {errors.dimensions && <p className="text-red-400 text-xs mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.dimensions}
              </p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Creating Product...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
