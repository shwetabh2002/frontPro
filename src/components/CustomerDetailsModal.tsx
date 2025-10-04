import React, { useState, useEffect, useCallback } from 'react';
import { customerService, CustomerDetails, Quotation } from '../services/customerService';
import { useToast } from '../contexts/ToastContext';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const { showToast } = useToast();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await customerService.getCustomerDetails(customerId);
      setCustomerDetails(response.data);
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err.message || 'Failed to fetch customer details');
      showToast('Failed to fetch customer details', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, showToast]);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId, fetchCustomerDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-slate-500/20 text-slate-700 border-slate-500/30';
      case 'sent':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'accepted':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-700 border-slate-500/30';
    }
  };

  const handleClose = () => {
    setCustomerDetails(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-100 to-slate-200 z-10 rounded-t-2xl shadow-lg border-b border-slate-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Customer Details</h2>
                <p className="text-slate-600 text-sm">View customer information and quotations</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 animate-spin text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-slate-600 text-lg">Loading customer details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-4 bg-red-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Details</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={fetchCustomerDetails}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : customerDetails ? (
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-300 shadow-xl">
                {/* Header with Customer ID Badge */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Customer Information</h3>
                      <p className="text-slate-600 text-sm">Complete customer profile details</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl px-4 py-2">
                    <span className="text-slate-800 font-mono font-bold text-lg">{customerDetails.customer.custId}</span>
                  </div>
                </div>

                {/* Main Customer Details Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6 shadow-sm">
                  <div className="flex items-start space-x-6">
                    {/* Customer Avatar/Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <span className="text-2xl font-bold text-slate-800">
                          {customerDetails.customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Customer Basic Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-bold text-slate-800 mb-2">{customerDetails.customer.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-slate-700">{customerDetails.customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-slate-700 font-mono">
                            {customerDetails.customer.countryCode} {customerDetails.customer.phone}
                          </span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-slate-700 leading-relaxed">{customerDetails.customer.address}</span>
                        </div>
                        {customerDetails.customer.trn && (
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-slate-700 font-mono">
                              TRN: {customerDetails.customer.trn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-400">Account Created</span>
                    </div>
                    <p className="text-slate-800 font-medium">{formatDate(customerDetails.customer.createdAt)}</p>
                  </div>
                  
                  <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm font-medium text-gray-400">Last Updated</span>
                    </div>
                    <p className="text-slate-800 font-medium">{formatDate(customerDetails.customer.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Quotations Section */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-300 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Quotations</h3>
                      <p className="text-slate-600 text-sm">Customer quotation history and status</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl px-4 py-2">
                    <span className="text-purple-400 font-bold text-lg">{customerDetails.quotations.statistics.total} Total</span>
                  </div>
                </div>

                {customerDetails.quotations.data.length > 0 ? (
                  <div className="space-y-6">
                    {customerDetails.quotations.data.map((quotation: Quotation) => (
                      <div key={quotation._id} className="bg-gradient-to-r from-slate-100 to-white rounded-xl p-6 border border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Quotation Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-slate-800">{quotation.quotationNumber}</h4>
                              <p className="text-slate-600 text-sm font-mono">{quotation.quotationId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(quotation.status)}`}>
                              {quotation.status.toUpperCase()}
                            </span>
                            <div className="bg-gradient-to-r from-blue-500/30 to-blue-500/30 border-2 border-blue-400/50 rounded-2xl px-6 py-3 shadow-xl">
                              <div className="text-center">
                                <p className="text-xs text-blue-300 font-medium uppercase tracking-wide">Currency</p>
                                <p className="text-blue-400 font-black text-2xl">{quotation.currency}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quotation Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-sm text-gray-400">Valid Until</p>
                                <p className="text-slate-800 font-medium">{formatDate(quotation.validTill)}</p>
                              </div>
                            </div>
                            
                            {/* Booking Amount - Only show if > 0 */}
                            {quotation.bookingAmount && quotation.bookingAmount > 0 && (
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <div>
                                  <p className="text-sm text-gray-400">Booking Amount</p>
                                  <p className="text-slate-800 font-medium text-green-600">
                                    {quotation.currency} {quotation.bookingAmount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div>
                                <p className="text-sm text-gray-400">Created By</p>
                                <p className="text-slate-800 font-medium">{quotation.createdBy.name}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-sm text-gray-400">Created At</p>
                                <p className="text-slate-800 font-medium">{formatDate(quotation.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-400 mb-2">No Quotations Found</h4>
                    <p className="text-gray-500">This customer doesn't have any quotations yet.</p>
                  </div>
                )}

                {/* Statistics */}
                {customerDetails.quotations.statistics.total > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Status Breakdown</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(customerDetails.quotations.statistics.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {status.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-sm">({count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
