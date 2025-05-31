'use client';

import SideNavigation from './SideNavigation';

const Example = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <SideNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome to Dashboard</h1>
            <p className="text-gray-600 mt-2">Here's what's happening in your barangay today.</p>
          </div>

          {/* Sample Content - Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Residents Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-600 text-sm font-medium">Total Residents</h3>
                <span className="text-blue-500 bg-blue-50 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-4">2,543</p>
              <p className="text-green-500 text-sm mt-2">↑ 12% from last month</p>
            </div>

            {/* Active Blotters Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-600 text-sm font-medium">Active Blotters</h3>
                <span className="text-red-500 bg-red-50 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-4">18</p>
              <p className="text-red-500 text-sm mt-2">↑ 3 new cases this week</p>
            </div>

            {/* Registered Businesses Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-600 text-sm font-medium">Registered Businesses</h3>
                <span className="text-purple-500 bg-purple-50 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-4">156</p>
              <p className="text-purple-500 text-sm mt-2">↑ 8 new this month</p>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Activity Items */}
                {[
                  {
                    title: "New Resident Registration",
                    description: "Juan Dela Cruz has registered as a new resident",
                    time: "2 hours ago",
                    type: "registration"
                  },
                  {
                    title: "Blotter Report Filed",
                    description: "New blotter report #BL-2024-123 has been filed",
                    time: "5 hours ago",
                    type: "blotter"
                  },
                  {
                    title: "Business Permit Approved",
                    description: "Approved business permit for Santos General Merchandise",
                    time: "1 day ago",
                    type: "business"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'registration' ? 'bg-green-50 text-green-500' :
                        activity.type === 'blotter' ? 'bg-red-50 text-red-500' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Example;
