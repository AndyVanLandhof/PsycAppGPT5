import React, { useEffect, useMemo, useState } from 'react';
import psychologyTopics from '../psychologyTopics';
import { useAIService } from '../hooks/useAIService';
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';

export default function BedtimeStory({ onBack, topic: topicProp, subTopic: subTopicProp }) {
  const topicEntries = useMemo(() => Object.entries(psychologyTopics), []);
  const hasLockedSelection = !!(topicProp && subTopicProp);
  const initialTopicId = topicProp?.id || topicEntries[0]?.[0] || 'memory';
  const initialSubId = subTopicProp?.id || psychologyTopics[initialTopicId]?.subTopics?.[0]?.id || '';
  const [topicId, setTopicId] = useState(initialTopicId);
  const [subTopicId, setSubTopicId] = useState(initialSubId);
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { callAIWithVault } = useAIService();
  const { speak, playPreparedAudio, pause, stop, audioReady, audioLoading, ttsState, isConfigured } = useElevenLabsTTS();
  const [playArmed, setPlayArmed] = useState(false);

  const topic = psychologyTopics[topicId];
  const subTopic = topic?.subTopics?.find(st => st.id === subTopicId);
  const topicTitle = topicProp?.title || topic?.title || '';
  const subTopicTitle = subTopicProp?.title || subTopic?.title || '';

  const cacheKey = hasLockedSelection
    ? `bedtime-story-${topicTitle}-${subTopicTitle}`
    : `bedtime-story-${subTopicId}`;

  const loadCached = () => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) setStory(cached);
  };

  useEffect(() => {
    loadCached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const generateStory = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Write a calm, narrative 'bedtime story' lesson for AQA Psychology 7182.\n\nTOPIC: ${topicTitle}\nSUB-TOPIC: ${subTopicTitle}\n\nOpeners (pick one, vary naturally):\n- "Hi Phoebe,"\n- "Good evening Phoebe,"\n- "Hello Phoebe,"\n- "Poodle Pops, what's up?"\n\nStyle & Goals:\n- Start with a short, relatable anecdote/scenario (2–3 sentences) — not "once upon a time" — to hook attention.\n- Then teach in a friendly story voice with concrete, everyday examples.\n- Include 2–3 key ideas, 1–2 named studies (with researcher and year and one key finding), and a brief recap at the end.\n- Keep everything accurate and exam-aligned but easy to follow and soothing.\n- Length target: 750–900 words (~5–6 minutes).\n- Do NOT include citations, page numbers, brackets, or references.\n- Output plain text only (no markdown/code fences).`;

      const text = await callAIWithVault(prompt, topicTitle, subTopicTitle, { includeAdditional: false });
      const clean = String(text || '').replace(/^```[a-z]*\n?|```$/g, '').trim();
      setStory(clean);
      localStorage.setItem(cacheKey, clean);
    } catch (e) {
      setError('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!story) return;
    // First press: arm the button (visual highlight), second press: execute
    if (!playArmed) {
      setPlayArmed(true);
      return;
    }
    try {
      if (audioReady) {
        await playPreparedAudio();
      } else if (!audioLoading) {
        await speak(story);
      }
    } finally {
      setPlayArmed(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bedtime Story (Beta)</h1>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">← Back</button>
          )}
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4">
          {hasLockedSelection ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <div><span className="font-semibold">Topic:</span> {topicTitle}</div>
                <div><span className="font-semibold">Subtopic:</span> {subTopicTitle}</div>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={generateStory} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {loading ? 'Generating…' : 'Generate Story'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setTopicId(newId);
                    setSubTopicId(psychologyTopics[newId].subTopics[0]?.id || '');
                    setStory('');
                  }}
                  className="w-full p-2 border rounded"
                >
                  {topicEntries.map(([id, t]) => (
                    <option key={id} value={id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic</label>
                <select
                  value={subTopicId}
                  onChange={(e) => { setSubTopicId(e.target.value); setStory(''); }}
                  className="w-full p-2 border rounded"
                >
                  {topic?.subTopics?.map(st => (
                    <option key={st.id} value={st.id}>{st.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={generateStory} disabled={loading} className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {loading ? 'Generating…' : 'Generate Story'}
                </button>
              </div>
            </div>
          )}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Story Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePlay}
                disabled={!story || String(ttsState).startsWith('playing')}
                aria-pressed={playArmed}
                className={`px-3 py-1 rounded transition-shadow ${
                  !story || String(ttsState).startsWith('playing')
                    ? 'bg-gray-200 text-gray-500'
                    : (audioReady ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-purple-600 text-white hover:bg-purple-700')
                } ${playArmed ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
              >
                {audioLoading ? 'Creating…' : (audioReady ? 'Play' : (playArmed ? 'Press again to create audio' : 'Create Audio'))}
              </button>
              <button
                onClick={pause}
                disabled={!ttsState || !String(ttsState).startsWith('playing')}
                className={`px-3 py-1 rounded ${!String(ttsState).startsWith('playing') ? 'bg-gray-200 text-gray-500' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
              >
                Pause
              </button>
              <button
                onClick={stop}
                disabled={!ttsState || (!String(ttsState).startsWith('playing') && ttsState !== 'paused')}
                className={`px-3 py-1 rounded ${(!String(ttsState).startsWith('playing') && ttsState !== 'paused') ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                Stop
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-2">TTS: {ttsState}{!isConfigured ? ' (Configure ElevenLabs key in Settings)' : ''}</div>
          <div className="whitespace-pre-wrap text-gray-800 leading-7 max-h-[50vh] overflow-y-auto border rounded p-3">
            {story || 'Generate a story to preview it here.'}
          </div>
        </div>
      </div>
    </div>
  );
}


