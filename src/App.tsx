import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import SessionManager from './components/SessionManager';
import { logAppStartup, testApiConnection, logAllEndpoints, showEnvironmentStatus, API_CONFIG } from './config/api';
import './App.css';

function App() {
  console.log('🚀 App component rendered!');
  console.log('🔍 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL
  });
  
  // Debug API_CONFIG
  console.log('🔍 API_CONFIG debug:');
  API_CONFIG._debug();
  
  useEffect(() => {
    console.log('🔍 App useEffect triggered - starting logging...');
    
    try {
      // Log app startup information
      console.log('🔍 Calling logAppStartup...');
      logAppStartup();
      
      // Log all available endpoints
      console.log('🔍 Calling logAllEndpoints...');
      logAllEndpoints();
      
      // Test API connection (with delay to avoid blocking startup)
      setTimeout(() => {
        console.log('🔍 Testing API connection...');
        testApiConnection();
        // Show final environment status after connection test
        setTimeout(() => {
          console.log('🔍 Showing final environment status...');
          showEnvironmentStatus();
        }, 500);
      }, 1000);
    } catch (error) {
      console.error('❌ Error in startup logging:', error);
    }
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SessionManager>
          <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <AppRoutes />
          </div>
        </SessionManager>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
