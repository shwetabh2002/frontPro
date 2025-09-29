import React from 'react';
import { Employee } from '../services/employeeService';

interface EmployeeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  isLoading?: boolean;
}

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  isOpen,
  onClose,
  employee,
  isLoading = false
}) => {
  if (!isOpen) return null;

  console.log('EmployeeViewModal - employee data:', employee);
  console.log('EmployeeViewModal - isLoading:', isLoading);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
              <p className="text-sm text-gray-600">View employee information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : employee ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium">{employee.name}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{employee.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{employee.countryCode} {employee.phone}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{employee.address}</p>
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {employee.roleIds && employee.roleIds.length > 0 ? (
                      employee.roleIds.map((role, index) => (
                        <span 
                          key={role._id || index}
                          className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No roles assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Type</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {employee.type?.charAt(0).toUpperCase() + employee.type?.slice(1) || 'Employee'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{new Date(employee.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(employee.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{new Date(employee.updatedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(employee.updatedAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                {employee.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{new Date(employee.lastLogin).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(employee.lastLogin).toLocaleTimeString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-500 font-medium">Failed to load employee details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeViewModal;
