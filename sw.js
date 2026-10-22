// 64 Squares Chess Academy — Service Worker for Closed-Chrome Round Alarms & Notifications
const CACHE_NAME = 'chess-pairing-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications (Works even when mobile Chrome is completely closed)
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { body: event.data ? event.data.text() : 'A new tournament round has started!' };
  }

  const title = payload.title || '♟ 64 SQUARES CHESS ACADEMY';
  const body = payload.body || '🚨 Round alert: Please report to your assigned board immediately!';
  const url = payload.url || '/';
  const tag = payload.tag || 'round-alarm';

  const options = {
    body: body,
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    // Strong distinctive alarm vibration: Buzz-Buzz-LongBuzz-AlarmBuzz
    vibrate: [500, 200, 500, 200, 800, 300, 1000],
    tag: tag,
    renotify: true,
    requireInteraction: true, // Remains on mobile lock screen until parent interacts
    silent: false,
    data: {
      url: url,
      participantName: payload.participantName || '',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_board', title: '🎯 View Board' }
    ]
  };

  // Broadcast to any open tabs/clients to trigger in-page audio chime immediately
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'ROUND_ALARM_PUSH',
          payload: { title, body, url, tag }
        });
      });
    }).catch(() => {});

  // Show native OS notification (wakes phone screen & plays alarm tone)
  const notifPromise = self.registration.showNotification(title, options);

  event.waitUntil(Promise.all([notifPromise, broadcastPromise]));
});

// Handle notification click: wake Chrome, focus existing window or open target board URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({ type: 'TRIGGER_ALARM_CHIME' });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
