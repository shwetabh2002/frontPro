import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg hover:shadow-xl';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black hover:from-amber-700 hover:to-yellow-600 focus:ring-amber-500/30 border border-amber-400',
    secondary: 'bg-gradient-to-r from-gray-800 to-black text-amber-400 hover:from-gray-700 hover:to-gray-900 focus:ring-amber-500/30 border border-amber-500/50',
    danger: 'bg-gradient-to-r from-red-900 to-red-800 text-red-300 hover:from-red-800 hover:to-red-700 focus:ring-red-500/30 border border-red-600',
    outline: 'border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400 focus:ring-amber-500/30 bg-gray-800',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="relative -ml-1 mr-3">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            {/* Automotive-themed mini steering wheel */}
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
            <circle className="opacity-60" cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"></circle>
            <circle className="opacity-90" cx="12" cy="12" r="2" fill="currentColor"></circle>
            <path className="opacity-80" stroke="currentColor" strokeWidth="1" d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"></path>
          </svg>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-ping opacity-20"></div>
        </div>
      )}
      {children}
    </button>
  );
};

export default Button;
