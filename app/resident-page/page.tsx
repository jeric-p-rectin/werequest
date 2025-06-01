'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaBell, FaUser, FaSearch } from 'react-icons/fa';
import ViewRequestedDocuments from '../components/Document/ViewRequestedDocuments';
import Profile from '../components/Profile';
import RequestDocument from '../components/Document/RequestDocument';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'home' | 'announcement' | 'request' | 'profile'>('home');
  const [openDropdown, setOpenDropdown] = useState<'none' | 'notification' | 'profile'>('none');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [announcementSearch, setAnnouncementSearch] = useState('');

  // Close dropdowns when clicking outside
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="text-white flex items-center justify-between px-6 py-3 shadow sidef"
        style={{ background: 'radial-gradient(circle, #4d5f30, #34450e)' }}
      >
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3 w-1/5 min-w-[180px]">
          <div className="logo w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div className="logoLabel">
            <span className="text-xl font-bold lgtitle">WeRequest</span>
          </div>
        </div>
        {/* Center: Navbar */}
        <nav className="flex-1 flex justify-center gap-2 menu">
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'home' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => setActiveSection('home')}
            type="button"
          >
            <i className="bi bi-house-fill text-lg"></i> Home
          </button>
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'announcement' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => setActiveSection('announcement')}
            type="button"
          >
            <i className="bi bi-megaphone-fill text-lg"></i> Announcement
          </button>
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'request' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => setActiveSection('request')}
            type="button"
          >
            <i className="bi bi-file-earmark-text-fill text-lg"></i> Request
          </button>
        </nav>
        {/* Right: Notification and Profile */}
        <div className="flex items-center gap-4 w-1/5 min-w-[120px] justify-end">
          <div ref={notifRef} className="relative">
            <button
              className="nav cnav bell flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-green-600 transition relative"
              onClick={() => setOpenDropdown(openDropdown === 'notification' ? 'none' : 'notification')}
              type="button"
            >
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {openDropdown === 'notification' && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50 p-4">
                <div className="font-semibold mb-2">Notifications</div>
                <div className="text-sm">No new notifications.</div>
              </div>
            )}
          </div>
          <div ref={profileRef} className="relative">
            <button
              className="logo w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white bg-transparent"
              onClick={() => setOpenDropdown(openDropdown === 'profile' ? 'none' : 'profile')}
              type="button"
            >
              <FaUser className="text-2xl text-white"></FaUser>
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="p-8">
        {openDropdown === 'profile' ? (
          <Profile />
        ) : (
          <>
            {activeSection === 'home' && (
              <>
                <h1 className="text-4xl font-bold text-green-700 mb-2 text-center">Welcome Resident</h1>
                <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">Your trusted barangay portal for fast, transparent, and caring service. Learn more about our mission and team below.</p>
                {/* ABOUT US Section ONLY */}
                <section className="mb-16 relative">
                  <h2 className="text-2xl font-bold text-green-800 mb-4 text-center flex items-center justify-center gap-2">
                    <span className="inline-block bg-green-100 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-green-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1m4 0h-1v-4h-1' /></svg></span> ABOUT US
                  </h2>
                  <div className="bg-gradient-to-br from-green-50 via-white to-green-100 rounded-3xl shadow-2xl p-12 flex flex-col items-center text-center border-t-4 border-green-600 max-w-3xl mx-auto relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-green-200 rounded-full opacity-20 z-0"></div>
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-green-100 rounded-full opacity-30 z-0"></div>
                    <div className="relative z-10">
                      <p className="text-gray-700 mb-6 text-lg font-medium">WeRequest is your trusted barangay portal, dedicated to serving the community with efficiency, transparency, and care. Our mission is to make barangay services accessible and convenient for everyone.</p>
                      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center">
                        <div className="bg-white/80 rounded-xl px-6 py-4 shadow flex-1">
                          <span className="block text-green-700 font-bold text-lg mb-1">Mission</span>
                          <span className="text-gray-600">To empower every resident by providing easy access to barangay services and information.</span>
                        </div>
                        <div className="bg-white/80 rounded-xl px-6 py-4 shadow flex-1">
                          <span className="block text-green-700 font-bold text-lg mb-1">Vision</span>
                          <span className="text-gray-600">A connected, informed, and engaged barangay community.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
            {activeSection === 'announcement' && (
              <>
                <h1 className="text-3xl font-bold text-green-700 mb-6">Announcements</h1>
                <div className="mb-6 flex items-center gap-2 max-w-md">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={announcementSearch}
                      onChange={e => setAnnouncementSearch(e.target.value)}
                      placeholder="Search announcements..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-8">
                  {filteredAnnouncements.length === 0 ? (
                    <div className="text-gray-500 text-center">No announcements found.</div>
                  ) : (
                    filteredAnnouncements.map(a => (
                      <div key={a.id} className="bg-white rounded-lg shadow flex flex-col md:flex-row overflow-hidden">
                        <div className="md:w-1/3 w-full h-48 relative">
                          <Image src={a.image} alt={a.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold text-green-800 mb-2">{a.title}</h2>
                            <p className="text-gray-700 mb-4">{a.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">Posted: {a.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            {activeSection === 'request' && (
              <>
                <h1 className="text-3xl font-bold text-green-700 mb-6">Request Services</h1>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-black mb-1">Request a Document</h2>
                      <p className="text-black">You can request barangay documents and certificates here.</p>
                    </div>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
                      onClick={() => setShowRequestForm(true)}
                      style={{ whiteSpace: 'nowrap' }}
                      hidden={showRequestForm}
                    >
                      + New Request
                    </button>
                  </div>
                  {!showRequestForm ? (
                    <ViewRequestedDocuments />
                  ) : (
                    <div className="flex justify-center">
                      <RequestDocument onBack={() => setShowRequestForm(false)} />
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
