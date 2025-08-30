import React from 'react';

interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChange,
  error,
  className = '',
}) => {
  const countryCodes: CountryCode[] = [
    { code: 'IN', dialCode: '+91', flag: '🇮🇳' },
    { code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', dialCode: '+44', flag: '🇬🇧' },
    { code: 'CA', dialCode: '+1', flag: '🇨🇦' },
    { code: 'AU', dialCode: '+61', flag: '🇦🇺' },
    { code: 'DE', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', dialCode: '+33', flag: '🇫🇷' },
    { code: 'JP', dialCode: '+81', flag: '🇯🇵' },
    { code: 'CN', dialCode: '+86', flag: '🇨🇳' },
    { code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  ];

  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = React.useState('');

  React.useEffect(() => {
    if (value) {
      // Parse existing value to extract country code and phone
      const country = countryCodes.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dialCode.length));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountryChange = (countryCode: string) => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const newValue = country.dialCode + phoneNumber;
      onChange(newValue);
    }
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    const newValue = selectedCountry.dialCode + phone;
    onChange(newValue);
  };

  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="w-24 mr-2">
          <select
            value={selectedCountry.code}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`${baseClasses} ${errorClasses} pr-8`}
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
        </div>
        
        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Phone number"
            className={`${baseClasses} ${errorClasses}`}
          />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
