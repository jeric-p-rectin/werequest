'use client';

import { useState } from 'react';
import SideNavigation from '../SideNavigation';
import ViewBlotters from './ViewBlotters';
import AddBlotter from './AddBlotter';
import BlotterAnalytics from '../Dashboard/Blotter';

export default function MainBlotter() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'view' | 'add'>('view');

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header with Toggle Buttons */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Blotter Management</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-4 py-2 rounded-md font-medium transition-colors
                  ${activeTab === 'view'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer'
                  }`}
              >
                View Blotters
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 rounded-md font-medium transition-colors
                  ${activeTab === 'add'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer'
                  }`}
              >
                Add Blotter
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'analytics' && <BlotterAnalytics />}
            {activeTab === 'view' && <ViewBlotters />}
            {activeTab === 'add' && <AddBlotter />}
          </div>
        </div>
      </div>
    </div>
  );
}
