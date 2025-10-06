import React, { forwardRef } from 'react';

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
        return { color: '#6b7280', text: 'Draft' };
      case 'sent':
        return { color: '#3b82f6', text: 'Sent' };
      case 'paid':
        return { color: '#10b981', text: 'Paid' };
      case 'overdue':
        return { color: '#ef4444', text: 'Overdue' };
      default:
        return { color: '#6b7280', text: status };
    }
  };

  return (
    <div ref={ref} style={{ 
      width: '794px', 
      minHeight: '1123px', 
      padding: '28px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white',
      color: 'black',
      position: 'relative'
    }}>
      {/* Status Indicator */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          padding: '6px 12px', 
          borderRadius: '9999px', 
          fontSize: '12px', 
          fontWeight: '600', 
          backgroundColor: getStatusInfo(invoiceData.status).color, 
          color: 'white', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            marginRight: '8px', 
            backgroundColor: 'rgba(255, 255, 255, 0.7)' 
          }}></div>
          {getStatusInfo(invoiceData.status).text}
        </div>
      </div>
      
      {/* Header Section */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ 
            width: '96px', 
            height: '96px', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundImage: 'url(/logo_extracted.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
          <div>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.25' }}>
              <div style={{ fontWeight: '600', fontSize: '18px' }}>{invoiceData.company?.name || 'AL KARAMA MOTORS FZE'}</div>
              <div>{invoiceData.company?.address?.street || 'Show Room No: 377,'}</div>
              <div>{invoiceData.company?.address?.city || 'Ducamz (Dubai Auto Zone),'}</div>
              <div>{invoiceData.company?.address?.state || 'Ras Al Khor Dubai'} {invoiceData.company?.address?.country || 'UAE'}</div>
              <div>Tel: {invoiceData.company?.phone || '+971 43337699'}</div>
              <div>
                <a href={invoiceData.company?.website || 'https://www.alkaramamotors.com'} 
                   style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {invoiceData.company?.website || 'www.alkaramamotors.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '14px', color: '#374151' }}>
          <div style={{ margin: '4px 0' }}><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
          <div style={{ margin: '4px 0' }}><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
          <div style={{ margin: '4px 0' }}><strong>Due Date:</strong> {formatDate(invoiceData.dueDate)}</div>
        </div>
      </header>

      {/* Invoice Title - Centered above cards */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          {invoiceData.status === 'draft' ? 'PROFORMA INVOICE' : 'CUSTOMER INVOICE'}
        </h1>
      </div>

      {/* Two Column Cards */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
        {/* Bill To Card */}
        <div style={{ flex: '1', minWidth: '320px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Bill / Export To</h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Name:</span>
              <span style={{ color: '#374151', fontWeight: '600', fontSize: '18px' }}>{invoiceData.customer.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Address:</span>
              <span style={{ color: '#374151' }}>{invoiceData.customer.address || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Phone:</span>
              <span style={{ color: '#374151' }}>{invoiceData.customer.phone || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Email:</span>
              <span style={{ color: '#374151' }}>{invoiceData.customer.email || ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Customer ID:</span>
              <span style={{ color: '#374151' }}>{invoiceData.customer.custId || ''}</span>
            </div>
            {invoiceData.exportTo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: '#1f2937' }}>Export To:</span>
                <span style={{ color: '#374151' }}>{invoiceData.exportTo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details Card */}
        <div style={{ flex: '1', minWidth: '320px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Invoice Details</h3>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <div style={{ marginBottom: '4px' }}><strong>Invoice Date:</strong> {formatDate(invoiceData.createdAt)}</div>
            <div style={{ marginBottom: '4px' }}><strong>Due Date:</strong> {formatDate(invoiceData.dueDate)}</div>
            <div style={{ marginBottom: '4px' }}><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</div>
            <div style={{ marginBottom: '4px' }}><strong>Sales Reference:</strong> {invoiceData.createdBy?.name || 'System Administrator'}</div>
            <div style={{ marginTop: '8px' }}>
              <strong>Chassis No(s):</strong>
              <ul style={{ marginLeft: '16px', marginTop: '4px', padding: 0 }}>
                {invoiceData.items.map((item: any, index: number) => 
                  item.vinNumbers?.map((vin: any, vinIndex: number) => (
                    <li key={`${index}-${vinIndex}`} style={{ fontSize: '12px', marginBottom: '2px' }}>{vin.chasisNumber}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <section style={{ marginTop: '20px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Description of Goods</h3>

        <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>#</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Ext. Color</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Int. Color</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Unit Price ({invoiceData.currency})</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Total Amount ({invoiceData.currency})</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items?.map((item: any, index: number) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{index + 1}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: '500', color: '#111827', lineHeight: '1.3' }}>{item.name} {item.brand} {item.model} {item.year}</div>
                    {item.vinNumbers && item.vinNumbers.length > 0 && (
                      <div style={{ marginTop: '2px', fontSize: '10px', color: '#6b7280' }}>
                        <div style={{ fontWeight: '500' }}>Chassis No:</div>
                        {item.vinNumbers.map((vin: any, vinIndex: number) => (
                          <div key={vinIndex} style={{ marginLeft: '6px' }}>{vinIndex + 1}) {vin.chasisNumber}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{item.color || '-'}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{item.interiorColor || '-'}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontWeight: '500' }}>{item.quantity}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#374151', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>{formatCurrency(item.sellingPrice, invoiceData.currency)}</td>
                  <td style={{ padding: '6px 8px', fontSize: '11px', color: '#111827', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>{formatCurrency(item.totalPrice, invoiceData.currency)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f3f4f6', pageBreakInside: 'avoid' }}>
              <tr>
                <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937', borderTop: '1px solid #d1d5db' }}>Total of Units</td>
                <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937', borderTop: '1px solid #d1d5db' }}>
                  {invoiceData.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                </td>
              </tr>
              <tr>
                <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Subtotal ({invoiceData.currency})</td>
                <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
              </tr>
              
              {/* Additional Expenses Row */}
              {invoiceData.additionalExpenses?.amount > 0 && (
                <tr style={{ backgroundColor: '#fef3c7' }}>
                  <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    +Additional Expenses ({invoiceData.additionalExpenses.expenceType})
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    +{formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}

              {/* Invoice Level Expenses Row */}
              {invoiceData.moreExpense?.amount > 0 && (
                <tr style={{ backgroundColor: '#fef3c7' }}>
                  <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    +Invoice Level Expenses
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    +{formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                  </td>
                </tr>
              )}
              
              {/* Discount Row */}
              {invoiceData.discountAmount > 0 && (
                <tr style={{ backgroundColor: '#fef2f2' }}>
                  <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                    -Discount ({invoiceData.discountType})
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#dc2626' }}>
                    -{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}
                  </td>
                </tr>
              )}
              
              <tr>
                <td colSpan={6} style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>Total Amount ({invoiceData.currency})</td>
                <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: '600', color: '#1f2937' }}>
                  {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Expenses Breakdown */}
      {invoiceData.additionalExpenses && invoiceData.additionalExpenses.amount > 0 && (
        <section style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Additional Expenses</h3>
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {invoiceData.additionalExpenses.expenceType ? 
                    invoiceData.additionalExpenses.expenceType.charAt(0).toUpperCase() + 
                    invoiceData.additionalExpenses.expenceType.slice(1) : 
                    'Additional Expense'
                  }
                </div>
                {invoiceData.additionalExpenses.description && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    {invoiceData.additionalExpenses.description}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Invoice Level Expenses */}
      {invoiceData.moreExpense && invoiceData.moreExpense.amount > 0 && (
        <section style={{ marginTop: '16px' }}>
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  Invoice Level Expenses
                </div>
                {invoiceData.moreExpense.description && (
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    {invoiceData.moreExpense.description}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>
                  {formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discount Section */}
      {invoiceData.discountAmount > 0 && (
        <section style={{ marginTop: '16px' }}>
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  Discount ({invoiceData.discountType === 'percentage' ? 'Percentage' : 'Fixed'})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '18px', color: '#16a34a' }}>
                  -{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Page Break Indicator */}
      <div style={{ 
        width: '100%', 
        height: '2px', 
        backgroundColor: '#e5e7eb', 
        margin: '40px 0', 
        position: 'relative',
        pageBreakBefore: 'always'
      }}>
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '0 16px',
          fontSize: '12px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          PAGE BREAK
        </div>
      </div>

      {/* Final Totals */}
      <section style={{ marginTop: '20px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Final Totals</h3>
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Subtotal:</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
              </tr>
              
              {invoiceData.additionalExpenses && invoiceData.additionalExpenses.amount > 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Additional Expenses ({invoiceData.currency}):</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>+{formatCurrency(invoiceData.additionalExpenses.amount, invoiceData.currency)}</td>
                </tr>
              )}

              {invoiceData.moreExpense && invoiceData.moreExpense.amount > 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Invoice Level Expenses ({invoiceData.currency}):</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>+{formatCurrency(invoiceData.moreExpense.amount, invoiceData.currency)}</td>
                </tr>
              )}
              
              {invoiceData.discountAmount > 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>Discount:</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>-{formatCurrency(invoiceData.discountAmount, invoiceData.currency)}</td>
                </tr>
              )}
              
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>VAT ({invoiceData.VAT || 5}%):</td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'right' }}>{formatCurrency(invoiceData.vatAmount, invoiceData.currency)}</td>
              </tr>
              
              <tr style={{ backgroundColor: '#eff6ff' }}>
                <td style={{ padding: '12px 16px', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Grand Total ({invoiceData.currency}):</td>
                <td style={{ padding: '12px 16px', fontSize: '18px', fontWeight: 'bold', color: '#2563eb', textAlign: 'right' }}>{formatCurrency(invoiceData.finalTotal, invoiceData.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment Information */}
      <section style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Payment Information</h3>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Payment Status:</div>
                <div style={{ color: '#6b7280' }}>{invoiceData.customerPayment.paymentStatus.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div style={{ fontSize: '14px', color: '#374151', marginTop: '8px' }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Amount Paid:</div>
                <div style={{ color: '#6b7280' }}>{formatCurrency(invoiceData.customerPayment.paymentAmount, invoiceData.currency)}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Payment Method:</div>
                <div style={{ color: '#6b7280' }}>{invoiceData.customerPayment.paymentMethod.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div style={{ fontSize: '14px', color: '#374151', marginTop: '8px' }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Payment Date:</div>
                <div style={{ color: '#6b7280' }}>{formatDate(invoiceData.customerPayment.paymentDate)}</div>
              </div>
            </div>
          </div>
          {invoiceData.customerPayment.paymentNotes && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Payment Notes:</div>
                <div style={{ color: '#6b7280' }}>{invoiceData.customerPayment.paymentNotes}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notes and Delivery Address - Two Column Layout */}
      {invoiceData.notes && (
        <section style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Notes Column */}
            <div style={{ flex: '1', minWidth: '320px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Notes</h3>
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  {invoiceData.notes}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Terms & Conditions and Bank Details - Two Column Layout */}
      <section style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Terms & Conditions Column */}
          <div style={{ flex: '1', minWidth: '320px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Terms & Conditions</h3>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              {invoiceData.company?.termCondition?.export ? (
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>SALES POLICY:</div>
                    <div style={{ color: '#6b7280' }}>{invoiceData.company.termCondition.export.price}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>EXPORT & COMPLIANCE:</div>
                    <div style={{ color: '#6b7280' }}>{invoiceData.company.termCondition.export.delivery}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>PAYMENT & MODE:</div>
                    <div style={{ color: '#6b7280' }}>{invoiceData.company.termCondition.export.payment}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>VALIDITY:</div>
                    <div style={{ color: '#6b7280' }}>{invoiceData.company.termCondition.export.validity}</div>
                  </div>
                  <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Amount in words:</div>
                    <div style={{ color: '#6b7280' }}>{invoiceData.finalTotal.toLocaleString()} Only</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Amount in words:</div>
                  <div>{invoiceData.finalTotal.toLocaleString()} Only</div>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details Column */}
          {invoiceData.company?.bankDetails && (
            <div style={{ flex: '1', minWidth: '320px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Bank Details</h3>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>Bank Name:</span>
                    <span style={{ color: '#374151' }}>{invoiceData.company.bankDetails.bankName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>Account Name:</span>
                    <span style={{ color: '#374151' }}>{invoiceData.company.bankDetails.accountName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>Account Number:</span>
                    <span style={{ color: '#374151' }}>{invoiceData.company.bankDetails.accountNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>IBAN:</span>
                    <span style={{ color: '#374151' }}>{invoiceData.company.bankDetails.iban}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>SWIFT Code:</span>
                    <span style={{ color: '#374151' }}>{invoiceData.company.bankDetails.swiftCode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
        <p style={{ margin: '0 0 8px 0' }}>Thank you for your business!</p>
        <p style={{ margin: 0 }}>
          {invoiceData.status === 'draft' ? 'Proforma Invoice' : 'Customer Invoice'} — {invoiceData.invoiceNumber}
        </p>
      </div>
    </div>
  );
});

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';

export default InvoicePDFTemplate;
