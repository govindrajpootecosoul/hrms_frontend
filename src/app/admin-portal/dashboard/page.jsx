'use client';

import { useAdminPortal } from '@/lib/context/AdminPortalContext';

export default function DashboardPage() {
  const { users, portalFeatures } = useAdminPortal();

  const activeUsers = users.filter(u => u.active).length;
  const totalPortals = portalFeatures.length;

  // Space Overview Cards
  const spaceCards = [
    {
      title: 'Coworking',
      type: 'Corporate',
      status: 'Busy',
      current: 32,
      total: 32,
      icon: '🏢',
      color: 'bg-blue-500',
    },
    {
      title: 'Shared Space',
      type: 'Conventional',
      status: 'Crowded',
      current: 14,
      total: 52,
      icon: '🪑',
      color: 'bg-green-500',
    },
    {
      title: 'Private Office',
      type: 'High-End',
      status: 'Quiet',
      current: 8,
      total: 64,
      icon: '🏛️',
      color: 'bg-purple-500',
    },
  ];

  // Recent Activities
  const recentActivities = [
    {
      name: 'John Doe',
      action: 'has booked the workspace',
      time: '2 hours ago',
      type: 'Booked',
      avatar: 'JD',
    },
    {
      name: 'Jane Smith',
      action: 'has checked in',
      time: '3 hours ago',
      type: 'Checked In',
      avatar: 'JS',
    },
    {
      name: 'Bob Johnson',
      action: 'has updated profile',
      time: '5 hours ago',
      type: 'Updated',
      avatar: 'BJ',
    },
  ];

  // Customer List
  const customers = users.slice(0, 5).map((user) => ({
    name: user.name,
    email: user.email,
    avatar: user.name.charAt(0).toUpperCase(),
  }));

  return (
    <div className="space-y-6">
      {/* Space Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spaceCards.map((space, index) => {
          const percentage = (space.current / space.total) * 100;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${space.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                    {space.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{space.title}</h3>
                    <p className="text-sm text-gray-500">{space.type}</p>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{space.status}</span>
                  <span className="font-medium text-gray-800">
                    {space.current}/{space.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${space.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Statistic */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Visitors Statistic</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
              const lastWeekHeight = Math.random() * 60 + 20;
              const thisWeekHeight = Math.random() * 60 + 20;
              const isHighlighted = day === 'F';
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full h-48 flex items-end justify-center space-x-1">
                    <div
                      className="w-full bg-blue-400 rounded-t"
                      style={{ height: `${lastWeekHeight}%` }}
                    ></div>
                    <div
                      className={`w-full rounded-t ${isHighlighted ? 'bg-orange-500' : 'bg-orange-400'}`}
                      style={{ height: `${thisWeekHeight}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs mt-2 ${isHighlighted ? 'font-bold text-purple-600' : 'text-gray-600'}`}>
                    {day}
                  </span>
                  {isHighlighted && (
                    <span className="text-xs text-purple-600 font-semibold mt-1">320</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Last Week</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span className="text-sm text-gray-600">This Week</span>
            </div>
          </div>
        </div>

        {/* Activity Workers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Workers</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="8"
                  strokeDasharray={`${(activeUsers / users.length) * 251.2} 251.2`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${(totalPortals / 10) * 251.2} 251.2`}
                  strokeDashoffset={`-${(activeUsers / users.length) * 251.2}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="8"
                  strokeDasharray={`${(100 - (activeUsers / users.length) * 100 - (totalPortals / 10) * 100) * 2.512} 251.2`}
                  strokeDashoffset={`-${((activeUsers / users.length) + (totalPortals / 10)) * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                  <div className="text-sm text-gray-500">Users</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Work</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Eat</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{totalPortals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Sleep</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{users.length - activeUsers - totalPortals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Space Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Space Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Users</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Income</th>
                </tr>
              </thead>
              <tbody>
                {portalFeatures.slice(0, 5).map((portal, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {portal.portal.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{portal.portal}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {index % 2 === 0 ? 'Corporate' : 'Conventional'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        index % 2 === 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {index % 2 === 0 ? 'Busy' : 'Free'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {portal.categories.length + portal.subcategories.length} users
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      ${(Math.random() * 300 + 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">May 2024</h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const date = i + 1;
                const isToday = date === 9;
                return (
                  <div
                    key={i}
                    className={`text-xs py-2 rounded ${
                      isToday
                        ? 'bg-orange-500 text-white font-semibold'
                        : date <= 12
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {date <= 12 ? date : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.name}</span> {activity.action}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer List</h3>
            <div className="space-y-3">
              {customers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {customer.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









































