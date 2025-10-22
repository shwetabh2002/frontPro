import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Planetsky Logo Image */}
      <img 
        src="/logo_extracted.png" 
        alt="Planetsky POS Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />

      {/* Brand Text */}
      {showText && (
        <div className="ml-3">
          <h1 className={`font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            Planetsky POS
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Automotive Solutions
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
