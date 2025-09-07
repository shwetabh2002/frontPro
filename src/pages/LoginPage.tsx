import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, clearError } from '../features/auth/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Logo from '../components/Logo';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // Only redirect if auth state is initialized and user is authenticated
    if (isInitialized && isAuthenticated && user) {
      const redirectPath = user.type === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(login(formData)).unwrap();
      setToastMessage('Login successful!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="relative">
              {/* Automotive-themed loader */}
              <svg className="animate-spin h-16 w-16 mx-auto shadow-lg" fill="none" viewBox="0 0 24 24">
                {/* Outer ring - steering wheel rim */}
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="url(#loginGradient)" strokeWidth="2"></circle>
                {/* Inner ring - steering wheel spokes */}
                <circle className="opacity-60" cx="12" cy="12" r="6" stroke="url(#loginGradient)" strokeWidth="1.5"></circle>
                {/* Center hub */}
                <circle className="opacity-90" cx="12" cy="12" r="2" fill="url(#loginGradient)"></circle>
                {/* Spokes */}
                <path className="opacity-80" stroke="url(#loginGradient)" strokeWidth="1" d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"></path>
              </svg>
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="loginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-ping opacity-20"></div>
            </div>
            <p className="mt-6 text-lg font-semibold text-amber-400">Initializing Automotive POS...</p>
            <p className="mt-2 text-sm text-gray-400">Please wait while we set up your session</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-600/10 to-yellow-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Automotive Logo */}
          <div className="mx-auto mb-8">
            <Logo size="xl" showText={true} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Automotive POS
          </h2>
          <p className="mt-3 text-lg text-gray-300 font-medium">
            Sign in to your automotive business account
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-12 border border-amber-500/30">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>


        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
};

export default LoginPage;
