'use client';

import { useState } from 'react';
import SideNavigation from '../SideNavigation';
import ViewBlotters from './ViewBlotters';
import AddBlotter from './AddBlotter';

export default function MainBlotter() {
  const [activeView, setActiveView] = useState<'view' | 'add'>('view');

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
                onClick={() => setActiveView('view')}
                className={`px-4 py-2 rounded-md font-medium transition-colors
                  ${activeView === 'view'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                View Blotters
              </button>
              <button
                onClick={() => setActiveView('add')}
                className={`px-4 py-2 rounded-md font-medium transition-colors
                  ${activeView === 'add'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Add Blotter
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow">
            {activeView === 'view' ? <ViewBlotters /> : <AddBlotter />}
          </div>
        </div>
      </div>
    </div>
  );
}
