import React, { useState, useEffect } from 'react';
import { type InventoryItem, type DetailedInventoryItem, type CreateInventoryItemData } from '../services/inventoryService';
import { getSuppliers, type Supplier } from '../services/supplierService';

interface InventoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, data: Partial<CreateInventoryItemData>) => Promise<void>;
  isLoading: boolean;
  item: DetailedInventoryItem | null;
}

const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  item
}) => {
  const [formData, setFormData] = useState<Partial<CreateInventoryItemData>>({});
  const [vinNumbers, setVinNumbers] = useState<string[]>([]); // Only editable VIN numbers
  const [allVinNumbers, setAllVinNumbers] = useState<any[]>([]); // All VIN numbers (active + inactive)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<{
    formData: Partial<CreateInventoryItemData>;
    vinNumbers: string[];
  } | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

  // Load suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
    }
  }, [isOpen]);

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      // Check if suppliers are cached in localStorage
      const cachedSuppliers = localStorage.getItem('suppliers');
      const cacheTimestamp = localStorage.getItem('suppliers_timestamp');
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedSuppliers && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
        // Use cached data
        const suppliers = JSON.parse(cachedSuppliers);
        setSuppliers(suppliers);
        setIsLoadingSuppliers(false);
        return;
      }

      // Fetch from API
      const response = await getSuppliers();
      const suppliers = response.data.suppliers || [];
      
      // Cache the suppliers
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
      localStorage.setItem('suppliers_timestamp', now.toString());
      
      setSuppliers(suppliers);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      // Try to use cached data as fallback
      const cachedSuppliers = localStorage.getItem('suppliers');
      if (cachedSuppliers) {
        try {
          const suppliers = JSON.parse(cachedSuppliers);
          setSuppliers(suppliers);
        } catch (parseError) {
          console.error('Error parsing cached suppliers:', parseError);
        }
      }
    } finally {
      setIsLoadingSuppliers(false);
    }
  };


  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      const allVinNumbers = item.vinNumber || [];
      const activeVinNumbers = allVinNumbers.filter(vin => vin.status === 'active');
      
      const initialFormData = {
        name: item.name || '',
        type: (item.type as 'car' | 'part') || 'car',
        category: item.category || '',
        subcategory: (item as any).subcategory || '',
        brand: item.brand || '',
        model: item.model || '',
        year: item.year || new Date().getFullYear(),
        color: item.color || '',
        interiorColor: item.interiorColor || '',
        description: item.description || '',
        costPrice: item.costPrice || 0,
        sellingPrice: item.sellingPrice || 0,
        quantity: item.quantity || 0,
        inStock: item.inStock ?? true,
        condition: (item.condition as 'new' | 'used' | 'refurbished') || 'new',
        status: (item.status as 'active' | 'inactive') || 'active',
        dimensions: (item as any).dimensions || {
          length: 0,
          width: 0,
          height: 0,
          weight: 0
        },
        supplierId: (item as any).supplierId?._id || undefined
      };
      
      setFormData(initialFormData);
      // Only editable VIN numbers (active ones + one empty field for adding new)
      setVinNumbers([...activeVinNumbers.map(vin => vin.chasisNumber), '']);
      // Store all VIN numbers for display
      setAllVinNumbers(allVinNumbers);
      
      // Store original data for comparison
      setOriginalData({
        formData: initialFormData,
        vinNumbers: activeVinNumbers.map(vin => vin.chasisNumber)
      });
    }
  }, [item]);

  // Auto-update stock status and product status based on VIN numbers (only for cars)
  useEffect(() => {
    if (formData.type === 'car') {
      const validVinNumbers = vinNumbers.filter(vin => vin.trim() !== '');
      const hasActiveVins = validVinNumbers.length > 0;
      
      setFormData(prev => ({
        ...prev,
        inStock: hasActiveVins,
        status: hasActiveVins ? 'active' : 'out_of_stock'
      }));
    } else if (formData.type === 'part') {
      // For parts, stock status and product status are manually controlled
      // No auto-update based on VIN numbers since parts don't have VINs
    }
  }, [vinNumbers, formData.type]);

  // Check if there are any changes
  const hasChanges = (): boolean => {
    if (!originalData) return false;
    
    // Compare form data - check all keys that exist in either object
    const allKeys = new Set([
      ...Object.keys(formData),
      ...Object.keys(originalData.formData)
    ]);
    
    const formDataChanged = Array.from(allKeys).some(key => {
      const currentValue = formData[key as keyof CreateInventoryItemData];
      const originalValue = originalData.formData[key as keyof CreateInventoryItemData];
      
      // Special handling for dimensions object
      if (key === 'dimensions') {
        const currentDims = currentValue as any;
        const originalDims = originalValue as any;
        
        // If both are undefined/null, they're equal
        if (!currentDims && !originalDims) return false;
        
        // If one is undefined/null and other isn't, they're different
        if (!currentDims || !originalDims) return true;
        
        // Compare each dimension property
        return currentDims.length !== originalDims.length ||
               currentDims.width !== originalDims.width ||
               currentDims.height !== originalDims.height ||
               currentDims.weight !== originalDims.weight;
      }
      
      // For other fields, do strict equality comparison
      return currentValue !== originalValue;
    });
    
    // Compare VIN numbers - normalize both arrays first
    const currentVinNumbers = vinNumbers.filter(vin => vin.trim() !== '').sort();
    const originalVinNumbers = originalData.vinNumbers.filter(vin => vin.trim() !== '').sort();
    const vinNumbersChanged = JSON.stringify(currentVinNumbers) !== JSON.stringify(originalVinNumbers);
    
    console.log('🔍 VIN Number Comparison:', {
      currentVinNumbers,
      originalVinNumbers,
      vinNumbersChanged,
      allVinNumbers: allVinNumbers.map(vin => ({ status: vin.status, chasisNumber: vin.chasisNumber }))
    });
    
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Change Detection:', {
        formDataChanged,
        vinNumbersChanged,
        currentVinNumbers,
        originalVinNumbers,
        hasChanges: formDataChanged || vinNumbersChanged
      });
    }
    
    return formDataChanged || vinNumbersChanged;
  };

  // Debug effect to monitor changes (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && originalData) {
      console.log('🔄 Form data changed:', {
        hasChanges: hasChanges(),
        formData,
        originalData: originalData.formData,
        vinNumbers,
        originalVinNumbers: originalData.vinNumbers
      });
    }
  }, [formData, vinNumbers, originalData]);

  // Test function to verify change detection (for debugging)
  // const testChangeDetection = () => {
  //   console.log('🧪 Testing Change Detection:');
  //   console.log('Original Data:', originalData);
  //   console.log('Current Form Data:', formData);
  //   console.log('Current VIN Numbers:', vinNumbers);
  //   console.log('Has Changes:', hasChanges());
  // };

  // Real-time validation
  const validateField = (name: string, value: any, formData: Partial<CreateInventoryItemData>): string => {
    switch (name) {
      case 'name':
        return !value?.trim() ? 'Product name is required' : '';
      case 'category':
        return !value?.trim() ? 'Category is required' : '';
      case 'subcategory':
        return !value?.trim() ? 'Subcategory is required' : '';
      case 'brand':
        return !value?.trim() ? 'Brand is required' : '';
      case 'model':
        return !value?.trim() ? 'Model is required' : '';
      case 'year':
        return !value || value < 1900 || value > new Date().getFullYear() + 1 
          ? 'Valid year is required' : '';
      case 'color':
        return !value?.trim() ? 'Exterior color is required' : '';
      case 'interiorColor':
        return !value?.trim() ? 'Interior color is required' : '';
      case 'description':
        return !value?.trim() ? 'Description is required' : '';
      case 'costPrice':
        if (value <= 0) return 'Cost price must be greater than 0';
        if (formData.sellingPrice && value >= formData.sellingPrice) {
          return 'Cost price must be less than selling price';
        }
        return '';
      case 'sellingPrice':
        if (value <= 0) return 'Selling price must be greater than 0';
        if (formData.costPrice && value <= formData.costPrice) {
          return 'Selling price must be greater than cost price';
        }
        return '';
      case 'quantity':
        return value <= 0 ? 'Quantity must be greater than 0' : '';
      case 'inStock':
        return value === undefined ? 'Stock status is required' : '';
      case 'condition':
        return !value ? 'Condition is required' : '';
      case 'status':
        return !value ? 'Status is required' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newFormData: Partial<CreateInventoryItemData>;
    
    if (type === 'number') {
      newFormData = { ...formData, [name]: parseFloat(value) || 0 };
    } else if (type === 'checkbox') {
      newFormData = { ...formData, [name]: (e.target as HTMLInputElement).checked };
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
  };

  const addVinNumber = () => {
    setVinNumbers(prev => [...prev, '']);
  };

  const removeVinNumber = (index: number) => {
    const newVinNumbers = vinNumbers.filter((_, i) => i !== index);
    setVinNumbers(newVinNumbers);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.subcategory?.trim()) newErrors.subcategory = 'Subcategory is required';
    if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year is required';
    }
    if (!formData.color?.trim()) newErrors.color = 'Exterior color is required';
    if (!formData.interiorColor?.trim()) newErrors.interiorColor = 'Interior color is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = 'Cost price must be greater than 0';
    if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
    if (formData.costPrice && formData.sellingPrice && formData.costPrice >= formData.sellingPrice) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }
    // Type-specific validation
    if (formData.type === 'car') {
      // For cars, validate VIN numbers - consider both active and inactive VINs
      const validVinNumbers = vinNumbers.filter(vin => vin.trim() !== '');
      const hasAnyVinNumbers = validVinNumbers.length > 0 || allVinNumbers.length > 0;
      
      console.log('🔍 VIN Validation:', {
        validVinNumbers,
        allVinNumbers: allVinNumbers.map(vin => ({ status: vin.status, chasisNumber: vin.chasisNumber })),
        hasAnyVinNumbers,
        vinNumbersLength: vinNumbers.length,
        allVinNumbersLength: allVinNumbers.length
      });
      
      if (!hasAnyVinNumbers) {
        newErrors.vinNumber = 'At least one VIN number is required for cars';
      }
    } else if (formData.type === 'part') {
      // For parts, validate quantity
      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0 for parts';
      }
    }
    if (formData.inStock === undefined) newErrors.inStock = 'Stock status is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (!formData.status) newErrors.status = 'Status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !item) {
      return;
    }

    // Check if there are any changes
    if (!hasChanges()) {
      console.log('No changes detected, skipping API call');
      onClose();
      return;
    }

    try {
      let updateData: Partial<CreateInventoryItemData>;
      let debugInfo: any = {};

      if (formData.type === 'car') {
        // For cars: handle VIN numbers and auto-set status
        const validVinNumbers = vinNumbers.filter(vin => vin.trim() !== '');
        
        // Get existing inactive VIN numbers (remove _id field)
        const existingInactiveVinNumbers = allVinNumbers
          .filter(vin => vin.status !== 'active')
          .map(vin => ({
            status: vin.status,
            chasisNumber: vin.chasisNumber
          }));
        
        // Create new active VIN numbers from the editable list
        const newActiveVinNumbers = validVinNumbers.map(vin => ({
          status: 'active' as const,
          chasisNumber: vin.trim()
        }));
        
        // Combine existing inactive + new active VIN numbers
        const finalVinNumbers = [...existingInactiveVinNumbers, ...newActiveVinNumbers];
        
        // Count only active VIN numbers for quantity
        const activeCount = newActiveVinNumbers.length;
        
        // Auto-set stock status and product status based on VIN status
        const hasActiveVins = finalVinNumbers.some(vin => vin.status === 'active');
        const autoInStock = hasActiveVins;
        const autoStatus = hasActiveVins ? 'active' : 'out_of_stock';

        updateData = {
          ...formData,
          vinNumber: finalVinNumbers,
          quantity: activeCount,
          inStock: autoInStock,
          status: autoStatus
        };

        debugInfo = {
          existingInactive: existingInactiveVinNumbers,
          newActive: newActiveVinNumbers,
          finalVinNumbers,
          activeCount,
          totalVINs: finalVinNumbers.length,
          hasActiveVins,
          autoInStock,
          autoStatus
        };
      } else {
        // For parts: no VIN numbers, use manual quantity and status
        updateData = {
          ...formData,
          vinNumber: [],
          quantity: formData.quantity || 0
        };

        debugInfo = {
          quantity: formData.quantity,
          vinNumber: []
        };
      }

      console.log('🔍 Update Details:', {
        type: formData.type,
        updateData,
        ...debugInfo
      });

      await onSubmit(item._id, updateData);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10 rounded-t-3xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Product</h2>
              <p className="text-gray-400">
                Update product information and settings
                {hasChanges() && (
                  <span className="ml-2 text-blue-400 text-sm font-medium">
                    • Unsaved changes
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-400">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Type</label>
                <input
                  type="text"
                  value={formData.type || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Type cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                <input
                  type="text"
                  value={item.sku || 'N/A'}
                  disabled
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">SKU is auto-generated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.category ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter category"
                />
                {errors.category && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.category}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subcategory *</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.subcategory ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter subcategory"
                />
                {errors.subcategory && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.subcategory}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.brand ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter brand"
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
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.model ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter model"
                />
                {errors.model && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.model}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year || ''}
                  onChange={handleInputChange}
                  min="1900"
                  max="2030"
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.year ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter year"
                />
                {errors.year && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.year}
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exterior Color *</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Interior Color *</label>
                <input
                  type="text"
                  name="interiorColor"
                  value={formData.interiorColor || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                    errors.interiorColor ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="e.g., Black, Beige"
                />
                {errors.interiorColor && <p className="text-red-400 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.interiorColor}
                </p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
                  errors.description ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-red-400 text-xs mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.description}
              </p>}
            </div>
          </div>

          {/* Pricing Information */}
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
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
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
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 ${
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
                {formData.costPrice && formData.sellingPrice && (
                  <div className="mt-2 text-sm">
                    {formData.sellingPrice > formData.costPrice ? (
                      <span className="text-green-400">
                        Profit: ${(formData.sellingPrice - formData.costPrice).toFixed(2)} ({(((formData.sellingPrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-red-400">Selling price must be greater than cost price</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-400">Supplier (Optional)</h3>
            </div>

            <div className="space-y-4">
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Supplier</label>
                <div className="relative">
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value || undefined }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">No Supplier Selected</option>
                    {isLoadingSuppliers ? (
                      <option disabled>Loading suppliers...</option>
                    ) : suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} ({supplier.email})
                        </option>
                      ))
                    ) : (
                      <option disabled>No suppliers found</option>
                    )}
                  </select>
                </div>
                {formData.supplierId && (
                  <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-purple-400 text-sm">
                        Selected: {suppliers.find(s => s._id === formData.supplierId)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VIN Numbers & Quantity - Only for cars */}
          {formData.type === 'car' && formData.status?.toLowerCase() !== 'sold' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-400">VIN Numbers & Quantity</h3>
                <span className="text-sm text-gray-400">(Only active chassis numbers are editable)</span>
              </div>
            
            <div className="space-y-4">
              {/* Show all VIN numbers (active + inactive) */}
              {allVinNumbers.map((vin, index) => {
                const isActive = vin.status === 'active';
                const editableIndex = vinNumbers.findIndex(v => v === vin.chasisNumber);
                
                return (
                  <div key={vin._id || index} className={`flex items-center space-x-3 p-3 rounded-xl border ${
                    isActive 
                      ? 'bg-gray-800/30 border-gray-600/50' 
                      : 'bg-gray-700/20 border-gray-600/30'
                  }`}>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={isActive ? (vinNumbers[editableIndex] || '') : vin.chasisNumber}
                        onChange={isActive ? (e) => handleVinNumberChange(editableIndex, e.target.value) : undefined}
                        disabled={!isActive}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-gray-800/50 border-gray-600 text-white focus:border-purple-500 focus:outline-none' 
                            : 'bg-gray-700/30 border-gray-600/50 text-gray-400 cursor-not-allowed'
                        }`}
                        placeholder={`VIN Number ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Status badge */}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {vin.status}
                      </span>
                      {/* Remove button - only for active VINs */}
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => removeVinNumber(editableIndex)}
                          className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                          disabled={vinNumbers.length === 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Show editable VIN numbers (for adding new ones) */}
              {vinNumbers.map((vin, index) => {
                // Skip if this VIN already exists in allVinNumbers
                const existsInAll = allVinNumbers.some(v => v.chasisNumber === vin);
                if (existsInAll) return null;
                
                return (
                  <div key={`editable-${index}`} className="flex items-center space-x-3 p-3 rounded-xl border bg-gray-800/30 border-gray-600/50">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={vin}
                        onChange={(e) => handleVinNumberChange(index, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200"
                        placeholder={`New VIN Number ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                        new
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVinNumber(index)}
                        className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <button
                type="button"
                onClick={addVinNumber}
                className="w-full py-3 border-2 border-dashed border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add VIN Number</span>
              </button>
              
              {errors.vinNumber && <p className="text-red-400 text-xs flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.vinNumber}
              </p>}
            </div>
          </div>
          )}

          {/* Quantity - Only for parts */}
          {formData.type === 'part' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-400">Quantity</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200 ${
                    errors.quantity ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="Enter quantity"
                  min="0"
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

          {/* Status & Condition */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-indigo-400">Status & Condition</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stock Status * 
                  {formData.type === 'car' && (
                    <span className="text-xs text-blue-400 ml-2">(Auto-set based on VIN status)</span>
                  )}
                </label>
                <select
                  name="inStock"
                  value={formData.inStock ? 'true' : 'false'}
                  onChange={handleInputChange}
                  disabled={formData.type === 'car'}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                    formData.type === 'car' 
                      ? 'bg-gray-700/30 border-gray-600/50 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:outline-none'
                  }`}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
                >
                  <option value="">Select Condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status * 
                  {formData.type === 'car' && (
                    <span className="text-xs text-blue-400 ml-2">(Auto-set based on VIN status)</span>
                  )}
                </label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  disabled={formData.type === 'car'}
                  className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                    formData.type === 'car' 
                      ? 'bg-gray-700/30 border-gray-600/50 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-800/50 border-gray-600 text-white focus:border-indigo-500 focus:outline-none'
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-400">Physical Dimensions <span className="text-sm text-gray-400 font-normal">(Optional)</span></h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Length (cm)</label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions?.length || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: {
                      length: parseFloat(e.target.value) || 0,
                      width: prev.dimensions?.width || 0,
                      height: prev.dimensions?.height || 0,
                      weight: prev.dimensions?.weight || 0
                    }
                  }))}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Width (cm)</label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions?.width || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: {
                      length: prev.dimensions?.length || 0,
                      width: parseFloat(e.target.value) || 0,
                      height: prev.dimensions?.height || 0,
                      weight: prev.dimensions?.weight || 0
                    }
                  }))}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions?.height || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: {
                      length: prev.dimensions?.length || 0,
                      width: prev.dimensions?.width || 0,
                      height: parseFloat(e.target.value) || 0,
                      weight: prev.dimensions?.weight || 0
                    }
                  }))}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="dimensions.weight"
                  value={formData.dimensions?.weight || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dimensions: {
                      length: prev.dimensions?.length || 0,
                      width: prev.dimensions?.width || 0,
                      height: prev.dimensions?.height || 0,
                      weight: parseFloat(e.target.value) || 0
                    }
                  }))}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !hasChanges()}
              className={`px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 ${
                hasChanges() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : hasChanges() ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Product</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No Changes</span>
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Unsaved Changes</h3>
            </div>
            <p className="text-gray-300 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryEditModal;
