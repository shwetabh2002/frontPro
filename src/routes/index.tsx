import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import LoginPage from '../pages/LoginPage';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeesPage from '../pages/admin/EmployeesPage';
import InventoryPage from '../pages/admin/InventoryPage';
import SalesPage from '../pages/admin/SalesPage';
import AllSalesPage from '../pages/admin/AllSalesPage';
import CustomersPage from '../pages/admin/CustomersPage';
import QuotationsPage from '../pages/admin/QuotationsPage';
import InvoicesPage from '../pages/admin/InvoicesPage';
import OrdersPage from '../pages/admin/OrdersPage';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import EmployeeCustomersPage from '../pages/employee/CustomersPage';
import Loader from '../components/Loader';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  // Show loading while initializing auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.type === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to={user?.type === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="all-sales" element={<AllSalesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRoles={['employee']}>
                <EmployeeLayout />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="customers" element={<EmployeeCustomersPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
