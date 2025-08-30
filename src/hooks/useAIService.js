import { useVaultService } from './useVaultService';

export function useAIService() {
  // Load API keys from localStorage or environment; never hardcode secrets in the repo
  const OPENAI_API_KEY =
    (typeof window !== 'undefined' && localStorage.getItem('openai-key')) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) ||
    '';

  const ANTHROPIC_API_KEY =
    (typeof window !== 'undefined' && localStorage.getItem('anthropic-key')) ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANTHROPIC_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.ANTHROPIC_API_KEY) ||
    '';

  const { createVaultPrompt, getExamContext, getRevisionContext } = useVaultService();

  const getSelectedOpenAIModel = (fallback) => {
    try {
      const saved = (typeof window !== 'undefined' && localStorage.getItem('openai-model')) || '';
      return (fallback || 'gpt-4o-mini') && (saved || fallback || 'gpt-4o-mini');
    } catch (_) {
      return fallback || 'gpt-4o-mini';
    }
  };

  const callAI = async (prompt, model = "ChatGPT", options = {}) => {
    const { topic, subTopic, includeAdditional = false, useVault = true, modelName } = options;
    
    let finalPrompt = prompt;
    
    // If vault integration is enabled and we have topic info, enhance the prompt
    if (useVault && topic && subTopic) {
      finalPrompt = createVaultPrompt(prompt, topic, subTopic, includeAdditional);
    }
    
    console.log(`[🔮 AI] (${model}):`, finalPrompt);

    try {
      if (model === "Claude") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [{ role: "user", content: finalPrompt }]
          })
        });

        const data = await response.json();
        console.log("[Claude raw]", data);
        return data?.content?.[0]?.text || "Claude did not return a valid response.";
      }

      // Default to OpenAI via backend proxy
      let key = (typeof window !== 'undefined' && localStorage.getItem('openai-key')) || '';
      key = String(key).trim().replace(/^['"]|['"]$/g, ''); // strip quotes/spaces
      const isValidKey = /^sk-/.test(key) && !/(REPLA|YOUR_OPENAI_API_KEY)/i.test(key) && key.length > 20;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isValidKey ? { 'x-openai-key': key } : {})
        },
        body: JSON.stringify({
          model: modelName || getSelectedOpenAIModel('gpt-4o-mini'),
          messages: [{ role: "user", content: finalPrompt }],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // If server returned a non-JSON body (e.g., plain text error), synthesize an error object
        const text = await response.text().catch(() => '');
        data = { error: text || e?.message || 'Unknown error' };
      }
      console.log("[OpenAI raw]", data);
      if (!response.ok) {
        throw new Error(data?.error || (isValidKey ? 'OpenAI proxy error' : 'Missing/invalid OpenAI API key. Add it in Settings or server .env and reload.'));
      }
      return data?.choices?.[0]?.message?.content || "ChatGPT did not return a valid response.";
    } catch (err) {
      console.error("[AI Error]", err);
      return `Error: ${err?.message || 'Something went wrong. Please try again.'}`;
    }
  };

  // Strict JSON-only helper (no educational wrapper). Optionally pass a system prompt.
  const callAIJsonOnly = async (userPrompt, systemPrompt = null, modelName = "gpt-4o-mini") => {
    const key = (typeof window !== 'undefined' && localStorage.getItem('openai-key')) || '';
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });
    let response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'x-openai-key': key } : {}) },
      body: JSON.stringify({ model: modelName || getSelectedOpenAIModel('gpt-4o-mini'), messages, temperature: 0.2, max_tokens: 1600, response_format: { type: 'json_object' } })
    });
    let data = null;
    try { data = await response.json(); } catch (_) { data = { error: (await response.text().catch(()=>'')).trim() }; }
    console.log('[OpenAI raw]', data);
    if (response.ok && data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
    const errMsg = (data && (data.error || data.message)) || '';
    const shouldRetry = !response.ok && /pattern|response_format|unsupported|invalid/i.test(String(errMsg));
    if (shouldRetry) {
      response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'x-openai-key': key } : {}) },
        body: JSON.stringify({ model: modelName || getSelectedOpenAIModel('gpt-4o-mini'), messages, temperature: 0.2, max_tokens: 1600 })
      });
      try { data = await response.json(); } catch (_) { data = { error: (await response.text().catch(()=>'')).trim() }; }
      console.log('[OpenAI raw retry]', data);
      if (!response.ok) throw new Error(data?.error || 'OpenAI proxy error');
      return data?.choices?.[0]?.message?.content || '';
    }
    if (!response.ok) throw new Error(errMsg || 'OpenAI proxy error');
    return data?.choices?.[0]?.message?.content || '';
  };

  // Enhanced AI call with vault context
  const callAIWithVault = async (prompt, topic, subTopic, options = {}) => {
    const { includeAdditional = false, model = "ChatGPT", modelName } = options;
    // Use plain text mode for Bedtime Story and other narrative outputs; Study Content handles JSON separately
    return callAI(prompt, model, {
      topic,
      subTopic,
      includeAdditional,
      useVault: true,
      modelName: modelName || getSelectedOpenAIModel('gpt-4o-mini')
    });
  };

  // Get exam-specific AI response
  const callAIForExam = async (prompt, topic, model = "ChatGPT") => {
    const examContext = getExamContext(topic);
    let enhancedPrompt = prompt;
    
    if (examContext.length > 0) {
      const examSection = examContext
        .slice(0, 3)
        .map((context, index) => 
          `EXAM REFERENCE ${index + 1}:\n${context.content}\n`
        )
        .join('\n');
      
      enhancedPrompt = `Use the following OCR exam materials as your primary reference:

${examSection}

INSTRUCTIONS: ${prompt}

Remember: Base your response on the OCR exam materials above.`;
    }
    
    return callAI(enhancedPrompt, model, { useVault: false, modelName: getSelectedOpenAIModel('gpt-4o-mini') });
  };

  // Get revision/essay-specific AI response
  const callAIForRevision = async (prompt, topic, subTopic, model = "ChatGPT") => {
    const revisionContext = getRevisionContext(topic, subTopic);
    let enhancedPrompt = prompt;
    
    if (revisionContext.length > 0) {
      const revisionSection = revisionContext
        .slice(0, 3)
        .map((context, index) => 
          `REVISION REFERENCE ${index + 1}:\n${context.content}\n`
        )
        .join('\n');
      
      enhancedPrompt = `Use the following OCR revision materials as your primary reference:

${revisionSection}

INSTRUCTIONS: ${prompt}

Remember: Base your response on the OCR revision materials above.`;
    }
    
    return callAI(enhancedPrompt, model, { useVault: false, modelName: getSelectedOpenAIModel('gpt-4o-mini') });
  };

  // Get AI response using public sources (AQA Psychology 7182 curriculum + academic knowledge)
  const callAIWithPublicSources = async (prompt, topic, subTopic, modelName = "gpt-4o-mini") => {
    const enhancedPrompt = `You are an expert AQA Psychology tutor with deep knowledge of the AQA Psychology 7182 curriculum. The student is studying ${subTopic || topic} and asks: "${prompt}"

Please provide a comprehensive, accurate answer using:

1. **AQA Psychology 7182 Curriculum Knowledge:**
   - Official AQA specification content
   - Standard A-Level psychology concepts
   - Required knowledge for the 7182 exam

2. **Academic Sources and Scholars:**
   - Well-known psychologists, researchers, and scholars in this field
   - Key texts and publications relevant to ${subTopic || topic}
   - Current academic understanding and debates

3. **Educational Focus:**
   - Content suitable for A-Level students
   - Clear explanations with examples
   - Links to exam requirements where relevant
   - Balanced perspectives and critiques

4. **Specific Requirements:**
   - Include relevant dates, names, and key concepts
   - Provide context for why ideas are important
   - Connect to broader psychology themes
   - Address potential exam questions

Focus on accuracy, educational value, and depth appropriate for AQA Psychology 7182 A-Level students.`;

    return callAIJsonOnly(enhancedPrompt, null, modelName || getSelectedOpenAIModel('gpt-4o-mini'));
  };

  return {
    callAI,
    callAIWithVault,
    callAIForExam,
    callAIForRevision,
    callAIWithPublicSources,
    callAIJsonOnly,
    isLoading: false // You can wire this into a true loading state if needed
  };
}
