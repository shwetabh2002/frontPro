import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { initializeAuth } from '../features/auth/authSlice';
import { authService } from '../services/authService';

const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isInitialized, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (isAuthenticated) {
      // Start background token refresh when authenticated
      authService.startBackgroundRefresh();
    }
  }, [isAuthenticated]);

  // Show loading while initializing auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
