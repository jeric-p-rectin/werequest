'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiSolidDashboard } from "react-icons/bi";
import { HiDocumentText } from "react-icons/hi";
import { FaUsers, FaBuilding, FaExclamationTriangle } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa"; // Using FaBullhorn instead of FaMegaphone

const SideNavigation = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', icon: <BiSolidDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/document', icon: <HiDocumentText className="w-5 h-5" />, label: 'Document' },
    { href: '/resident', icon: <FaUsers className="w-5 h-5" />, label: 'Resident' },
    { href: '/business', icon: <FaBuilding className="w-5 h-5" />, label: 'Business' },
    { href: '/blotter', icon: <FaExclamationTriangle className="w-5 h-5" />, label: 'Blotter' },
    { href: '/announcement', icon: <FaBullhorn className="w-5 h-5" />, label: 'Announcement' },
  ];

  return (
    <div className="flex flex-col h-screen shadow-sm" style={{ background: "radial-gradient(#4d5f30, #34450e)" }}>
      {/* User Profile Section */}
      <div className="p-4 flex items-center gap-4 border-b border-white/20">
        <Link href="/profileA" className="block">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40">
            <Image
              src="/images/kaila.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </Link>
        <div>
          <p className="text-sm font-medium text-white">Hello Wilyn</p>
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
          <div className="w-8 h-8 relative">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs font-medium text-white">San Andres, Guimba</p>
        </div>
      </div>
    </div>
  );
};

export default SideNavigation;
