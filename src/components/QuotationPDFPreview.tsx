import React from 'react';
import { formatPrice, getCurrencySymbol } from '../utils/currencyUtils';

interface QuotationPDFPreviewProps {
  quotationData: any;
  onClose: () => void;
  onDownload: () => void;
}

const QuotationPDFPreview: React.FC<QuotationPDFPreviewProps> = ({ 
  quotationData, 
  onClose, 
  onDownload 
}) => {
  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">PDF Preview - {quotationData.quotationNumber}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PDF Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white shadow-lg max-w-4xl mx-auto rounded-lg" style={{ minHeight: '800px', padding: '28px' }}>
            {/* Header Section */}
            <header className="flex items-center justify-between gap-4 mb-5">
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden">
                  <img 
                    src="/digital.webp" 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-700 leading-tight">
                    <div className="font-semibold text-lg">{quotationData.company?.name || 'AL KARAMA MOTORS FZE'}</div>
                    <div>{quotationData.company?.address?.street || 'Show Room No: 377,'}</div>
                    <div>{quotationData.company?.address?.city || 'Ducamz (Dubai Auto Zone),'}</div>
                    <div>{quotationData.company?.address?.state || 'Ras Al Khor Dubai'} {quotationData.company?.address?.country || 'UAE'}</div>
                    <div>Tel: {quotationData.company?.phone || '+971 43337699'}</div>
                    <div>
                      <a href={quotationData.company?.website || 'https://www.alkaramamotors.com'} 
                         target="_blank" rel="noopener" 
                         className="text-blue-600 hover:underline">
                        {quotationData.company?.website || 'www.alkaramamotors.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right text-sm text-gray-700">
                <div><strong>Quote Date:</strong> {formatDate(quotationData.createdAt)}</div>
                <div><strong>Sales Quote #:</strong> {quotationData.quotationNumber}</div>
                <div><strong>Validity:</strong> {formatDate(quotationData.validTill)}</div>
              </div>
            </header>

            {/* Proforma Invoice Title - Centered above cards */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">PROFORMA INVOICE</h1>
            </div>

            {/* Two Column Cards */}
            <div className="flex gap-6 mt-5 flex-wrap">
              {/* Bill To Card */}
              <div className="flex-1 min-w-80 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Bill / Export To</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Name:</span>
                    <span className="text-gray-700 font-semibold text-lg">{quotationData.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Address:</span>
                    <span className="text-gray-700">{quotationData.customer.address || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Phone:</span>
                    <span className="text-gray-700">{quotationData.customer.phone || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Email:</span>
                    <span className="text-gray-700">{quotationData.customer.email || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Customer ID:</span>
                    <span className="text-gray-700">{quotationData.customer.custId || ''}</span>
                  </div>
                </div>
              </div>

              {/* PI Details Card */}
              <div className="flex-1 min-w-80 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">PI Details</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>Quote Date:</strong> {formatDate(quotationData.createdAt)}</div>
                  <div><strong>Valid Till:</strong> {formatDate(quotationData.validTill)}</div>
                  <div><strong>Quotation #:</strong> {quotationData.quotationNumber}</div>
                  <div><strong>Sales Reference:</strong> {quotationData.createdBy?.name || 'System Administrator'}</div>
                  <div className="mt-2">
                    <strong>Chassis No(s):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      {quotationData.items.map((item: any, index: number) => 
                        item.vinNumbers?.map((vin: any, vinIndex: number) => (
                          <li key={`${index}-${vinIndex}`} className="text-xs">{vin.chasisNumber}</li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Items table */}
            <section className="mt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Description of Goods</h3>

              <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-sm text-gray-800 border-b border-gray-300">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-sm text-gray-800 border-b border-gray-300">Description</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm text-gray-800 border-b border-gray-300">Ext. Color</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm text-gray-800 border-b border-gray-300">Int. Color</th>
                      <th className="px-4 py-3 text-center font-semibold text-sm text-gray-800 border-b border-gray-300">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-sm text-gray-800 border-b border-gray-300">Unit Price (AED)</th>
                      <th className="px-4 py-3 text-right font-semibold text-sm text-gray-800 border-b border-gray-300">Total Amount (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationData.items.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                          <div className="font-medium text-gray-900">{item.name} {item.brand} {item.model} {item.year}</div>
                          {item.vinNumbers && item.vinNumbers.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              <div className="font-medium">Chassis No:</div>
                              {item.vinNumbers.map((vin: any, vinIndex: number) => (
                                <div key={vinIndex} className="ml-2">{vinIndex + 1}) {vin.chasisNumber}</div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">{item.color || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">{item.interiorColor || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200 font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">{formatCurrency(item.sellingPrice, quotationData.currency)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right border-b border-gray-200 font-semibold">{formatCurrency(item.totalPrice, quotationData.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800 border-t border-gray-300">Total of Units</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800 border-t border-gray-300">
                        {quotationData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">Subtotal (AED)</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">{formatCurrency(quotationData.subtotal, quotationData.currency)}</td>
                    </tr>
                    
                    {/* Additional Expenses Row */}
                    {quotationData.additionalExpenses?.amount > 0 && (
                      <tr className="bg-yellow-50">
                        <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                          +Additional Expenses ({quotationData.additionalExpenses.expenceType})
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                          +{formatCurrency(quotationData.additionalExpenses.amount, quotationData.currency)}
                        </td>
                      </tr>
                    )}
                    
                    {/* Discount Row */}
                    {quotationData.totalDiscount > 0 && (
                      <tr className="bg-red-50">
                        <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                          -Discount ({quotationData.discountType})
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                          -{formatCurrency(quotationData.totalDiscount, quotationData.currency)}
                        </td>
                      </tr>
                    )}
                    
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">Total Amount (AED)</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                        {formatCurrency(
                          quotationData.subtotal + 
                          (quotationData.additionalExpenses?.amount || 0) - 
                          (quotationData.totalDiscount || 0), 
                          quotationData.currency
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Expenses Breakdown */}
            {quotationData.additionalExpenses && quotationData.additionalExpenses.amount > 0 && (
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Expenses</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {quotationData.additionalExpenses.expenceType ? 
                          quotationData.additionalExpenses.expenceType.charAt(0).toUpperCase() + 
                          quotationData.additionalExpenses.expenceType.slice(1) : 
                          'Additional Expense'
                        }
                      </div>
                      {quotationData.additionalExpenses.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {quotationData.additionalExpenses.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {formatCurrency(quotationData.additionalExpenses.amount, quotationData.additionalExpenses.currency || quotationData.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Discount Section */}
            {quotationData.totalDiscount > 0 && (
              <section className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">
                        Discount ({quotationData.discountType === 'percentage' ? 'Percentage' : 'Fixed'})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg text-green-600">
                        -{formatCurrency(quotationData.totalDiscount, quotationData.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Final Totals */}
            <section className="mt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Final Totals</h3>
              <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">Subtotal:</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(quotationData.subtotal, quotationData.currency)}</td>
                    </tr>
                    
                    {quotationData.additionalExpenses && quotationData.additionalExpenses.amount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Additional Expenses:</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">+{formatCurrency(quotationData.additionalExpenses.amount, quotationData.additionalExpenses.currency || quotationData.currency)}</td>
                      </tr>
                    )}
                    
                    {quotationData.totalDiscount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">Discount:</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right">-{formatCurrency(quotationData.totalDiscount, quotationData.currency)}</td>
                      </tr>
                    )}
                    
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">VAT ({quotationData.VAT || 5}%):</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(quotationData.vatAmount, quotationData.currency)}</td>
                    </tr>
                    
                    <tr className="bg-blue-50">
                      <td className="px-4 py-3 text-lg font-bold text-gray-900">Grand Total ({quotationData.currency}):</td>
                      <td className="px-4 py-3 text-lg font-bold text-blue-600 text-right">{formatCurrency(quotationData.totalAmount, quotationData.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notes and Delivery Address - Two Column Layout */}
            {(quotationData.notes || quotationData.deliveryAddress) && (
              <section className="mt-5">
                <div className="flex gap-6 flex-wrap">
                  {/* Notes Column */}
                  {quotationData.notes && (
                    <div className="flex-1 min-w-80">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-700">
                          {quotationData.notes}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address Column */}
                  {quotationData.deliveryAddress && (
                    <div className="flex-1 min-w-80">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-gray-700">
                          {quotationData.deliveryAddress}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Terms & Conditions and Bank Details - Two Column Layout */}
            <section className="mt-5">
              <div className="flex gap-6 flex-wrap">
                {/* Terms & Conditions Column */}
                <div className="flex-1 min-w-80">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Terms & Conditions</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {quotationData.company?.termCondition?.export ? (
                      <div className="space-y-3 text-sm text-gray-700">
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">EXPORT PRICE:</div>
                          <div className="text-gray-600">{quotationData.company.termCondition.export.price}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">DELIVERY:</div>
                          <div className="text-gray-600">{quotationData.company.termCondition.export.delivery}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">PAYMENT & MODE:</div>
                          <div className="text-gray-600">{quotationData.company.termCondition.export.payment}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">VALIDITY:</div>
                          <div className="text-gray-600">{quotationData.company.termCondition.export.validity}</div>
                        </div>
                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="font-semibold text-gray-800 mb-1">Amount in words:</div>
                          <div className="text-gray-600">{quotationData.totalAmount.toLocaleString()} Only</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <div className="font-semibold text-gray-800 mb-1">Amount in words:</div>
                        <div>{quotationData.totalAmount.toLocaleString()} Only</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details Column */}
                {quotationData.company?.bankDetails && (
                  <div className="flex-1 min-w-80">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">Bank Name:</span>
                          <span className="text-gray-700">{quotationData.company.bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">Account Name:</span>
                          <span className="text-gray-700">{quotationData.company.bankDetails.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">Account No:</span>
                          <span className="text-gray-700">{quotationData.company.bankDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">IBAN (AED):</span>
                          <span className="text-gray-700 text-xs">{quotationData.company.bankDetails.iban}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">SWIFT CODE:</span>
                          <span className="text-gray-700">{quotationData.company.bankDetails.swiftCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Footer */}
            <div className="flex justify-between items-center mt-5 text-sm text-gray-600">
              <div>
                <div><strong>Prepared by:</strong></div>
                <div className="mt-1 italic">{quotationData.createdBy?.name || 'SYSTEM'} — Sales Ref</div>
              </div>

              <div className="text-right">
                <div className="mb-2 font-bold">Customer Acceptance</div>
                <div>Proforma Invoice — {quotationData.quotationNumber}</div>
                <div className="mt-1">Show Room No: 377, Dubai Auto Zone</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-100 p-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationPDFPreview;
