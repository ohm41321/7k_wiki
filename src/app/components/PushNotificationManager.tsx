'use client';

import { useState, useEffect } from 'react';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      // Wait a bit for service worker to be ready
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 1000);
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Check if service worker is registered and ready
      if (!navigator.serviceWorker.controller) {
        console.log('Service worker not ready yet, waiting...');
        setTimeout(checkSubscriptionStatus, 500);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker registration:', registration);

      const subscription = await registration.pushManager.getSubscription();
      console.log('Current subscription:', subscription);
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Don't show error to user for this check
    }
  };

  const subscribeToNotifications = async () => {
    setLoading(true);
    try {
      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker ไม่รองรับในเบราว์เซอร์นี้');
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready:', registration);

      // Request notification permission first
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);

      if (permission !== 'granted') {
        alert('กรุณาอนุญาตการแจ้งเตือนเพื่อรับข่าวสารเกม');
        return;
      }

      // Try to subscribe with VAPID key from environment
      let subscription;
      try {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (vapidKey) {
          console.log('Using VAPID key for subscription');
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          });
        } else {
          console.log('No VAPID key found, using development mode');
          // For development without VAPID keys, we'll simulate subscription
          // In production, you need proper VAPID keys
          alert('สำหรับการพัฒนา: กรุณาตั้งค่า VAPID keys ใน environment variables\n\nสำหรับตอนนี้จะใช้โหมดจำลองแทน');
          setIsSubscribed(true);
          setLoading(false);
          return;
        }
      } catch (vapidError) {
        console.error('VAPID subscription failed:', vapidError);
        // Fallback for development
        alert('ไม่สามารถสมัครรับการแจ้งเตือนจริงได้ (ต้องการ VAPID keys)\n\nสำหรับตอนนี้จะใช้โหมดจำลองแทน');
        setIsSubscribed(true);
        setLoading(false);
        return;
      }

      if (subscription) {
        // Save subscription to your backend
        const subscriptionData: PushSubscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
          }
        };

        console.log('Sending subscription to backend:', subscriptionData);

        const response = await fetch('/api/push?action=subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionData),
        });

        console.log('Backend response:', response.status, response.statusText);

        if (response.ok) {
          setIsSubscribed(true);
          alert('สมัครรับการแจ้งเตือนสำเร็จ!');
        } else {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Failed to save subscription: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Remove from backend first
        const response = await fetch('/api/push?action=unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (response.ok) {
          // Then unsubscribe from browser
          await subscription.unsubscribe();
          setIsSubscribed(false);
          alert('ยกเลิกการรับการแจ้งเตือนสำเร็จ');
        } else {
          throw new Error('Failed to remove subscription');
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกการแจ้งเตือน');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      // For development testing, we'll use the browser's built-in notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        // Create a test notification
        const testNotif = new Notification('ทดสอบ Fonzu Wiki', {
          body: 'การแจ้งเตือนทำงานปกติแล้ว! 🎉',
          icon: '/vercel.svg',
          badge: '/vercel.svg',
          tag: 'test',
          requireInteraction: false,
          silent: false
        });

        // Auto close after 3 seconds
        setTimeout(() => {
          testNotif.close();
        }, 3000);

        alert('ส่งการแจ้งเตือนทดสอบแล้ว! ตรวจสอบการแจ้งเตือนของเบราว์เซอร์');
      } else {
        alert('กรุณาอนุญาตการแจ้งเตือนก่อนทดสอบ');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('ไม่สามารถส่งการแจ้งเตือนทดสอบได้');
    }
  };

  // Helper functions
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    const binary = String.fromCharCode.apply(null, Array.from(bytes));
    return window.btoa(binary);
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-textLight/60">
        เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน
        <br />
        <small className="text-textLight/40">
          ต้องใช้ Chrome, Firefox, Safari หรือ Edge เวอร์ชันล่าสุด
        </small>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-textLight">
        <p className="font-medium mb-1">การแจ้งเตือน</p>
        <p className="text-textLight/70">
          รับข่าวสารเกม อัพเดท และประกาศสำคัญ
        </p>
      </div>

      {isSubscribed ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-400">✓ กำลังรับการแจ้งเตือน</span>
            <button
              onClick={unsubscribeFromNotifications}
              disabled={loading}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'กำลังยกเลิก...' : 'ยกเลิก'}
            </button>
          </div>
          <button
            onClick={testNotification}
            className="w-full px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded text-sm transition-colors"
          >
            🔔 ทดสอบการแจ้งเตือน
          </button>
        </div>
      ) : (
        <button
          onClick={subscribeToNotifications}
          disabled={loading}
          className="w-full px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'กำลังสมัคร...' : 'สมัครรับการแจ้งเตือน'}
        </button>
      )}
    </div>
  );
}