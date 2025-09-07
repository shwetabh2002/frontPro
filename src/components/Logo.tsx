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
      {/* Automotive Logo SVG */}
      <svg 
        className={sizeClasses[size]} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="automotiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="100" cy="100" r="95" fill="url(#blackGradient)" stroke="url(#automotiveGradient)" strokeWidth="4"/>
        
        {/* Car body outline */}
        <path d="M40 120 Q40 80 60 60 L140 60 Q160 80 160 120 L160 140 Q160 150 150 150 L50 150 Q40 150 40 140 Z" 
              fill="url(#automotiveGradient)" opacity="0.9"/>
        
        {/* Car windows */}
        <path d="M50 70 Q50 60 60 60 L140 60 Q150 60 150 70 L150 110 Q150 120 140 120 L60 120 Q50 120 50 110 Z" 
              fill="url(#blackGradient)" opacity="0.8"/>
        
        {/* Car wheels */}
        <circle cx="70" cy="140" r="12" fill="url(#blackGradient)" stroke="url(#automotiveGradient)" strokeWidth="2"/>
        <circle cx="130" cy="140" r="12" fill="url(#blackGradient)" stroke="url(#automotiveGradient)" strokeWidth="2"/>
        
        {/* Wheel spokes */}
        <circle cx="70" cy="140" r="6" fill="url(#automotiveGradient)" opacity="0.6"/>
        <circle cx="130" cy="140" r="6" fill="url(#automotiveGradient)" opacity="0.6"/>
        
        {/* Headlights */}
        <circle cx="50" cy="90" r="4" fill="#EAB308"/>
        <circle cx="50" cy="110" r="4" fill="#EAB308"/>
        
        {/* Taillights */}
        <circle cx="150" cy="90" r="3" fill="#F59E0B"/>
        <circle cx="150" cy="110" r="3" fill="#F59E0B"/>
        
        {/* Grille */}
        <rect x="45" y="75" width="10" height="20" fill="url(#blackGradient)" opacity="0.7"/>
        
        {/* Side mirrors */}
        <circle cx="65" cy="85" r="3" fill="url(#automotiveGradient)"/>
        <circle cx="135" cy="85" r="3" fill="url(#automotiveGradient)"/>
        
        {/* Door handles */}
        <rect x="75" y="100" width="8" height="2" fill="url(#automotiveGradient)" rx="1"/>
        <rect x="117" y="100" width="8" height="2" fill="url(#automotiveGradient)" rx="1"/>
        
        {/* Brand text area */}
        <rect x="80" y="130" width="40" height="8" fill="url(#blackGradient)" opacity="0.8" rx="2"/>
        <text x="100" y="136" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" fill="url(#automotiveGradient)">AUTO</text>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="ml-3">
          <h1 className={`font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            AutoPOS
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
