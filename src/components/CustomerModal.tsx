import React, { useState, useEffect } from 'react';
import SimpleModal from './SimpleModal';
import { inventoryService, type InventoryItem, type FilterSummary } from '../services/inventoryService';
import { customerService, type CreateCustomerData } from '../services/customerService';
import { countriesService, type Country } from '../services/countriesService';
import { currencyService, type Currency } from '../services/currencyService';
import { formatPrice, getCurrencySymbol } from '../utils/currencyUtils';
import { APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import CountryDropdown from './CountryDropdown';
import CurrencyDropdown from './CurrencyDropdown';
import Pagination from './Pagination';

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
    color: '',
  });

  // Inventory state
  const [allInventoryItems, setAllInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([]);
  const [filterSummary, setFilterSummary] = useState<FilterSummary>({ category: [], brand: [], model: [], year: [], color: [] });
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [isAllItemsLoading, setIsAllItemsLoading] = useState(false);
  
  // Cart state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(APP_CONSTANTS.DEFAULTS.COUNTRY_CODE);

  // Countries state
  const [countries, setCountries] = useState<Country[]>([]);

  // Currency state
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState<number>(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_LIMIT);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [previousCurrency, setPreviousCurrency] = useState<Currency | null>(null);

  // Handle currency selection
  const handleCurrencySelect = (currency: Currency) => {
    console.log('💰 Currency selected:', currency.code);
    
    // Check if items are selected and show alert
    if (showRequirements && selectedItems.size > 0) {
      // Store the previous currency for potential revert
      setPreviousCurrency(selectedCurrency);
      // Store the new currency but don't refresh yet
      setSelectedCurrency(currency);
      setShowRefreshAlert(true);
    } else {
      // Direct currency change if no items selected
      performCurrencyChange(currency);
    }
  };

  const performCurrencyChange = (currency: Currency) => {
    console.log('💰 Performing currency change to:', currency.code);
    setSelectedCurrency(currency);
    
    // Clear existing inventory data when currency changes
    if (showRequirements) {
      setFilteredInventoryItems([]);
      setAllInventoryItems([]);
      setSelectedItems(new Set());
      setItemQuantities({});
      // Reset pagination
      setCurrentPage(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
      setTotalItems(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPrevPage(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    console.log('📄 Page changed to:', page);
    setCurrentPage(page);
    fetchAllInventoryItemsForCurrency(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log('📊 Items per page changed to:', newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE); // Reset to first page
    fetchAllInventoryItemsForCurrency(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
  };

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // Simple client-side search for demonstration
    // In production, this should be server-side search
    const results = allInventoryItems.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.brand.toLowerCase().includes(term.toLowerCase()) ||
      item.model.toLowerCase().includes(term.toLowerCase()) ||
      item.sku.toLowerCase().includes(term.toLowerCase()) ||
      item.category.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  // Get items to display (search results or paginated items)
  const getDisplayItems = () => {
    if (searchTerm.trim() !== '') {
      return searchResults;
    }
    return filteredItems;
  };

  // Refresh inventory functionality
  const handleRefreshClick = () => {
    if (selectedItems.size > 0) {
      // Show alert if items are selected
      setShowRefreshAlert(true);
    } else {
      // Direct refresh if no items selected
      performRefresh();
    }
  };

  const performRefresh = () => {
    console.log('🔄 Refreshing inventory...');
    setIsRefreshing(true);
    setShowRefreshAlert(false);
    
    // Clear search and reset to first page
    setSearchTerm('');
    setSearchResults([]);
    setCurrentPage(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
    
    // Refresh inventory data
    fetchAllInventoryItemsForCurrency(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
  };

  const performCurrencyChangeWithRefresh = () => {
    console.log('💰 Performing currency change with refresh...');
    setShowRefreshAlert(false);
    setPreviousCurrency(null); // Clear previous currency state
    
    // Clear search and reset to first page
    setSearchTerm('');
    setSearchResults([]);
    setCurrentPage(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
    
    // Clear selected items and quantities
    setSelectedItems(new Set());
    setItemQuantities({});
    
    // Refresh inventory data with new currency
    fetchAllInventoryItemsForCurrency(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
  };

  const cancelRefresh = () => {
    setShowRefreshAlert(false);
    // Revert currency selection if it was a currency change
    if (previousCurrency) {
      console.log('💰 Currency change cancelled, reverting to:', previousCurrency.code);
      setSelectedCurrency(previousCurrency);
      setPreviousCurrency(null);
    } else {
      console.log('💰 Currency change cancelled, keeping current state');
    }
  };

  // Fetch countries and currencies on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await countriesService.getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    const loadCurrencies = async () => {
      console.log('🔄 Loading currencies...');
      setIsCurrenciesLoading(true);
      try {
        const currenciesData = await currencyService.getCurrencies();
        console.log('✅ Currencies loaded:', currenciesData.length, 'currencies');
        setCurrencies(currenciesData);
      } catch (error) {
        console.error('❌ Error loading currencies:', error);
        // Ensure we have some currencies even if API fails
        const fallbackCurrencies = [
          { code: 'USD', name: 'United States Dollar' },
          { code: 'EUR', name: 'Euro' },
          { code: 'GBP', name: 'British Pound Sterling' },
          { code: 'SAR', name: 'Saudi Riyal' },
          { code: 'AED', name: 'United Arab Emirates Dirham' },
          { code: 'QAR', name: 'Qatari Rial' },
          { code: 'KWD', name: 'Kuwaiti Dinar' },
          { code: 'BHD', name: 'Bahraini Dinar' },
          { code: 'OMR', name: 'Omani Rial' },
          { code: 'JOD', name: 'Jordanian Dinar' },
        ];
        setCurrencies(fallbackCurrencies);
      } finally {
        setIsCurrenciesLoading(false);
      }
    };

    loadCountries();
    loadCurrencies();
  }, []);

  // Fetch inventory data when requirements change
  useEffect(() => {
    if (showRequirements && requirements.category && selectedCurrency) {
      fetchInventoryData();
    }
  }, [requirements.category, requirements.brand, requirements.model, requirements.year, requirements.color]);

  // Refetch inventory data when currency changes
  useEffect(() => {
    if (showRequirements && selectedCurrency) {
      // Only auto-refresh if no items are selected (no alert needed)
      if (selectedItems.size === 0) {
        console.log('💰 Currency changed, refetching inventory data...');
        // Clear existing data when currency changes to show loading state
        setFilteredInventoryItems([]);
        setAllInventoryItems([]);
        setSelectedItems(new Set());
        setItemQuantities({});
        fetchAllInventoryItemsForCurrency();
      } else {
        console.log('💰 Currency changed but items selected, waiting for user confirmation...');
        // Don't refresh automatically, wait for user decision in alert popup
      }
    }
  }, [selectedCurrency]);

  // Fetch all inventory items with just currency (no filters)
  const fetchAllInventoryItemsForCurrency = async (page: number = 1) => {
    if (!selectedCurrency) return;
    
    console.log('🔄 fetchAllInventoryItemsForCurrency called with currency:', selectedCurrency.code, 'page:', page);
    setIsInventoryLoading(true);
    try {
      const response = await inventoryService.getAllItems(selectedCurrency.code, page, itemsPerPage);

      if (response.success) {
        console.log('✅ All inventory items loaded:', response.data.items.length, 'items');
        console.log('💰 Sample item with pricing:', response.data.items[0]);
        console.log('📊 API Pagination info:', response.data.pagination);
        console.log('💱 Currency info:', response.data.currencyInfo);
        
        setAllInventoryItems(response.data.items);
        setFilteredInventoryItems(response.data.items);
        setFilterSummary(response.data.summary);
        
        // Use pagination data from API response
        const pagination = response.data.pagination;
        setTotalItems(pagination.totalItems);
        setTotalPages(pagination.totalPages);
        setHasNextPage(pagination.hasNextPage);
        setHasPrevPage(pagination.hasPrevPage);
        setCurrentPage(pagination.currentPage);
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
      setIsInventoryLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchInventoryData = async () => {
    if (!requirements.category || !selectedCurrency) return;
    
    console.log('🔄 fetchInventoryData called with currency:', selectedCurrency.code);
    setIsInventoryLoading(true);
    try {
      const filters = {
        category: requirements.category,
        brand: requirements.brand || undefined,
        model: requirements.model || undefined,
        year: requirements.year || undefined,
        color: requirements.color || undefined,
        currencyType: selectedCurrency.code,
      };
      
      console.log('🔍 Fetching inventory with filters:', filters);
      console.log('🔍 Requirements state:', requirements);
      console.log('🔍 Selected currency:', selectedCurrency);
      console.log('🔍 Color value specifically:', requirements.color);
      
      const response = await inventoryService.getRequirementsCars(filters);

      if (response.success) {
        console.log('✅ API response received:', response.data.items.length, 'items');
        console.log('💰 Sample item with pricing:', response.data.items[0]);
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
    if (!selectedCurrency) return;
    
    setIsAllItemsLoading(true);
    try {
      const response = await inventoryService.getAllItems(selectedCurrency.code);

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

  const getSubtotal = () => {
    return getAllSelectedItems().reduce((total, item) => {
      if (!item) return total;
      const price = item.newSellingPrice || item.sellingPrice;
      return total + (price * item.quantity);
    }, 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (discountType === 'percentage') {
      const percentageAmount = (subtotal * discount) / 100;
      return Math.min(percentageAmount, subtotal); // Discount cannot exceed subtotal
    }
    return Math.min(discount, subtotal); // Discount cannot exceed subtotal
  };

  const getFinalTotal = () => {
    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    return Math.max(0, subtotal - discountAmount); // Total cannot be negative
  };

  const confirmClose = () => {
    // Reset form state
    setFormData({ name: '', email: '', phone: '', address: '' });
    setErrors({});
    setShowRequirements(false);
    setRequirements({ category: '', brand: '', model: '', year: '', color: '' });
    setSelectedCountryCode('+91');
    setAllInventoryItems([]);
    setFilteredInventoryItems([]);
    setIsAllItemsLoading(false);
    setSelectedItems(new Set());
    setItemQuantities({});
    setDiscount(0);
    setDiscountType('amount');
    setSelectedCurrency(null);
    setFilterSummary({ category: [], brand: [], model: [], year: [], color: [] });
    setCurrentPage(APP_CONSTANTS.DEFAULTS.PAGINATION.DEFAULT_PAGE);
    setTotalItems(0);
    setTotalPages(0);
    setHasNextPage(false);
    setHasPrevPage(false);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setShowRefreshAlert(false);
    setPreviousCurrency(null);
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
      if (requirements.color && item.color !== requirements.color) return false;
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
          <div className={`bg-gradient-to-br rounded-xl p-6 shadow-lg border ${
            showRequirements 
              ? 'from-gray-800 to-black border-amber-500/30' 
              : 'from-gray-900 to-black border-amber-500/50'
          }`}>
            <h4 className={`text-xl font-bold mb-6 flex items-center ${
              showRequirements ? 'text-amber-300' : 'text-amber-400'
            }`}>
              <div className={`p-2 rounded-lg mr-3 shadow-md ${
                showRequirements 
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 border border-amber-500/50' 
                  : 'bg-gradient-to-br from-amber-600 to-yellow-500'
              }`}>
                {showRequirements ? (
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              Customer Information
              {showRequirements && (
                <span className="ml-3 text-sm font-normal text-amber-300 bg-gray-800 border border-amber-500 px-3 py-1 rounded-full">
                  ✓ Locked
                </span>
              )}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name"
                  disabled={showRequirements}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all duration-200 bg-gray-800 text-gray-100 ${
                    errors.name ? 'border-red-400 bg-red-900' : 'border-amber-500/50 hover:border-amber-400 hover:shadow-md'
                  } ${showRequirements ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''}`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  disabled={showRequirements}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all duration-200 bg-gray-800 text-gray-100 ${
                    errors.email ? 'border-red-400 bg-red-900' : 'border-amber-500/50 hover:border-amber-400 hover:shadow-md'
                  } ${showRequirements ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''}`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Input with Country Code */}
              <div>
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  Phone Number *
                </label>
                <div className="flex space-x-2">
                  <CountryDropdown
                    value={selectedCountryCode}
                    onChange={setSelectedCountryCode}
                    countries={countries}
                    className={`min-w-[180px] ${showRequirements ? 'opacity-75 pointer-events-none' : ''}`}
                    isLoading={countries.length === 0}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    disabled={showRequirements}
                    className={`block flex-1 px-4 py-3 border-2 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all duration-200 bg-gray-800 text-gray-100 ${
                      errors.phone ? 'border-red-400 bg-red-900' : 'border-amber-500/50 hover:border-amber-400 hover:shadow-md'
                    } ${showRequirements ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-amber-400 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={3}
                  disabled={showRequirements}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all duration-200 resize-none bg-gray-800 text-gray-100 ${
                    errors.address ? 'border-red-400 bg-red-900' : 'border-amber-500/50 hover:border-amber-400 hover:shadow-md'
                  } ${showRequirements ? 'bg-gray-700 cursor-not-allowed opacity-75' : ''}`}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
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
                disabled={isLoading || showRequirements}
                className={`w-full px-6 py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-offset-2 font-bold text-base transition-all duration-300 transform shadow-xl ${
                  showRequirements
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-amber-300 cursor-not-allowed opacity-75 border border-amber-500/50'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black hover:from-amber-700 hover:to-yellow-600 hover:scale-[1.02] hover:shadow-2xl focus:ring-amber-500/30 border border-amber-400'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Customer...
                  </div>
                ) : showRequirements ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Customer Added ✓
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
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 shadow-lg border border-amber-500/50">
              <h4 className="text-xl font-bold text-amber-400 mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg mr-3 shadow-md">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Requirements
              </h4>

              {/* Currency Selection - Required before showing filters */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-amber-400 mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Select Currency *
                  </div>
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <CurrencyDropdown
                      currencies={currencies}
                      selectedCurrency={selectedCurrency}
                      onCurrencySelect={handleCurrencySelect}
                      isLoading={isCurrenciesLoading}
                      placeholder={isCurrenciesLoading ? "Loading currencies..." : "Choose currency for pricing"}
                      className="max-w-md"
                    />
                  </div>
                  
                  {/* Live Status Indicator & Refresh Button */}
                  {selectedCurrency && (
                    <div className="flex items-center space-x-2">
                      {/* Live Blinking Red Indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-400 font-medium">LIVE</span>
                      </div>
                      
                      {/* Refresh Button */}
                      <button
                        onClick={handleRefreshClick}
                        disabled={isRefreshing || isInventoryLoading}
                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-600 to-yellow-500 text-black rounded-lg hover:from-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                        title="Refresh inventory data"
                      >
                        {isRefreshing ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {!selectedCurrency && (
                  <p className="mt-2 text-sm text-amber-300 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Please select a currency to view available items
                  </p>
                )}
                {selectedCurrency && isInventoryLoading && (
                  <p className="mt-2 text-sm text-amber-300 flex items-center">
                    <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Loading prices for {selectedCurrency.code}...
                  </p>
                )}
              </div>

              {/* Filters - Only shown after currency selection */}
              {selectedCurrency && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-amber-400 mb-2">
                    Category
                  </label>
                  <select
                    value={requirements.category}
                    onChange={(e) => {
                      setRequirements(prev => ({ ...prev, category: e.target.value }));
                      // Reset other filters when category changes
                      setRequirements(prev => ({ ...prev, brand: '', model: '', year: '', color: '' }));
                    }}
                    className="block w-full px-4 py-3 border-2 border-amber-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm hover:border-amber-400 transition-all duration-200 bg-gray-800 text-gray-100"
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
                  <label className="block text-sm font-semibold text-amber-400 mb-2">
                    Brand
                  </label>
                  <select
                    value={requirements.brand}
                    onChange={(e) => setRequirements(prev => ({ ...prev, brand: e.target.value }))}
                    className="block w-full px-4 py-3 border border-amber-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm hover:border-amber-400 transition-colors bg-gray-800 text-gray-100"
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
                  <label className="block text-sm font-semibold text-amber-400 mb-2">
                    Model
                  </label>
                  <select
                    value={requirements.model}
                    onChange={(e) => setRequirements(prev => ({ ...prev, model: e.target.value }))}
                    className="block w-full px-4 py-3 border border-amber-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm hover:border-amber-400 transition-colors bg-gray-800 text-gray-100"
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
                  <label className="block text-sm font-semibold text-amber-400 mb-2">
                    Year
                  </label>
                  <select
                    value={requirements.year}
                    onChange={(e) => setRequirements(prev => ({ ...prev, year: e.target.value }))}
                    className="block w-full px-4 py-3 border border-amber-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm hover:border-amber-400 transition-colors bg-gray-800 text-gray-100"
                    disabled={!requirements.category}
                  >
                    <option value="">Select year</option>
                    {filterSummary.year.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Color Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-amber-400 mb-2">
                    Color
                  </label>
                  <select
                    value={requirements.color}
                    onChange={(e) => {
                      console.log('🎨 Color selected:', e.target.value);
                      setRequirements(prev => ({ ...prev, color: e.target.value }));
                    }}
                    className="block w-full px-4 py-3 border border-amber-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm hover:border-amber-400 transition-colors bg-gray-800 text-gray-100"
                    disabled={!requirements.category}
                  >
                    <option value="">Select color</option>
                    {filterSummary.color.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
              )}

              {/* Apply Filters Button - Only shown after currency selection */}
              {selectedCurrency && (
                <div className="mb-8">
                  <button
                    onClick={handleCheckAvailability}
                    disabled={!requirements.category || isInventoryLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-6 py-4 rounded-xl hover:from-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl border border-amber-400"
                  >
                    {isInventoryLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Applying Filters...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        Apply Filters
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Cart Summary - Show selected items */}
              {selectedCurrency && selectedItems.size > 0 && (
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
                      const unitPrice = item.newSellingPrice || item.sellingPrice;
                      const totalPrice = unitPrice * quantity;
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
                                  <span>Color: {item.color}</span>
                                </div>
                              </div>
                              
                              {/* Price Section */}
                              <div className="text-right ml-4">
                                <div className="text-sm text-gray-500 mb-1">Unit Price</div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatPrice(item.newSellingPrice || item.sellingPrice, item.currencyType || selectedCurrency?.code || 'USD')}
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
                                  {formatPrice(totalPrice, item.currencyType || selectedCurrency?.code || 'USD')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Cart Total Summary */}
                  <div className="mt-4 pt-4 border-t border-amber-500/30">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-semibold text-amber-400">Subtotal</div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-300">
                          {formatPrice(getSubtotal(), selectedCurrency?.code || 'USD')}
                        </div>
                        <div className="text-sm text-gray-400">
                          {getTotalSelectedItems()} items selected
                        </div>
                      </div>
                    </div>

                    {/* Discount Input */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-amber-300">Discount:</label>
                        <div className="flex items-center space-x-2">
                          {/* Discount Type Toggle */}
                          <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setDiscountType('amount');
                                setDiscount(0);
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                discountType === 'amount'
                                  ? 'bg-amber-500 text-black'
                                  : 'text-amber-300 hover:text-amber-200'
                              }`}
                            >
                              $
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDiscountType('percentage');
                                setDiscount(0);
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                discountType === 'percentage'
                                  ? 'bg-amber-500 text-black'
                                  : 'text-amber-300 hover:text-amber-200'
                              }`}
                            >
                              %
                            </button>
                          </div>
                          
                          {/* Discount Input */}
                          <div className="flex items-center space-x-1">
                            {discountType === 'amount' && (
                              <span className="text-amber-400">
                                {getCurrencySymbol(selectedCurrency?.code || 'USD')}
                              </span>
                            )}
                            <input
                              type="number"
                              min="0"
                              max={discountType === 'amount' ? getSubtotal() : 100}
                              step={discountType === 'amount' ? "0.01" : "1"}
                              value={discount}
                              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-20 px-2 py-1 text-sm bg-gray-800 border border-amber-500/50 rounded text-amber-100 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              placeholder={discountType === 'amount' ? "0.00" : "0"}
                            />
                            {discountType === 'percentage' && <span className="text-amber-400">%</span>}
                          </div>
                        </div>
                      </div>
                      {discount > 0 && (
                        <div className="text-right">
                          <div className="text-sm text-red-400 font-medium">
                            -{formatPrice(getDiscountAmount(), selectedCurrency?.code || 'USD')}
                          </div>
                          {discountType === 'percentage' && (
                            <div className="text-xs text-gray-400">
                              ({discount}% off)
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Final Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-amber-500/30">
                      <div className="text-xl font-bold text-amber-400">Total</div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">
                          {formatPrice(getFinalTotal(), selectedCurrency?.code || 'USD')}
                        </div>
                        {discount > 0 && (
                          <div className="text-sm text-green-400">
                            You save {formatPrice(getDiscountAmount(), selectedCurrency?.code || 'USD')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Items Display - Show all items after currency selection */}
              {selectedCurrency && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Available Items ({getDisplayItems().length})
                      {searchTerm && (
                        <span className="ml-2 text-sm text-amber-600 font-normal">
                          (Search: "{searchTerm}")
                        </span>
                      )}
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
                  
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search items by name, brand, model, SKU, or category..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm"
                      />
                      {isSearching && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Loading State */}
                  {isInventoryLoading && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading inventory items for {selectedCurrency.code}...
                      </div>
                    </div>
                  )}
                  
                  {/* Items List */}
                  {!isInventoryLoading && getDisplayItems().length > 0 && (
                    <div className="space-y-4">
                    {getDisplayItems().map(item => (
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
                          <div className="grid grid-cols-2 md:grid-cols-8 gap-4 text-sm flex-1">
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
                              <p className="text-gray-900 font-medium text-green-600">
                                {formatPrice(item.newSellingPrice || item.sellingPrice, item.currencyType || selectedCurrency?.code || 'USD')}
                              </p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</span>
                              <p className="text-gray-900 font-medium">{item.category}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Year</span>
                              <p className="text-gray-900 font-medium">{item.year}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Color</span>
                              <p className="text-gray-900 font-medium">{item.color}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                  
                  {/* Empty State */}
                  {!isInventoryLoading && getDisplayItems().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      {searchTerm ? (
                        <>
                          <p className="text-lg font-medium">No items found for "{searchTerm}".</p>
                          <p className="text-sm">Try a different search term or clear the search.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium">No inventory items available for {selectedCurrency.code}.</p>
                          <p className="text-sm">Please try a different currency or contact support.</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Pagination - Only show when not searching */}
                  {!isInventoryLoading && totalItems > 0 && !searchTerm && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        isLoading={isInventoryLoading}
                      />
                    </div>
                  )}
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
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-md w-full shadow-2xl border border-amber-500/50 transform transition-all duration-300 scale-100">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-xl shadow-lg mr-4">
                <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Close Modal?
              </h3>
            </div>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              All changes will be lost. Are you sure you want to close this modal?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={cancelClose}
                className="flex-1 bg-gradient-to-r from-gray-800 to-black text-amber-400 border border-amber-500/50 px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-900 hover:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No, Keep Open
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-6 py-3 rounded-xl hover:from-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:ring-offset-2 font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border border-amber-400"
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

      {/* Refresh/Currency Change Alert Popup */}
      {showRefreshAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-amber-500/30 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-amber-400 mb-2">
                  {selectedItems.size > 0 ? 'Currency Change Warning' : 'Refresh Inventory Data'}
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  {selectedItems.size > 0 ? (
                    <>
                      Changing currency will refresh the inventory with the latest exchange rates. 
                      <span className="text-red-400 font-medium">
                        Any selected items will be removed from your cart.
                      </span>
                    </>
                  ) : (
                    'This will refresh the inventory with the latest currency exchange rate.'
                  )}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelRefresh}
                    className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    {selectedItems.size > 0 ? 'No, Keep Items' : 'Cancel'}
                  </button>
                  <button
                    onClick={selectedItems.size > 0 ? performCurrencyChangeWithRefresh : performRefresh}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-4 py-2 rounded-lg hover:from-amber-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 font-medium"
                  >
                    {selectedItems.size > 0 ? 'Yes, Change Currency' : 'Yes, Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerModal;

