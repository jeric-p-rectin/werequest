import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MainBlotter from "@/app/components/Blotter/MainBlotter";

export default function BlotterPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !['admin', 'super admin'].includes(session.user.role)) {
    redirect('/');
  }

  return (
    <div>
      <MainBlotter />
    </div>
  );
}
