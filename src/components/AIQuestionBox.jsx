import React, { useState } from 'react';
import { Sparkles, Loader2, Brain, Bot } from 'lucide-react';

function AIQuestionBox({ topic }) {
  const [question, setQuestion] = useState('');
  const [gptResponse, setGptResponse] = useState('');
  const [claudeResponse, setClaudeResponse] = useState('');
  const [isLoadingGPT, setIsLoadingGPT] = useState(false);
  const [isLoadingClaude, setIsLoadingClaude] = useState(false);

  const callAI = async (model) => {
    const key =
      model === 'gpt'
        ? localStorage.getItem('pretutor-settings') && JSON.parse(localStorage.getItem('pretutor-settings')).gptKey
        : localStorage.getItem('pretutor-settings') && JSON.parse(localStorage.getItem('pretutor-settings')).claudeKey;

    const endpoint =
      model === 'gpt'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.anthropic.com/v1/messages';

    const headers =
      model === 'gpt'
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          }
        : {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          };

    const body =
      model === 'gpt'
        ? {
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are a helpful OCR Religious Studies tutor.' },
              { role: 'user', content: question },
            ],
            temperature: 0.7,
          }
        : {
            model: 'claude-3-opus-20240229',
            messages: [
              { role: 'user', content: question },
            ],
            max_tokens: 1024,
          };

    try {
      model === 'gpt' ? setIsLoadingGPT(true) : setIsLoadingClaude(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();

      const output =
        model === 'gpt'
          ? json.choices?.[0]?.message?.content || 'No GPT response'
          : json.content?.[0]?.text || 'No Claude response';

      model === 'gpt' ? setGptResponse(output) : setClaudeResponse(output);
    } catch (err) {
      model === 'gpt'
        ? setGptResponse('❌ GPT request failed.')
        : setClaudeResponse('❌ Claude request failed.');
    } finally {
      model === 'gpt' ? setIsLoadingGPT(false) : setIsLoadingClaude(false);
    }
  };

  return (
    <div className="bg-white border rounded p-4 mt-10 shadow">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        Ask AI about: <span className="text-blue-700">{topic.title}</span>
      </h3>

      <input
        type="text"
        className="w-full border px-3 py-2 rounded mt-2 mb-3"
        placeholder="Type your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          onClick={() => callAI('gpt')}
          disabled={isLoadingGPT}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center gap-2"
        >
          {isLoadingGPT ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          ChatGPT
        </button>
        <button
          onClick={() => callAI('claude')}
          disabled={isLoadingClaude}
          className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 flex items-center gap-2"
        >
          {isLoadingClaude ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          Claude
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {gptResponse && (
          <div className="bg-gray-100 p-4 rounded shadow-inner">
            <div className="font-semibold mb-1 text-gray-700">💬 ChatGPT Answer:</div>
            <p className="text-sm text-gray-800 whitespace-pre-line">{gptResponse}</p>
          </div>
        )}
        {claudeResponse && (
          <div className="bg-purple-100 p-4 rounded shadow-inner">
            <div className="font-semibold mb-1 text-purple-800">🤖 Claude Answer:</div>
            <p className="text-sm text-purple-900 whitespace-pre-line">{claudeResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIQuestionBox;
