import React, { useState } from 'react';
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

const EmployeeDashboard: React.FC = () => {
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
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1 234-567-8903',
      status: 'active',
      lastOrder: '2024-01-12',
    },
  ]);

  // Enhanced data for better dashboard
  const employeeStats = [
    { 
      name: 'Customers Managed', 
      value: customers.length.toString(), 
      change: '+12%', 
      changeType: 'positive',
      icon: '👥',
      description: 'This month',
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      name: 'Active Customers', 
      value: customers.filter(c => c.status === 'active').length.toString(), 
      change: '+8%', 
      changeType: 'positive',
      icon: '✅',
      description: 'Currently active',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'Customer Satisfaction', 
      value: '4.8/5', 
      change: '+0.2', 
      changeType: 'positive',
      icon: '⭐',
      description: 'Average rating',
      color: 'from-yellow-500 to-amber-600'
    },
    { 
      name: 'Response Time', 
      value: '2.3h', 
      change: '-0.5h', 
      changeType: 'positive',
      icon: '⚡',
      description: 'Average response',
      color: 'from-blue-500 to-indigo-600'
    },
  ];

  const recentCustomerActivities = [
    { action: 'New customer registered', customer: 'Charlie Wilson', time: '2 hours ago', type: 'registration' },
    { action: 'Customer inquiry resolved', customer: 'Alice Brown', time: '4 hours ago', type: 'support' },
    { action: 'Follow-up scheduled', customer: 'Bob Johnson', time: '6 hours ago', type: 'followup' },
    { action: 'Customer feedback received', customer: 'Jane Smith', time: '8 hours ago', type: 'feedback' },
    { action: 'Order placed', customer: 'John Doe', time: '1 day ago', type: 'order' },
  ];

  const quickActions = [
    { name: 'Add Customer', icon: '👥', description: 'Register new customer', color: 'from-emerald-500 to-teal-600' },
    { name: 'View Reports', icon: '📊', description: 'Customer analytics', color: 'from-blue-500 to-indigo-600' },
    { name: 'Send Follow-up', icon: '📧', description: 'Follow up with customers', color: 'from-purple-500 to-pink-600' },
    { name: 'Schedule Meeting', icon: '📅', description: 'Book customer meeting', color: 'from-orange-500 to-amber-600' },
    { name: 'Export Data', icon: '📤', description: 'Export customer data', color: 'from-cyan-500 to-blue-600' },
    { name: 'Settings', icon: '⚙️', description: 'Dashboard settings', color: 'from-slate-500 to-gray-600' },
  ];

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

  const handleCustomerCreated = () => {
    // Refresh customer list or add new customer to the list
    // For now, we'll just close the modal
    setIsAddCustomerModalOpen(false);
  };

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {employeeStats.map((stat, index) => (
          <div key={stat.name} className="group relative bg-gradient-to-br from-white to-slate-50 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-slate-200">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl ${
                  stat.changeType === 'positive' 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700 border border-red-200'
                }`}>
                  <span className="text-sm font-bold">{stat.change}</span>
                </div>
              </div>
              <div className="space-y-2">
                <dt className="text-sm font-bold text-slate-600 truncate">
                  {stat.name}
                </dt>
                <dd className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-800 bg-clip-text text-transparent">
                  {stat.value}
                </dd>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white to-slate-50 shadow-xl rounded-2xl border border-slate-200 p-6">
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
      <div className="bg-gradient-to-br from-white to-slate-50 shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Customers ({filteredCustomers.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
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

      {/* Recent Activities & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customer Activities */}
        <div className="bg-gradient-to-br from-white to-emerald-50 shadow-lg rounded-xl border border-emerald-100 overflow-hidden">
          <div className="px-5 py-5">
            <div className="flex items-center mb-5">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Recent Activities
              </h3>
            </div>
            <div className="space-y-4">
              {recentCustomerActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-emerald-100 hover:shadow-md transition-all duration-200">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'registration' ? 'bg-emerald-500' :
                    activity.type === 'support' ? 'bg-blue-500' :
                    activity.type === 'followup' ? 'bg-purple-500' :
                    activity.type === 'feedback' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.customer}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl border border-blue-100 overflow-hidden">
          <div className="px-5 py-5">
            <div className="flex items-center mb-5">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickActions.map((action, index) => (
                <button key={action.name} className="group p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      {action.icon}
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">{action.name}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
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

export default EmployeeDashboard;
