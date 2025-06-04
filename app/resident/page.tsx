'use client';

import MainResident from '../components/Resident/MainResident';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function ResidentPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !['admin', 'super admin'].includes(session.user.role)) {
    redirect('/');
  }

  return <MainResident />;
}
