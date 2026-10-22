// 64 Squares Chess Academy — Web Push Serverless API
// Dispatches high-urgency alarm notifications to mobile devices via Web Push API (FCM / Mozilla / Apple)
// Works even when mobile Chrome / browser is completely closed.

const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BGwGkM5HZkysMuZSFVbX25KmQQkOviORgXb4VfKvEIdxWfI7KGZFXUADIXquKM_kff_k92uxrkOzPFpvaOe9y3A';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'ecRlxC6XoNuFPNPEPSIKosF8sylPmUAYVZAnG7wflcc';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:youkeepintouch@gmail.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('VAPID initialization error:', e);
}

module.exports = async (req, res) => {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: '64 Squares Chess Academy Web Push Dispatcher',
      vapidPublicKey: VAPID_PUBLIC_KEY,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Parse Body safely
  let body = req.body;
  if (!body || typeof body === 'string') {
    try {
      if (typeof body === 'string') {
        body = JSON.parse(body);
      } else {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const raw = Buffer.concat(buffers).toString();
        body = raw ? JSON.parse(raw) : {};
      }
    } catch (e) {
      body = {};
    }
  }

  const { notifications, tournamentId, roundNumber } = body || {};

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res.status(200).json({
      success: true,
      sent: 0,
      failed: 0,
      message: 'No push notifications to dispatch',
    });
  }

  // 3. Dispatch Web Push in parallel
  const results = await Promise.allSettled(
    notifications.map(async (item) => {
      if (!item.subscription || !item.subscription.endpoint) {
        throw new Error('Missing subscription endpoint');
      }

      const payload = JSON.stringify({
        title: item.title || '♟ 64 SQUARES CHESS ACADEMY',
        body: item.body || '🚨 Round alert: Please report to your assigned board immediately!',
        icon: item.icon || '/favicon.ico',
        badge: item.badge || '/favicon.ico',
        tag: item.tag || `round-alarm-${tournamentId || 'tour'}-r${roundNumber || 1}`,
        vibrate: [500, 200, 500, 200, 800, 300, 1000],
        url: item.url || '/',
        participantName: item.participantName || '',
        timestamp: Date.now(),
      });

      return webpush.sendNotification(item.subscription, payload, {
        TTL: 3600, // 1 hour TTL
        urgency: 'high', // High priority wakes mobile screen immediately
      });
    })
  );

  let sent = 0;
  let failed = 0;
  const errors = [];

  results.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      sent++;
    } else {
      failed++;
      const reason = r.reason;
      errors.push({
        participant: notifications[idx]?.participantName || 'Unknown',
        error: reason?.message || 'Send failed',
        statusCode: reason?.statusCode,
      });
    }
  });

  return res.status(200).json({
    success: true,
    sent,
    failed,
    total: notifications.length,
    errors: errors.slice(0, 10),
  });
};
