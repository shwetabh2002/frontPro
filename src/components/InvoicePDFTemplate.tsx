import React, { forwardRef } from 'react';
import { toWords } from 'number-to-words';

interface InvoicePDFTemplateProps {
  invoiceData: any;
}

const InvoicePDFTemplate = forwardRef<HTMLDivElement, InvoicePDFTemplateProps>(({ invoiceData }, ref) => {
  if (!invoiceData) {
    return <div>Loading invoice data...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        return { color: '#000000', text: 'Draft' };
      case 'sent':
        return { color: '#000000', text: 'Sent' };
      case 'paid':
        return { color: '#000000', text: 'Paid' };
      case 'overdue':
        return { color: '#000000', text: 'Overdue' };
      default:
        return { color: '#000000', text: status };
    }
  };

  return (
    <div ref={ref} style={{ 
      width: '794px', 
      padding: '10px 20px 20px 20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white',
      color: 'black',
      position: 'relative'
    }}>
      {/* Status Indicator */}
      <div style={{ position: 'absolute', top: '8px', right: '20px', zIndex: 10 }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          padding: '4px 10px', 
          borderRadius: '9999px', 
          fontSize: '10px', 
          fontWeight: '600', 
          backgroundColor: getStatusInfo(invoiceData.status).color, 
          color: 'white', 
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            marginRight: '6px', 
            backgroundColor: 'rgba(255, 255, 255, 0.7)' 
          }}></div>
          {getStatusInfo(invoiceData.status).text}
        </div>
      </div>
      
      {/* Header Section */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ 
            width: '90px', 
            height: '90px', 
            borderRadius: '6px', 
            overflow: 'hidden',
            backgroundImage: 'url(/logo_extracted.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
          <div>
            <div style={{ fontSize: '11px', color: '#000000', lineHeight: '1.15' }}>
              <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>{invoiceData.company?.name || 'AL KARAMA MOTORS FZE'}</div>
              <div style={{ marginBottom: '1px' }}>{invoiceData.company?.address?.street || 'Show Room No: 377,'}</div>
              <div style={{ marginBottom: '1px' }}>{invoiceData.company?.address?.city || 'Ducamz (Dubai Auto Zone),'}</div>
              <div style={{ marginBottom: '1px' }}>{invoiceData.company?.address?.state || 'Ras Al Khor Dubai'} {invoiceData.company?.address?.country || 'UAE'}</div>
              <div style={{ marginBottom: '1px' }}>Tel: {invoiceData.company?.phone || '+971 43337699'}</div>
              <div>
                <a href={invoiceData.company?.website || 'https://www.alkaramamotors.com'} 
                   style={{ color: '#000000', textDecoration: 'none' }}>
                  {invoiceData.company?.website || 'www.alkaramamotors.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11px', color: '#000000' }}>
          <div style={{ margin: '1px 0' }}><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
          <div style={{ margin: '1px 0' }}><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
          <div style={{ margin: '1px 0' }}><strong>Due Date:</strong> {formatDate(invoiceData.dueDate)}</div>
        </div>
      </header>

      {/* Invoice Title - Centered above cards */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', margin: 0 }}>
          {invoiceData.status === 'draft' ? 'PROFORMA INVOICE' : 'COMMERCIAL INVOICE'}
        </h1>
      </div>

      {/* Two Column Cards */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        {/* Bill To Card */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #000000' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Bill / Export To</h3>
          <div style={{ fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#000000' }}>Name:</span>
              <span style={{ color: '#000000', fontWeight: '600', fontSize: '14px' }}>{invoiceData.customer.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#000000' }}>Address:</span>
              <span style={{ color: '#000000' }}>{invoiceData.customer.address || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#000000' }}>Phone:</span>
              <span style={{ color: '#000000' }}>{invoiceData.customer.phone || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#000000' }}>Email:</span>
              <span style={{ color: '#000000' }}>{invoiceData.customer.email || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: '600', color: '#000000' }}>Customer ID:</span>
              <span style={{ color: '#000000' }}>{invoiceData.customer.custId || ''}</span>
            </div>
            {invoiceData.exportTo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#000000' }}>Export To:</span>
                <span style={{ color: '#000000' }}>{invoiceData.exportTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details Card */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #000000' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Invoice Details</h3>
          <div style={{ fontSize: '11px', color: '#000000' }}>
            <div style={{ marginBottom: '2px' }}><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
            <div style={{ marginBottom: '2px' }}><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
            <div style={{ marginBottom: '2px' }}><strong>Sales Reference:</strong> {invoiceData.createdBy?.name || 'System Administrator'}</div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <section style={{ marginTop: '12px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Description of Goods</h3>

        <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #000000', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>#</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Description</th>
                <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Ext. Color</th>
                <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Int. Color</th>
                <th style={{ padding: '4px 6px', textAlign: 'center', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Qty</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Unit Price ({invoiceData.currency})</th>
                <th style={{ padding: '4px 6px', textAlign: 'right', fontSize: '10px', fontWeight: '600', color: '#000000', borderBottom: '1px solid #000000' }}>Total Amount ({invoiceData.currency})</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item: any, index: number) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f5f5f5' }}>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', borderBottom: '1px solid #000000' }}>{index + 1}</td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', borderBottom: '1px solid #000000' }}>
                    <div style={{ fontWeight: '500', color: '#000000', lineHeight: '1.2' }}>{item.name} {item.brand} {item.model} {item.year}</div>
                    {item.vinNumbers && item.vinNumbers.length > 0 && (
                      <div style={{ marginTop: '1px', fontSize: '9px', color: '#000000' }}>
                        <div style={{ fontWeight: '500' }}>Chassis No:</div>
                        {item.vinNumbers.map((vin: any, vinIndex: number) => (
                          <div key={vinIndex} style={{ marginLeft: '4px' }}>{vinIndex + 1}) {vin.chasisNumber}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', textAlign: 'center', borderBottom: '1px solid #000000' }}>{item.color || '-'}</td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', textAlign: 'center', borderBottom: '1px solid #000000' }}>{item.interiorColor || '-'}</td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', textAlign: 'center', borderBottom: '1px solid #000000', fontWeight: '500' }}>{item.quantity}</td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', textAlign: 'right', borderBottom: '1px solid #000000' }}>{formatCurrency(item.sellingPrice, invoiceData.currency)}</td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', color: '#000000', textAlign: 'right', borderBottom: '1px solid #000000', fontWeight: '600' }}>{formatCurrency(item.totalPrice, invoiceData.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f0f0f0', pageBreakInside: 'avoid' }}>
              <tr>
                <td colSpan={6} style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000', borderTop: '1px solid #000000' }}>Total of Units</td>
                <td style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000', borderTop: '1px solid #000000' }}>
                  {invoiceData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>Subtotal ({invoiceData.currency})</td>
                <td style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
              </tr>
              
              {/* Additional Expenses Row */}
              {invoiceData.additionalExpenses?.amount > 0 && (
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td colSpan={6} style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>
                    +Additional Expenses ({invoiceData.additionalExpenses.expenceType})
                  </td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>
                    +{formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}

              {/* Invoice Level Expenses Row */}
              {invoiceData.moreExpense?.amount > 0 && (
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <td colSpan={6} style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>
                    +Invoice Level Expenses
                  </td>
                  <td style={{ padding: '4px 6px', fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>
                    +{formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </section>

      {/* Expenses Breakdown */}
      {invoiceData.additionalExpenses && invoiceData.additionalExpenses.amount > 0 && (
        <section style={{ marginTop: '10px' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Additional Expenses</h3>
          <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #fbbf24', borderRadius: '6px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#000000' }}>
                  {invoiceData.additionalExpenses.expenceType ? 
                    invoiceData.additionalExpenses.expenceType.charAt(0).toUpperCase() + 
                    invoiceData.additionalExpenses.expenceType.slice(1) : 
                    'Additional Expense'
                  }
                </div>
                {invoiceData.additionalExpenses.description && (
                  <div style={{ fontSize: '11px', color: '#000000', marginTop: '2px' }}>
                    {invoiceData.additionalExpenses.description}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Invoice Level Expenses */}
      {invoiceData.moreExpense && invoiceData.moreExpense.amount > 0 && (
        <section style={{ marginTop: '8px' }}>
          <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #fbbf24', borderRadius: '6px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#000000', fontSize: '11px' }}>
                  Invoice Level Expenses
                </div>
                {invoiceData.moreExpense.description && (
                  <div style={{ fontSize: '11px', color: '#000000', marginTop: '2px' }}>
                    {invoiceData.moreExpense.description}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Notes and Delivery Address - Two Column Layout */}
      {invoiceData.notes && (
        <section style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Notes Column */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Notes</h3>
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #000000', borderRadius: '6px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#000000' }}>
                  {invoiceData.notes}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Terms & Conditions and Bank Details - Two Column Layout */}
      <section style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Terms & Conditions Column */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Terms & Conditions</h3>
            <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #000000', borderRadius: '6px', padding: '10px' }}>
              {invoiceData.company?.termCondition?.export ? (
                <div style={{ fontSize: '10px', color: '#000000', lineHeight: '1.4' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>SALES POLICY:</div>
                    <div style={{ color: '#000000' }}>{invoiceData.company.termCondition.export.price}</div>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>EXPORT & COMPLIANCE:</div>
                    <div style={{ color: '#000000' }}>{invoiceData.company.termCondition.export.delivery}</div>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>PAYMENT & MODE:</div>
                    <div style={{ color: '#000000' }}>{invoiceData.company.termCondition.export.payment}</div>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>VALIDITY:</div>
                    <div style={{ color: '#000000' }}>{invoiceData.company.termCondition.export.validity}</div>
                  </div>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '6px', marginTop: '6px' }}>
                    <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>Amount in words:</div>
                    <div style={{ color: '#000000' }}>{toWords(Math.floor(invoiceData.finalTotal))} Only</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#000000' }}>
                  <div style={{ fontWeight: '600', color: '#000000', marginBottom: '2px' }}>Amount in words:</div>
                  <div>{toWords(Math.floor(invoiceData.finalTotal))} Only</div>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details Column */}
          {invoiceData.company?.bankDetails && (
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#000000', marginBottom: '6px' }}>Bank Details</h3>
              <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #000000', borderRadius: '6px', padding: '10px' }}>
                <div style={{ fontSize: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#000000' }}>Bank Name:</span>
                    <span style={{ color: '#000000' }}>{invoiceData.company.bankDetails.bankName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#000000' }}>Account Name:</span>
                    <span style={{ color: '#000000' }}>{invoiceData.company.bankDetails.accountName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#000000' }}>Account Number:</span>
                    <span style={{ color: '#000000' }}>{invoiceData.company.bankDetails.accountNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#000000' }}>IBAN:</span>
                    <span style={{ color: '#000000' }}>{invoiceData.company.bankDetails.iban}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#000000' }}>SWIFT Code:</span>
                    <span style={{ color: '#000000' }}>{invoiceData.company.bankDetails.swiftCode}</span>
                  </div>
                </div>
              </div>
              {/* Company Stamp */}
              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
                <img 
                  src="/stamp-planet-sky.png" 
                  alt="Company Stamp" 
                  style={{ height: '80px', width: 'auto' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #000000', textAlign: 'center', fontSize: '11px', color: '#000000' }}>
        <p style={{ margin: '0 0 4px 0' }}>Thank you for your business!</p>
        <p style={{ margin: 0 }}>
          {invoiceData.status === 'draft' ? 'Proforma Invoice' : 'Commercial Invoice'} — {invoiceData.invoiceNumber}
        </p>
      </div>
    </div>
  );
});

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';

export default InvoicePDFTemplate;
