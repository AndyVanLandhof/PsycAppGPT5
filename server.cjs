process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// server.cjs
// To use: create a .env file with OPENAI_API_KEY=sk-... in your project root
const express = require('express');
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
  const headerKey = (req.headers['x-openai-key'] || '').toString().trim();
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
        model: 'gpt-3.5-turbo',
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Socratic Dialogue API server running on port ${PORT}`));