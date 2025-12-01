'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import { WhatsAppConnectionStatus, WhatsAppQRResponse } from '@/types/whatsapp';

// Polling intervals (in milliseconds) - increased to avoid rate limiting
const STATUS_POLL_INTERVAL = 10000; // 10 seconds
const QR_POLL_INTERVAL = 15000; // 15 seconds (QR codes are valid for ~20 seconds)
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export default function WhatsAppConnectionCard() {
  const router = useRouter();
  const [status, setStatus] = useState<WhatsAppConnectionStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);
  const retryCountRef = useRef(0);
  const isPollingPaused = useRef(false);

  // Redirect to chats when connected
  const redirectToChats = useCallback(() => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      console.log('[WhatsApp] Redirecting to chats...');
      router.push('/dashboard/chat');
    }
  }, [router]);

  // Stop QR polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Stop status polling
  const stopStatusPolling = useCallback(() => {
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }
  }, []);

  // Check connection status with retry logic
  const checkStatus = useCallback(async () => {
    // Skip if polling is paused (rate limited)
    if (isPollingPaused.current) return;

    try {
      const response = await apiClient.get<WhatsAppConnectionStatus>('/api/whatsapp/status');
      console.log('[WhatsApp] Status check:', response);
      setStatus(response);
      retryCountRef.current = 0; // Reset retry count on success
      
      // If connected, stop polling and redirect to chats
      if (response.isConnected) {
        console.log('[WhatsApp] Connected! Stopping polling and redirecting...');
        setQrCode(null);
        stopPolling();
        stopStatusPolling();
        redirectToChats();
      }
    } catch (err: any) {
      console.error('Failed to check status:', err);
      
      // Handle rate limiting (429)
      if (err?.message?.includes('429') || err?.status === 429) {
        console.warn('[WhatsApp] Rate limited, pausing polling for 30 seconds...');
        isPollingPaused.current = true;
        setTimeout(() => {
          isPollingPaused.current = false;
          console.log('[WhatsApp] Resuming polling after rate limit pause');
        }, 30000);
      } else {
        retryCountRef.current++;
        if (retryCountRef.current >= MAX_RETRIES) {
          console.error('[WhatsApp] Max retries reached, stopping status polling');
          stopStatusPolling();
        }
      }
    }
  }, [redirectToChats, stopPolling, stopStatusPolling]);

  // Start polling for status (to detect when scan is successful)
  const startStatusPolling = useCallback(() => {
    if (statusPollingRef.current) return;

    console.log('[WhatsApp] Starting status polling (every', STATUS_POLL_INTERVAL / 1000, 'seconds)...');
    statusPollingRef.current = setInterval(async () => {
      await checkStatus();
    }, STATUS_POLL_INTERVAL);
  }, [checkStatus]);

  // Start polling for QR code (fallback if socket doesn't work)
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    console.log('[WhatsApp] Starting QR polling (every', QR_POLL_INTERVAL / 1000, 'seconds)...');
    pollingIntervalRef.current = setInterval(async () => {
      // Skip if polling is paused (rate limited)
      if (isPollingPaused.current) return;

      try {
        const response = await apiClient.get<WhatsAppQRResponse>('/api/whatsapp/qr');
        if (response.qr) {
          setQrCode(response.qr);
        }
      } catch (err: any) {
        console.error('Failed to fetch QR:', err);
        
        // Handle rate limiting (429)
        if (err?.message?.includes('429') || err?.status === 429) {
          console.warn('[WhatsApp] Rate limited on QR fetch, pausing...');
          isPollingPaused.current = true;
          setTimeout(() => {
            isPollingPaused.current = false;
          }, 30000);
        }
      }
    }, QR_POLL_INTERVAL);
  }, []);

  useEffect(() => {
    // Initial status check
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
      stopStatusPolling();
      redirectToChats();
    });

    socket.on('whatsapp:qr', (data: { sessionId: string; qr: string }) => {
      console.log('[WhatsApp Connection] QR received via socket');
      setQrCode(data.qr);
    });

    socket.on('whatsapp:authenticated', () => {
      console.log('[WhatsApp Connection] Authenticated!');
      // Check status to get phone number and redirect
      checkStatus();
    });

    socket.on('whatsapp:disconnected', () => {
      console.log('[WhatsApp Connection] Disconnected');
      setStatus(null);
      setQrCode(null);
      hasRedirected.current = false;
    });

    return () => {
      socket.off('whatsapp:ready');
      socket.off('whatsapp:qr');
      socket.off('whatsapp:authenticated');
      socket.off('whatsapp:disconnected');
      stopPolling();
      stopStatusPolling();
    };
  }, [checkStatus, redirectToChats, stopPolling, stopStatusPolling]);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    hasRedirected.current = false;

    try {
      // Start polling for QR code and status
      startPolling();
      startStatusPolling();

      // Also fetch immediately
      const response = await apiClient.get<WhatsAppQRResponse>('/api/whatsapp/qr');
      if (response.qr) {
        setQrCode(response.qr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاتصال بـ WhatsApp');
      stopPolling();
      stopStatusPolling();
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

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            <span>في انتظار المسح... (يتم التحقق تلقائياً)</span>
          </div>
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
