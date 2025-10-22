import React, { useRef } from 'react';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { Receipt } from '../services/receiptService';
import { toWords } from 'number-to-words';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptPDFPreviewProps {
  receipt: Receipt;
  onClose: () => void;
}

const ReceiptPDFPreview: React.FC<ReceiptPDFPreviewProps> = ({ receipt, onClose }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const formatAmountInWords = (amount: number): string => {
    const words = toWords(Math.floor(amount));
    return `${words} Only`;
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 1.5, // Reduced scale for better fit
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: pdfRef.current.scrollHeight,
        width: pdfRef.current.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // Reduced width to fit A4 with margins
      const pageHeight = 280; // Reduced height to fit A4 with margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if content fits on one page
      if (imgHeight <= pageHeight) {
        // Single page - center the content
        const yOffset = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
      } else {
        // Multiple pages - split content properly
        let position = 0;
        let pageNumber = 1;
        
        while (position < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          // Calculate how much of the image to show on this page
          const remainingHeight = imgHeight - position;
          const pageContentHeight = Math.min(pageHeight, remainingHeight);
          
          // Create a canvas for this page's content
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = (pageContentHeight * canvas.width) / imgWidth;
          
          // Draw the portion of the image for this page
          pageCtx?.drawImage(
            canvas,
            0, (position * canvas.height) / imgHeight, // Source Y
            canvas.width, (pageContentHeight * canvas.height) / imgHeight, // Source height
            0, 0, // Destination X, Y
            canvas.width, (pageContentHeight * canvas.height) / imgHeight // Destination width, height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageContentHeight);
          
          position += pageContentHeight;
          pageNumber++;
        }
      }

      const fileName = `receipt-${receipt.receiptNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Receipt Preview</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PDF Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div ref={pdfRef} className="p-4 bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
            {/* Company Header */}
            <div className="border-b-2 border-gray-800 pb-3 mb-4">
              {/* Receipt Voucher Title - Centered */}
              <div className="text-center mb-3">
                <h1 className="text-xl font-bold text-gray-800">RECEIPT VOUCHER</h1>
              </div>
              
              {/* Company Info Layout */}
              <div className="flex justify-between items-start">
                {/* Left Side - Logo and Company Name */}
                <div className="flex flex-col items-start">
                  <img 
                    src="/logo_extracted.png" 
                    alt="Company Logo" 
                    className="h-12 mb-2"
                    onError={(e) => {
                      // Fallback if logo doesn't load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-sm font-semibold text-gray-700">
                    {receipt.company?.name}
                  </div>
                </div>
                
                {/* Right Side - Company Details */}
                <div className="text-right text-sm text-gray-600">
                  {receipt.company?.address?.street && (
                    <div>{receipt.company.address.street}</div>
                  )}
                  {receipt.company?.address?.city && receipt.company?.address?.state && (
                    <div>{receipt.company.address.city}, {receipt.company.address.state}</div>
                  )}
                  {receipt.company?.address?.country && (
                    <div>{receipt.company.address.country}</div>
                  )}
                  {receipt.company?.phone && (
                    <div className="mt-2 font-medium">Phone: {receipt.company.phone}</div>
                  )}
                  {receipt.company?.email && (
                    <div className="font-medium">Email: {receipt.company.email}</div>
                  )}
                  {receipt.company?.website && (
                    <div className="font-medium">Website: {receipt.company.website}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Receipt Number:</span>
                    <span className="text-gray-900">{receipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Receipt Date:</span>
                    <span className="text-gray-900">{formatDate(receipt.receiptDate, { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Payment Method:</span>
                    <span className="text-gray-900 capitalize">{receipt.paymentMethod}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Customer Name:</span>
                    <span className="text-gray-900">{receipt.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Contact:</span>
                    <span className="text-gray-900">{receipt.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="text-gray-900">{receipt.customer.email}</span>
                  </div>
                </div>
              </div>
              
              {receipt.customer.address && (
                <div className="mt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Address:</span>
                    <span className="text-gray-900">{receipt.customer.address}</span>
                  </div>
                </div>
              )}

              {receipt.customer.trn && (
                <div className="mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">TRN:</span>
                    <span className="text-gray-900">{receipt.customer.trn}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Description</h3>
              <p className="text-sm text-gray-700">{receipt.description}</p>
            </div>

            {/* Amount Section */}
            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Amount:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(receipt.amount, receipt.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Currency:</span>
                      <span className="text-sm font-medium text-gray-900">{receipt.currency}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Amount in Words:</div>
                    <div className="text-sm font-semibold text-gray-800 italic">
                      {formatAmountInWords(receipt.amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quotation Reference */}
            {receipt.quotationId && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-800 mb-1 border-b border-gray-300 pb-1">Related Order</h3>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-gray-700">Order Number:</span>
                      <span className="ml-2 text-gray-900">{receipt.quotationId.quotationNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900 capitalize">{receipt.quotationId.status}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Total Amount:</span>
                      <span className="ml-2 text-gray-900">{formatCurrency(receipt.quotationId.totalAmount, receipt.currency)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Booking Amount:</span>
                      <span className="ml-2 text-gray-900">{formatCurrency(receipt.quotationId.bookingAmount, receipt.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">Terms & Conditions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Export Terms */}
                {receipt.company?.termCondition?.export && (
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-semibold text-gray-800 mb-2 text-center text-sm">Export Terms</div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <div><strong>Price:</strong> {receipt.company.termCondition.export.price}</div>
                      <div><strong>Delivery:</strong> {receipt.company.termCondition.export.delivery}</div>
                      <div><strong>Payment:</strong> {receipt.company.termCondition.export.payment}</div>
                      <div><strong>Validity:</strong> {receipt.company.termCondition.export.validity}</div>
                    </div>
                  </div>
                )}
                
                {/* General Terms */}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-semibold text-gray-800 mb-2 text-center text-sm">General Terms</div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 pl-2 pr-2">
                    <li className="mb-1">Full payment before delivery of the vehicle.</li>
                    <li className="mb-1">All banking charges are payable by the buyer.</li>
                    <li className="mb-1">Payments accepted through T/T, cheques, or cash only.</li>
                    <li className="mb-1">Receipt is valid for 3 days from the creation date.</li>
                    <li className="mb-1">This document is valueless without an authorized signature and company stamp.</li>
                    <li className="mb-1">Merchandise shall not be sold or shipped to embargoed countries.</li>
                    <li className="mb-1">Company website's T&C apply.</li>
                    <li className="mb-1">No returns or exchanges; advance payments are non-refundable.</li>
                    <li className="mb-1">Buyer acknowledges inspecting and accepting the car as-is.</li>
                    <li className="mb-1">Customs documentation must be refunded within the allowed period.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="border-t-2 border-gray-400 pt-1">
                    <div className="text-sm font-semibold text-gray-700">Customer Signature</div>
                    <div className="text-xs text-gray-500 mt-2">Date: _______________</div>
                  </div>
                </div>
                <div>
                  <div className="border-t-2 border-gray-400 pt-1">
                    <div className="text-sm font-semibold text-gray-700">Accountant/Cashier Signature</div>
                    <div className="text-xs text-gray-500 mt-2">Date: _______________</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center border-t border-gray-300 pt-2">
              <div className="text-xs text-gray-600 space-y-0.5">
                {receipt.company?.address && (
                  <div>
                    {receipt.company.address.street}, {receipt.company.address.city}, {receipt.company.address.state}, {receipt.company.address.country}
                  </div>
                )}
                <div>
                  Email: {receipt.company?.email} | 
                  Contact: {receipt.company?.phone} | 
                  Website: {receipt.company?.website}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 shadow-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPDFPreview;
