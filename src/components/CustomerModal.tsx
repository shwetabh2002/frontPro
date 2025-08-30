import React, { useState, useEffect } from 'react';
import SimpleModal from './SimpleModal';
import { inventoryService, type InventoryItem, type FilterSummary } from '../services/inventoryService';
import { customerService, type CreateCustomerData } from '../services/customerService';
import { countriesService, type Country } from '../services/countriesService';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import CountryDropdown from './CountryDropdown';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}



const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastProgress, setToastProgress] = useState(100);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      setToastProgress(100);
      const timer = setInterval(() => {
        setToastProgress(prev => {
          if (prev <= 0) {
            setShowToast(false);
            return 100;
          }
          return prev - APP_CONSTANTS.TOAST.PROGRESS_STEP; // Decrease by step every interval
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [showToast]);

  // Requirements form data
  const [requirements, setRequirements] = useState({
    category: '',
    brand: '',
    model: '',
    year: '',
  });

  // Inventory state
  const [allInventoryItems, setAllInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([]);
  const [filterSummary, setFilterSummary] = useState<FilterSummary>({ category: [], brand: [], model: [], year: [] });
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [isAllItemsLoading, setIsAllItemsLoading] = useState(false);
  
  // Cart state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(APP_CONSTANTS.DEFAULTS.COUNTRY_CODE);

  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await countriesService.getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Fetch inventory data when requirements change
  useEffect(() => {
    if (showRequirements && requirements.category) {
      fetchInventoryData();
    }
  }, [requirements.category, requirements.brand, requirements.model, requirements.year]);

  const fetchInventoryData = async () => {
    if (!requirements.category) return;
    
    setIsInventoryLoading(true);
    try {
      const response = await inventoryService.getRequirementsCars({
        category: requirements.category,
        brand: requirements.brand || undefined,
        model: requirements.model || undefined,
        year: requirements.year || undefined,
      });

      if (response.success) {
        // Only update filtered items, don't overwrite allInventoryItems
        // This preserves selected items from other categories
        setFilteredInventoryItems(response.data.items);
        setFilterSummary(response.data.summary);
      } else {
        console.error('API error:', response.message);
        setToastMessage(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setToastMessage(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  // Fetch all inventory items for selected items display (no filters)
  // Uses the same requirements-cars endpoint but without any filter parameters
  const fetchAllInventoryItems = async () => {
    setIsAllItemsLoading(true);
    try {
      const response = await inventoryService.getAllItems();

      if (response.success) {
        setAllInventoryItems(response.data.items);
      } else {
        console.error('API error:', response.message);
        setToastMessage(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error fetching all inventory items:', error);
      setToastMessage(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsAllItemsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRequirement = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // API call to create customer using service
      const customerData: CreateCustomerData = {
        name: formData.name,
        email: formData.email,
        phone: selectedCountryCode + formData.phone,
        address: formData.address,
      };

      const response = await customerService.createCustomer(customerData);

      if (response.success) {
        // Success: Show green toast and open requirements section
        setToastMessage(SUCCESS_MESSAGES.CUSTOMER.CREATED);
        setToastType('success');
        setShowToast(true);
        setShowRequirements(true);
        
        // Clear errors
        setErrors({});
      } else {
        // Error: Show error message and make inputs red
        if (response.message.includes('already exists')) {
          setErrors({
            email: ERROR_MESSAGES.CUSTOMER.ALREADY_EXISTS,
            phone: ERROR_MESSAGES.CUSTOMER.PHONE_ALREADY_EXISTS,
          });
          setShowRequirements(false);
        } else {
          setToastMessage(response.message || 'Failed to create customer');
          setToastType('error');
          setShowToast(true);
        }
      }
    } catch (error) {
      console.error('Error creating customer:', error);
              setToastMessage(ERROR_MESSAGES.CUSTOMER.CREATE_FAILED);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAvailability = () => {
    fetchInventoryData();
  };

  // Modal state
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const handleClose = () => {
    // Show confirmation dialog instead of closing immediately
    setShowCloseConfirmation(true);
  };

  // Cart management functions
  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => new Set(Array.from(prev).concat(itemId)));
      setItemQuantities(prev => ({ ...prev, [itemId]: 1 }));
    } else {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      setItemQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[itemId];
        return newQuantities;
      });
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setItemQuantities(prev => {
      const currentQty = prev[itemId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [itemId]: newQty };
    });
  };

  const getSelectedItem = (itemId: string) => {
    return allInventoryItems.find(item => item._id === itemId);
  };

  const getTotalSelectedItems = () => {
    return Array.from(selectedItems).reduce((total, itemId) => {
      return total + (itemQuantities[itemId] || 1);
    }, 0);
  };

  const confirmClose = () => {
    // Reset form state
    setFormData({ name: '', email: '', phone: '', address: '' });
    setErrors({});
    setShowRequirements(false);
    setRequirements({ category: '', brand: '', model: '', year: '' });
    setSelectedCountryCode('+91');
                setAllInventoryItems([]);
    setFilteredInventoryItems([]);
    setIsAllItemsLoading(false);
    setFilterSummary({ category: [], brand: [], model: [], year: [] });
    setSelectedItems(new Set());
    setItemQuantities({});
    setShowCloseConfirmation(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const getFilteredItems = () => {
    return allInventoryItems.filter(item => {
      if (requirements.brand && item.brand !== requirements.brand) return false;
      if (requirements.model && item.model !== requirements.model) return false;
      if (requirements.year && item.year !== parseInt(requirements.year)) return false;
      return true;
    });
  };

  // Get all selected items (including those not in current filter)
  // This function now uses allInventoryItems instead of inventoryItems to ensure
  // selected items remain visible even when they don't match current filters
  const getAllSelectedItems = () => {
    return Array.from(selectedItems).map(itemId => {
      const item = allInventoryItems.find(invItem => invItem._id === itemId);
      return item ? { ...item, quantity: itemQuantities[itemId] || 1 } : null;
    }).filter(Boolean);
  };

  // Check if an item is selected (regardless of current filter)
  const isItemSelected = (itemId: string) => {
    return selectedItems.has(itemId);
  };

  // Update filtered items when requirements change
  useEffect(() => {
    const filtered = getFilteredItems();
    setFilteredInventoryItems(filtered);
  }, [requirements, allInventoryItems]);

  // Update filtered items when allInventoryItems changes (e.g., after API call)
  useEffect(() => {
    if (allInventoryItems.length > 0) {
      const filtered = getFilteredItems();
      setFilteredInventoryItems(filtered);
    }
  }, [allInventoryItems]);

  // Fetch all inventory items when modal opens for selected items display
  useEffect(() => {
    if (isOpen && showRequirements) {
      fetchAllInventoryItems();
    }
  }, [isOpen, showRequirements]);

  // Also fetch all items when requirements section is first shown
  useEffect(() => {
    if (showRequirements && allInventoryItems.length === 0) {
      fetchAllInventoryItems();
    }
  }, [showRequirements]);

  const filteredItems = filteredInventoryItems;

  return (
    <>
      <SimpleModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add New Customer"
        maxWidth="max-w-6xl"
      >
        <div className="space-y-8">
          {/* Customer Information Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 shadow-lg border border-blue-100">
            <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name"
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-blue-300 hover:shadow-md'
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-green-300 hover:shadow-md'
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Input with Country Code */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex space-x-2">
                  <CountryDropdown
                    value={selectedCountryCode}
                    onChange={setSelectedCountryCode}
                    countries={countries}
                    className="min-w-[180px]"
                    isLoading={countries.length === 0}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className={`block flex-1 px-4 py-3 border-2 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-200 ${
                      errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-purple-300 hover:shadow-md'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={3}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-200 resize-none ${
                    errors.address ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-orange-300 hover:shadow-md'
                  }`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleAddRequirement}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Customer...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Requirement
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Requirements Section - Only shown after successful customer creation */}
          {showRequirements && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg border border-emerald-100">
              <h4 className="text-xl font-bold text-emerald-800 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={requirements.category}
                    onChange={(e) => {
                      setRequirements(prev => ({ ...prev, category: e.target.value }));
                      // Reset other filters when category changes
                      setRequirements(prev => ({ ...prev, brand: '', model: '', year: '' }));
                    }}
                    className="block w-full px-4 py-3 border-2 border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm hover:border-emerald-400 transition-all duration-200 bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                {/* Brand Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={requirements.brand}
                    onChange={(e) => setRequirements(prev => ({ ...prev, brand: e.target.value }))}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-400 transition-colors"
                    disabled={!requirements.category}
                  >
                    <option value="">Select brand</option>
                    {filterSummary.brand.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Model Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={requirements.model}
                    onChange={(e) => setRequirements(prev => ({ ...prev, model: e.target.value }))}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-400 transition-colors"
                    disabled={!requirements.category}
                  >
                    <option value="">Select model</option>
                    {filterSummary.model.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Year Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={requirements.year}
                    onChange={(e) => setRequirements(prev => ({ ...prev, year: e.target.value }))}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm hover:border-gray-400 transition-colors"
                    disabled={!requirements.category}
                  >
                    <option value="">Select year</option>
                    {filterSummary.year.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Check Availability Button */}
              <div className="mb-8">
                <button
                  onClick={handleCheckAvailability}
                  disabled={!requirements.category || isInventoryLoading}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl"
                >
                  {isInventoryLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking Availability...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check Availability
                    </div>
                  )}
                </button>
              </div>

              {/* Cart Summary - Show selected items */}
              {selectedItems.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  {/* Info message */}
                  <div className="mb-3 p-2 bg-blue-100 border border-blue-200 rounded text-xs text-blue-700">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Selected items remain in cart even when hidden by filters. Use +/- buttons to adjust quantities.
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-lg font-semibold text-blue-900 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Selected Items ({getTotalSelectedItems()})
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-700 font-medium">Cart</span>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {getTotalSelectedItems()}
                      </span>
                      {(() => {
                        const hiddenCount = getAllSelectedItems().filter(item => 
                          item && !filteredItems.some(filteredItem => filteredItem._id === item._id)
                        ).length;
                        return hiddenCount > 0 ? (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {hiddenCount} hidden
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {getAllSelectedItems().map(item => {
                      if (!item) return null;
                      
                      const itemId = item._id;
                      const quantity = item.quantity;
                      const totalPrice = item.sellingPrice * quantity;
                      const isInCurrentFilter = filteredItems.some(filteredItem => filteredItem._id === itemId);
                      
                      return (
                        <div key={itemId} className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                          isInCurrentFilter ? 'border-blue-200' : 'border-orange-200'
                        }`}>
                          <div className="p-4">
                            {/* Item Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h6 className={`font-semibold text-lg ${isInCurrentFilter ? 'text-blue-900' : 'text-orange-900'}`}>
                                    {item.brand} {item.model}
                                  </h6>
                                  {!isInCurrentFilter && (
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                      Hidden by filter
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-1">{item.name}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>SKU: {item.sku}</span>
                                  <span>Category: {item.category}</span>
                                  <span>Year: {item.year}</span>
                                </div>
                              </div>
                              
                              {/* Price Section */}
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-500 mb-1">Unit Price</div>
                                <div className="text-lg font-bold text-green-600">
                                  ${item.sellingPrice.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            
                            {/* Quantity and Total Section */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleQuantityChange(itemId, -1)}
                                    className={`w-8 h-8 rounded-full hover:scale-105 transition-all flex items-center justify-center text-sm font-bold ${
                                      isInCurrentFilter ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                    }`}
                                  >
                                    -
                                  </button>
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isInCurrentFilter ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
                                  }`}>
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(itemId, 1)}
                                    className={`w-8 h-8 rounded-full hover:scale-105 transition-all flex items-center justify-center text-sm font-bold ${
                                      isInCurrentFilter ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              {/* Total Price */}
                              <div className="text-right">
                                <div className="text-sm text-gray-500 mb-1">Total</div>
                                <div className="text-xl font-bold text-green-600">
                                  ${totalPrice.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Cart Total Summary */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-blue-900">Cart Total</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${getAllSelectedItems().reduce((total, item) => {
                            if (!item) return total;
                            return total + (item.sellingPrice * item.quantity);
                          }, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTotalSelectedItems()} items selected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Items Display */}
              {filteredItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Available Items ({filteredItems.length})
                    </h5>
                    {selectedItems.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 font-medium">Cart</span>
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {getTotalSelectedItems()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {filteredItems.map(item => (
                      <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              id={`item-${item._id}`}
                              checked={isItemSelected(item._id)}
                              onChange={(e) => handleItemSelect(item._id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </div>
                          
                          {/* Item Details */}
                          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm flex-1">
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">SKU</span>
                              <p className="text-gray-900 font-medium">{item.sku}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Brand</span>
                              <p className="text-gray-900 font-medium">{item.brand}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Model</span>
                              <p className="text-gray-900 font-medium">{item.model}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</span>
                              <p className="text-gray-900 font-medium">{item.name}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Price</span>
                              <p className="text-gray-900 font-medium text-green-600">${item.sellingPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</span>
                              <p className="text-gray-900 font-medium">{item.category}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Year</span>
                              <p className="text-gray-900 font-medium">{item.year}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {requirements.category && filteredItems.length === 0 && !isInventoryLoading && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg font-medium">No items found with selected filters.</p>
                  <p className="text-sm">Try adjusting your search criteria.</p>
                </div>
              )}

              <div className="flex space-x-4 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    console.log('Saving requirements:', requirements);
                    // Handle saving requirements
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Save and Send Quotation
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Quotation
                </button>
              </div>
            </div>
          )}
        </div>
      </SimpleModal>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toastType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                toastType === 'success' ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{ width: `${toastProgress}%` }}
            />
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {toastType === 'success' ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg mr-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Close Modal?
              </h3>
            </div>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              All changes will be lost. Are you sure you want to close this modal?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={cancelClose}
                className="flex-1 bg-gradient-to-r from-slate-300 to-gray-400 text-slate-700 px-6 py-3 rounded-xl hover:from-slate-400 hover:to-gray-500 focus:outline-none focus:ring-4 focus:ring-slate-500/20 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No, Keep Open
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:via-pink-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerModal;
