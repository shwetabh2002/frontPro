import React, { useState, useEffect } from 'react';
import SimpleModal from './SimpleModal';
import { customerService, type Customer, type CreateCustomerData } from '../services/customerService';
import { useToast } from '../contexts/ToastContext';
import CountryDropdown from './CountryDropdown';
import { countriesService, type Country } from '../services/countriesService';
import { APP_CONSTANTS } from '../constants';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdateSuccess?: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  customer,
  onUpdateSuccess 
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    trn: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(APP_CONSTANTS.DEFAULTS.COUNTRY_CODE);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Pre-populate form when customer data is provided
  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        trn: customer.trn || '',
      });
      setSelectedCountryCode(customer.countryCode || APP_CONSTANTS.DEFAULTS.COUNTRY_CODE);
      setErrors({});
    }
  }, [customer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !customer) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData: Partial<CreateCustomerData> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        countryCode: selectedCountryCode,
        trn: formData.trn.trim() || undefined,
      };

      const response = await customerService.updateCustomer(customer._id, updateData);

      if (response.success) {
        showToast('Customer updated successfully', 'success');
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        onClose();
      } else {
        showToast(response.message || 'Failed to update customer', 'error');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer';
      showToast(errorMessage, 'error');
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        const errors = error.response.data.errors;
        
        if (typeof errors === 'object') {
          Object.keys(errors).forEach((key) => {
            validationErrors[key] = Array.isArray(errors[key]) 
              ? errors[key][0] 
              : errors[key];
          });
        }
        
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Customer"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter customer name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="w-32">
              <CountryDropdown
                value={selectedCountryCode}
                onChange={setSelectedCountryCode}
                countries={countries}
                isLoading={isLoadingCountries}
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter address"
            disabled={isLoading}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* TRN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TRN (Optional)
          </label>
          <input
            type="text"
            value={formData.trn}
            onChange={(e) => handleInputChange('trn', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter TRN"
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Customer</span>
            )}
          </button>
        </div>
      </form>
    </SimpleModal>
  );
};

export default EditCustomerModal;

