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
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500/30 border border-emerald-400',
    secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 hover:from-slate-200 hover:to-slate-300 focus:ring-slate-500/30 border border-slate-500/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-red-500/30 border border-red-400',
    outline: 'border-2 border-slate-500/50 text-slate-700 hover:bg-slate-100 hover:border-slate-400 focus:ring-slate-500/30 bg-white',
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
