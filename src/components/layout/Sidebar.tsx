'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  label: string;
  path: string;
  icon?: string;
}

const menuItems: SidebarItem[] = [
  { label: 'لوحة التحكم', path: '/dashboard' },
  { label: 'ربط WhatsApp', path: '/dashboard/whatsapp' },
  { label: 'المحادثات', path: '/dashboard/chat' },
  { label: 'البوت', path: '/dashboard/bot' },
  { label: 'بوت الاستبيان', path: '/dashboard/survey-bot' },
  { label: 'الإعدادات', path: '/dashboard/configuration' },
  { label: 'Mini CRM', path: '/dashboard/mini-crm' },
  { label: 'السائقون', path: '/dashboard/drivers' },
  { label: 'الإعدادات العامة', path: '/dashboard/settings' },
  { label: 'التقارير', path: '/dashboard/report' },
  { label: 'الذكاء الاصطناعي', path: '/dashboard/ai-agent' },
  { label: 'المحادثات المتقدمة', path: '/dashboard/threads' },
  { label: 'الإضافات', path: '/dashboard/add-ons' },
  { label: 'جهات الاتصال', path: '/dashboard/contacts' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-700">Awfar CRM</h1>
        <p className="text-xs text-gray-500 mt-1">إدارة احترافية لـ WhatsApp</p>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
