'use client';

import { useState } from 'react';
import SideNavigation from '../SideNavigation';
import Residents from './Residents';
import AddResident from './AddResident';

export default function MainResident() {
  const [activeView, setActiveView] = useState<'list' | 'add'>('list');

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        {/* Header with navigation */}
        <div className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Residents Management</h1>
              <div className="space-x-4">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  View Residents
                </button>
                <button
                  onClick={() => setActiveView('add')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'add'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add Resident
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {activeView === 'list' ? <Residents /> : <AddResident />}
        </div>
      </div>
    </div>
  );
} 