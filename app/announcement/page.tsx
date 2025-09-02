'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import SideNavigation from '../components/SideNavigation';
import MainAnnouncement from '../components/Announcement/MainAnnouncement';

export default function AnnouncementPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !['admin', 'super admin'].includes(session.user.role)) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNavigation />
      <div className="w-64 flex-shrink-0" />
      <div className="flex-1 p-8">
        <h1 className="text-3xl text-center font-bold text-black mb-6">
          Announcements
        </h1>
        <MainAnnouncement />
      </div>
    </div>
  );
}
