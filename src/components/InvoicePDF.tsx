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
        height: templateRef.current.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      if (totalPages === 1) {
        // Single page - fit to page with margins
        const margin = 10; // 10mm margin
        const availableWidth = imgWidth - (margin * 2);
        const availableHeight = pageHeight - (margin * 2);
        
        const scaleX = availableWidth / imgWidth;
        const scaleY = availableHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        const xOffset = (imgWidth - scaledWidth) / 2;
        const yOffset = (pageHeight - scaledHeight) / 2;
        
        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
      } else {
        // Multiple pages - force page break at 70% of content
        const pageMargin = 10; // 10mm margin
        const availablePageHeight = pageHeight - (pageMargin * 2);
        const availableWidth = imgWidth - (pageMargin * 2);
        
        // Page break at 70% of content
        const pageBreakY = imgHeight * 0.7;
        
        // First page - show content up to page break indicator
        const firstPageHeight = Math.min(pageBreakY, availablePageHeight);
        
        // Create a cropped canvas for the first page
        const firstPageCanvas = document.createElement('canvas');
        const firstPageCtx = firstPageCanvas.getContext('2d');
        firstPageCanvas.width = canvas.width;
        firstPageCanvas.height = (firstPageHeight / imgHeight) * canvas.height;
        
        if (firstPageCtx) {
          firstPageCtx.drawImage(canvas, 0, 0, canvas.width, firstPageCanvas.height, 0, 0, canvas.width, firstPageCanvas.height);
          const firstPageImgData = firstPageCanvas.toDataURL('image/jpeg', 0.9);
          pdf.addImage(firstPageImgData, 'JPEG', pageMargin, pageMargin, availableWidth, firstPageHeight);
        }
        
        // If we have more content, add a new page for final totals
        if (imgHeight > firstPageHeight) {
          pdf.addPage();
          
          // Create a cropped canvas for the second page (content after page break)
          const secondPageCanvas = document.createElement('canvas');
          const secondPageCtx = secondPageCanvas.getContext('2d');
          const secondPageStartY = (firstPageHeight / imgHeight) * canvas.height;
          const secondPageHeight = canvas.height - secondPageStartY;
          
          secondPageCanvas.width = canvas.width;
          secondPageCanvas.height = secondPageHeight;
          
          if (secondPageCtx) {
            secondPageCtx.drawImage(canvas, 0, secondPageStartY, canvas.width, secondPageHeight, 0, 0, canvas.width, secondPageHeight);
            const secondPageImgData = secondPageCanvas.toDataURL('image/jpeg', 0.9);
            const secondPageHeightMM = (secondPageHeight / canvas.height) * imgHeight;
            pdf.addImage(secondPageImgData, 'JPEG', pageMargin, pageMargin, availableWidth, secondPageHeightMM);
          }
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
