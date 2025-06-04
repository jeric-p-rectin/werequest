'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BiSolidDashboard } from "react-icons/bi";
import { HiDocumentText } from "react-icons/hi";
import { FaUsers, FaBuilding, FaExclamationTriangle, FaUserCircle } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import Image from 'next/image';

const SideNavigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Define all possible menu items
  const allMenuItems = [
    { 
      href: '/dashboard', 
      icon: <BiSolidDashboard className="w-5 h-5" />, 
      label: 'Dashboard', 
      roles: ['super admin', 'admin'] 
    },
    { 
      href: '/document', 
      icon: <HiDocumentText className="w-5 h-5" />, 
      label: 'Document', 
      roles: ['super admin', 'admin', 'resident'] 
    },
    { 
      href: '/resident', 
      icon: <FaUsers className="w-5 h-5" />, 
      label: 'Resident', 
      roles: ['super admin', 'admin'] 
    },
    { 
      href: '/business', 
      icon: <FaBuilding className="w-5 h-5" />, 
      label: 'Business', 
      roles: ['super admin', 'admin'] 
    },
    { 
      href: '/blotter', 
      icon: <FaExclamationTriangle className="w-5 h-5" />, 
      label: 'Blotter', 
      roles: ['super admin', 'admin'] 
    },
    { 
      href: '/announcement', 
      icon: <FaBullhorn className="w-5 h-5" />, 
      label: 'Announcement', 
      roles: ['super admin', 'admin', 'resident'] 
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(session?.user?.role || '')
  );

  // Conditionally apply fixed class only on /announcement page
  const isAnnouncementPage = pathname === '/announcement';
  const sidebarClass = isAnnouncementPage
    ? 'fixed left-0 top-0 h-screen z-40 flex flex-col shadow-sm'
    : 'flex flex-col h-screen shadow-sm';

  return (
    <div className={sidebarClass} style={{ background: "radial-gradient(#4d5f30, #34450e)" }}>
      {/* User Profile Section */}
      <div className="p-4 flex items-center gap-4 border-b border-white/20">
        <Link href="/profile" className="block">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40 flex items-center justify-center bg-white/10">
            <FaUserCircle className="w-8 h-8 text-white/80" />
          </div>
        </Link>
        <div>
          <p className="text-sm font-medium text-white">
            Hello, {session?.user?.fullName?.split(' ')[0] || 'User'}
          </p>
          <p className="text-xs text-white/60 capitalize">
            {session?.user?.role || ''}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        <hr className="mb-4 border-white/20" />
        <nav className="px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-white/80 hover:bg-white/5'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Logo Section */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center gap-3 p-3 border border-white/20 rounded-lg justify-center">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="ml-3 text-xl font-semibold text-gray-800">WeRequest</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavigation;
