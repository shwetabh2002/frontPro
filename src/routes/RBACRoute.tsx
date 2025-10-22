import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

interface RBACRouteProps {
  children: React.ReactNode;
  page: keyof import('../config/rbac').Permission['pages'];
  fallbackPath?: string;
}

const RBACRoute: React.FC<RBACRouteProps> = ({ 
  children, 
  page, 
  fallbackPath = '/admin/customers' 
}) => {
  const { canAccessPage } = usePermissions();

  if (!canAccessPage(page)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RBACRoute;
