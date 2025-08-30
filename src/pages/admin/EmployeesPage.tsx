import React from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastLogin: string;
}

const EmployeesPage: React.FC = () => {
  const employees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-20',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Employee',
      status: 'active',
      joinDate: '2023-03-20',
      lastLogin: '2024-01-19',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Employee',
      status: 'inactive',
      joinDate: '2023-06-10',
      lastLogin: '2024-01-15',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'Employee',
      status: 'active',
      joinDate: '2023-08-05',
      lastLogin: '2024-01-20',
    },
  ];

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${
          value === 'active' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'joinDate', header: 'Join Date' },
    { key: 'lastLogin', header: 'Last Login' },
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
          <Button variant="danger" size="sm" className="shadow-md hover:shadow-lg">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/8 to-amber-600/8 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex items-center">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-orange-700 to-amber-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Employees
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Manage your employees and their roles.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Button variant="primary" className="shadow-xl hover:shadow-2xl">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Employee
        </Button>
      </div>

      {/* Employees Table */}
      <div className="bg-gradient-to-br from-white to-orange-50 shadow-lg rounded-xl border border-orange-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Employee List ({employees.length})
              </h3>
            </div>
            <div className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              Total employees in the system
            </div>
          </div>
          
          <Table
            columns={columns}
            data={employees}
            emptyMessage="No employees found."
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
