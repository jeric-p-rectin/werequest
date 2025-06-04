'use client';

import MainDashboard from "../components/Dashboard/MainDashboard";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session || !['admin', 'super admin'].includes(session.user.role)) {
        redirect('/');
    }

    return (
        <>
            <MainDashboard />
        </>
    );
}