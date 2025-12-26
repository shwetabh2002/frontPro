import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';
import QuotationPDFPreview from './QuotationPDFPreview';
import QuotationPDFTemplate from './QuotationPDFTemplate';

interface QuotationPDFProps {
  quotationData: any;
  onClose: () => void;
  isFromOrdersPage?: boolean;
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotationData, onClose, isFromOrdersPage = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProformaMode, setIsProformaMode] = useState(false);
  const { showToast } = useToast();
  const templateRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (asProforma: boolean = false) => {
    if (!templateRef.current) {
      showToast('Error: Template not found', 'error');
      return;
    }

    setIsGenerating(true);
    if (asProforma) setIsProformaMode(true);
    
    // Wait a bit for the template to update with proforma mode
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

      // Save the PDF with appropriate filename based on source and type
      const displayNumber = isFromOrdersPage 
        ? quotationData.quotationNumber.replace(/QUO/g, 'SO')
        : quotationData.quotationNumber;
      
      let fileName: string;
      if (asProforma) {
        fileName = `proforma-invoice-${displayNumber}.pdf`;
      } else if (isFromOrdersPage) {
        fileName = `salesOrder-${displayNumber}.pdf`;
      } else {
        fileName = `quotation-${quotationData.quotationNumber}.pdf`;
      }
      
      pdf.save(fileName);
      showToast(`${asProforma ? 'Proforma Invoice' : 'PDF'} generated successfully!`, 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
      setIsProformaMode(false);
    }
  };

  const handleDownload = () => generatePDF(false);
  const handleDownloadProforma = () => generatePDF(true);

  return (
    <QuotationPDFPreview
      quotationData={quotationData}
      onClose={onClose}
      onDownload={handleDownload}
      onDownloadProforma={handleDownloadProforma}
      templateRef={templateRef}
      isGenerating={isGenerating}
      isFromOrdersPage={isFromOrdersPage}
      isProformaMode={isProformaMode}
    />
  );
};

export default QuotationPDF;