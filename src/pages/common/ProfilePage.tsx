import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { employeeService, Employee } from '../../services/employeeService';
import { useToast } from '../../contexts/ToastContext';
import ResetPasswordDialog from '../../components/ResetPasswordDialog';
import Loader from '../../components/Loader';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const employeeData = await employeeService.getEmployeeById(user!._id);
      setEmployee(employeeData);
    } catch (error: any) {
      console.error('Error fetching employee data:', error);
      showToast('Failed to load profile data', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-blue-100 mt-1">View your profile information</p>
            </div>
            <button
              onClick={() => setIsResetPasswordOpen(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <div className="text-gray-900 font-medium">{employee.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="text-gray-900">{employee.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <div className="text-gray-900">
                  {employee.countryCode} {employee.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <div className="text-gray-900 capitalize">{employee.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className="text-gray-900">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                <div className="text-gray-900">{employee.address || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Roles</h2>
            {employee.roleIds && employee.roleIds.length > 0 ? (
              <div className="space-y-4">
                {employee.roleIds.map((role) => (
                  <div key={role._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    </div>
                    {role.description && (
                      <p className="text-sm text-gray-600">{role.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No roles assigned</p>
            )}
          </div>

          {/* Account Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate(employee.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <div className="text-gray-900">{formatDate(employee.updatedAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
                <div className="text-gray-900">{formatDate(employee.lastLogin)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;

