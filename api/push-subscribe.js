// 64 Squares Chess Academy — Push Subscription Storage Endpoint
// Stores and retrieves Web Push subscriptions for tournaments

// In-memory cache for fast serverless retrieval
const subscriptionCache = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Retrieve subscriptions for a tournament
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const tournamentId = url.searchParams.get('tournamentId');
    if (!tournamentId) {
      return res.status(400).json({ error: 'Missing tournamentId' });
    }
    const list = subscriptionCache.get(tournamentId) || [];
    return res.status(200).json({ tournamentId, subscriptions: list });
  }

  // POST: Register or update a subscription
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (!body || typeof body === 'string') {
        try {
          if (typeof body === 'string') {
            body = JSON.parse(body);
          } else {
            const buffers = [];
            for await (const chunk of req) buffers.push(chunk);
            const raw = Buffer.concat(buffers).toString();
            body = raw ? JSON.parse(raw) : {};
          }
        } catch {
          body = {};
        }
      }

      const { tournamentId, subscription } = body || {};
      if (!tournamentId || !subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription payload' });
      }

      let list = subscriptionCache.get(tournamentId) || [];
      // Deduplicate by endpoint
      list = list.filter((s) => s.endpoint !== subscription.endpoint);
      list.push(subscription);
      subscriptionCache.set(tournamentId, list);

      return res.status(200).json({
        success: true,
        count: list.length,
        message: 'Push subscription registered successfully',
      });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
