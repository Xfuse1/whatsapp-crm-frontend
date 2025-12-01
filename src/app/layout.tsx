import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Awfar CRM - إدارة WhatsApp الاحترافية',
  description: 'منصة شاملة لإدارة محادثات WhatsApp مع عملائك',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
