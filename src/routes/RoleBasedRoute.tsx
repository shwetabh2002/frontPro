import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'employee')[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.type)) {
    // Redirect based on user role
    if (user.type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.type === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
