import React, { useState, useEffect } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import EmployeeModal from '../../components/EmployeeModal';
import EmployeeViewModal from '../../components/EmployeeViewModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { employeeService, type Employee, type CreateEmployeeData, type EmployeeFilters, type EmployeesResponse } from '../../services/employeeService';
import { useToast } from '../../contexts/ToastContext';

const EmployeesPage: React.FC = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    statuses: [] as string[],
    roles: [] as string[],
    dateRange: { min: '', max: '' },
  });
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    role: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch employees on component mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employeeService.getEmployees(filters);
      setEmployees(response.data);
      setPagination(response.pagination);
      setSummary(response.summary);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setError(error.message || 'Failed to fetch employees');
      showToast(error.message || 'Failed to fetch employees', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async (employeeData: CreateEmployeeData) => {
    try {
      setIsCreating(true);
      const response = await employeeService.createEmployee(employeeData);
      
      showToast('Employee created successfully', 'success', 5000);
      setIsModalOpen(false);
      
      // Refresh the employees list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      showToast(error.message || 'Failed to create employee', 'error', 5000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    if (!isCreating) {
      setIsModalOpen(false);
    }
  };

  const handleViewEmployee = async (employeeId: string) => {
    setIsViewLoading(true);
    setSelectedEmployee(null);
    setIsViewModalOpen(true);
    
    try {
      console.log('Fetching employee with ID:', employeeId);
      const employee = await employeeService.getEmployeeById(employeeId);
      console.log('Employee data received:', employee);
      setSelectedEmployee(employee);
    } catch (error: any) {
      console.error('Error fetching employee details:', error);
      showToast('Failed to load employee details', 'error');
    } finally {
      setIsViewLoading(false);
    }
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    setEmployeeToDelete({ id: employeeId, name: employeeName });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await employeeService.deleteEmployee(employeeToDelete.id);
      console.log('Delete response:', response);
      
      if (response.success) {
        showToast('Employee deleted successfully', 'success');
        // Refresh the employee list
        await fetchEmployees();
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
      } else {
        // Handle business logic error (active quotations)
        if (response.activeQuotations && response.activeQuotations.length > 0) {
          const quotationList = response.activeQuotations
            .map((q: any) => `${q.quotationNumber} (${q.status})`)
            .join(', ');
          showToast(
            `Cannot delete employee. Employee has ${response.activeQuotations.length} active quotation(s): ${quotationList}. Please reject these quotations first.`,
            'error'
          );
        } else {
          showToast(response.message || 'Failed to delete employee', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      showToast(error.message || 'Failed to delete employee', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleFilterChange = (key: keyof EmployeeFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      role: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { 
      key: 'roleIds', 
      header: 'Role',
      render: (value: Array<{ _id: string; name: string; permissions: string[]; description?: string }>) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((role, index) => (
              <span 
                key={role._id || index}
                className="inline-flex px-3 py-1.5 text-xs font-bold rounded-full border bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-blue-300 border-blue-500/50"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="inline-flex px-3 py-1.5 text-xs font-bold rounded-full border bg-gradient-to-r from-gray-900/50 to-gray-700/50 text-gray-300 border-gray-500/50">
              No Role
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${
          value === 'active' 
            ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border-green-500/50' 
            : 'bg-gradient-to-r from-red-900/50 to-pink-900/50 text-red-300 border-red-500/50'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'createdAt', 
      header: 'Join Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: Employee) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="shadow-md hover:shadow-lg"
            onClick={() => handleViewEmployee(row._id)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            className="shadow-md hover:shadow-lg"
            onClick={() => handleDeleteEmployee(row._id, row.name)}
          >
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl"></div>
          <div className="relative p-4">
            <div className="flex items-center">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-300 rounded-lg shadow-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Employees
                </h1>
                <p className="text-sm text-gray-700 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Manage your automotive business employees and their roles.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="shadow-lg hover:shadow-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
          </Button>
          <Button 
            variant="primary" 
            className="shadow-xl hover:shadow-2xl"
            onClick={() => setIsModalOpen(true)}
          >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Employee
        </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search employees by name, email, or phone..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-600">
              {pagination.total} employees found
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {summary.statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  {summary.roles.map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end mt-4 space-x-3">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Employees Table */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-300 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Employee List ({pagination.total})
              </h3>
            </div>
            <div className="text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-500 font-medium">{error}</p>
              <Button 
                onClick={fetchEmployees}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : (
          <Table
            columns={columns}
            data={employees}
            emptyMessage="No employees found."
          />
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateEmployee}
        isLoading={isCreating}
      />

      {/* Employee View Modal */}
      <EmployeeViewModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        employee={selectedEmployee}
        isLoading={isViewLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={`Are you sure you want to permanently delete "${employeeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
      </div>
    </div>
  );
};

export default EmployeesPage;
