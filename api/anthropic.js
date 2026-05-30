// api/anthropic.js — Vercel serverless function
// Proxies Anthropic API calls so the key stays server-side

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const headerKey = (req.headers['x-api-key'] || '').toString().trim();
  const envKey = (process.env.ANTHROPIC_API_KEY || '').toString().trim();
  const ANTHROPIC_API_KEY = (headerKey && headerKey.startsWith('sk-ant-')) ? headerKey : envKey;

  if (!ANTHROPIC_API_KEY) {
    return res.status(401).json({ error: 'Missing Anthropic API key.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('[api/anthropic] error:', err);
    return res.status(500).json({ error: 'Error contacting Anthropic.' });
  }
}
