process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// server.cjs
// To use: create a .env file with OPENAI_API_KEY=sk-... in your project root
const express = require('express');
const fs = require('fs');
const path = require('path');
// const fetch = require('node-fetch'); // Not needed in Node 18+
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-openai-key']
}));
app.use(express.json());

app.get('/test', (req, res) => res.send('Test OK'));

app.post('/api/gpt-socratic', async (req, res) => {
  const { topic, chatHistory } = req.body;
  const headerKey = (req.headers['x-openai-key'] || '').toString().trim().replace(/^['"]|['"]$/g, '');
  const envKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  const OPENAI_API_KEY = (headerKey && headerKey.startsWith('sk-')) ? headerKey : envKey;
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    return res.status(500).json({ reply: 'Missing or invalid OpenAI API key. Add it in Settings (client) or set OPENAI_API_KEY in .env and restart.' });
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
- Keep your responses concise, focusing on one main idea or question at a time. Do not include multiple questions or concepts in your answers - space them out. Never provide direct answers, but always encourage further thinking and reflection, unless the student really has no idea at all.

Examples:
- If the student says: "not sure," you might reply: "No worries! Let's try a concrete example: Imagine you draw a circle on paper. Is it a perfect circle? What might Plato say about that?"
- If the student says: "It's inside us," you might reply: "Exactly! Plato believed our knowledge of perfect Forms is 'inside us' through soul memory. How do you think this helps us recognize beauty or justice?"
- If the student gives a strong answer, you might reply: "Great insight! Can you think of a real-world example that illustrates this idea?"`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(m => ({
      role: m.role, // should be 'user' or 'assistant'
      content: m.content
    }))
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.error?.message || 'OpenAI API error.';
      return res.status(500).json({ reply: `OpenAI error: ${msg}` });
    }
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI API error:', err);
    res.status(500).json({ reply: 'Error contacting OpenAI API.' });
  }
});

// Generic AI proxy: POST /api/ai { model, messages, temperature }
app.post('/api/ai', async (req, res) => {
  const { model = 'gpt-4o-mini', messages = [], temperature = 0.7, max_tokens = 800, response_format = null } = req.body || {};
  // Sanitize provided keys (quotes/newlines/spaces)
  const rawHeaderKey = (req.headers['x-openai-key'] || '').toString();
  const headerKey = rawHeaderKey.trim().replace(/^['"]|['"]$/g, '');
  const envKeyRaw = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '').toString();
  const envKey = envKeyRaw.trim().replace(/^['"]|['"]$/g, '');
  const OPENAI_API_KEY = (headerKey && headerKey.startsWith('sk-')) ? headerKey : envKey;
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    return res.status(401).json({ error: 'Missing or invalid OpenAI API key. Add in Settings or server .env' });
  }
  try {
    const payloadBase = { model, messages, temperature, max_tokens };
    const payloadWithFormat = { ...payloadBase, ...(response_format ? { response_format } : {}) };
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payloadWithFormat)
    });
    let data = null;
    try { data = await response.json(); } catch (_) {
      const text = await response.text().catch(()=>'');
      data = { error: text || 'Unknown error' };
    }
    if (!response.ok) {
      const message = (data && data.error && (data.error.message || data.error)) || 'OpenAI error';
      // Retry without response_format if model/param not supported
      if (/pattern|response_format|unsupported|invalid/i.test(String(message))) {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payloadBase)
        });
        try { data = await response.json(); } catch (_) {
          const text = await response.text().catch(()=>'');
          data = { error: text || 'Unknown error' };
        }
        if (!response.ok) {
          const message2 = (data && data.error && (data.error.message || data.error)) || 'OpenAI error';
          return res.status(response.status).json({ error: message2 });
        }
        return res.json(data);
      }
      return res.status(response.status).json({ error: message });
    }
    res.json(data);
  } catch (e) {
    console.error('AI proxy error', e);
    res.status(500).json({ error: 'Proxy error' });
  }
});

// Generate a small bank for a topic (short answers) in one call
app.post('/api/generate-bank', async (req, res) => {
  const { topic = 'biopsychology', kind = 'short', count = 12, save = false, append = false } = req.body || {};
  const headerKey = (req.headers['x-openai-key'] || '').toString().trim();
  const envKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  const OPENAI_API_KEY = (headerKey && headerKey.startsWith('sk-')) ? headerKey : envKey;
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    return res.status(401).json({ error: 'Missing or invalid OpenAI API key.' });
  }
  const system = 'You are an AQA 7182 Psychology question writer. Respond in strict JSON only.';
  let user = '';
  if (kind === 'short') {
    user = `Create ${count} short-answer questions (2–6 marks) for AQA Psychology topic: ${topic}.
Mix of: define/identify (2), outline two (4), explain with example (3–4), quick methods/ethics/data.
Return JSON as { items: [ { prompt: string, max: 2|3|4|6, markscheme: string[] } ] }.`;
  } else if (kind === 'mcq') {
    user = `Create ${count} MCQs (1 mark each) for AQA Psychology topic: ${topic}.
Return JSON as { questions: [ { question: string, options: string[4], correctIndex: 0|1|2|3 } ] }.`;
  } else if (kind === 'scenario') {
    user = `Create ${Math.ceil(count/2)} scenario/application questions (6 marks) for AQA Psychology topic: ${topic}.
Return JSON as { items: [ { prompt: string, max: 6, markscheme: string[] } ] }.`;
  } else {
    user = `Create ${Math.min(count, 2)} essay stems (16 marks) for AQA Psychology topic: ${topic}.
Return JSON as { items: [ { prompt: string } ] }.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1200,
        messages: [ { role: 'system', content: system }, { role: 'user', content: user } ]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'OpenAI error' });
    let saved = null;
    let parsedOk = true;
    let parseError = null;
    const content = data?.choices?.[0]?.message?.content || '{}';
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      parsedOk = false;
      parseError = e?.message || String(e);
    }
    try {
      if (save) {
        const outDir = path.join(__dirname, 'public', 'banks');
        fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, `${topic}_${kind}.json`);
        if (parsedOk) {
          if (append && fs.existsSync(outPath)) {
            try {
              const existing = JSON.parse(fs.readFileSync(outPath, 'utf8')) || {};
              if (kind === 'mcq') {
                const oldQs = Array.isArray(existing.questions) ? existing.questions : [];
                const newQs = Array.isArray(parsed.questions) ? parsed.questions : [];
                const merged = [...oldQs, ...newQs];
                const uniq = [];
                const seen = new Set();
                for (const q of merged) {
                  const key = (q?.question || '').trim();
                  if (key && !seen.has(key)) { seen.add(key); uniq.push(q); }
                }
                fs.writeFileSync(outPath, JSON.stringify({ questions: uniq }, null, 2), 'utf8');
              } else {
                const oldItems = Array.isArray(existing.items) ? existing.items : [];
                const newItems = Array.isArray(parsed.items) ? parsed.items : [];
                const merged = [...oldItems, ...newItems];
                const uniq = [];
                const seen = new Set();
                for (const it of merged) {
                  const key = (it?.prompt || '').trim();
                  if (key && !seen.has(key)) { seen.add(key); uniq.push(it); }
                }
                fs.writeFileSync(outPath, JSON.stringify({ items: uniq }, null, 2), 'utf8');
              }
            } catch (e) {
              fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
            }
          } else {
            fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
          }
        } else {
          // Fallback: save raw content so user can inspect
          fs.writeFileSync(outPath, JSON.stringify({ raw: content }, null, 2), 'utf8');
        }
        saved = `/banks/${topic}_${kind}.json`;
      }
    } catch (e) {
      parseError = parseError || e?.message || String(e);
    }
    return res.json({ ok: true, saved, parsedOk, parseError });
  } catch (e) {
    console.error('generate-bank error', e);
    return res.status(500).json({ error: 'Proxy error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Socratic Dialogue API server running on port ${PORT}`));