import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Table from '../../components/Table';
import CustomerModal from '../../components/CustomerModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  lastOrder: string;
}

const EmployeeCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234-567-8900',
      status: 'active',
      lastOrder: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 234-567-8901',
      status: 'active',
      lastOrder: '2024-01-14',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1 234-567-8902',
      status: 'inactive',
      lastOrder: '2024-01-10',
    },
  ]);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${
          value === 'active' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' 
            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'lastOrder', header: 'Last Order' },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
          <Button variant="outline" size="sm" className="shadow-md hover:shadow-lg">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
              <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/8 to-teal-600/8 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Customer Management
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Manage your customers and their information.
                </p>
              </div>
              </div>
              <Button 
                variant="primary"
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="shadow-xl hover:shadow-2xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Customer
              </Button>
            </div>
          </div>
        </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-xl border border-blue-100 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Search Customers"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="shadow-lg hover:shadow-xl">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gradient-to-br from-white to-emerald-50 shadow-lg rounded-xl border border-emerald-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Customers ({filteredCustomers.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
          
          <Table
            columns={columns}
            data={filteredCustomers}
            emptyMessage="No customers found matching your search criteria."
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
      />
    </div>
  );
};

export default EmployeeCustomersPage;
