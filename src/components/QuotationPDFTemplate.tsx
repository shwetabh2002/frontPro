import React, { forwardRef } from 'react';
import { toWords } from 'number-to-words';

interface QuotationPDFTemplateProps {
  quotationData: any;
}

const QuotationPDFTemplate = forwardRef<HTMLDivElement, QuotationPDFTemplateProps>(({ quotationData }, ref) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency || 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get status text
  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'draft':
        return { text: 'Draft' };
      case 'accepted':
        return { text: 'Accepted' };
      case 'review':
        return { text: 'Under Review' };
      case 'approved':
        return { text: 'Approved by Admin' };
      case 'confirmed':
        return { text: 'Confirmed' };
      case 'rejected':
        return { text: 'Rejected' };
      default:
        return { text: status };
    }
  };

  const customer = quotationData.customer;

  return (
    <div ref={ref} id="quotation-pdf-template" style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '10mm 15mm',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#000000',
      backgroundColor: '#ffffff',
      margin: '0 auto',
      position: 'relative'
    }}>
      
      {/* Header Section - Compact */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        {/* Company Information - Left Corner */}
        <div style={{ 
          position: 'absolute',
          left: '15mm',
          top: '10mm'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 3px 0',
            lineHeight: '1.2'
          }}>
            {quotationData.company?.name || 'AL KARAMA MOTORS FZE'}
          </div>
          <div style={{ fontSize: '10px', color: '#000000', lineHeight: '1.3' }}>
            <div>{quotationData.company?.address?.street || 'Show Room No: 377,'}</div>
            <div>{quotationData.company?.address?.city || 'Ducamz (Dubai Auto Zone),'}</div>
            <div>{quotationData.company?.address?.state || 'Ras Al Khor Dubai'} {quotationData.company?.address?.country || 'UAE'}</div>
            <div>Tel: {quotationData.company?.phone || '+971 43337699'}</div>
            <div>{quotationData.company?.website || 'https://www.alkaramamotors.com'}</div>
          </div>
        </div>

        {/* Logo and Invoice Details - Right Corner */}
        <div style={{ 
          position: 'absolute',
          right: '15mm',
          top: '10mm',
          textAlign: 'right'
        }}>
          {/* Logo */}
          <div style={{ 
            width: '50px', 
            height: '50px', 
            marginBottom: '5px',
            marginLeft: 'auto',
            backgroundImage: 'url(/logo_extracted.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
          
          {/* Invoice Details */}
          <div style={{ fontSize: '9px', color: '#000000' }}>
            <div>Quote Date: {formatDate(quotationData.createdAt)}</div>
            <div>Sales Quote #: {quotationData.quotationNumber}</div>
            <div>Validity: {formatDate(quotationData.validTill)}</div>
          </div>
        </div>
      </div>

      {/* Proforma Invoice Title - Compact */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#000000',
          marginTop: '80px',
          marginBottom: '15px',
          borderBottom: '2px solid #000000',
          paddingBottom: '10px'
        }}>
          {quotationData.status === 'draft' ? 'PROFORMA INVOICE' : 'SALES ORDER INVOICE'}
        </div>

      {/* Two Column Cards - Compact */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        {/* Bill To Card */}
        <div style={{ 
          flex: '1', 
          minWidth: '280px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #000000',
          borderRadius: '6px',
          padding: '10px'
        }}>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 8px 0'
          }}>
            Bill / Export To
          </h3>
          <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Name:</span>
              <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                {customer.name}
              </span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Address:</span>
              <span>{customer.address || ''}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Phone:</span>
              <span>{customer.phone || ''}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Email:</span>
              <span>{customer.email || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Customer ID:</span>
              <span>{customer.custId || ''}</span>
            </div>
        {customer.trn && (
          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>TRN:</span>
            <span>{customer.trn}</span>
          </div>
        )}
        {quotationData.exportTo && (
          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Export To:</span>
            <span>{quotationData.exportTo}</span>
          </div>
        )}
          </div>
        </div>

        {/* PI Details Card */}
        <div style={{ 
          flex: '1', 
          minWidth: '280px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #000000',
          borderRadius: '6px',
          padding: '10px'
        }}>
          <h3 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#000000',
            margin: '0 0 8px 0'
          }}>
            PI Details
          </h3>
          <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Quote Date:</span>
              <span>{formatDate(quotationData.createdAt)}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Valid Till:</span>
              <span>{formatDate(quotationData.validTill)}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Quotation #:</span>
              <span>{quotationData.quotationNumber}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Sales Reference:</span>
              <span>{quotationData.createdBy?.name || 'System Administrator'}</span>
            </div>
            <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>Status:</span>
              <span>{getStatusInfo(quotationData.status).text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table with Additional Expenses and Notes */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          color: '#333333',
          margin: '0 0 10px 0'
        }}>
          Description of Goods
        </h3>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '10px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f4ff' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left' }}>#</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left' }}>Ext. Color</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left' }}>Int. Color</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>Qty</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>Unit Price ({quotationData.currency})</th>
              <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>Total Amount ({quotationData.currency})</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.items.map((item: any, index: number) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{index + 1}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '9px', color: '#666666' }}>
                      {item.brand} {item.model} {item.year}
                    </div>
                    {item.vinNumbers && item.vinNumbers.length > 0 && (
                      <div style={{ fontSize: '9px', color: '#666666', marginTop: '2px' }}>
                        Chassis: {item.vinNumbers.map((vin: any) => vin.chasisNumber).join(', ')}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{item.color}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{item.interiorColor}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(item.sellingPrice, quotationData.currency)}
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(item.totalPrice, quotationData.currency)}
                </td>
              </tr>
            ))}
            
            {/* Additional Expenses Row */}
            {quotationData.additionalExpenses?.amount > 0 && (
              <tr style={{ backgroundColor: '#fef3c7' }}>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>-</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Additional Expenses ({quotationData.additionalExpenses.expenceType})</div>
                    <div style={{ fontSize: '9px', color: '#666666' }}>
                      {quotationData.additionalExpenses.description}
                    </div>
                  </div>
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>-</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>-</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>1</td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(quotationData.additionalExpenses.amount, quotationData.currency)}
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(quotationData.additionalExpenses.amount, quotationData.currency)}
                </td>
              </tr>
            )}
            
            {/* Notes Row */}
            {quotationData.notes && (
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>-</td>
                <td colSpan={5} style={{ border: '1px solid #d1d5db', padding: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Additional Notes:</div>
                    <div style={{ fontSize: '9px', color: '#666666', marginTop: '2px' }}>
                      {quotationData.notes}
                    </div>
                  </div>
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>-</td>
              </tr>
            )}

          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
              <td colSpan={4} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                Total of Units
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>
                {quotationData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                Subtotal
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                {formatCurrency(quotationData.subtotal, quotationData.currency)}
              </td>
            </tr>
            
            {/* Additional Expenses Row in Totals */}
            {quotationData.additionalExpenses?.amount > 0 && (
              <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
                <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  +Additional Expenses ({quotationData.additionalExpenses.expenceType})
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  +{formatCurrency(quotationData.additionalExpenses.amount, quotationData.currency)}
                </td>
              </tr>
            )}
            
            {/* Discount Row in Totals */}
            {quotationData.totalDiscount > 0 && (
              <tr style={{ backgroundColor: '#fef2f2', fontWeight: 'bold' }}>
                <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  -Discount ({quotationData.discountType})
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', color: '#dc2626' }}>
                  -{formatCurrency(quotationData.totalDiscount, quotationData.currency)}
                </td>
              </tr>
            )}
            
            {/* Booking Amount Row in Totals */}
            {quotationData.bookingAmount > 0 && (
              <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 'bold' }}>
                <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  Booking Amount
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', color: '#059669' }}>
                  {formatCurrency(quotationData.bookingAmount, quotationData.currency)}
                </td>
              </tr>
            )}
            
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
              <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                Total Amount ({quotationData.currency})
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                {formatCurrency(
                  quotationData.subtotal + 
                  (quotationData.additionalExpenses?.amount || 0) - 
                  (quotationData.totalDiscount || 0), 
                  quotationData.currency
                )}
              </td>
            </tr>
            {(quotationData.VAT > 0 || quotationData.company?.VAT > 0) && (
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  VAT ({quotationData.company?.VAT || quotationData.VAT || 0}%)
                </td>
                <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                  {formatCurrency(quotationData.vatAmount, quotationData.currency)}
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: '#e0f2fe', fontWeight: 'bold', fontSize: '11px' }}>
              <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                Grand Total ({quotationData.currency})
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>
                {formatCurrency(quotationData.totalAmount, quotationData.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Delivery Address - Compact */}
      {quotationData.deliveryAddress && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: '#333333',
            margin: '0 0 8px 0'
          }}>
            Delivery Address
          </h3>
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px'
          }}>
            {quotationData.deliveryAddress}
          </div>
        </div>
      )}

      {/* Terms & Conditions and Bank Details - Compact */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        {/* Terms & Conditions */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: '#333333',
            margin: '0 0 8px 0'
          }}>
            Terms & Conditions
          </h3>
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px',
            lineHeight: '1.3'
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>SALES POLICY:</strong> {quotationData.company?.termCondition?.export?.price || 'All prices are FOB Dubai unless otherwise specified.'}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>EXPORT & COMPLIANCE:</strong> {quotationData.company?.termCondition?.export?.delivery || 'Delivery within 7-10 working days from order confirmation.'}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>PAYMENT & MODE:</strong> {quotationData.company?.termCondition?.export?.payment || '100% advance payment required before shipment.'}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>VALIDITY:</strong> {quotationData.company?.termCondition?.export?.validity || 'This quotation is valid for 30 days from the date of issue.'}
            </div>
            <div style={{ marginTop: '6px', fontStyle: 'italic', fontWeight: 'bold', color: '#111827' }}>
              Amount in words: {toWords(Math.floor(quotationData.totalAmount))} Only
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: '#333333',
            margin: '0 0 8px 0'
          }}>
            Bank Detail
          </h3>
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '10px',
            lineHeight: '1.3'
          }}>
            <div style={{ marginBottom: '3px' }}>
              <strong>Bank Name:</strong> {quotationData.company?.bankDetails?.bankName || 'Emirates NBD'}
            </div>
            <div style={{ marginBottom: '3px' }}>
              <strong>Account Name:</strong> {quotationData.company?.bankDetails?.accountName || quotationData.company?.name || 'AL KARAMA MOTORS FZE'}
            </div>
            <div style={{ marginBottom: '3px' }}>
              <strong>Account No:</strong> {quotationData.company?.bankDetails?.accountNumber || '101234567890'}
            </div>
            <div style={{ marginBottom: '3px' }}>
              <strong>IBAN ({quotationData.currency}):</strong> {quotationData.company?.bankDetails?.iban || 'AE070331000000123456789'}
            </div>
            <div>
              <strong>SWIFT CODE:</strong> {quotationData.company?.bankDetails?.swiftCode || 'EBILAEAD'}
            </div>
          </div>
          {/* Company Stamp */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <img 
              src="/stamp-planet-sky.png" 
              alt="Company Stamp" 
              style={{ height: '120px', width: 'auto' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginTop: '20px',
        paddingTop: '10px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>
            Prepared by: {quotationData.createdBy?.name || 'System Administrator'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Customer Acceptance
          </div>
          <div style={{ fontWeight: 'bold' }}>
            {quotationData.status === 'draft' ? 'Proforma Invoice' : 'Sales Order Invoice'} — {quotationData.quotationNumber}
          </div>
          <div>{quotationData.company?.address?.street || 'Show Room No: 377, Dubai Auto Zone'}</div>
        </div>
      </div>
    </div>
  );
});

QuotationPDFTemplate.displayName = 'QuotationPDFTemplate';

export default QuotationPDFTemplate;
