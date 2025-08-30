import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  className = '',
}) => {
  const baseClasses = 'block w-full px-4 py-3 border-2 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200 bg-white';
  const errorClasses = error ? 'border-red-400 bg-red-50/50 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-300 hover:border-blue-300 hover:shadow-md';
  
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={classes}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 000 16zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Select;
