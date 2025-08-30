import React from 'react';
import Table from '../../components/Table';

interface Sale {
  id: string;
  customer: string;
  employee: string;
  amount: number;
  status: string;
  date: string;
}

const AllSalesPage: React.FC = () => {
  const sales: Sale[] = [
    { id: '#1234', customer: 'John Doe', employee: 'Admin', amount: 120.00, status: 'completed', date: '2024-01-20' },
    { id: '#1235', customer: 'Jane Smith', employee: 'Employee', amount: 85.50, status: 'pending', date: '2024-01-19' },
    { id: '#1236', customer: 'Bob Johnson', employee: 'Admin', amount: 200.00, status: 'completed', date: '2024-01-18' },
  ];

  const columns = [
    { key: 'id', header: 'Sale ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'employee', header: 'Employee' },
    { key: 'amount', header: 'Amount', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/8 to-pink-600/8 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-rose-700 to-pink-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  All Sales
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Overview of all sales across the system.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* All Sales Table */}
      <div className="bg-gradient-to-br from-white to-rose-50 shadow-lg rounded-xl border border-rose-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Sales List ({sales.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200">
              Total sales in the system
            </div>
          </div>
          
          <Table columns={columns} data={sales} emptyMessage="No sales found." />
        </div>
      </div>
    </div>
  );
};

export default AllSalesPage;
