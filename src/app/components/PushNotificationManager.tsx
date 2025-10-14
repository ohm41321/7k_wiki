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
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribeToNotifications = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        alert('กรุณาอนุญาตการแจ้งเตือนเพื่อรับข่าวสารเกม');
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This should be your VAPID public key
          // For now, we'll use a placeholder
          'BEl62iUYgUivxIkv69yViEuiBIa0i6r5x6Vv6V6v6V6v6V6v6V6v6V6v6V6v6V6'
        )
      });

      // Save subscription to your backend
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const response = await fetch('/api/push?action=subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('สมัครรับการแจ้งเตือนสำเร็จ!');
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert('เกิดข้อผิดพลาดในการสมัครรับการแจ้งเตือน');
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