'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import { WhatsAppConnectionStatus, WhatsAppQRResponse } from '@/types/whatsapp';

export default function WhatsAppConnectionCard() {
  const router = useRouter();
  const [status, setStatus] = useState<WhatsAppConnectionStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkStatus();

    const socket = getSocket();

    socket.on('whatsapp:ready', (data: { sessionId: string; phoneNumber: string }) => {
      console.log('[WhatsApp Connection] Session ready:', data);
      setQrCode(null);
      setStatus({
        sessionId: data.sessionId,
        isConnected: true,
        phoneNumber: data.phoneNumber,
      });
      stopPolling();
    });

    socket.on('whatsapp:qr', (data: { sessionId: string; qr: string }) => {
      console.log('[WhatsApp Connection] QR received');
      setQrCode(data.qr);
    });

    return () => {
      socket.off('whatsapp:ready');
      socket.off('whatsapp:qr');
      stopPolling();
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await apiClient.get<WhatsAppConnectionStatus>('/api/whatsapp/status');
      setStatus(response);
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  };

  const startPolling = () => {
    if (pollingInterval) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get<WhatsAppQRResponse>('/api/whatsapp/qr');
        if (response.qr) {
          setQrCode(response.qr);
        }
      } catch (err) {
        console.error('Failed to fetch QR:', err);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');

    try {
      // Start polling for QR code
      startPolling();

      // Also fetch immediately
      const response = await apiClient.get<WhatsAppQRResponse>('/api/whatsapp/qr');
      if (response.qr) {
        setQrCode(response.qr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاتصال بـ WhatsApp');
      stopPolling();
    } finally {
      setLoading(false);
    }
  };

  const handleGoToChats = () => {
    router.push('/dashboard/chat');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      {status?.isConnected ? (
        // Connected State
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900">تم ربط WhatsApp بنجاح!</h2>
          <p className="text-gray-600">
            حسابك متصل برقم: <span className="font-semibold">{status.phoneNumber}</span>
          </p>
          <button
            onClick={handleGoToChats}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            الذهاب إلى المحادثات
          </button>
        </div>
      ) : qrCode ? (
        // QR Code Display State
        <div className="text-center space-y-6">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900">امسح رمز QR</h2>
          <p className="text-gray-600">
            افتح WhatsApp على هاتفك، اذهب إلى <strong>الإعدادات</strong> &gt;{' '}
            <strong>الأجهزة المرتبطة</strong> &gt; <strong>ربط جهاز</strong>
          </p>

          <div className="flex justify-center my-6">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeSVG value={qrCode} size={256} />
            </div>
          </div>

          <p className="text-sm text-gray-500">في انتظار المسح...</p>
        </div>
      ) : (
        // Not Connected State
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">📲</div>
          <h2 className="text-2xl font-bold text-gray-900">يرجى ربط حساب WhatsApp</h2>
          <p className="text-gray-600">يبدو أن الاتصال غير نشط، قم بالربط للمتابعة.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            {loading ? 'جاري الاتصال...' : 'ربط WhatsApp الآن'}
          </button>
        </div>
      )}
    </div>
  );
}
