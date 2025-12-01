'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">مرحبًا بك في Awfar CRM</h1>
          <p className="text-lg text-gray-600">
            ابدأ بربط حساب WhatsApp الخاص بك لإدارة محادثاتك بشكل احترافي
          </p>
          <div className="pt-6">
            <Link
              href="/dashboard/whatsapp"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              ربط WhatsApp الآن
            </Link>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">ربط سهل</h3>
            <p className="text-sm text-gray-600">
              اربط حساب WhatsApp الخاص بك في ثوانٍ معدودة
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">إدارة ذكية</h3>
            <p className="text-sm text-gray-600">نظم وتابع جميع محادثاتك من مكان واحد</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">ذكاء اصطناعي</h3>
            <p className="text-sm text-gray-600">ردود تلقائية ذكية على رسائل عملائك</p>
          </div>
        </div>
      </div>
    </div>
  );
}
