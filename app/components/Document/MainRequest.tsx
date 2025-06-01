'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import SideNavigation from '../SideNavigation';
import ViewDocuments from './ViewDocuments';
import ViewRequestedDocuments from './ViewRequestedDocuments';
import RequestDocument from './RequestDocument';

export default function MainRequest() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<'list' | 'request'>('list');
  const isResident = session?.user?.role === 'resident';

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavigation />
      
      <div className="flex-1 flex flex-col">
        {/* Header with navigation */}
        <div className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">Document Management</h1>
              <div className="space-x-4">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isResident ? 'My Requests' : 'View Documents'}
                </button>
                <button
                  onClick={() => setActiveView('request')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeView === 'request'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Request Document
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {activeView === 'list' ? (
            isResident ? <ViewRequestedDocuments /> : <ViewDocuments />
          ) : (
            <div className="flex justify-center pt-6">
              <RequestDocument />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
