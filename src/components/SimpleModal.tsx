import React from 'react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-gradient-to-br from-gray-900 to-black rounded-2xl text-left overflow-visible shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle ${maxWidth} w-full border border-amber-500/50`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-black px-6 py-5 border-b border-amber-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 bg-gray-900 overflow-visible">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
