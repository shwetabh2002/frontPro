import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import Loader from '../components/Loader';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading while initializing auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
