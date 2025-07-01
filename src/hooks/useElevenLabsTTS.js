import { useState, useRef, useCallback } from "react";
import { toast } from 'react-toastify';

export function useElevenLabsTTS() {
  const ELEVENLABS_API_KEY = "sk_19ca25b5ba5e9dd84ee253c6c10db87bc157e408efe560b2"; // 🔑 Paste your key here
  const [ttsState, setTtsState] = useState("idle"); // "idle" | "playing" | "paused" | "error"
  const audioRef = useRef(null);
  const CHUNK_SIZE = 800; // characters per chunk
  const MAX_CHUNK_LENGTH = 2500; // ElevenLabs hard limit
  const MAX_RETRIES = 3;
  const BASE_BACKOFF = 1000; // ms
  const CHUNK_TIMEOUT = 30000; // 30s
  const [audioBlocked, setAudioBlocked] = useState(false);
  const blockedAudioBlobRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const preparedAudioBlobsRef = useRef([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Preprocess text for TTS
  function preprocessText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .trim()
      .substring(0, MAX_CHUNK_LENGTH);
  }

  // Smarter chunking: split by sentence, force split if needed
  function chunkText(text, maxLen = CHUNK_SIZE) {
    const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
    const chunks = [];
    let current = "";
    for (const sentence of sentences) {
      if ((current + sentence).length > maxLen && current.length > 0) {
        chunks.push(current.trim());
        current = sentence;
      } else if (sentence.length > maxLen) {
        // Force split long sentence
        for (let i = 0; i < sentence.length; i += maxLen) {
          chunks.push(sentence.substring(i, i + maxLen));
        }
        current = "";
      } else {
        current += sentence;
      }
    }
    if (current.trim().length > 0) chunks.push(current.trim());
    console.log(`[TTS] Chunked text into ${chunks.length} chunk(s):`, chunks);
    return chunks;
  }

  // Retry logic with exponential backoff and timeout
  async function fetchWithRetry(chunk, voiceId, attempt = 1) {
    const processed = preprocessText(chunk);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHUNK_TIMEOUT);
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: processed,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const audioBlob = await response.blob();
      if (audioBlob.size === 0) throw new Error("Empty audio blob");
      return audioBlob;
    } catch (err) {
      clearTimeout(timeoutId);
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * BASE_BACKOFF;
        console.warn(`[TTS] Chunk fetch failed (attempt ${attempt}): ${err.message}. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(chunk, voiceId, attempt + 1);
      } else {
        console.error(`[TTS] Chunk fetch failed after ${MAX_RETRIES} attempts:`, err);
        throw err;
      }
    }
  }

  // Play a sequence of audio blobs
  async function playAudioSequence(blobs) {
    for (let i = 0; i < blobs.length; i++) {
      const audioUrl = URL.createObjectURL(blobs[i]);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setTtsState("playing");
      console.log(`[TTS] Playing chunk ${i+1} of ${blobs.length}`);
      try {
        await new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            console.log(`[TTS] Finished chunk ${i+1}`);
            resolve();
          };
          audio.onerror = (e) => {
            URL.revokeObjectURL(audioUrl);
            console.error(`[TTS] Error playing chunk ${i+1}:`, e);
            reject(e);
          };
          audio.play().catch((err) => {
            console.error(`[TTS] Playback error for chunk ${i+1}:`, err);
            if (err.name === 'NotAllowedError') {
              setAudioBlocked(true);
              blockedAudioBlobRef.current = blobs[i];
            }
            reject(err);
          });
        });
      } catch (err) {
        // If NotAllowedError, break so user can retry
        if (err.name === 'NotAllowedError') {
          break;
        }
        throw err;
      }
    }
    setTtsState("idle");
    audioRef.current = null;
    console.log(`[TTS] All chunks played.`);
  }

  // Retry audio playback on user click if blocked
  const retryAudio = useCallback(() => {
    if (audioBlocked && blockedAudioBlobRef.current) {
      const audioUrl = URL.createObjectURL(blockedAudioBlobRef.current);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setTtsState("playing");
      setAudioBlocked(false);
      blockedAudioBlobRef.current = null;
      audio.play().then(() => {
        URL.revokeObjectURL(audioUrl);
        setTtsState("idle");
        audioRef.current = null;
      }).catch((err) => {
        URL.revokeObjectURL(audioUrl);
        setTtsState("error");
        audioRef.current = null;
        setAudioBlocked(true);
        blockedAudioBlobRef.current = blockedAudioBlobRef.current;
        console.error("[TTS] Retry playback error:", err);
      });
    }
  }, [audioBlocked]);

  // Main speak function (fetches audio, does not auto-play)
  const speak = useCallback(async (text, voiceId = null) => {
    setAudioLoading(true);
    setAudioError(false);
    setAudioReady(false);
    preparedAudioBlobsRef.current = [];
    const storedVoiceId = localStorage.getItem("elevenlabs-voice-id");
    const effectiveVoiceId = voiceId || storedVoiceId || "21m00Tcm4TlvDq8ikWAM"; // Default to Rachel

    if (!ELEVENLABS_API_KEY || !effectiveVoiceId) {
      console.warn("❌ Missing ElevenLabs API key or voice ID");
      return;
    }

    // Check if we have user interaction context
    if (!document.hasFocus()) {
      console.warn("⚠️ No user interaction context - audio may be blocked");
      toast.warning("Please ensure the page is active before playing audio.");
    }

    // Chunked TTS logic
    const chunks = text.length > CHUNK_SIZE ? chunkText(text, CHUNK_SIZE) : [text];
    setTtsState("playing");
    try {
      const audioBlobs = [];
      for (let i = 0; i < chunks.length; i++) {
        setTtsState(`playing-chunk-${i+1}-of-${chunks.length}`);
        console.log(`[TTS] Requesting chunk ${i+1}/${chunks.length}:`, chunks[i]);
        const audioBlob = await fetchWithRetry(chunks[i], effectiveVoiceId);
        console.log(`[TTS] Received audio blob for chunk ${i+1}: size ${audioBlob.size}`);
        audioBlobs.push(audioBlob);
      }
      preparedAudioBlobsRef.current = audioBlobs;
      setAudioReady(true);
      setAudioLoading(false);
    } catch (err) {
      console.error("[TTS] ElevenLabs playback error", err);
      setTtsState("error");
      setAudioError(true);
    }
  }, []);

  // Play prepared audio sequence (user gesture)
  const playPreparedAudio = useCallback(async () => {
    if (!audioReady || preparedAudioBlobsRef.current.length === 0) return;
    setTtsState("playing");
    for (let i = 0; i < preparedAudioBlobsRef.current.length; i++) {
      const audioUrl = URL.createObjectURL(preparedAudioBlobsRef.current[i]);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      try {
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = reject;
          audio.play();
        });
      } catch (err) {
        setAudioError(true);
        break;
      }
      URL.revokeObjectURL(audioUrl);
    }
    setTtsState("idle");
    setAudioReady(false);
    preparedAudioBlobsRef.current = [];
  }, [audioReady]);

  const pause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setTtsState("paused");
    }
  };

  const resume = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setTtsState("playing");
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setTtsState("idle");
      audioRef.current = null;
    }
  };

  return {
    speak,
    playPreparedAudio,
    audioReady,
    audioLoading,
    audioError,
    pause,
    resume,
    stop,
    ttsState,
    isConfigured: !!ELEVENLABS_API_KEY,
    audioBlocked,
    retryAudio
  };
}
