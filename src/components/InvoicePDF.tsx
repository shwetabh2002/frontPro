import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '../contexts/ToastContext';
import InvoicePDFPreview from './InvoicePDFPreview';

interface InvoicePDFProps {
  invoiceData: any;
  onClose: () => void;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoiceData, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();
  const templateRef = useRef<HTMLDivElement>(null);

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
        height: templateRef.current.scrollHeight,
        logging: false
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Try to fit on one page with minimal margins
      const margin = 5; // Reduced margin
      const availableWidth = imgWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      // Calculate scale to fit content
      const scaleX = availableWidth / imgWidth;
      const scaleY = availableHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the content
      const xOffset = (imgWidth - scaledWidth) / 2;
      const yOffset = (pageHeight - scaledHeight) / 2;
      
      // If content fits on one page, add it
      if (scaledHeight <= availableHeight) {
        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
      } else {
        // Content doesn't fit - split across pages
        const pageMargin = 5;
        const availablePageHeight = pageHeight - (pageMargin * 2);
        const availablePageWidth = imgWidth - (pageMargin * 2);
        
        let yPosition = 0;
        let pageNumber = 0;
        
        while (yPosition < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          const remainingHeight = canvas.height - yPosition;
          const pageContentHeight = Math.min(remainingHeight, (availablePageHeight / imgHeight) * canvas.height);
          
          // Create a cropped canvas for this page
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageContentHeight;
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, yPosition, canvas.width, pageContentHeight, 0, 0, canvas.width, pageContentHeight);
            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
            const pageHeightMM = (pageContentHeight / canvas.height) * imgHeight;
            pdf.addImage(pageImgData, 'JPEG', pageMargin, pageMargin, availablePageWidth, pageHeightMM);
          }
          
          yPosition += pageContentHeight;
          pageNumber++;
        }
      }

      // Download the PDF
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
      showToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error generating PDF. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <InvoicePDFPreview 
      invoiceData={invoiceData} 
      onClose={onClose}
      onDownload={handleDownload}
      templateRef={templateRef}
      isGenerating={isGenerating}
    />
  );
};

export default InvoicePDF;
