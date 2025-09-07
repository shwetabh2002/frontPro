import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Automotive-themed loader with steering wheel design */}
        <svg
          className={`animate-spin ${sizeClasses[size]} text-transparent`}
          fill="none"
          viewBox="0 0 24 24"
        >
          {/* Outer ring - steering wheel rim */}
          <circle
            className="opacity-30"
            cx="12"
            cy="12"
            r="10"
            stroke="url(#automotiveGradient)"
            strokeWidth="2"
          ></circle>
          {/* Inner ring - steering wheel spokes */}
          <circle
            className="opacity-60"
            cx="12"
            cy="12"
            r="6"
            stroke="url(#automotiveGradient)"
            strokeWidth="1.5"
          ></circle>
          {/* Center hub */}
          <circle
            className="opacity-90"
            cx="12"
            cy="12"
            r="2"
            fill="url(#automotiveGradient)"
          ></circle>
          {/* Spokes */}
          <path
            className="opacity-80"
            stroke="url(#automotiveGradient)"
            strokeWidth="1"
            d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
          ></path>
        </svg>
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="automotiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-ping opacity-20"></div>
      </div>
    </div>
  );
};

export default Loader;
