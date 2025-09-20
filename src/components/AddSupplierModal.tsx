import React, { useState, useEffect, useCallback } from 'react';
import { createSupplier, updateSupplier, CreateSupplierData, UpdateSupplierData, Supplier } from '../services/supplierService';
import { useToast } from '../contexts/ToastContext';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, APP_CONSTANTS } from '../constants';
import CountryDropdown from './CountryDropdown';
import { countriesService, Country } from '../services/countriesService';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSupplier?: Supplier | null;
  mode?: 'create' | 'edit' | 'view';
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  address: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  address?: string;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editSupplier = null,
  mode = 'create',
  onModeChange,
}) => {
  const { showToast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    countryCode: APP_CONSTANTS.DEFAULTS.COUNTRY_CODE,
    address: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const countriesData = await countriesService.getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
        showToast('Failed to load countries', 'error');
      } finally {
        setIsLoadingCountries(false);
      }
    };

    if (isOpen) {
      loadCountries();
    }
  }, [isOpen, showToast]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if ((mode === 'edit' || mode === 'view') && editSupplier) {
        // Pre-fill form with existing supplier data
        setFormData({
          name: editSupplier.name || '',
          email: editSupplier.email || '',
          phone: editSupplier.phone || '',
          countryCode: editSupplier.countryCode || APP_CONSTANTS.DEFAULTS.COUNTRY_CODE,
          address: editSupplier.address || '',
        });
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          email: '',
          phone: '',
          countryCode: APP_CONSTANTS.DEFAULTS.COUNTRY_CODE,
          address: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, editSupplier]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Supplier name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Supplier name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!APP_CONSTANTS.VALIDATION.EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove country code from phone for validation
      const cleanPhone = formData.phone.replace(formData.countryCode, '').trim();
      if (cleanPhone.length < 7) {
        newErrors.phone = 'Phone number must be at least 7 digits';
      } else if (cleanPhone.length > 15) {
        newErrors.phone = 'Phone number must be less than 15 digits';
      } else if (!/^[\d\s\-\+\(\)]+$/.test(cleanPhone)) {
        newErrors.phone = 'Phone number contains invalid characters';
      }
    }

    // Country code validation
    if (!formData.countryCode) {
      newErrors.countryCode = 'Country code is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    } else if (formData.address.trim().length > 500) {
      newErrors.address = 'Address must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [errors]);

  // Handle country code change
  const handleCountryCodeChange = useCallback((dialCode: string) => {
    setFormData(prev => ({
      ...prev,
      countryCode: dialCode,
    }));
    
    if (errors.countryCode) {
      setErrors(prev => ({
        ...prev,
        countryCode: undefined,
      }));
    }
  }, [errors.countryCode]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Skip validation and submission for view mode
    if (mode === 'view') {
      return;
    }
    
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'edit' && editSupplier) {
        // Update existing supplier
        const updateData: UpdateSupplierData = {
          _id: editSupplier._id,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          countryCode: formData.countryCode,
          address: formData.address.trim(),
        };

        await updateSupplier(updateData);
        showToast(SUCCESS_MESSAGES.SUPPLIER.UPDATED, 'success');
      } else {
        // Create new supplier
        const supplierData: CreateSupplierData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          countryCode: formData.countryCode,
          address: formData.address.trim(),
        };

        await createSupplier(supplierData);
        showToast(SUCCESS_MESSAGES.SUPPLIER.CREATED, 'success');
      }
      
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} supplier:`, error);
      
      // Handle specific API errors
      if (error.message?.includes('email')) {
        setErrors(prev => ({ ...prev, email: 'Email already exists' }));
      } else if (error.message?.includes('phone')) {
        setErrors(prev => ({ ...prev, phone: 'Phone number already exists' }));
      } else {
        const errorMessage = mode === 'edit' 
          ? ERROR_MESSAGES.SUPPLIER.UPDATE_FAILED 
          : ERROR_MESSAGES.SUPPLIER.CREATE_FAILED;
        showToast(error.message || errorMessage, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, showToast, onSuccess, onClose]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle switch to edit mode
  const handleSwitchToEdit = useCallback(() => {
    if (onModeChange) {
      onModeChange('edit');
    }
  }, [onModeChange]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isSubmitting, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {mode === 'view' ? 'View Supplier' : mode === 'edit' ? 'Edit Supplier' : 'Add New Supplier'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {mode === 'view' 
                      ? 'View supplier information' 
                      : mode === 'edit' 
                        ? 'Update supplier information' 
                        : 'Enter supplier information to add them to your network'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Supplier Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter supplier name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      mode === 'view' 
                        ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed' 
                        : errors.name 
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-300 hover:border-slate-400'
                    }`}
                    disabled={isSubmitting || mode === 'view'}
                    readOnly={mode === 'view'}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="supplier@example.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      mode === 'view' 
                        ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed' 
                        : errors.email 
                          ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                          : 'border-slate-300 hover:border-slate-400'
                    }`}
                    disabled={isSubmitting || mode === 'view'}
                    readOnly={mode === 'view'}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number - Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <div className="w-40">
                    <CountryDropdown
                      value={formData.countryCode}
                      onChange={handleCountryCodeChange}
                      countries={countries}
                      placeholder="Code"
                      className="w-full"
                      isLoading={isLoadingCountries}
                      disabled={isSubmitting || mode === 'view'}
                    />
                    {errors.countryCode && (
                      <p className="text-xs text-red-600 mt-1">{errors.countryCode}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        mode === 'view' 
                          ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed' 
                          : errors.phone 
                            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                            : 'border-slate-300 hover:border-slate-400'
                      }`}
                      disabled={isSubmitting || mode === 'view'}
                      readOnly={mode === 'view'}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    mode === 'view' 
                      ? 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed' 
                      : errors.address 
                        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-300 hover:border-slate-400'
                  }`}
                  disabled={isSubmitting || mode === 'view'}
                  readOnly={mode === 'view'}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.address}
                  </p>
                )}
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              {mode === 'view' ? (
                <button
                  type="button"
                  onClick={handleSwitchToEdit}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{mode === 'edit' ? 'Update Supplier' : 'Create Supplier'}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
