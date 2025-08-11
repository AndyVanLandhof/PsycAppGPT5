import { NextResponse } from 'next/server';

export async function POST(req) {
  const { topic, chatHistory } = await req.json();
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) || '';
  const prompt = `You are a Psychology teacher. The topic is: ${topic}.
The conversation so far is: ${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
Ask the student one question at a time about this topic. Focus on weaknesses, ethical issues, or comparisons to test their AO3 (evaluation) understanding. Do not provide direct answers; always respond with a probing question or a follow-up that challenges their thinking. Conclude the session when the student demonstrates clear, critical understanding.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a Socratic Psychology teacher for AQA A-Level.' },
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