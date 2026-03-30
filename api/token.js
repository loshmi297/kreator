export default async function handler(req, res) {
  // Allow CORS from same origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required fields: code, code_verifier, redirect_uri' });
  }

  const clientId     = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (!clientId) {
    return res.status(500).json({ error: 'Server misconfigured: X_CLIENT_ID not set' });
  }

  try {
    const body = new URLSearchParams({
      code,
      grant_type:    'authorization_code',
      client_id:     clientId,
      redirect_uri,
      code_verifier,
    });

    // Build auth header — required if client_secret is set (confidential client)
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (clientSecret) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    }

    const xResp = await fetch('https://api.twitter.com/2/oauth2/token', {
      method:  'POST',
      headers,
      body:    body.toString(),
    });

    const data = await xResp.json();

    if (!xResp.ok) {
      return res.status(xResp.status).json({ error: data.error_description || data.error || 'Token exchange failed', detail: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Token proxy error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
