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
    primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-blue-500/30',
    secondary: 'bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 text-white hover:from-slate-700 hover:via-gray-700 hover:to-zinc-700 focus:ring-slate-500/30',
    danger: 'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white hover:from-red-700 hover:via-pink-700 hover:to-rose-700 focus:ring-red-500/30',
    outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 focus:ring-blue-500/30 bg-white',
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-ping opacity-20"></div>
        </div>
      )}
      {children}
    </button>
  );
};

export default Button;
