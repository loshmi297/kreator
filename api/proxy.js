export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint param' });

  // Whitelist allowed X API endpoints
  const allowed = [
    /^users\/me$/,
    /^users\/\d+\/tweets$/,
  ];
  const ok = allowed.some(r => r.test(endpoint));
  if (!ok) return res.status(403).json({ error: 'Endpoint not allowed' });

  // Forward query params (minus 'endpoint')
  const params = new URLSearchParams(req.query);
  params.delete('endpoint');
  const qs = params.toString();

  const url = `https://api.twitter.com/2/${endpoint}${qs ? '?' + qs : ''}`;

  try {
    const xResp = await fetch(url, {
      headers: { Authorization: authHeader },
    });
    const data = await xResp.json();
    return res.status(xResp.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
