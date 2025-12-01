'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

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
      // TODO: Implement real authentication later
      // For now, skip auth and go directly to dashboard
      router.push('/dashboard');
      
      /* Real auth code (disabled for now):
      const { error } = await supabaseBrowserClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
      */
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

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              تخطي والدخول مباشرة (Demo Mode)
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
