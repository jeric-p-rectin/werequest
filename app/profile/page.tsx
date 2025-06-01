'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SideNavigation from '@/app/components/SideNavigation';
import Profile from '@/app/components/Profile';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <div className="w-64 flex-shrink-0">
        <SideNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <Profile />
      </div>
    </div>
  );
}
