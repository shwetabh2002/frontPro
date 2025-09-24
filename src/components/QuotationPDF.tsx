import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';
import QuotationPDFPreview from './QuotationPDFPreview';
import QuotationPDFTemplate from './QuotationPDFTemplate';

interface QuotationPDFProps {
  quotationData: any;
  onClose: () => void;
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotationData, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();
  const templateRef = useRef<HTMLDivElement>(null);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (!templateRef.current) {
      showToast('Error: Template not found', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: templateRef.current.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`quotation-${quotationData.quotationNumber}.pdf`);
      showToast('PDF generated successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (showPreview) {
    return (
      <QuotationPDFPreview
        quotationData={quotationData}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownload}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Generate PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Choose how you want to generate the PDF for quotation <strong>{quotationData.quotationNumber}</strong>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Preview PDF
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Hidden template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <QuotationPDFTemplate 
          ref={templateRef}
          quotationData={quotationData} 
        />
      </div>
    </div>
  );
};

export default QuotationPDF;