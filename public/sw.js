// Fonzu Wiki Service Worker
const CACHE_NAME = 'fonzu-wiki-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/vercel.svg',
  // Add other static assets as needed
];

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install event - cache static assets (skip in development)
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  if (isDevelopment) {
    console.log('Service Worker: Skipping cache in development mode');
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches (clear all caches in development)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  if (isDevelopment) {
    console.log('Service Worker: Development mode - clearing all caches');
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('Service Worker: Deleting cache in development', cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          console.log('Service Worker: All caches cleared in development');
          return self.clients.claim();
        })
    );
    return;
  }

  // Production mode - clean up old caches only
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline (skip cache in development)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // In development mode, always fetch from network
  if (isDevelopment) {
    console.log('Service Worker: Development mode - fetching from network');
    event.respondWith(
      fetch(event.request)
        .catch((error) => {
          console.error('Service Worker: Network fetch failed in development', error);
          throw error;
        })
    );
    return;
  }

  // Production mode - use cache strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);

            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }

            throw error;
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  let notificationData = {};

  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('Service Worker: Error parsing push data', error);
    notificationData = {
      title: 'Fonzu Wiki',
      body: 'มีข่าวสารเกมใหม่แล้ว!',
      icon: '/vercel.svg',
      badge: '/vercel.svg',
      tag: 'general'
    };
  }

  const {
    title = 'Fonzu Wiki',
    body = 'มีข่าวสารเกมใหม่แล้ว!',
    icon = '/vercel.svg',
    badge = '/vercel.svg',
    image,
    url = '/',
    tag = 'general',
    requireInteraction = false,
    actions = []
  } = notificationData;

  const options = {
    body,
    icon,
    badge,
    image,
    tag,
    requireInteraction,
    actions: actions.length > 0 ? actions : [
      {
        action: 'open',
        title: 'เปิด',
        icon: '/vercel.svg'
      },
      {
        action: 'close',
        title: 'ปิด',
        icon: '/vercel.svg'
      }
    ],
    data: {
      url,
      timestamp: Date.now()
    },
    vibrate: [200, 100, 200],
    silent: false,
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  const { action, data } = event;

  let targetUrl = '/';

  if (data && data.url) {
    targetUrl = data.url;
  }

  // Handle action buttons
  if (action === 'open' || !action) {
    // Default action or 'open' action
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if the app is already open
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }

          // If not open, open new window
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
        .catch((error) => {
          console.error('Service Worker: Error handling notification click', error);
        })
    );
  } else if (action === 'close') {
    // Just close the notification
    event.waitUntil(
      Promise.resolve()
    );
  }
});

// Background sync event - for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks here
      // For example, sync offline comments, posts, etc.
      Promise.resolve()
    );
  }
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
});