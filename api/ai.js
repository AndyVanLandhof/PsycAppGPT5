// api/ai.js — Vercel serverless function
// Generic OpenAI proxy used by useAIService.js and other components

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-openai-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { model = 'gpt-4o-mini', messages = [], temperature = 0.7, max_tokens = 800, response_format = null } = req.body || {};
  const headerKey = (req.headers['x-openai-key'] || '').toString().trim().replace(/^['"]|['"]$/g, '');
  const envKey = (process.env.OPENAI_API_KEY || '').toString().trim();
  const OPENAI_API_KEY = (headerKey && headerKey.startsWith('sk-')) ? headerKey : envKey;

  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    return res.status(401).json({ error: 'Missing or invalid OpenAI API key.' });
  }

  const callOpenAI = async (payload) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    let data;
    try { data = await response.json(); } catch (_) { data = { error: 'Invalid JSON from OpenAI' }; }
    return { response, data };
  };

  try {
    const basePayload = { model, messages, temperature, max_tokens };
    let { response, data } = await callOpenAI({ ...basePayload, ...(response_format ? { response_format } : {}) });

    // Retry without response_format if unsupported
    if (!response.ok && /pattern|response_format|unsupported|invalid/i.test(String(data?.error?.message || ''))) {
      ({ response, data } = await callOpenAI(basePayload));
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'OpenAI error' });
    }
    return res.json(data);
  } catch (err) {
    console.error('[api/ai] error:', err);
    return res.status(500).json({ error: 'Error contacting OpenAI.' });
  }
}
