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
    { name: 'New Order', icon: '📦', description: 'Create a new order', color: 'from-amber-600 to-yellow-500' },
    { name: 'Add Customer', icon: '👥', description: 'Register new customer', color: 'from-amber-500 to-yellow-400' },
    { name: 'Add Product', icon: '🏷️', description: 'Add new product', color: 'from-yellow-500 to-amber-600' },
    { name: 'Create Invoice', icon: '📄', description: 'Generate invoice', color: 'from-amber-400 to-yellow-500' },
    { name: 'View Reports', icon: '📊', description: 'Analytics & insights', color: 'from-yellow-400 to-amber-500' },
    { name: 'Manage Users', icon: '👤', description: 'User management', color: 'from-amber-600 to-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 to-amber-600/10 rounded-xl"></div>
        <div className="relative p-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-br from-gray-900 to-black border border-amber-500 rounded-lg shadow-lg mr-3">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
                          <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-600 to-yellow-500 bg-clip-text text-transparent m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium m-0 p-0 text-left" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  Welcome to your automotive POS admin dashboard. Here's an overview of your business.
                </p>
              </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.name} className="group relative bg-gradient-to-br from-gray-900 to-black overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-amber-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
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
                <dt className="text-sm font-bold text-amber-400 truncate">
                  {stat.name}
                </dt>
                <dd className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  {stat.value}
                </dd>
                <p className="text-xs text-gray-400 font-medium">
                  {stat.description}
                </p>
              </div>
              {/* Mini Trend Chart */}
              <div className="mt-4 flex items-end space-x-1 h-12">
                {stat.trend.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-amber-500/60 to-yellow-500/30 rounded-sm hover:from-amber-600/80 hover:to-yellow-600/50 transition-all duration-200"
                    style={{ height: `${(value / 25) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gradient-to-br from-gray-900 to-black shadow-xl rounded-2xl border border-amber-500/30 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg mr-3">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-400">
              Recent Orders
            </h3>
          </div>
          <div className="overflow-hidden rounded-xl">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-0 bg-gradient-to-r from-gray-800 to-black border-b border-amber-500/30">
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Order ID
              </div>
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Customer
              </div>
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Amount
              </div>
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Items
              </div>
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Status
              </div>
              <div className="px-5 py-4 text-xs font-bold text-amber-400 uppercase tracking-wider">
                Time
              </div>
            </div>
            
            {/* Table Body */}
            <div className="bg-gray-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-6 gap-0 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-all duration-200 border-b border-amber-500/10">
                  <div className="px-5 py-4 text-sm font-bold text-gray-100">
                    {order.id}
                  </div>
                  <div className="px-5 py-4 text-sm font-medium text-gray-200">
                    {order.customer}
                  </div>
                  <div className="px-5 py-4 text-sm font-bold text-amber-400">
                    {order.amount}
                  </div>
                  <div className="px-5 py-4 text-sm text-gray-300">
                    {order.items} items
                  </div>
                  <div className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                      order.status === 'Completed' 
                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300'
                        : order.status === 'Pending'
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 border border-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="px-5 py-4 text-xs text-gray-400">
                    {order.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

            {/* Recent Activities */}
      <div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-xl border border-amber-500/30 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg mr-3">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-400">
              Recent Activities
            </h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg border border-amber-500/20 hover:shadow-md transition-all duration-200">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'order' ? 'bg-amber-500' :
                  activity.type === 'customer' ? 'bg-yellow-500' :
                  activity.type === 'product' ? 'bg-amber-400' :
                  activity.type === 'payment' ? 'bg-yellow-400' : 'bg-amber-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100">{activity.action}</p>
                  <p className="text-xs text-gray-300">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-xl border border-amber-500/30 overflow-hidden">
        <div className="px-5 py-5">
          <div className="flex items-center mb-5">
            <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg mr-3">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-400">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action, index) => (
              <button key={action.name} className="group p-4 bg-gray-800 border-2 border-amber-500/30 rounded-xl hover:border-amber-400 hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-gray-100 mb-1">{action.name}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
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
