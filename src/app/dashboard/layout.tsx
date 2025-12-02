'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="h-screen flex flex-col">
      <Topbar />
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background-light p-6">{children}</main>
        <Sidebar />
      </div>
    </div>
  );
}
