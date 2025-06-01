'use client';
import { useState, useRef, useEffect } from 'react';
import SideNavigation from '../components/SideNavigation';
import Image from 'next/image';
import { FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function AnnouncementPage() {
  const [, setOpenDropdown] = useState<'none' | 'notification' | 'profile'>('none');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const announcements = [
    {
      id: 1,
      title: 'Fire Disaster',
      description: 'A fire broke out in Purok 3 last night. Emergency services responded quickly and no casualties were reported. Residents are reminded to check electrical wiring and avoid open flames.',
      image: '/images/fire.jpg',
      date: 'June 12, 2024'
    },
    {
      id: 2,
      title: 'Flood Disaster',
      description: 'Heavy rains caused flooding in Purok 5. Evacuation centers are open for affected families. Please stay tuned for further updates and safety instructions.',
      image: '/images/flood.jpg',
      date: 'June 10, 2024'
    }
  ];
  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
    a.description.toLowerCase().includes(announcementSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node) &&
        profileRef.current && !profileRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown('none');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNavigation />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-black mb-8 flex items-center justify-between">
          <span>Announcements</span>
          <button className="flex items-center text-lg gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-lime-500 text-white rounded-lg shadow hover:scale-105 hover:from-green-700 transition-transform font-semibold">
            <FaPlus /> New Announcement
          </button>
        </h1>
        <div className="mb-8 flex items-center gap-2 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={announcementSearch}
              onChange={e => setAnnouncementSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 shadow-sm bg-white"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" />
          </div>
        </div>
        <div className="space-y-10">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-gray-500 text-center">No announcements found.</div>
          ) : (
            filteredAnnouncements.map(a => (
              <div key={a.id} className="bg-white border-l-8 border-green-500 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden hover:shadow-2xl transition-shadow group">
                <div className="md:w-1/3 w-full h-56 relative flex-shrink-0">
                  <div className="absolute inset-0 m-4 rounded-xl overflow-hidden shadow-md">
                    <Image src={a.image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2 tracking-tight">{a.title}</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">{a.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 italic">Posted: {a.date}</span>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-semibold shadow-sm"><FaEdit /> Edit</button>
                      <button className="flex items-center gap-1 px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold shadow-sm"><FaTrash /> Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
