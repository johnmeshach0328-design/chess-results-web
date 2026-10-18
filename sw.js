// 64 Squares Chess Academy — Service Worker for Round Alarms & Notifications
const CACHE_NAME = 'chess-pairing-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { body: event.data ? event.data.text() : 'A new tournament round has started!' };
  }

  const title = payload.title || '♟ 64 SQUARES CHESS ACADEMY';
  const options = {
    body: payload.body || '🚨 Round alert: Please report to your assigned board immediately!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [350, 150, 350, 150, 500],
    tag: payload.tag || 'round-alarm',
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click: bring Chrome tab to focus or open the live tournament URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
