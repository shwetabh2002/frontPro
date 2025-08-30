import React from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';

interface Sale {
  id: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  items: number;
}

const SalesPage: React.FC = () => {
  const sales: Sale[] = [
    { id: '#1234', customer: 'John Doe', amount: 120.00, status: 'completed', date: '2024-01-20', items: 3 },
    { id: '#1235', customer: 'Jane Smith', amount: 85.50, status: 'pending', date: '2024-01-19', items: 2 },
    { id: '#1236', customer: 'Bob Johnson', amount: 200.00, status: 'completed', date: '2024-01-18', items: 5 },
  ];

  const columns = [
    { key: 'id', header: 'Sale ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'status', header: 'Status',       render: (value: string) => (
      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${
        value === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' : 
        value === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200' : 
        'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200'
      }`}>
        {value}
      </span>
    )},
    { key: 'date', header: 'Date' },
    { key: 'items', header: 'Items' },
    { key: 'actions', header: 'Actions', render: () => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </Button>
        <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/8 to-emerald-600/8 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-green-700 to-emerald-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Your Sales
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Track your personal sales performance.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-gradient-to-br from-white to-green-50 shadow-lg rounded-xl border border-green-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Sales List ({sales.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              Total sales in the system
            </div>
          </div>
          
          <Table columns={columns} data={sales} emptyMessage="No sales found." />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
