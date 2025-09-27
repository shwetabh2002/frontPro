import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import LoginPage from '../pages/LoginPage';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import AdminDashboard from '../pages/common/AdminDashboard';
import EmployeesPage from '../pages/common/EmployeesPage';
// import SalesPage from '../pages/common/SalesPage';
// import AllSalesPage from '../pages/common/AllSalesPage';
import CustomersPage from '../pages/common/CustomersPage';
import QuotationsPage from '../pages/common/QuotationsPage';
import InvoicesPage from '../pages/common/InvoicesPage';
import OrdersPage from '../pages/common/OrdersPage';
import ReviewOrdersPage from '../pages/common/ReviewOrdersPage';
import InvoiceRequestsPage from '../pages/common/InvoiceRequestsPage';
import EmployeeDashboard from '../pages/common/EmployeeDashboard';
import Loader from '../components/Loader';
import InventoryPage from '../pages/common/InventoryPage';
import SuppliersPage from '../pages/common/SuppliersPage';

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
          {/* <Route path="sales" element={<SalesPage />} /> */}
          {/* <Route path="all-sales" element={<AllSalesPage />} /> */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="quotations" element={<QuotationsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="review-orders" element={<ReviewOrdersPage />} />
          <Route path="invoice-requests" element={<InvoiceRequestsPage />} />
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
          <Route path="customers" element={<CustomersPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
