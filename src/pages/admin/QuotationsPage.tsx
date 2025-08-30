import React from 'react';
import Table from '../../components/Table';

interface Quotation {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  validUntil: string;
}

const QuotationsPage: React.FC = () => {
  const quotations: Quotation[] = [
    { id: '#Q001', customer: 'John Doe', amount: 500.00, status: 'pending', date: '2024-01-20', validUntil: '2024-02-20' },
    { id: '#Q002', customer: 'Jane Smith', amount: 750.00, status: 'accepted', date: '2024-01-19', validUntil: '2024-02-19' },
    { id: '#Q003', customer: 'Bob Johnson', amount: 300.00, status: 'expired', date: '2024-01-15', validUntil: '2024-02-15' },
  ];

  const columns = [
    { key: 'id', header: 'Quotation ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Created Date' },
    { key: 'validUntil', header: 'Valid Until' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/8 to-purple-600/8 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Quotations
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Manage customer quotations and proposals.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-gradient-to-br from-white to-indigo-50 shadow-lg rounded-xl border border-indigo-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Quotation List ({quotations.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
              Total quotations in the system
            </div>
          </div>
          
          <Table columns={columns} data={quotations} emptyMessage="No quotations found." />
        </div>
      </div>
    </div>
  );
};

export default QuotationsPage;
