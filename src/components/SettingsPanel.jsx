import React, { useState, useEffect } from "react";

function SettingsPanel() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");

  useEffect(() => {
    setOpenAIKey(localStorage.getItem("openai-key") || "");
    setClaudeKey(localStorage.getItem("claude-key") || "");
    setVoices(JSON.parse(localStorage.getItem("elevenlabs-voices") || "[]"));
    setSelectedVoiceId(localStorage.getItem("elevenlabs-voice-id") || "");
  }, []);

  const saveKeys = () => {
    localStorage.setItem("openai-key", openAIKey);
    localStorage.setItem("claude-key", claudeKey);
  };

  const addVoice = () => {
    if (!voiceId || !voiceName) return;
    const newVoice = { id: voiceId, name: voiceName };
    const updated = [...voices, newVoice];
    setVoices(updated);
    localStorage.setItem("elevenlabs-voices", JSON.stringify(updated));
    setVoiceId("");
    setVoiceName("");
  };

  const selectVoice = (id) => {
    setSelectedVoiceId(id);
    localStorage.setItem("elevenlabs-voice-id", id);
  };

  const removeVoice = (id) => {
    const updated = voices.filter(v => v.id !== id);
    setVoices(updated);
    localStorage.setItem("elevenlabs-voices", JSON.stringify(updated));
    if (selectedVoiceId === id) {
      setSelectedVoiceId("");
      localStorage.removeItem("elevenlabs-voice-id");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-800">🔐 API Keys</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
        <input
          type="text"
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Claude API Key</label>
        <input
          type="text"
          value={claudeKey}
          onChange={(e) => setClaudeKey(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={saveKeys}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save API Keys
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-6">🎤 ElevenLabs Voices</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Voice ID"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Display Name"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={addVoice}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add
        </button>
      </div>

      <ul className="space-y-2 mt-4">
        {voices.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between px-4 py-2 border rounded bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium">{v.name}</p>
              <p className="text-xs text-gray-500">{v.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  checked={selectedVoiceId === v.id}
                  onChange={() => selectVoice(v.id)}
                />
                Active
              </label>
              <button
                onClick={() => removeVoice(v.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SettingsPanel;
