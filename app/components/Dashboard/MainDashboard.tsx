'use client';

import { useEffect, useState } from 'react';
import BlotterAnalytics from './Blotter';
import IssuanceAnalytics from './Issuance';
import SideNavigation from '../SideNavigation';

// interface ResidentData {
//   _id: string;
//   fullName: string;
//   gender: string;
//   age: number;
//   pwd: boolean;
//   soloParent: boolean;
//   fourPsBeneficiary: boolean;
//   civilStatus: string;
//   educationalAttainment: string;
//   votingStatus: string;
// }

export default function MainDashboard() {
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
      <div className="w-64 flex-shrink-0">
        <SideNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-8 items-center">
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'issuance' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('issuance')}
            >
              Issuance
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${activeTab === 'blotter' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('blotter')}
            >
              Blotter
            </button>
            <div className="flex-1" />
            <a
              href="/report/issuance-summary"
              className="px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none bg-green-600 text-white shadow-lg hover:bg-green-700"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Export Data
            </a>
          </div>

          {/* Show the selected dashboard */}
          <div className="space-y-8">
            {activeTab === 'issuance' && (
              <div className="bg-white rounded-lg shadow-2xl transition-shadow duration-300 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Issuance Analytics</h2>
                <IssuanceAnalytics />
              </div>
            )}
            {activeTab === 'blotter' && (
              <div className="bg-white rounded-lg shadow-2xl transition-shadow duration-300 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Blotter Analytics</h2>
                <BlotterAnalytics />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
