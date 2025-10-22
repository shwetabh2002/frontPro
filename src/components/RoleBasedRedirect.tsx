import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const RoleBasedRedirect: React.FC = () => {
  const { canAccessPage } = usePermissions();

  // Define page priority order (first accessible page will be used)
  const pagePriority = [
    'dashboard',
    'customers', 
    'quotations',
    'orders',
    'invoices',
    'receipts',
    'expenses',
    'inventory',
    'employees',
    'suppliers',
    'invoiceRequests',
    'reviewOrders',
    'analytics'
  ];

  // Find the first page the user can access
  const firstAccessiblePage = pagePriority.find(page => canAccessPage(page as any));
  
  if (firstAccessiblePage) {
    return <Navigate to={`/admin/${firstAccessiblePage}`} replace />;
  }

  // Fallback to customers if no pages are accessible (shouldn't happen)
  return <Navigate to="/admin/customers" replace />;
};

export default RoleBasedRedirect;
