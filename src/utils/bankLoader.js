// Lightweight bank loader with sessionStorage caching

export async function loadBank(topicId, kind) {
  const key = `bank-${topicId}-${kind}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      let json = JSON.parse(cached);
      if (json && json.raw && typeof json.raw === 'string') {
        try { json = JSON.parse(json.raw); } catch {}
        try { sessionStorage.setItem(key, JSON.stringify(json)); } catch {}
      }
      try { console.log('[Bank] loaded from cache', { key, kind, topicId, hasItems: Array.isArray(json.items), hasQs: Array.isArray(json.questions) }); } catch {}
      return json;
    }
  } catch {}

  try {
    const res = await fetch(`/banks/${topicId}_${kind}.json?t=${Date.now()}`);
    if (!res.ok) return null;
    let json = await res.json();
    // Handle servers that saved { raw: "{ items:[...] }" }
    if (json && json.raw && typeof json.raw === 'string') {
      try { json = JSON.parse(json.raw); } catch {}
    }
    try { sessionStorage.setItem(key, JSON.stringify(json)); } catch {}
    try { console.log('[Bank] fetched', { key, kind, topicId, hasItems: Array.isArray(json.items), hasQs: Array.isArray(json.questions), itemsLen: (json.items||[]).length, qsLen: (json.questions||[]).length }); } catch {}
    return json;
  } catch {
    return null;
  }
}


