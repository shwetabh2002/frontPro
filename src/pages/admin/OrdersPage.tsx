import React from 'react';
import Table from '../../components/Table';

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  date: string;
}

const OrdersPage: React.FC = () => {
  const orders: Order[] = [
    { id: '#ORD001', customer: 'John Doe', items: 3, total: 120.00, status: 'completed', date: '2024-01-20' },
    { id: '#ORD002', customer: 'Jane Smith', items: 2, total: 85.50, status: 'processing', date: '2024-01-19' },
    { id: '#ORD003', customer: 'Bob Johnson', items: 5, total: 200.00, status: 'shipped', date: '2024-01-18' },
  ];

  const columns = [
    { key: 'id', header: 'Order ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Order Date' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/8 to-pink-600/8 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-purple-700 to-pink-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Orders
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Track and manage customer orders.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-white to-purple-50 shadow-lg rounded-xl border border-purple-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Order List ({orders.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              Total orders in the system
            </div>
          </div>
          
          <Table columns={columns} data={orders} emptyMessage="No orders found." />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
