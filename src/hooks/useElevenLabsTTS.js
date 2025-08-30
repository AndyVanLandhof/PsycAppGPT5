import { useState, useRef, useCallback } from "react";
import { toast } from 'react-toastify';

export function useElevenLabsTTS() {
  // Prefer key from localStorage, fallback to env variables; never hardcode secrets
  const ELEVENLABS_API_KEY =
    localStorage.getItem("elevenlabs-key") ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ELEVENLABS_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.ELEVENLABS_API_KEY) ||
    "";
  const [ttsState, setTtsState] = useState("idle"); // "idle" | "preparing" | "playing" | "paused" | "error"
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
  const preparedParaEndsRef = useRef([]); // parallel to blobs: true if end of paragraph
  const cancelPlaybackRef = useRef(false);
  const isPlayingRef = useRef(false);
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

  // Paragraph-first chunking: split by paragraph, then sentences to satisfy maxLen
  function chunkText(text, maxLen = CHUNK_SIZE) {
    const paragraphs = text.split(/\n\s*\n+/); // blank-line separated
    const outChunks = [];
    const outParaEnds = [];
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      const sentences = trimmed.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [trimmed];
      let current = "";
      const thisParaChunks = [];
      for (const sentence of sentences) {
        if ((current + sentence).length > maxLen && current.length > 0) {
          thisParaChunks.push(current.trim());
          current = sentence;
        } else if (sentence.length > maxLen) {
          // Force split very long sentence
          for (let i = 0; i < sentence.length; i += maxLen) {
            thisParaChunks.push(sentence.substring(i, i + maxLen));
          }
          current = "";
        } else {
          current += sentence;
        }
      }
      if (current.trim().length > 0) thisParaChunks.push(current.trim());
      for (let i = 0; i < thisParaChunks.length; i++) {
        outChunks.push(thisParaChunks[i]);
        outParaEnds.push(i === thisParaChunks.length - 1); // only last chunk of paragraph marks para end
      }
    }
    console.log(`[TTS] Chunked paragraphs into ${outChunks.length} chunk(s)`);
    return { chunks: outChunks, paraEnds: outParaEnds };
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
      setAudioLoading(false);
      setAudioError(true);
      toast.error("ElevenLabs not configured. Add API key and Voice ID in Settings.");
      return;
    }

    // Check if we have user interaction context
    if (!document.hasFocus()) {
      console.warn("⚠️ No user interaction context - audio may be blocked");
      toast.warning("Please ensure the page is active before playing audio.");
    }

    // Chunked TTS logic
    const { chunks, paraEnds } = text.length > CHUNK_SIZE ? chunkText(text, CHUNK_SIZE) : { chunks: [text], paraEnds: [true] };
    setTtsState("preparing");
    try {
      const audioBlobs = [];
      for (let i = 0; i < chunks.length; i++) {
        setTtsState(`preparing-chunk-${i+1}-of-${chunks.length}`);
        console.log(`[TTS] Requesting chunk ${i+1}/${chunks.length}:`, chunks[i]);
        const audioBlob = await fetchWithRetry(chunks[i], effectiveVoiceId);
        console.log(`[TTS] Received audio blob for chunk ${i+1}: size ${audioBlob.size}`);
        audioBlobs.push(audioBlob);
      }
      preparedAudioBlobsRef.current = audioBlobs;
      preparedParaEndsRef.current = paraEnds;
      setAudioReady(true);
      setAudioLoading(false);
      setTtsState("idle");
    } catch (err) {
      console.error("[TTS] ElevenLabs playback error", err);
      setTtsState("error");
      setAudioError(true);
    }
  }, []);

  // Play prepared audio sequence (user gesture)
  const playPreparedAudio = useCallback(async () => {
    if (isPlayingRef.current) return; // prevent re-entrant plays
    if (!audioReady || preparedAudioBlobsRef.current.length === 0) return;
    setTtsState("playing");
    isPlayingRef.current = true;
    cancelPlaybackRef.current = false;
    for (let i = 0; i < preparedAudioBlobsRef.current.length; i++) {
      const audioUrl = URL.createObjectURL(preparedAudioBlobsRef.current[i]);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      try {
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onpause = resolve;
          audio.onerror = reject;
          audio.play();
        });
      } catch (err) {
        setAudioError(true);
        break;
      }
      URL.revokeObjectURL(audioUrl);
      // Pause only at paragraph boundaries (1s)
      if (preparedParaEndsRef.current[i]) {
        await new Promise(res => setTimeout(res, 1000));
      }
      if (cancelPlaybackRef.current) {
        break;
      }
    }
    setTtsState("idle");
    isPlayingRef.current = false;
    setAudioReady(false);
    preparedAudioBlobsRef.current = [];
    preparedParaEndsRef.current = [];
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
    cancelPlaybackRef.current = true;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (_) {}
      audioRef.current = null;
    }
    setTtsState("idle");
    isPlayingRef.current = false;
    setAudioReady(false);
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
