import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Country } from '../services/countriesService';

interface CountryNameDropdownProps {
  value: string;
  onChange: (countryName: string) => void;
  countries: Country[];
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

const CountryNameDropdown: React.FC<CountryNameDropdownProps> = ({
  value,
  onChange,
  countries,
  placeholder = "Select country",
  className = "",
  isLoading = false,
  disabled = false,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Highlight search term in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-blue-200 px-1 rounded">$1</mark>');
  };

  // Get selected country object
  const selectedCountry = countries.find(country => country.name === value);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredCountries.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCountries.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCountries[highlightedIndex]) {
            onChange(filteredCountries[highlightedIndex].name);
            setIsOpen(false);
            setSearchTerm('');
            setHighlightedIndex(0);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCountries, highlightedIndex, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on the dropdown itself (portal content)
      const dropdownElement = document.querySelector('[data-country-name-dropdown]');
      if (dropdownElement && dropdownElement.contains(event.target as Node)) {
        return; // Don't close if clicking inside dropdown
      }
      
      // Check if the click is on the trigger button
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return; // Don't close if clicking on trigger button
      }
      
      // Close dropdown if clicking outside both
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(0);
    };

    // Use mousedown for better click detection
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens and handle window resize
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Update position on window resize
    const handleResize = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = rect.bottom + 4;
        let left = rect.left;
        let width = Math.max(rect.width, 320);
        
        // Check if dropdown would go below viewport
        if (top + 320 > viewportHeight) {
          top = rect.top - 320 - 4;
        }
        
        // Check if dropdown would go outside left edge
        if (left < 0) {
          left = 16;
        }
        
        // Check if dropdown would go outside right edge
        if (left + width > viewportWidth) {
          left = viewportWidth - width - 16;
        }
        
        setDropdownPosition({ top, left, width });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      // Calculate position when opening
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.bottom + 4;
      let left = rect.left;
      let width = Math.max(rect.width, 320); // Minimum width
      
      // Check if dropdown would go below viewport
      if (top + 320 > viewportHeight) {
        top = rect.top - 320 - 4; // Position above
      }
      
      // Check if dropdown would go outside left edge
      if (left < 0) {
        left = 16; // 16px margin
      }
      
      // Check if dropdown would go outside right edge
      if (left + width > viewportWidth) {
        left = viewportWidth - width - 16; // 16px margin
      }
      
      setDropdownPosition({ top, left, width });
    }
    
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
    }
  };

  // Helper function to get country flag emoji
  const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Helper function to get popular countries
  const getPopularCountries = (countries: Country[]): Country[] => {
    const popularCodes = ['AE', 'US', 'GB', 'IN', 'CN', 'JP', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU'];
    return countries.filter(country => popularCodes.includes(country.code));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={disabled ? undefined : toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-200 ${
          hasError 
            ? 'border-red-400 bg-red-50' 
            : 'border-orange-300 hover:border-orange-400 hover:shadow-md'
        } ${
          disabled 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' 
            : 'bg-white text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedCountry ? (
            <>
              <span className="text-lg flex-shrink-0">{getCountryFlag(selectedCountry.code)}</span>
              <span className="font-medium truncate">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-orange-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <div 
          data-country-name-dropdown
          className="fixed bg-gradient-to-br from-white to-slate-50 border-2 border-orange-300 rounded-xl shadow-2xl z-[99999] flex flex-col overflow-hidden backdrop-blur-sm"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            minWidth: '320px',
            maxHeight: '320px'
          }}
          onMouseDown={(e) => {
            // Prevent clicks inside dropdown from closing it
            e.stopPropagation();
          }}
        >
          {/* Search Input - Fixed at top */}
          <div className="bg-gradient-to-r from-orange-50 to-slate-100 border-b border-orange-200 p-4 flex-shrink-0">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 text-sm bg-white text-slate-800 placeholder-slate-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Countries List - Scrollable */}
          <div 
            className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors" 
            style={{ 
              maxHeight: '220px'
            }}
            onScroll={(e) => {
              // Prevent scroll event from bubbling up and closing dropdown
              e.stopPropagation();
            }}
          >
            {isLoading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="animate-spin w-8 h-8 text-orange-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm">Loading countries...</p>
              </div>
            ) : filteredCountries.length > 0 ? (
              <>
                {/* Popular Countries Section */}
                {searchTerm === '' && (
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-100 to-slate-100 border-b border-orange-200">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Popular Countries
                      </div>
                    </div>
                    {getPopularCountries(filteredCountries).map((country) => (
                      <button
                        key={`popular-${country.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-slate-50 focus:bg-gradient-to-r focus:from-orange-50 focus:to-slate-50 focus:outline-none transition-all duration-200 ${
                          country.name === value ? 'bg-gradient-to-r from-orange-100 to-slate-100 border-l-4 border-orange-500 shadow-sm' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-xl flex-shrink-0">{getCountryFlag(country.code)}</span>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-medium text-slate-800 truncate"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightText(country.name, searchTerm) 
                              }}
                            />
                          </div>
                        </div>
                        {country.name === value && (
                          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-100 to-orange-50 border-b border-orange-200">
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wide flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        All Countries
                      </div>
                    </div>
                  </>
                )}
                
                {/* All Countries */}
                {filteredCountries.map((country, index) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center px-4 py-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-indigo-50 focus:bg-gradient-to-r focus:from-orange-50 focus:to-indigo-50 focus:outline-none transition-all duration-200 ${
                      index === highlightedIndex ? 'bg-gradient-to-r from-orange-100 to-indigo-100' : ''
                    } ${country.name === value ? 'bg-gradient-to-r from-orange-100 to-indigo-100 border-l-4 border-orange-500 shadow-sm' : ''}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-xl flex-shrink-0">{getCountryFlag(country.code)}</span>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-medium text-gray-900 truncate"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(country.name, searchTerm) 
                          }}
                        />
                      </div>
                    </div>
                    {country.name === value && (
                      <svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-slate-500">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">No countries found</p>
                <p className="text-xs text-slate-400">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer with count - Fixed at bottom */}
          {filteredCountries.length > 0 && (
            <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-orange-50 border-t border-slate-200 text-xs font-medium text-slate-600 text-center flex-shrink-0">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {filteredCountries.length} of {countries.length} countries
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CountryNameDropdown;

