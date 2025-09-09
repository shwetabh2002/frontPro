import React, { useState, useRef, useEffect } from 'react';
import { Currency } from '../services/currencyService';

interface CurrencyDropdownProps {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  isLoading = false,
  placeholder = "Select Currency",
  className = ""
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('🔄 CurrencyDropdown: Received currencies:', currencies.length);
    console.log('🔄 CurrencyDropdown: Is loading:', isLoading);
  }, [currencies, isLoading]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencySelect(currency);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          w-full px-4 py-3 text-left bg-gray-800 border border-amber-500/50 rounded-lg
          text-amber-100 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 
          focus:border-amber-500 transition-all duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400'}
          ${isOpen ? 'ring-2 ring-amber-500 border-amber-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Currency Icon */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            
            {/* Selected Currency or Placeholder */}
            <div className="flex-1 min-w-0">
              {selectedCurrency ? (
                <div>
                  <div className="text-amber-100 font-medium">
                    {selectedCurrency.code}
                  </div>
                  <div className="text-sm text-amber-300 truncate">
                    {selectedCurrency.name}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  {placeholder}
                </div>
              )}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg 
                className={`w-5 h-5 text-amber-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-gray-800 border border-amber-500/50 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-amber-500/30">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search currencies..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-amber-500/30 rounded-md text-amber-100 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                autoFocus
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleCurrencySelect(currency)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-amber-500/10 transition-colors duration-150
                    ${selectedCurrency?.code === currency.code ? 'bg-amber-500/20 text-amber-200' : 'text-amber-100'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-6 bg-amber-500/20 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-300">
                            {currency.code}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-amber-100 font-medium truncate">
                            {currency.name}
                          </div>
                          <div className="text-sm text-amber-300 truncate">
                            {currency.code}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedCurrency?.code === currency.code && (
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.571M15 6.334A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.571" />
                </svg>
                <p>No currencies found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
