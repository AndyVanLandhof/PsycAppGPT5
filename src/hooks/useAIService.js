import { useVaultService } from './useVaultService';

export function useAIService() {
  const OPENAI_API_KEY = "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";         // 🔁 Replace with your OpenAI key
  const ANTHROPIC_API_KEY = "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";  // 🔁 Replace with your Claude key

  const { createVaultPrompt, getExamContext, getRevisionContext } = useVaultService();

  const callAI = async (prompt, model = "ChatGPT", options = {}) => {
    const { topic, subTopic, includeAdditional = false, useVault = true } = options;
    
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

      // Default to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: finalPrompt }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      console.log("[OpenAI raw]", data);
      return data?.choices?.[0]?.message?.content || "ChatGPT did not return a valid response.";
    } catch (err) {
      console.error("[AI Error]", err);
      return "Something went wrong. Please try again.";
    }
  };

  // Enhanced AI call with vault context
  const callAIWithVault = async (prompt, topic, subTopic, options = {}) => {
    const { includeAdditional = false, model = "ChatGPT" } = options;
    
    return callAI(prompt, model, {
      topic,
      subTopic,
      includeAdditional,
      useVault: true
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
    
    return callAI(enhancedPrompt, model, { useVault: false });
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
    
    return callAI(enhancedPrompt, model, { useVault: false });
  };

  // Get AI response using public sources (OCR curriculum + academic knowledge)
  const callAIWithPublicSources = async (prompt, topic, subTopic, model = "ChatGPT") => {
    const enhancedPrompt = `You are an expert OCR Religious Studies tutor with deep knowledge of the H573 curriculum. The student is studying ${subTopic || topic} and asks: "${prompt}"

Please provide a comprehensive, accurate answer using:

1. **OCR H573 Religious Studies Curriculum Knowledge:**
   - Official OCR specification content
   - Standard A-Level religious studies concepts
   - Required knowledge for H573 exam

2. **Academic Sources and Scholars:**
   - Well-known philosophers, theologians, and scholars in this field
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
   - Connect to broader religious studies themes
   - Address potential exam questions

Focus on accuracy, educational value, and depth appropriate for A-Level Religious Studies students.`;

    return callAI(enhancedPrompt, model, { useVault: false });
  };

  return {
    callAI,
    callAIWithVault,
    callAIForExam,
    callAIForRevision,
    callAIWithPublicSources,
    isLoading: false // You can wire this into a true loading state if needed
  };
}
