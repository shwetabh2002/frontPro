import React from 'react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { 
      name: 'Total Sales', 
      value: '$24,000', 
      change: '+12%', 
      changeType: 'positive',
      icon: '💰',
      description: 'This month',
      trend: [12, 19, 3, 5, 2, 3, 15, 8, 12, 9, 14, 18]
    },
    { 
      name: 'Total Orders', 
      value: '156', 
      change: '+8%', 
      changeType: 'positive',
      icon: '📦',
      description: 'This month',
      trend: [8, 12, 15, 9, 6, 11, 14, 8, 12, 9, 14, 18]
    },
    { 
      name: 'Total Customers', 
      value: '89', 
      change: '+15%', 
      changeType: 'positive',
      icon: '👥',
      description: 'Active customers',
      trend: [15, 22, 8, 12, 9, 14, 18, 12, 19, 3, 5, 2]
    },
    { 
      name: 'Total Products', 
      value: '234', 
      change: '+3%', 
      changeType: 'positive',
      icon: '🏷️',
      description: 'In inventory',
      trend: [3, 8, 12, 9, 14, 18, 12, 19, 3, 5, 2, 3]
    },
  ];

  const recentOrders = [
    { id: '#1234', customer: 'John Doe', amount: '$120', status: 'Completed', date: '2 hours ago', items: 3 },
    { id: '#1235', customer: 'Jane Smith', amount: '$85', status: 'Pending', date: '4 hours ago', items: 2 },
    { id: '#1236', customer: 'Bob Johnson', amount: '$200', status: 'Processing', date: '6 hours ago', items: 5 },
    { id: '#1237', customer: 'Alice Brown', amount: '$95', status: 'Completed', date: '8 hours ago', items: 2 },
    { id: '#1238', customer: 'Charlie Wilson', amount: '$150', status: 'Completed', date: '1 day ago', items: 4 },
  ];



  const recentActivities = [
    { action: 'New order placed', details: 'Order #1238 by Charlie Wilson', time: '2 hours ago', type: 'order' },
    { action: 'Customer registered', details: 'Alice Brown joined the platform', time: '4 hours ago', type: 'customer' },
    { action: 'Product updated', details: 'Laptop Computer price updated', time: '6 hours ago', type: 'product' },
    { action: 'Payment received', details: 'Payment of $200 from Bob Johnson', time: '8 hours ago', type: 'payment' },
    { action: 'Inventory alert', details: 'Wireless Mouse stock is low', time: '1 day ago', type: 'alert' },
  ];

  const quickActions = [
    { name: 'New Order', icon: '📦', description: 'Create a new order', color: 'from-blue-500 to-indigo-600' },
    { name: 'Add Customer', icon: '👥', description: 'Register new customer', color: 'from-emerald-500 to-teal-600' },
    { name: 'Add Product', icon: '🏷️', description: 'Add new product', color: 'from-purple-500 to-pink-600' },
    { name: 'Create Invoice', icon: '📄', description: 'Generate invoice', color: 'from-orange-500 to-amber-600' },
    { name: 'View Reports', icon: '📊', description: 'Analytics & insights', color: 'from-cyan-500 to-blue-600' },
    { name: 'Manage Users', icon: '👤', description: 'User management', color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 to-indigo-600/8 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Dashboard
                </h1>
                <p className="text-sm text-slate-500 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Welcome to your POS admin dashboard. Here's an overview of your business.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.name} className="group relative bg-gradient-to-br from-white to-slate-50 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                {/* <div className={`flex-shrink-0 px-3 py-1.5 rounded-xl ${
                  stat.changeType === 'positive' 
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700 border border-red-200'
                }`}>
                  <span className="text-sm font-bold">{stat.change}</span>
                </div> */}
              </div>
              <div className="space-y-2">
                <dt className="text-sm font-bold text-slate-600 truncate">
                  {stat.name}
                </dt>
                <dd className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                  {stat.value}
                </dd>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.description}
                </p>
              </div>
              {/* Mini Trend Chart */}
              <div className="mt-4 flex items-end space-x-1 h-12">
                {stat.trend.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-400/60 to-indigo-400/30 rounded-sm hover:from-blue-500/80 hover:to-indigo-500/50 transition-all duration-200"
                    style={{ height: `${(value / 25) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-br from-white to-slate-50 shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              Recent Orders
            </h3>
          </div>
          <div className="overflow-hidden rounded-xl">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-0 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Order ID
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Customer
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Amount
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Items
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Status
              </div>
              <div className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Time
              </div>
            </div>
            
            {/* Table Body */}
            <div className="bg-white">
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-6 gap-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b border-slate-100">
                  <div className="px-5 py-4 text-sm font-bold text-slate-700">
                    {order.id}
                  </div>
                  <div className="px-5 py-4 text-sm font-medium text-slate-700">
                    {order.customer}
                  </div>
                  <div className="px-5 py-4 text-sm font-bold text-slate-700">
                    {order.amount}
                  </div>
                  <div className="px-5 py-4 text-sm text-slate-600">
                    {order.items} items
                  </div>
                  <div className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                      order.status === 'Completed' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                        : order.status === 'Pending'
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="px-5 py-4 text-xs text-slate-500">
                    {order.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

            {/* Recent Activities */}
      <div className="bg-gradient-to-br from-white to-emerald-50 shadow-lg rounded-xl border border-emerald-100 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              Recent Activities
            </h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-emerald-100 hover:shadow-md transition-all duration-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'order' ? 'bg-blue-500' :
                  activity.type === 'customer' ? 'bg-emerald-500' :
                  activity.type === 'product' ? 'bg-purple-500' :
                  activity.type === 'payment' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.details}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-br from-white to-slate-50 shadow-lg rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-slate-500 to-blue-600 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action, index) => (
              <button key={action.name} className="group p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">{action.name}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
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
