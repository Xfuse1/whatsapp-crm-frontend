'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'فشل تسجيل الدخول');
      }

      // Store token in localStorage and cookie
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Set cookie for middleware
        document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Login Form Card */}
        <AuthCard title="تسجيل الدخول">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="example@domain.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                suppressHydrationWarning
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ليس لديك حساب؟ إنشاء حساب جديد
              </Link>
            </div>
          </form>
        </AuthCard>

        {/* Hero Section */}
        <div className="space-y-6 text-center md:text-right">
          <h1 className="text-4xl font-bold text-gray-900">
            أدر أعمالك على WhatsApp
            <br />
            <span className="text-primary-600">باحترافية</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            منصة شاملة لإدارة محادثات WhatsApp مع عملائك، تقارير تفصيلية، ردود ذكية بالذكاء
            الاصطناعي، وأدوات تساعدك على تحسين خدمة العملاء وزيادة المبيعات
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900">إدارة المحادثات</h3>
              <p className="text-sm text-gray-600 mt-1">تنظيم ومتابعة جميع المحادثات</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-900">الردود الذكية</h3>
              <p className="text-sm text-gray-600 mt-1">ردود تلقائية بالذكاء الاصطناعي</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">تقارير وإحصائيات</h3>
              <p className="text-sm text-gray-600 mt-1">تحليلات شاملة للأداء</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900">عمل جماعي</h3>
              <p className="text-sm text-gray-600 mt-1">تعاون مع فريقك بسهولة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
