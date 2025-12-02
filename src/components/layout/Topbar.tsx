'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { logout, getCurrentUser } from '@/lib/auth';

export default function Topbar() {
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - User info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
          {getInitials(user?.fullName, user?.email)}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{user?.fullName || user?.email || 'المستخدم'}</div>
          <div className="text-xs text-primary-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
            متصل
          </div>
        </div>
      </div>

      {/* Right side - Logout button */}
      <button 
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}
