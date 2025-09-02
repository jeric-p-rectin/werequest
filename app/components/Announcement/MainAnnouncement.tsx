import React, { useEffect, useState } from 'react';
import AddAnnouncement from './AddAnnouncement';
import ViewAnnouncements, { type Announcement } from './ViewAnnouncements';

const MainAnnouncement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const res = await fetch('/api/announcement/get-all-announcement');
      const data = await res.json();
      setAnnouncements(data);
    };
    fetchAnnouncements();
  }, [refresh]);

  const handleAdded = () => {
    setActiveTab('view');
    setRefresh(r => !r);
  };

  const handleRefresh = () => setRefresh(r => !r);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-4 justify-center">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'view' ? 'bg-green-600 text-white shadow-lg' : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer'}`}
          onClick={() => setActiveTab('view')}
        >
          Announcements
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors ${activeTab === 'add' ? 'bg-green-600 text-white shadow-lg' : 'bg-[#f5fdf1] text-gray-800 border border-gray-300 hover:bg-[#3c5e1a] hover:text-white duration-300 cursor-pointer'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Announcement
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === 'view' && <ViewAnnouncements announcements={announcements} onRefresh={handleRefresh} />}
      {activeTab === 'add' && <AddAnnouncement onAdded={handleAdded} />}
    </div>
  );
};

export default MainAnnouncement;
