import { NextResponse } from 'next/server';

export async function POST(req) {
  const { topic, chatHistory } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
  const prompt = `You are a Socratic tutor for A-Level Religious Studies. The topic is: ${topic}.
The conversation so far is: ${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
Ask probing, open-ended questions that help the student think deeply, clarify their ideas, and reach a philosophical insight. Do not provide direct answers; always respond with a question or a summary that prompts further reflection. Conclude the session when the student demonstrates clear understanding.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a Socratic tutor for A-Level Religious Studies.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  return NextResponse.json({ reply });
} 