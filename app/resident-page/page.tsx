'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaBell, FaUser, FaHome, FaBullhorn, FaFileAlt, FaBars, FaTimes } from 'react-icons/fa';
import ViewRequestedDocuments from '../components/Document/ViewRequestedDocuments';
import Profile from '../components/Profile';
import RequestDocument from '../components/Document/RequestDocument';
import ViewAnnouncements from '../components/Announcement/ViewAnnouncements';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'home' | 'announcement' | 'request' | 'profile'>('home');
  const [openDropdown, setOpenDropdown] = useState<'none' | 'notification'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { data: session, status } = useSession();
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown('none');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      try {
        const res = await fetch('/api/announcement/get-all-announcement');
        const data = await res.json();
        setAnnouncements(data);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleNavClick = (section: 'home' | 'announcement' | 'request' | 'profile') => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when navigation item is clicked
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'resident') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="text-white flex items-center justify-between px-4 sm:px-6 py-3 shadow sidef"
        style={{ background: 'radial-gradient(circle, #4d5f30, #34450e)' }}
      >
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="logo w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div className="logoLabel">
            <span className="text-lg sm:text-xl font-bold lgtitle">WeRequest</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center gap-2 menu">
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'home' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => handleNavClick('home')}
            type="button"
          >
            <FaHome className="text-lg" /> Home
          </button>
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'announcement' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => handleNavClick('announcement')}
            type="button"
          >
            <FaBullhorn className="text-lg" /> Announcement
          </button>
          <button
            className={`nav mnav flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeSection === 'request' ? 'bg-white/20 text-white font-bold active' : 'text-white hover:bg-white/15'}`}
            onClick={() => handleNavClick('request')}
            type="button"
          >
            <FaFileAlt className="text-lg" /> Request
          </button>
        </nav>

        {/* Right: Notification, Profile, and Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* Notification */}
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

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              className="logo w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-white bg-transparent"
              onClick={() => handleNavClick('profile')}
              type="button"
            >
              <FaUser className="text-2xl text-white"></FaUser>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-green-600 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-b border-gray-200">
          <nav className="flex flex-col">
            <button
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === 'home' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleNavClick('home')}
              type="button"
            >
              <FaHome className="text-lg" />
              <span>Home</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === 'announcement' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleNavClick('announcement')}
              type="button"
            >
              <FaBullhorn className="text-lg" />
              <span>Announcement</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === 'request' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleNavClick('request')}
              type="button"
            >
              <FaFileAlt className="text-lg" />
              <span>Request</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeSection === 'profile' ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleNavClick('profile')}
              type="button"
            >
              <FaUser className="text-lg" />
              <span>Profile</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 sm:p-8">
        {activeSection === 'home' && (
          <>
            <h1 className="text-2xl sm:text-4xl font-bold text-green-700 mb-2 text-center">Welcome Resident</h1>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-10 text-center max-w-2xl mx-auto">Your trusted barangay portal for fast, transparent, and caring service. Learn more about our mission and team below.</p>
            {/* ABOUT US Section ONLY */}
            <section className="mb-10 sm:mb-16 relative">
              <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 text-center flex items-center justify-center gap-2">
                <span className="inline-block bg-green-100 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-green-700' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1m4 0h-1v-4h-1' /></svg></span> ABOUT US
              </h2>
              <div className="bg-gradient-to-br from-green-50 via-white to-green-100 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-12 flex flex-col items-center text-center border-t-4 border-green-600 max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-green-200 rounded-full opacity-20 z-0"></div>
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-green-100 rounded-full opacity-30 z-0"></div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 text-lg font-medium">WeRequest is your trusted barangay portal, dedicated to serving the community with efficiency, transparency, and care. Our mission is to make barangay services accessible and convenient for everyone.</p>
                  <div className="mb-6 flex flex-col md:flex-row gap-4 justify-center">
                    <div className="bg-white/80 rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow flex-1">
                      <span className="block text-green-700 font-bold text-base sm:text-lg mb-1">Mission</span>
                      <span className="text-gray-600 text-sm sm:text-base">To empower every resident by providing easy access to barangay services and information.</span>
                    </div>
                    <div className="bg-white/80 rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow flex-1">
                      <span className="block text-green-700 font-bold text-base sm:text-lg mb-1">Vision</span>
                      <span className="text-gray-600 text-sm sm:text-base">A connected, informed, and engaged barangay community.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
        {activeSection === 'announcement' && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-4 sm:mb-6">Announcements</h1>
            {loadingAnnouncements ? (
              <div className="text-center text-gray-500">Loading announcements...</div>
            ) : (
              <ViewAnnouncements announcements={announcements} readOnly />
            )}
          </>
        )}
        {activeSection === 'request' && (
          <>
            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-black mb-1">Request a Document</h2>
                  <p className="text-black text-sm sm:text-base">You can request barangay documents and certificates here.</p>
                </div>
                <button
                  className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
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
        {activeSection === 'profile' && <Profile />}
      </main>
    </div>
  );
}