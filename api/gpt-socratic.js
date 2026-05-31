// api/gpt-socratic.js — Vercel serverless function
// Handles Socratic Dialogue for OCR Religious Studies

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-openai-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method not allowed' });

  const { topic, chatHistory = [] } = req.body || {};
  const headerKey = (req.headers['x-openai-key'] || '').toString().trim().replace(/^['"]|['"]$/g, '');
  const envKey = (process.env.OPENAI_API_KEY || '').toString().trim();
  const OPENAI_API_KEY = (headerKey && headerKey.startsWith('sk-')) ? headerKey : envKey;

  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    return res.status(500).json({ reply: 'Missing or invalid OpenAI API key.' });
  }

  const systemPrompt = `You are a Socratic Method tutor for A-Level Religious Studies student aged 17. The topic is: ${topic}.

Your job is to help the student think deeply and clarify their ideas through a friendly, supportive, and adaptive dialogue.

Instructions:
- Select a common idea or concept from the main [TOPIC] and ask the student a question about it.
- Carefully read and analyze the student's most recent answer.
- If the student seems uncertain, confused, or says things like "not sure," "don't know," or "confused," respond with a concrete, simple example or a helpful hint, and then ask a related, follow-up question.
- If the student shows insight or makes a breakthrough, celebrate their progress and ask them to elaborate or connect it to the topic.
- If the student gives a partial answer, ask them to clarify or expand on their idea. Give another hint
- If the student continues to say 'don't know', or 'don't understand' then ask if they want the full answer or another hint.
- Only move to a new concept or question when the student demonstrates clear understanding of the current one.
- Use concrete, relatable examples to scaffold understanding when needed.
- Avoid following a rigid script or checklist. Let the student's responses guide the conversation.
- Keep your responses concise, focusing on one main idea or question at a time. Do not include multiple questions or concepts in your answers - space them out. Never provide direct answers, but always encourage further thinking and reflection, unless the student really has no idea at all.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 200, temperature: 0.7 }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ reply: `OpenAI error: ${data?.error?.message || 'unknown'}` });
    }
    return res.json({ reply: data.choices?.[0]?.message?.content || 'Sorry, no response.' });
  } catch (err) {
    console.error('[gpt-socratic] error:', err);
    return res.status(500).json({ reply: 'Error contacting OpenAI.' });
  }
}
