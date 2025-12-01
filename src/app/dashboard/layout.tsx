'use client';

import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: Check Supabase session and redirect to /login if not authenticated
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const { data: { session } } = await supabaseBrowserClient.auth.getSession();
  //     if (!session) {
  //       router.push('/login');
  //     }
  //   };
  //   checkAuth();
  // }, []);

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
