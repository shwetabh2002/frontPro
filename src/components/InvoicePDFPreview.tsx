import React from 'react';
import InvoicePDFTemplate from './InvoicePDFTemplate';

interface InvoicePDFPreviewProps {
  invoiceData: any;
  onClose: () => void;
  onDownload: () => void;
  templateRef?: React.RefObject<HTMLDivElement | null>;
  isGenerating?: boolean;
}

const InvoicePDFPreview: React.FC<InvoicePDFPreviewProps> = ({ 
  invoiceData, 
  onClose, 
  onDownload,
  templateRef,
  isGenerating = false
}) => {
  if (!invoiceData) {
    return <div>Loading invoice data...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to get status color and text
  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'draft':
        return { color: 'bg-gray-500', text: 'Draft', textColor: 'text-gray-700' };
      case 'sent':
        return { color: 'bg-blue-500', text: 'Sent', textColor: 'text-blue-700' };
      case 'paid':
        return { color: 'bg-green-500', text: 'Paid', textColor: 'text-green-700' };
      case 'overdue':
        return { color: 'bg-red-500', text: 'Overdue', textColor: 'text-red-700' };
      default:
        return { color: 'bg-gray-500', text: status, textColor: 'text-gray-700' };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
            <div className="flex space-x-3">
              <button
                onClick={onDownload}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white shadow-lg max-w-4xl mx-auto rounded-lg relative" style={{ minHeight: '800px', padding: '28px' }}>
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusInfo(invoiceData.status).color} text-white shadow-md`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusInfo(invoiceData.status).color.replace('bg-', 'bg-').replace('-500', '-300')}`}></div>
          {getStatusInfo(invoiceData.status).text}
        </div>
      </div>
      
      {/* Header Section */}
      <header className="flex items-center justify-between gap-4 mb-5">
        <div className="flex gap-4 items-center">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <img 
              src="/logo_extracted.png" 
              alt="Company Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-sm text-gray-700 leading-tight">
              <div className="font-semibold text-lg">{invoiceData.company?.name || 'AL KARAMA MOTORS FZE'}</div>
              <div>{invoiceData.company?.address?.street || 'Show Room No: 377,'}</div>
              <div>{invoiceData.company?.address?.city || 'Ducamz (Dubai Auto Zone),'}</div>
              <div>{invoiceData.company?.address?.state || 'Ras Al Khor Dubai'} {invoiceData.company?.address?.country || 'UAE'}</div>
              <div>Tel: {invoiceData.company?.phone || '+971 43337699'}</div>
              <div>
                    <a href={invoiceData.company?.website || 'https://www.alkaramamotors.com'} 
                       target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                  {invoiceData.company?.website || 'www.alkaramamotors.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-sm text-gray-700">
          <div><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
          <div><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
          <div><strong>Due Date:</strong> {formatDate(invoiceData.dueDate)}</div>
        </div>
      </header>

      {/* Invoice Title - Centered above cards */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {invoiceData.status === 'draft' ? 'PROFORMA INVOICE' : 'CUSTOMER INVOICE'}
        </h1>
      </div>

      {/* Two Column Cards */}
      <div className="flex gap-6 mt-5 flex-wrap">
        {/* Bill To Card */}
        <div className="flex-1 min-w-80 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Bill / Export To</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Name:</span>
              <span className="text-gray-700 font-semibold text-lg">{invoiceData.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Address:</span>
              <span className="text-gray-700">{invoiceData.customer.address || ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Phone:</span>
              <span className="text-gray-700">{invoiceData.customer.phone || ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Email:</span>
              <span className="text-gray-700">{invoiceData.customer.email || ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-800">Customer ID:</span>
              <span className="text-gray-700">{invoiceData.customer.custId || ''}</span>
            </div>
            {invoiceData.exportTo && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Export To:</span>
                <span className="text-gray-700">{invoiceData.exportTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details Card */}
        <div className="flex-1 min-w-80 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoice Details</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
            <div><strong>Due Date:</strong> {formatDate(invoiceData.dueDate)}</div>
            <div><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
            <div><strong>Sales Reference:</strong> {invoiceData.createdBy?.name || 'System Administrator'}</div>
            <div className="mt-2">
              <strong>Chassis No(s):</strong>
              <ul className="ml-4 mt-1 space-y-1">
                {invoiceData.items.map((item: any, index: number) => 
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
                <th className="px-4 py-3 text-right font-semibold text-sm text-gray-800 border-b border-gray-300">Unit Price ({invoiceData.currency})</th>
                <th className="px-4 py-3 text-right font-semibold text-sm text-gray-800 border-b border-gray-300">Total Amount ({invoiceData.currency})</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item: any, index: number) => (
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
                  <td className="px-4 py-3 text-sm text-gray-700 text-right border-b border-gray-200">{formatCurrency(item.sellingPrice, invoiceData.currency)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right border-b border-gray-200 font-semibold">{formatCurrency(item.totalPrice, invoiceData.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800 border-t border-gray-300">Total of Units</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800 border-t border-gray-300">
                  {invoiceData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">Subtotal ({invoiceData.currency})</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
              </tr>
              
              {/* Additional Expenses Row */}
              {invoiceData.additionalExpenses?.amount > 0 && (
                <tr className="bg-yellow-50">
                  <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    +Additional Expenses ({invoiceData.additionalExpenses.expenceType})
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    +{formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}

              {/* Invoice Level Expenses Row */}
              {invoiceData.moreExpense?.amount > 0 && (
                <tr className="bg-yellow-50">
                  <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    +Invoice Level Expenses
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    +{formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}
              
              {/* Discount Row */}
              {invoiceData.discount > 0 && (
                <tr className="bg-red-50">
                  <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    -Discount ({invoiceData.discountType})
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                    -{formatCurrency(invoiceData.discount, invoiceData.currency)}
                  </td>
                </tr>
              )}
              
              <tr>
                <td colSpan={6} className="px-4 py-3 text-sm text-right font-semibold text-gray-800">Total Amount ({invoiceData.currency})</td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                  {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Expenses Breakdown */}
      {invoiceData.additionalExpenses && invoiceData.additionalExpenses.amount > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Expenses</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  {invoiceData.additionalExpenses.expenceType ? 
                    invoiceData.additionalExpenses.expenceType.charAt(0).toUpperCase() + 
                    invoiceData.additionalExpenses.expenceType.slice(1) : 
                    'Additional Expense'
                  }
                </div>
                {invoiceData.additionalExpenses.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {invoiceData.additionalExpenses.description}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Invoice Level Expenses */}
      {invoiceData.moreExpense && invoiceData.moreExpense.amount > 0 && (
        <section className="mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  Invoice Level Expenses
                </div>
                {invoiceData.moreExpense.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {invoiceData.moreExpense.description}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discount Section */}
      {invoiceData.discountAmount > 0 && (
        <section className="mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  Discount ({invoiceData.discountType === 'percentage' ? 'Percentage' : 'Fixed'})
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg text-green-600">
                  -{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}
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
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
              </tr>
              
              {invoiceData.additionalExpenses && invoiceData.additionalExpenses.amount > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">Additional Expenses ({invoiceData.currency}):</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">+{formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}</td>
                </tr>
              )}

              {invoiceData.moreExpense && invoiceData.moreExpense.amount > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">Invoice Level Expenses ({invoiceData.currency}):</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">+{formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}</td>
                </tr>
              )}
              
              {invoiceData.discountAmount > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">Discount:</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</td>
                </tr>
              )}
              
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">VAT ({invoiceData.VAT || 5}%):</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(invoiceData.vatAmount, invoiceData.currency)}</td>
              </tr>
              
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-lg font-bold text-gray-900">Grand Total ({invoiceData.currency}):</td>
                <td className="px-4 py-3 text-lg font-bold text-blue-600 text-right">{formatCurrency(invoiceData.finalTotal, invoiceData.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Information */}
      <section className="mt-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Information</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-gray-800 mb-1">Payment Status:</div>
                <div className="text-gray-600">{invoiceData.customerPayment.paymentStatus.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div className="text-sm text-gray-700 mt-2">
                <div className="font-semibold text-gray-800 mb-1">Amount Paid:</div>
                <div className="text-gray-600">{formatCurrency(invoiceData.customerPayment.paymentAmount, invoiceData.currency)}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-gray-800 mb-1">Payment Method:</div>
                <div className="text-gray-600">{invoiceData.customerPayment.paymentMethod.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div className="text-sm text-gray-700 mt-2">
                <div className="font-semibold text-gray-800 mb-1">Payment Date:</div>
                <div className="text-gray-600">{formatDate(invoiceData.customerPayment.paymentDate)}</div>
              </div>
            </div>
          </div>
          {invoiceData.customerPayment.paymentNotes && (
            <div className="mt-3">
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-gray-800 mb-1">Payment Notes:</div>
                <div className="text-gray-600">{invoiceData.customerPayment.paymentNotes}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notes and Delivery Address - Two Column Layout */}
      {invoiceData.notes && (
        <section className="mt-5">
          <div className="flex gap-6 flex-wrap">
            {/* Notes Column */}
            <div className="flex-1 min-w-80">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  {invoiceData.notes}
                </div>
              </div>
            </div>
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
              {invoiceData.company?.termCondition?.export ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">SALES POLICY:</div>
                    <div className="text-gray-600">{invoiceData.company.termCondition.export.price}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">EXPORT & COMPLIANCE:</div>
                    <div className="text-gray-600">{invoiceData.company.termCondition.export.delivery}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">PAYMENT & MODE:</div>
                    <div className="text-gray-600">{invoiceData.company.termCondition.export.payment}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">VALIDITY:</div>
                    <div className="text-gray-600">{invoiceData.company.termCondition.export.validity}</div>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="font-semibold text-gray-800 mb-1">Amount in words:</div>
                    <div className="text-gray-600">{invoiceData.finalTotal.toLocaleString()} Only</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <div className="font-semibold text-gray-800 mb-1">Amount in words:</div>
                  <div>{invoiceData.finalTotal.toLocaleString()} Only</div>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details Column */}
          {invoiceData.company?.bankDetails && (
            <div className="flex-1 min-w-80">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Bank Details</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Bank Name:</span>
                    <span className="text-gray-700">{invoiceData.company.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Account Name:</span>
                    <span className="text-gray-700">{invoiceData.company.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Account Number:</span>
                    <span className="text-gray-700">{invoiceData.company.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">IBAN:</span>
                    <span className="text-gray-700">{invoiceData.company.bankDetails.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">SWIFT Code:</span>
                    <span className="text-gray-700">{invoiceData.company.bankDetails.swiftCode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          {invoiceData.status === 'draft' ? 'Proforma Invoice' : 'Customer Invoice'} — {invoiceData.invoiceNumber}
        </p>
      </div>

            {/* Hidden template for PDF generation */}
            {templateRef && (
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <InvoicePDFTemplate 
                  ref={templateRef}
                  invoiceData={invoiceData} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDFPreview;
