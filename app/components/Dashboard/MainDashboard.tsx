'use client';

import { useEffect, useState } from 'react';
import BlotterAnalytics from './Blotter';
import IssuanceAnalytics from './Issuance';
import SideNavigation from '../SideNavigation';

export default function MainDashboard() {
  const [error, setError] = useState<string | null>(null);
  // Navigation state for dashboard
  const [activeTab, setActiveTab] = useState<'issuance' | 'blotter'>('issuance');

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await fetch('/api/resident/get-all-residents');
        const result = await response.json();
        
        if (result.message === "Residents fetched successfully") {
          // setResidents(result.data);
        } else {
          setError('Failed to fetch resident data');
        }
      } catch {
        setError('Error fetching resident data');
      } 
    };

    fetchResidents();
  }, []);

  if (error) return <div>Error: {error}</div>;


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
      <div className="w-64 flex-shrink-0">
        <SideNavigation />
      </div>

      <div className="flex-1 overflow-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center px-8 py-5 border-b-black shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <div className="flex-1 flex justify-center gap-4">
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'issuance' ? 'bg-green-600 text-white shadow-lg' : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white'}`}
              onClick={() => setActiveTab('issuance')}
            >
              Issuance
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'blotter' ? 'bg-green-600 text-white shadow-lg' : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white'}`}
              onClick={() => setActiveTab('blotter')}
            >
              Blotter
            </button>
          </div>
          <a
            href="/report/issuance-summary"
            className="px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white"
          >
            Export Report
          </a>
        </div>

        {/* Main Content */}
        <div className="p-3">
          {/* Show the selected dashboard */}
          <div className="space-y-8">
            {activeTab === 'issuance' && (
              <div className="p-6">
                <IssuanceAnalytics />
              </div>
            )}
            {activeTab === 'blotter' && (
              <div className="p-6">
                <BlotterAnalytics />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
