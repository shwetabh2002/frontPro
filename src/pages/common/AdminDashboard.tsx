import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useToast } from '../../contexts/ToastContext';
import { 
  getSalesAnalytics, 
  getQuotationAnalytics,
  SalesAnalyticsData, 
  SalesAnalyticsSummary, 
  SalesAnalyticsFilters,
  QuotationAnalyticsData,
  QuotationAnalyticsSummary,
  QuotationFilters
} from '../../services/invoiceService';
import { formatPrice } from '../../utils/currencyUtils';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
// @ts-ignore
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // State management
  const [analyticsData, setAnalyticsData] = useState<SalesAnalyticsData | null>(null);
  const [quotationData, setQuotationData] = useState<QuotationAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SalesAnalyticsFilters>({});
  const [quotationFilters, setQuotationFilters] = useState<QuotationFilters>({});
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotations'>('invoices');

  // Initialize filters with default values from API response
  const initializeFilters = (data: SalesAnalyticsData) => {
    if (data?.filters) {
      const defaultFilters: SalesAnalyticsFilters = {
        groupBy: data.filters.groupBy?.value || 'day',
        status: data.filters.status?.value || undefined,
        customerId: data.filters.customerId?.value || undefined,
        createdBy: data.filters.createdBy?.value || undefined,
        currency: data.filters.currency?.value || undefined,
        dateFrom: data.filters.dateFrom || undefined,
        dateTo: data.filters.dateTo || undefined,
      };
      setFilters(defaultFilters);
    }
  };

  const initializeQuotationFilters = (data: QuotationAnalyticsData) => {
    if (data?.filters) {
      const defaultFilters: QuotationFilters = {
        groupBy: data.filters.groupBy?.value || 'day',
        status: data.filters.status?.value || undefined,
        customerId: data.filters.customerId?.value || undefined,
        createdBy: data.filters.createdBy?.value || undefined,
        currency: data.filters.currency?.value || undefined,
        dateFrom: data.filters.dateFrom || undefined,
        dateTo: data.filters.dateTo || undefined,
      };
      setQuotationFilters(defaultFilters);
    }
  };

  // Fetch sales analytics with proper auth handling
  const fetchSalesAnalytics = async (customFilters?: SalesAnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = customFilters || filters;
      const data = await getSalesAnalytics(filtersToUse);
      setAnalyticsData(data);
      
      // Initialize filters with default values from API response (only on first load)
      if (!customFilters && Object.keys(filters).length === 0) {
        initializeFilters(data);
      }
    } catch (err: any) {
      console.error('Error fetching sales analytics:', err);
      
      // Handle authentication errors
      if (err?.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.data.accessToken);
              localStorage.setItem('refreshToken', refreshData.data.refreshToken);
              
              // Retry the original request
              const retryData = await getSalesAnalytics(filters);
              setAnalyticsData(retryData);
              return;
            }
          }
          
          // If refresh fails, redirect to login
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        }
      }
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load analytics data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch quotation analytics with proper auth handling
  const fetchQuotationAnalytics = useCallback(async (customFilters?: QuotationFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = customFilters || quotationFilters;
      const data = await getQuotationAnalytics(filtersToUse);
      setQuotationData(data);
      
      // Initialize filters with default values from API response (only on first load)
      if (!customFilters && Object.keys(quotationFilters).length === 0) {
        initializeQuotationFilters(data);
      }
    } catch (err: any) {
      console.error('Error fetching quotation analytics:', err);
      
      // Handle authentication errors
      if (err?.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.data.accessToken);
              localStorage.setItem('refreshToken', refreshData.data.refreshToken);
              
              // Retry the original request
              const retryData = await getQuotationAnalytics(filters);
              setQuotationData(retryData);
              return;
            }
          }
          
          // If refresh fails, redirect to login
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await dispatch(logout() as any);
          navigate('/login');
          showToast('Session expired. Please login again.', 'error');
          return;
        }
      }
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load quotation analytics data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [quotationFilters, dispatch, navigate, showToast]);

  // Handle filter changes
  const handleFilterChange = (key: keyof SalesAnalyticsFilters, value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined
    };
    setFilters(newFilters);
  };

  const handleQuotationFilterChange = (key: keyof QuotationFilters, value: string | undefined) => {
    const newFilters = {
      ...quotationFilters,
      [key]: value || undefined
    };
    setQuotationFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    if (activeTab === 'invoices') {
      fetchSalesAnalytics(filters);
    } else {
      fetchQuotationAnalytics(quotationFilters);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    if (activeTab === 'invoices') {
      setFilters({});
      fetchSalesAnalytics({});
    } else {
      setQuotationFilters({});
      fetchQuotationAnalytics({});
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'invoices' | 'quotations') => {
    setActiveTab(tab);
    setShowFilters(false);
  };

  useEffect(() => {
    fetchSalesAnalytics();
    fetchQuotationAnalytics();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return formatPrice(amount, currency);
  };

  // Helper function to calculate percentage change (mock data for now)
  const getPercentageChange = (current: number, previous: number = 0) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Generate stats from analytics data
  const generateStats = (summary: SalesAnalyticsSummary) => [
    {
      name: 'Total Revenue Generated',
      value: formatCurrency(summary.totalAmount),
      change: getPercentageChange(summary.totalAmount, summary.totalAmount * 0.8),
      changeType: 'positive',
      icon: '💰',
      description: 'All invoice payments received',
      subtitle: 'From all completed sales',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Invoices Created',
      value: summary.totalInvoices.toString(),
      change: getPercentageChange(summary.totalInvoices, summary.totalInvoices * 0.9),
      changeType: 'positive',
      icon: '📦',
      description: 'Total invoices generated',
      subtitle: 'Across all customers',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      name: 'Net Profit Earned',
      value: formatCurrency(summary.totalProfitAmount),
      change: getPercentageChange(summary.totalProfitAmount, summary.totalProfitAmount * 0.85),
      changeType: 'positive',
      icon: '📈',
      description: 'After all costs & expenses',
      subtitle: `${((summary.totalProfitAmount / summary.totalAmount) * 100).toFixed(1)}% margin`,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      name: 'Invoices Paid',
      value: summary.paidInvoices.toString(),
      change: getPercentageChange(summary.paidInvoices, summary.paidInvoices * 0.95),
      changeType: 'positive',
      icon: '✅',
      description: 'Successfully collected payments',
      subtitle: `${((summary.paidInvoices / summary.totalInvoices) * 100).toFixed(1)}% payment rate`,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
  ];

  // Prepare chart data
  const prepareChartData = () => {
    if (!analyticsData) return { timeSeries: [], currencyData: [], statusData: [], exportData: [] };

    const timeSeries = analyticsData.timeSeries.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: item.totalAmount,
      profit: item.totalProfitAmount,
      invoices: item.totalInvoices
    }));

    const currencyData = analyticsData.currencySummaries.map(item => ({
      name: item.currency,
      value: item.totalAmount,
      profit: item.totalProfitAmount,
      invoices: item.totalInvoices
    }));

    const statusData = analyticsData.additionalAnalytics.salesByStatus.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.totalAmount,
      count: item.count
    }));

    // Prepare export destination data for map
    const exportData = analyticsData.additionalAnalytics.salesByExportTo?.map((item, index) => {
      // Map country names to coordinates (simplified mapping)
      const countryCoordinates: { [key: string]: [number, number] } = {
        'india': [77.2090, 28.6139], // New Delhi
        'australia': [133.7751, -25.2744], // Canberra
        'usa': [-95.7129, 37.0902], // Center of USA
        'uae': [54.3773, 24.2992], // Dubai
        'uk': [-3.4360, 55.3781], // London
        'germany': [10.4515, 51.1657], // Berlin
        'france': [2.3522, 48.8566], // Paris
        'canada': [-106.3468, 56.1304], // Ottawa
        'japan': [138.2529, 36.2048], // Tokyo
        'china': [104.1954, 35.8617], // Beijing
      };

      const coordinates = countryCoordinates[item._id.toLowerCase()] || [0, 0];
      
      // Assign consistent colors based on country name hash
      const countryColors: { [key: string]: string } = {
        'india': '#FF6B6B',      // Red
        'australia': '#4ECDC4',  // Teal
        'usa': '#45B7D1',        // Blue
        'uae': '#96CEB4',        // Green
        'uk': '#FFEAA7',         // Yellow
        'germany': '#DDA0DD',    // Plum
        'france': '#98D8C8',     // Mint
        'canada': '#F7DC6F',     // Gold
        'japan': '#BB8FCE',      // Lavender
        'china': '#85C1E9',      // Light Blue
      };
      
      return {
        name: item._id.toLowerCase(), // Normalize to lowercase for consistent matching
        coordinates: coordinates,
        amount: item.totalAmount,
        count: item.count,
        fill: countryColors[item._id.toLowerCase()] || COLORS[index % COLORS.length] // Consistent color for each country
      };
    }) || [];

    return { timeSeries, currencyData, statusData, exportData };
  };

  // Generate quotation stats from analytics data
  const generateQuotationStats = (summary: QuotationAnalyticsSummary, quotationData: QuotationAnalyticsData) => {
    // Safety check for required properties
    if (!summary) {
      return [
        {
          name: 'Total Quotations',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: '📋',
          description: 'Quotations created',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        },
        {
          name: 'Total Value',
          value: 'AED 0.00',
          change: '+0%',
          changeType: 'positive',
          icon: '💰',
          description: 'Total quotation value',
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        },
        {
          name: 'Average Value',
          value: 'AED 0.00',
          change: '+0%',
          changeType: 'positive',
          icon: '📊',
          description: 'Per quotation',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600'
        },
        {
          name: 'Confirmed',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: '✅',
          description: 'Confirmed quotations',
          color: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          iconColor: 'text-emerald-600'
        },
      ];
    }

    // Get confirmed count from quotationsByStatus
    const confirmedCount = quotationData?.additionalAnalytics?.quotationsByStatus?.find(
      status => status._id === 'confirmed'
    )?.count || 0;

    return [
      {
        name: 'Quotations Created',
        value: summary.totalQuotations.toString(),
        change: getPercentageChange(summary.totalQuotations, summary.totalQuotations * 0.8),
        changeType: 'positive',
        icon: '📋',
        description: 'Total quotations generated',
        subtitle: 'For all customers',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        name: 'Total Quotation Value',
        value: formatCurrency(summary.totalAmount),
        change: getPercentageChange(summary.totalAmount, summary.totalAmount * 0.8),
        changeType: 'positive',
        icon: '💰',
        description: 'Combined value of all quotations',
        subtitle: 'Potential revenue if all convert',
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600'
      },
      {
        name: 'Average Quotation Size',
        value: formatCurrency(summary.averageQuotationValue),
        change: getPercentageChange(summary.averageQuotationValue, summary.averageQuotationValue * 0.8),
        changeType: 'positive',
        icon: '📊',
        description: 'Average value per quotation',
        subtitle: 'Typical quotation amount',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      {
        name: 'Quotations Confirmed',
        value: confirmedCount.toString(),
        change: getPercentageChange(confirmedCount, confirmedCount * 0.8),
        changeType: 'positive',
        icon: '✅',
        description: 'Customer-approved quotations',
        subtitle: `${summary.totalQuotations > 0 ? ((confirmedCount / summary.totalQuotations) * 100).toFixed(1) : 0}% confirmation rate`,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
      },
    ];
  };

  // Prepare quotation chart data
  const prepareQuotationChartData = () => {
    if (!quotationData) return { timeSeries: [], currencyData: [], statusData: [], exportData: [] };

    const timeSeries = quotationData.timeSeries.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: item.totalAmount,
      quotations: item.totalQuotations
    }));

    const currencyData = quotationData.additionalAnalytics.quotationsByCurrency.map(item => ({
      name: item._id,
      value: item.totalAmount
    }));

    const statusData = quotationData.additionalAnalytics.quotationsByStatus.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.totalAmount,
      count: item.count
    }));

    // Empty export data for quotations (not applicable)
    const exportData: any[] = [];

    return { timeSeries, currencyData, statusData, exportData };
  };

  const quickActions = [
    { name: 'New Quotation', icon: '📝', description: 'Create a new quotation', color: 'from-blue-600 to-blue-500', path: '/quotations' },
    { name: 'View Orders', icon: '📦', description: 'Manage sales orders', color: 'from-green-600 to-green-500', path: '/orders' },
    { name: 'Review Orders', icon: '🔍', description: 'Review pending orders', color: 'from-yellow-600 to-yellow-500', path: '/review-orders' },
    { name: 'Invoice Requests', icon: '📄', description: 'Generate invoices', color: 'from-purple-600 to-purple-500', path: '/invoice-requests' },
    { name: 'View Invoices', icon: '📊', description: 'Manage invoices', color: 'from-indigo-600 to-indigo-500', path: '/invoices' },
    { name: 'Inventory', icon: '🏷️', description: 'Manage inventory', color: 'from-pink-600 to-pink-500', path: '/inventory' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
              <p className="text-gray-600">Fetching your analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <button
                onClick={() => fetchSalesAnalytics()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = activeTab === 'invoices' 
    ? (analyticsData ? generateStats(analyticsData.summary) : [])
    : (quotationData && quotationData.summary ? generateQuotationStats(quotationData.summary, quotationData) : []);
  const chartData = activeTab === 'invoices' ? prepareChartData() : prepareQuotationChartData();

  // Show loading state if data is not ready for the active tab
  if (isLoading && ((activeTab === 'invoices' && !analyticsData) || (activeTab === 'quotations' && !quotationData))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {activeTab === 'invoices' ? 'invoice' : 'quotation'} analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">Analytics overview</p>
              </div>
          </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center space-x-2 ${
                    showFilters 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  {Object.values(activeTab === 'invoices' ? filters : quotationFilters).some(f => f) && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(activeTab === 'invoices' ? filters : quotationFilters).filter(f => f).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => activeTab === 'invoices' ? fetchSalesAnalytics() : fetchQuotationAnalytics()}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center space-x-2 transition-colors"
                >
                  <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                </button>
        </div>
      </div>

            {/* Tab Navigation */}
            <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('invoices')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>Invoice Analytics</span>
              </div>
              </button>
              <button
                onClick={() => handleTabChange('quotations')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'quotations'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>Quotation Analytics</span>
              </div>
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Picker - Always Visible */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">📅 Date Range</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">From:</label>
                  <input
                    type="date"
                    value={activeTab === 'invoices' ? filters.dateFrom || '' : quotationFilters.dateFrom || ''}
                    onChange={(e) => {
                      if (activeTab === 'invoices') {
                        handleFilterChange('dateFrom', e.target.value);
                      } else {
                        handleQuotationFilterChange('dateFrom', e.target.value);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-blue-400"
                  />
              </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <input
                    type="date"
                    value={activeTab === 'invoices' ? filters.dateTo || '' : quotationFilters.dateTo || ''}
                    onChange={(e) => {
                      if (activeTab === 'invoices') {
                        handleFilterChange('dateTo', e.target.value);
                      } else {
                        handleQuotationFilterChange('dateTo', e.target.value);
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 hover:border-blue-400"
                  />
            </div>
                <button
                  onClick={() => {
                    if (activeTab === 'invoices') {
                      handleFilterChange('dateFrom', '');
                      handleFilterChange('dateTo', '');
                    } else {
                      handleQuotationFilterChange('dateFrom', '');
                      handleQuotationFilterChange('dateTo', '');
                    }
                  }}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-1"
                >
                  <span>🗑️</span>
                  <span>Clear Dates</span>
                </button>
          </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={applyFilters}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-2"
              >
                <span>✅</span>
                <span>{isLoading ? 'Applying...' : 'Apply Filters'}</span>
              </button>
              {Object.values(activeTab === 'invoices' ? filters : quotationFilters).some(f => f) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
      </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>🔍</span>
                <span>Advanced Filters</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {Object.values(activeTab === 'invoices' ? filters : quotationFilters).filter(f => f).length} filters active
                </span>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Status</span>
                </label>
                <div className="relative">
                  <select
                    value={activeTab === 'invoices' ? (filters.status || '') : (quotationFilters.status || '')}
                    onChange={(e) => activeTab === 'invoices' 
                      ? handleFilterChange('status', e.target.value || undefined)
                      : handleQuotationFilterChange('status', e.target.value || undefined)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 appearance-none bg-white"
                  >
                    <option value="">All Statuses</option>
                    {(activeTab === 'invoices' ? analyticsData?.filters.status.options : quotationData?.filters.status.options)?.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
                  {activeTab === 'invoices' 
                    ? (analyticsData?.filters.customerId.applied && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                      ))
                    : (quotationData?.filters.customerId.applied && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                      ))
                  }
                </label>
                <select
                  value={activeTab === 'invoices' ? (filters.customerId || '') : (quotationFilters.customerId || '')}
                  onChange={(e) => activeTab === 'invoices' 
                    ? handleFilterChange('customerId', e.target.value || undefined)
                    : handleQuotationFilterChange('customerId', e.target.value || undefined)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    (activeTab === 'invoices' ? analyticsData?.filters.customerId.applied : quotationData?.filters.customerId.applied)
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">All Customers</option>
                  {(activeTab === 'invoices' 
                    ? analyticsData?.filters.customerId.availableCustomers 
                    : quotationData?.filters.customerId.availableCustomers
                  )?.map(customer => (
                    <option key={customer.customerId} value={customer.customerId}>
                      {customer.customerName} ({activeTab === 'invoices' ? (customer as any).invoiceCount : (customer as any).quotationCount} {activeTab === 'invoices' ? 'invoices' : 'quotations'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                  {activeTab === 'invoices' 
                    ? (analyticsData?.filters.currency.applied && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                      ))
                    : (quotationData?.filters.currency.applied && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                      ))
                  }
                </label>
                <select
                  value={activeTab === 'invoices' ? (filters.currency || '') : (quotationFilters.currency || '')}
                  onChange={(e) => activeTab === 'invoices' 
                    ? handleFilterChange('currency', e.target.value || undefined)
                    : handleQuotationFilterChange('currency', e.target.value || undefined)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    (activeTab === 'invoices' ? analyticsData?.filters.currency.applied : quotationData?.filters.currency.applied)
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">All Currencies</option>
                  {(activeTab === 'invoices' 
                    ? analyticsData?.filters.currency.availableCurrencies 
                    : quotationData?.filters.currency.availableCurrencies
                  )?.map(currency => (
                    <option key={currency.currency} value={currency.currency}>
                      {currency.currency} ({(currency as any).totalInvoices || (currency as any).totalQuotations} {activeTab === 'invoices' ? 'invoices' : 'quotations'})
                    </option>
                  ))}
                </select>
              </div>
              </div>
            
            {/* Additional Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group By
                  {analyticsData?.filters.groupBy.applied && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                  )}
                </label>
                <select
                  value={filters.groupBy || 'day'}
                  onChange={(e) => handleFilterChange('groupBy', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    analyticsData?.filters.groupBy.applied 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  {analyticsData?.filters.groupBy.options.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                  {analyticsData?.filters.createdBy.applied && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Applied</span>
                  )}
                </label>
                <select
                  value={filters.createdBy || ''}
                  onChange={(e) => handleFilterChange('createdBy', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    analyticsData?.filters.createdBy.applied 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">All Employees</option>
                  {analyticsData?.filters.createdBy.availableEmployees.map(employee => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.employeeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Filter Status and Applied Filters Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Filter Status</h4>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (analyticsData?.filters.appliedFilters?.count || 0) > 0 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {analyticsData?.filters.appliedFilters?.count || 0} filters applied
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    analyticsData?.filters.query.hasData 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {analyticsData?.filters.query.totalInvoices || 0} invoices found
                  </div>
                  </div>
                  </div>
              
              {/* Applied Filters List */}
              {analyticsData?.filters.appliedFilters?.list && analyticsData.filters.appliedFilters.list.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Applied filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.filters.appliedFilters.list.map((filter, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {filter}
                    </span>
                    ))}
                  </div>
                  </div>
              )}
              
              {/* Currency Breakdown */}
              {analyticsData?.filters.appliedFilters?.currencyBreakdown && 
               analyticsData.filters.appliedFilters.currencyBreakdown.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Currency breakdown:</p>
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.filters.appliedFilters.currencyBreakdown.map((currency, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {currency.currency}: {currency.invoices} invoices ({formatPrice(currency.amount, currency.currency)})
                      </span>
              ))}
            </div>
          </div>
              )}
        </div>
            
            {/* Filter Status Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeTab === 'invoices' ? filters : quotationFilters).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {key}: {value}
                          <button
                            onClick={() => {
                              if (activeTab === 'invoices') {
                                handleFilterChange(key as keyof typeof filters, '');
                              } else {
                                handleQuotationFilterChange(key as keyof typeof quotationFilters, '');
                              }
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
      </div>
                </div>
                <button
                  onClick={applyFilters}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <span>🚀</span>
                  <span>{isLoading ? 'Applying...' : 'Apply Filters'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <div className="text-lg">{stat.icon}</div>
            </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
              </div>
      </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                
                {/* Description */}
                <p className="text-xs text-gray-500 mb-1">{stat.description}</p>
                
                {/* Subtitle if available */}
                {(stat as any).subtitle && (
                  <p className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    {(stat as any).subtitle}
                  </p>
                )}
                
                {/* Legacy additional context - keeping for backward compatibility */}
                {stat.name === 'Total Revenue Generated' && analyticsData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Avg: {formatCurrency(analyticsData.summary.averageInvoiceValue)}
              </div>
                )}
                
                {stat.name === 'Net Profit Earned' && analyticsData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Margin: {((analyticsData.summary.totalProfitAmount / analyticsData.summary.totalAmount) * 100).toFixed(1)}%
              </div>
                )}
                
                {stat.name === 'Invoices Paid' && analyticsData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Rate: {((analyticsData.summary.paidInvoices / analyticsData.summary.totalInvoices) * 100).toFixed(1)}%
                  </div>
                )}
                
                {stat.name === 'Pending Invoices' && analyticsData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Amount: {formatCurrency(analyticsData.summary.pendingAmount)}
                  </div>
                )}

                {/* Additional context for quotation stats */}
                {stat.name === 'Total Quotation Value' && activeTab === 'quotations' && quotationData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Avg: {formatCurrency(quotationData.summary.averageQuotationValue)}
                  </div>
                )}
                
                {stat.name === 'Quotations Confirmed' && activeTab === 'quotations' && quotationData && (
                  <div className="mt-2 text-xs text-gray-500">
                    Rate: {quotationData.summary.totalQuotations > 0 ? ((parseInt(stat.value) / quotationData.summary.totalQuotations) * 100).toFixed(1) : 0}%
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

        {/* Compact Charts Section */}
        {((activeTab === 'invoices' && analyticsData) || (activeTab === 'quotations' && quotationData)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue/Value Trend Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'invoices' ? 'Daily Revenue Trend' : 'Daily Quotation Value Trend'}
            </h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(activeTab === 'invoices' 
                      ? analyticsData?.summary.totalAmount || 0
                      : quotationData?.summary.totalAmount || 0
                    )}
          </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData.timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      activeTab === 'invoices' 
                        ? (name === 'revenue' ? 'Revenue' : 'Profit')
                        : 'Value'
                    ]}
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeTab === 'invoices' ? 'revenue' : 'value'}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Currency Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'invoices' ? 'Revenue by Currency' : 'Value by Currency'}
            </h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {activeTab === 'invoices' 
                      ? analyticsData?.currencySummaries.length || 0
                      : quotationData?.additionalAnalytics.quotationsByCurrency.length || 0
                    }
          </div>
                  <div className="text-xs text-gray-500">Currencies</div>
              </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.currencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="white"
                    strokeWidth={1}
                  >
                    {chartData.currencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), activeTab === 'invoices' ? 'Revenue' : 'Value']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Compact Currency Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {chartData.currencyData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(entry.value)}</div>
          </div>
        </div>
            ))}
      </div>
              </div>
            </div>
        )}

        {/* Compact Analytics */}
        {((activeTab === 'invoices' && analyticsData) || (activeTab === 'quotations' && quotationData)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'invoices' ? 'Sales by Status' : 'Quotations by Status'}
                </h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {activeTab === 'invoices' 
                      ? analyticsData?.additionalAnalytics.salesByStatus.length || 0
                      : quotationData?.additionalAnalytics.quotationsByStatus.length || 0
                    }
            </div>
                  <div className="text-xs text-gray-500">Types</div>
                  </div>
                  </div>
              <div className="space-y-3">
                {(activeTab === 'invoices' 
                  ? analyticsData?.additionalAnalytics.salesByStatus || []
                  : quotationData?.additionalAnalytics.quotationsByStatus || []
                ).map((status, index) => {
                  const totalCount = activeTab === 'invoices' 
                    ? analyticsData?.summary.totalInvoices || 0
                    : quotationData?.summary.totalQuotations || 0;
                  const percentage = ((status.count / totalCount) * 100).toFixed(1);
                  return (
                    <div key={status._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status._id === 'paid' || status._id === 'confirmed' ? 'bg-green-500' : 
                            status._id === 'pending' || status._id === 'sent' ? 'bg-yellow-500' : 
                            status._id === 'draft' ? 'bg-gray-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="font-medium text-gray-900 capitalize">{status._id}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                  </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(status.totalAmount)}</p>
                          <p className="text-xs text-gray-500">{status.count} {activeTab === 'invoices' ? 'invoices' : 'quotations'}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            status._id === 'paid' || status._id === 'confirmed' ? 'bg-green-500' : 
                            status._id === 'pending' || status._id === 'sent' ? 'bg-yellow-500' : 
                            status._id === 'draft' ? 'bg-gray-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'invoices' ? 'Monthly Revenue Trend' : 'Monthly Quotation Trend'}
            </h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {activeTab === 'invoices' 
                      ? analyticsData?.additionalAnalytics.monthlyTrend.length || 0
                      : quotationData?.additionalAnalytics.monthlyTrend.length || 0
                    }
          </div>
                  <div className="text-xs text-gray-500">Months</div>
                </div>
              </div>
              <div className="space-y-3">
                {(activeTab === 'invoices' 
                  ? analyticsData?.additionalAnalytics.monthlyTrend || []
                  : quotationData?.additionalAnalytics.monthlyTrend || []
                ).map((trend, index) => {
                  const monthName = new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  const isCurrentMonth = new Date().getMonth() === trend._id.month - 1 && new Date().getFullYear() === trend._id.year;
                  return (
                    <div key={`${trend._id.year}-${trend._id.month}`} className={`p-3 rounded-lg border ${
                      isCurrentMonth ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                            isCurrentMonth ? 'bg-purple-500' : 'bg-purple-400'
                          }`}>
                            {trend._id.month}
                  </div>
                          <div>
                            <p className="font-medium text-gray-900">{monthName}</p>
                            <p className="text-xs text-gray-500">{trend.count} {activeTab === 'invoices' ? 'invoices' : 'quotations'}</p>
                            {isCurrentMonth && (
                              <span className="text-xs text-purple-600 font-medium">Current</span>
                            )}
                  </div>
                </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(trend.totalAmount)}</p>
                          <p className="text-xs text-gray-500">
                            Avg: {formatCurrency(trend.totalAmount / trend.count)}
                          </p>
            </div>
          </div>
        </div>
                  );
                })}
      </div>
            </div>

            {/* Export Destinations Map - Clean Design */}
            {activeTab === 'invoices' && analyticsData?.additionalAnalytics.salesByExportTo && analyticsData.additionalAnalytics.salesByExportTo.length > 0 && (
              <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2 text-xl">🌍</span>
                    Export Destinations
                  </h3>
                  <p className="text-sm text-gray-600">Global distribution of car exports</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 120,
                      center: [0, 20]
                    }}
                    width={800}
                    height={350}
                    style={{ width: "100%", height: "auto" }}
                  >
                    <Geographies geography="https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson">
                      {({ geographies }: any) => {
                        return geographies.map((geo: any) => {
                          // Only apply colors if we have export data
                          let fillColor = "#F3F4F6"; // Default light gray
                          let strokeColor = "#E5E7EB"; // Default light border
                          let strokeWidth = 0.5; // Default thin border
                          
                          // Default colors for all countries
                          fillColor = "#F3F4F6"; // Default light gray
                          strokeColor = "#E5E7EB"; // Default light border
                          strokeWidth = 0.5;
                          
                          if (chartData.exportData && chartData.exportData.length > 0) {
                            
                            // Get all possible names for this geography (try different property names)
                            const geoName = geo.properties.NAME?.toLowerCase() || geo.properties.name?.toLowerCase() || '';
                            const geoNameEn = geo.properties.NAME_EN?.toLowerCase() || geo.properties.name_en?.toLowerCase() || '';
                            const geoNameLong = geo.properties.NAME_LONG?.toLowerCase() || geo.properties.name_long?.toLowerCase() || '';
                            const geoSovereign = geo.properties.SOVEREIGNT?.toLowerCase() || geo.properties.sovereignt?.toLowerCase() || '';
                            const geoAdmin = geo.properties.ADMIN?.toLowerCase() || geo.properties.admin?.toLowerCase() || '';
                            
                            // Create a comprehensive list of all possible geo names for this country
                            const allGeoNames = [geoName, geoNameEn, geoNameLong, geoSovereign, geoAdmin].filter(Boolean);
                            
                            
                            // Check if any export destination matches this country
                            const exportCountry = chartData.exportData.find((dest: any) => {
                              const exportToName = dest.name.toLowerCase();
                              
                              // Direct exact match
                              if (allGeoNames.includes(exportToName)) {
                                return true;
                              }
                              
                              // Specific country mappings for common variations
                              const countryMappings: { [key: string]: string[] } = {
                                'india': ['india', 'republic of india', 'bharat'],
                                'australia': ['australia', 'commonwealth of australia'],
                                'usa': ['united states', 'usa', 'us', 'united states of america', 'america'],
                                'uae': ['united arab emirates', 'uae', 'emirates'],
                                'uk': ['united kingdom', 'uk', 'britain', 'great britain', 'england'],
                                'germany': ['germany', 'deutschland', 'federal republic of germany'],
                                'france': ['france', 'french republic'],
                                'canada': ['canada'],
                                'japan': ['japan', 'nippon'],
                                'china': ['china', 'people\'s republic of china', 'prc']
                              };
                              
                              // Check if export name has specific mappings
                              if (countryMappings[exportToName]) {
                                return countryMappings[exportToName].some(variation => 
                                  allGeoNames.includes(variation)
                                );
                              }
                              
                              // Additional fallback: check if any geo name contains the export name (for partial matches)
                              return allGeoNames.some(geoName => 
                                geoName.includes(exportToName) || exportToName.includes(geoName)
                              );
                            });
                            
                            // Apply colors only if this is an export country
                            if (exportCountry) {
                              fillColor = exportCountry.fill;
                              strokeColor = "#1F2937";
                              strokeWidth = 1.5;
                            }
                          }
                          
                          
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              style={{
                                default: {
                                  fill: fillColor,
                                  stroke: strokeColor,
                                  strokeWidth: strokeWidth,
                                  outline: "none",
                                },
                                hover: {
                                  fill: fillColor,
                                  stroke: strokeColor === "#1F2937" ? "#000000" : "#9CA3AF",
                                  strokeWidth: strokeWidth === 1.5 ? 2 : 1,
                                  outline: "none",
                                },
                                pressed: {
                                  fill: fillColor,
                                  stroke: strokeColor === "#1F2937" ? "#000000" : "#6B7280",
                                  strokeWidth: strokeWidth === 1.5 ? 2 : 1,
                                  outline: "none",
                                },
                              }}
                            />
                          );
                        });
                      }}
                    </Geographies>
                  </ComposableMap>
                </div>
              </div>
              )}
            </div>
          )}

        {/* Compact Currency Breakdown */}
        {((activeTab === 'invoices' && analyticsData && analyticsData.currencySummaries.length > 0) || 
          (activeTab === 'quotations' && quotationData && quotationData.additionalAnalytics.quotationsByCurrency.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Currency Breakdown</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-600">
                  {activeTab === 'invoices' 
                    ? analyticsData?.currencySummaries.length || 0
                    : quotationData?.additionalAnalytics.quotationsByCurrency.length || 0
                  }
            </div>
                <div className="text-xs text-gray-500">Currencies</div>
          </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'invoices' 
                ? analyticsData?.currencySummaries || []
                : quotationData?.additionalAnalytics.quotationsByCurrency || []
              ).map((currency, index) => {
                if (activeTab === 'invoices') {
                  const invoiceCurrency = currency as any;
                  const profitMargin = ((invoiceCurrency.totalProfitAmount / invoiceCurrency.totalAmount) * 100).toFixed(1);
                  const paymentRate = ((invoiceCurrency.paidInvoices / invoiceCurrency.totalInvoices) * 100).toFixed(1);
                  return (
                    <div key={invoiceCurrency.currency} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{invoiceCurrency.currency}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{invoiceCurrency.currency}</h4>
                            <p className="text-xs text-gray-500">{invoiceCurrency.totalInvoices} invoices</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total</span>
                          <span className="font-bold text-gray-900 text-sm">{formatCurrency(invoiceCurrency.totalAmount, invoiceCurrency.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Profit</span>
                          <span className="font-bold text-green-600 text-sm">{formatCurrency(invoiceCurrency.totalProfitAmount, invoiceCurrency.currency)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">{invoiceCurrency.paidInvoices}</div>
                            <div className="text-xs text-gray-600">Paid</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-lg font-bold text-yellow-600">{invoiceCurrency.pendingInvoices}</div>
                            <div className="text-xs text-gray-600">Pending</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Margin</span>
                            <span className="font-semibold text-green-600">{profitMargin}%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Rate</span>
                            <span className="font-semibold text-blue-600">{paymentRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const quotationCurrency = currency as any;
                  return (
                    <div key={quotationCurrency._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{quotationCurrency._id}</span>
                          </div>
                           <div>
                            <h4 className="font-semibold text-gray-900">{quotationCurrency._id}</h4>
                            <p className="text-xs text-gray-500">{quotationCurrency.count} quotations</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Total Value</span>
                          <span className="font-bold text-gray-900 text-sm">{formatCurrency(quotationCurrency.totalAmount, quotationCurrency._id)}</span>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-blue-600">{quotationCurrency.count}</div>
                          <div className="text-xs text-gray-600">Quotations</div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Compact Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600">
                {quickActions.length}
              </div>
              <div className="text-xs text-gray-500">Actions</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action, index) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className={`group relative p-4 rounded-lg bg-gradient-to-br ${action.color} text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{action.name}</h4>
                  <p className="text-xs opacity-90 leading-tight">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;