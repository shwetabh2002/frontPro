import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import PrivateRoute from './PrivateRoute';
import RBACRoute from './RBACRoute';
import RoleBasedRedirect from '../components/RoleBasedRedirect';
import LoginPage from '../pages/LoginPage';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/common/AdminDashboard';
import EmployeesPage from '../pages/common/EmployeesPage';
import CustomersPage from '../pages/common/CustomersPage';
import QuotationsPage from '../pages/common/QuotationsPage';
import InvoicesPage from '../pages/common/InvoicesPage';
import OrdersPage from '../pages/common/OrdersPage';
import ReviewOrdersPage from '../pages/common/ReviewOrdersPage';
import InvoiceRequestsPage from '../pages/common/InvoiceRequestsPage';
import Loader from '../components/Loader';
import InventoryPage from '../pages/common/InventoryPage';
import SuppliersPage from '../pages/common/SuppliersPage';
import ExpensesPage from '../pages/common/ExpensesPage';
import ReceiptsPage from '../pages/common/ReceiptsPage';
import ProfilePage from '../pages/common/ProfilePage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

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
              <RoleBasedRedirect />
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
              <RoleBasedRedirect />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Admin routes - for all authenticated users */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<RoleBasedRedirect />} />
          <Route path="dashboard" element={
            <RBACRoute page="dashboard">
              <AdminDashboard />
            </RBACRoute>
          } />
          <Route path="employees" element={
            <RBACRoute page="employees">
              <EmployeesPage />
            </RBACRoute>
          } />
          <Route path="inventory" element={
            <RBACRoute page="inventory">
              <InventoryPage />
            </RBACRoute>
          } />
          <Route path="customers" element={
            <RBACRoute page="customers">
              <CustomersPage />
            </RBACRoute>
          } />
          <Route path="quotations" element={
            <RBACRoute page="quotations">
              <QuotationsPage />
            </RBACRoute>
          } />
          <Route path="suppliers" element={
            <RBACRoute page="suppliers">
              <SuppliersPage />
            </RBACRoute>
          } />
          <Route path="expenses" element={
            <RBACRoute page="expenses">
              <ExpensesPage />
            </RBACRoute>
          } />
          <Route path="receipts" element={
            <RBACRoute page="receipts">
              <ReceiptsPage />
            </RBACRoute>
          } />
          <Route path="invoices" element={
            <RBACRoute page="invoices">
              <InvoicesPage />
            </RBACRoute>
          } />
          <Route path="orders" element={
            <RBACRoute page="orders">
              <OrdersPage />
            </RBACRoute>
          } />
          <Route path="review-orders" element={
            <RBACRoute page="reviewOrders">
              <ReviewOrdersPage />
            </RBACRoute>
          } />
          <Route path="invoice-requests" element={
            <RBACRoute page="invoiceRequests">
              <InvoiceRequestsPage />
            </RBACRoute>
          } />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
