import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import SessionManager from './components/SessionManager';
import { getApiBaseUrl } from './config/api';
import './App.css';

function App() {
  useEffect(() => {
    // Log current API base URL on startup (optional)
    const apiUrl = getApiBaseUrl();
    // console.log(`🚀 App started - API Base URL: ${apiUrl}`);
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
