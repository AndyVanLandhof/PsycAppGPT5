import React, { useState, useEffect, useMemo } from "react";
import { themeMap } from "../data/themeMap";
import { useAIService } from "../hooks/useAIService";
import { useVaultService } from "../hooks/useVaultService";
import { useElevenLabsTTS } from "../hooks/useElevenLabsTTS";
import { Loader2, Volume2, Pause, StopCircle, X, FileText, ExternalLink, Play } from "lucide-react";
import PDFViewer from "./PDFViewer";

// Robust JSON parsing function to handle various GPT response formats
const parseAIResponse = (response) => {
  try {
    // First, try direct JSON parsing
    return JSON.parse(response);
  } catch (error) {
    console.log('Direct JSON parsing failed, attempting to clean response...');
    
    // Remove code block markers if present
    let cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/^```\s*/g, '')
      .trim();
    
    try {
      return JSON.parse(cleanedResponse);
    } catch (secondError) {
      console.log('Cleaned JSON parsing failed, attempting to extract JSON...');
      
      // Try to find JSON object in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (thirdError) {
          console.log('JSON extraction failed');
        }
      }
      
      // If all parsing attempts fail, create a fallback response
      console.error('Failed to parse AI response:', response);
      return {
        comprehensiveSummary: "I apologize, but I encountered an issue formatting my response. Here's what I can tell you: " + cleanedResponse.substring(0, 500) + "...",
        practicalExamples: ["Please try asking your question again for a properly formatted response."],
        keyInsights: ["The AI response was received but couldn't be parsed correctly."],
        scholarlyPerspectives: ["This appears to be a technical formatting issue."]
      };
    }
  }
};

// Map AQA JSON keys to UI keys
const normalizeStudyResponseShape = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const hasAQAKeys = (
    'ao1_summary' in obj || 'ao2_application' in obj || 'ao1_key_studies' in obj || 'ao3_strengths' in obj || 'ao3_limitations' in obj
  );
  if (!hasAQAKeys) return obj;
  const summary = obj.ao1_summary || '';
  const application = obj.ao2_application ? [obj.ao2_application] : [];
  const studies = Array.isArray(obj.ao1_key_studies) ? obj.ao1_key_studies : [];
  const strengths = Array.isArray(obj.ao3_strengths) ? obj.ao3_strengths : [];
  const limitations = Array.isArray(obj.ao3_limitations) ? obj.ao3_limitations : [];
  const pitfalls = Array.isArray(obj.exam_pitfalls) ? obj.exam_pitfalls : [];

  return {
    comprehensiveSummary: summary,
    practicalExamples: [...application, ...pitfalls],
    keyInsights: [...studies],
    scholarlyPerspectives: [...strengths, ...limitations]
  };
};

// Convert a long paragraph into bullet items
const splitTextToBullets = (text) => {
  if (!text || typeof text !== 'string') return [];
  const t = text.trim();
  // If the text already contains bullets, split by common bullet markers
  if (t.includes('\n- ') || t.includes('•') || t.includes('\n* ')) {
    return t
      .split(/\n[-*]\s+|•\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  // Otherwise, split into sentences for a readable bullet list
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
};

// Map all topic IDs to their top-level subject folder
const topicIdToFolder = {
  // Philosophy
  "ancient-philosophical-influences": "Philosophy",
  "soul-mind-body": "Philosophy",
  "nature-attributes-god": "Philosophy",
  "arguments-existence-god": "Philosophy",
  "problem-of-evil": "Philosophy",
  "religious-experience": "Philosophy",
  "religious-language": "Philosophy",
  "miracles": "Philosophy",
  // Ethics
  "natural-law": "Ethics",
  "situation-ethics": "Ethics",
  "kantian-ethics": "Ethics",
  "utilitarianism": "Ethics",
  "euthanasia": "Ethics",
  "business-ethics": "Ethics",
  // Christianity
  "christian-beliefs": "Christianity",
  "jesus-christ": "Christianity",
  "christian-practices": "Christianity",
  "gender-sexuality": "Christianity",
  "death-afterlife": "Christianity",
  "religious-pluralism": "Christianity",
  "liberation-theology": "Christianity",
  // Add more as needed
};
const typeFolderMap = {
  core: "Core",
  additional: "Additional",
  // Add more aliases as needed
};

function getTopLevelFolder(topicId) {
  return topicIdToFolder[topicId] || "Philosophy"; // Default to Philosophy if not found
}

function StudyContent({ topic, onBack }) {
  const subTopic = topic.subTopic;
  // Use per-subtopic themes from themeMap
  const themes = themeMap[subTopic?.id] || [];
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupResponse, setPopupResponse] = useState(null);
  const [activeAudioSection, setActiveAudioSection] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [includeAdvanced, setIncludeAdvanced] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);

  const { callAIWithVault, callAIWithPublicSources } = useAIService();
  const { getClickableReferences, isVaultLoaded, getRelevantContext } = useVaultService();
  const { speak, playPreparedAudio, audioReady, audioLoading: ttsAudioLoading, audioError: ttsAudioError, pause, stop, ttsState } = useElevenLabsTTS();

  // Detect AQA components (original behavior)
  const isAQA = ["Compulsory", "Option 1", "Option 2", "Option 3"].includes(topic.component);

  // Defer vault reference computation until after we have a response and the vault is loaded
  const vaultReferences = useMemo(() => {
    try {
      if (!response) return [];
      if (!isVaultLoaded()) return [];
      return getClickableReferences(topic.title, subTopic.title, includeAdvanced);
    } catch (_) {
      return [];
    }
  }, [response, includeAdvanced, topic.title, subTopic.title, isVaultLoaded, getClickableReferences]);

  // Reset active audio section when audio ends
  useEffect(() => {
    if (ttsState === 'idle') {
      setActiveAudioSection(null);
    }
  }, [ttsState]);

  const handleSubmit = async () => {
    // New AQA Psychology prompt (robust to missing sub-topics/themes)
    const subTitle = (topic?.subTopic && topic.subTopic.title) ? topic.subTopic.title : topic.title;
    const themeLine = selectedTheme ? `\nTHEME: ${selectedTheme}` : '';
    const subLine = subTitle ? `\nSUB-TOPIC: ${subTitle}` : '';
    const basePrompt = `You are an expert AQA Psychology teacher creating study content for AQA Psychology 7182 students.

TOPIC: ${topic.title}${subLine}${themeLine}

Respond ONLY with valid JSON in the format below. Do not include any extra text, markdown, or commentary.

Output the following sections:
- AO1 Summary: 200–300 words; concise but thorough summary of the topic (knowledge and understanding)
- AO2 Application: Example of applying the topic to a scenario, case study, or data (application)
- AO1 Key Studies: List and explain 2-3 key studies (with researcher and year)
- AO3 Strengths: 2-3 strengths of the theory/model (analysis/evaluation)
- AO3 Limitations: 2-3 limitations of the theory/model (analysis/evaluation)
- Exam Pitfalls: Common mistakes students make on this topic

Constraints:
- Ensure "ao1_summary" is between 200 and 300 words (strictly).

Return in this JSON format:
{
  "ao1_summary": "...",
  "ao2_application": "...",
  "ao1_key_studies": ["...", "..."],
  "ao3_strengths": ["...", "..."],
  "ao3_limitations": ["...", "..."],
  "exam_pitfalls": ["...", "..."]
}
`;

    setIsLoading(true);
    let result = null;
    try {
      // For AQA Psychology, always use public AI sources
      if (isAQA) {
        result = await callAIWithPublicSources(
          basePrompt,
          topic.title,
          subTopic?.title || topic.title
        );
      } else {
        const vaultReady = isVaultLoaded() && getRelevantContext(topic.title, subTopic.title, includeAdvanced).length > 0;
        if (vaultReady) {
          result = await callAIWithVault(
            basePrompt,
            topic.title, 
            subTopic?.title || topic.title, 
            { includeAdditional: includeAdvanced }
          );
        } else {
          result = await callAIWithPublicSources(
            basePrompt,
            topic.title,
            subTopic?.title || topic.title
          );
        }
      }
      console.log('AI raw response:', result);
      const parsed = parseAIResponse(result);
      const normalized = normalizeStudyResponseShape(parsed);
      if (customQuestion && !selectedTheme) {
        setPopupResponse(normalized);
        setShowPopup(true);
      } else {
        setResponse(normalized);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err, result);
      // Show the raw AI response as a fallback
      const errorResponse = { 
        error: "Failed to parse AI response.",
        raw: result
      };
      if (customQuestion && !selectedTheme) {
        setPopupResponse(errorResponse);
        setShowPopup(true);
      } else {
        setResponse(errorResponse);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Replace the handleViewPDF function with robust logic
  const handleViewPDF = (reference) => {
    // Prefer the explicit pdfUrl provided by the vault service
    const pdfPath = reference?.pdfUrl || (reference?.source ? `/vault/${reference.source}` : null);
    if (!pdfPath) {
      alert("No PDF path found for this reference.");
      return;
    }
    const title = reference?.title || reference?.source || 'Source Document';
    setSelectedPDF({
      path: pdfPath,
      page: reference?.page || reference?.pageNumber || 1,
      title
    });
    setShowPDFViewer(true);
  };

  return (
    <div className="bg-gradient-to-br from-pink-100 to-pink-200 text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          Ask AI About This Topic
        </h2>
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="text-xl font-semibold text-gray-800 text-center">{subTopic?.title}</div>
          <div className="text-base text-gray-600 text-center max-w-2xl">{topic?.description}</div>
        </div>
        {onBack && (
          <div className="flex justify-center mb-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              onClick={onBack}
            >
              ← Back to {topic.title}
            </button>
          </div>
        )}

        <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
          {/* Advanced Content Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAdvanced}
                onChange={(e) => setIncludeAdvanced(e.target.checked)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Include advanced content (A* level materials)
              </span>
            </label>
            <p className="text-xs text-gray-600 mt-1 ml-6">
              When enabled, AI will reference additional academic texts and source materials for more advanced insights.
            </p>
          </div>

          {themes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-purple-700">Select a theme:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themes.map((theme, index) => (
                  <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={selectedTheme === theme}
                      onChange={() => setSelectedTheme(theme)}
                      className="text-blue-600"
                    />
                    <span className="text-gray-800">{theme}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or ask AI anything about this topic:
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your question here..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              rows="3"
            />
          </div>

          {(() => {
            const canAsk = !!customQuestion || (themes.length === 0) || !!selectedTheme;
            return (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !canAsk}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Response...
                  </div>
                ) : (
                  "Ask AI"
                )}
              </button>
            );
          })()}
        </div>

        {response && (
          <div className="space-y-6 max-w-4xl mx-auto pb-8 bg-gradient-to-br from-blue-50 to-indigo-100">
            {[
              { key: "comprehensiveSummary", color: "bg-blue-50 border-blue-200" },
              { key: "practicalExamples", color: "bg-yellow-50 border-yellow-200" },
              { key: "keyInsights", color: "bg-green-50 border-green-200" },
              { key: "scholarlyPerspectives", color: "bg-pink-50 border-pink-200" }
            ].map((section, i) => (
              <div key={i} className={`${section.color} border rounded-lg shadow-sm p-6 relative`}>
                <h4 className="font-semibold text-lg text-purple-700 capitalize mb-4">
                  {section.key.replace(/([A-Z])/g, " $1")}
                </h4>
                
                <div className="pr-16">
                  {section.key === "comprehensiveSummary" && (
                    <>
                      <ul className="list-disc ml-5 text-gray-800 space-y-2">
                        {splitTextToBullets(response[section.key]).map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                      {vaultReferences.length > 0 && (
                        <div className="mt-3">
                          <a
                            href={`${vaultReferences[0].pdfUrl}${vaultReferences[0].page ? `#page=${vaultReferences[0].page}` : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open textbook: {vaultReferences[0].source}{vaultReferences[0].page ? ` (p. ${vaultReferences[0].page})` : ''}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                  {Array.isArray(response[section.key]) && (
                    <ul className="list-disc ml-5 text-gray-800 space-y-2">
                      {response[section.key].map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="absolute top-6 right-6 flex gap-2">
                  {/* Speaker button (fetches audio) */}
                  <button 
                    onClick={async () => {
                      const textToSpeak = Array.isArray(response[section.key]) 
                        ? response[section.key].join('. ') 
                        : response[section.key];
                      setActiveAudioSection(section.key);
                      await speak(textToSpeak);
                    }}
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === section.key && ttsState === 'playing' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Fetch audio"
                    disabled={ttsAudioLoading}
                  >
                    {ttsAudioLoading && activeAudioSection === section.key ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <Volume2 className={`w-5 h-5 ${activeAudioSection === section.key && ttsState === 'playing' ? 'text-blue-800' : 'text-blue-600'}`} />
                    )}
                  </button>
                  {/* Permanent Play button */}
                  <button
                    onClick={playPreparedAudio}
                    disabled={!audioReady || ttsAudioLoading}
                    className={`p-2 rounded-lg transition-colors ${(!audioReady || ttsAudioLoading) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                    title="Play audio"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  {/* Pause button */}
                  <button 
                    onClick={pause}
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === section.key && ttsState === 'paused' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Pause audio"
                  >
                    <Pause className={`w-5 h-5 ${activeAudioSection === section.key && ttsState === 'paused' ? 'text-blue-800' : 'text-blue-600'}`} />
                  </button>
                  {/* Stop button */}
                  <button 
                    onClick={() => {
                      stop();
                      setActiveAudioSection(null);
                    }}
                    className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                      activeAudioSection === section.key && ttsState === 'idle' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                    }`}
                    title="Stop audio"
                  >
                    <StopCircle className={`w-5 h-5 ${activeAudioSection === section.key && ttsState === 'idle' ? 'text-blue-800' : 'text-blue-600'}`} />
                  </button>
                </div>
                {ttsAudioError && activeAudioSection === section.key && (
                  <div className="text-xs text-red-600 mt-2">If you don't hear audio, please click again.</div>
                )}
              </div>
            ))}
            {/* Vault References Section moved here */}
            {vaultReferences.length > 0 && (
              <div className="border rounded-lg shadow-sm p-6 mt-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <h3 className="font-semibold text-lg mb-4 text-purple-700 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Available Source Materials ({vaultReferences.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaultReferences.map((reference) => (
                    <div key={reference.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">
                          Reference {reference.referenceNumber}
                        </h4>
                        <button
                          onClick={() => handleViewPDF(reference)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Page {reference.page}
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {reference.source} - Page {reference.page}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {reference.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {response?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <h3 className="text-red-700 font-semibold mb-2">AI Response (Raw Output)</h3>
            <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">{response.raw}</pre>
            <p className="text-xs text-gray-500 mt-2">The AI response could not be parsed as JSON. Please check your prompt or try again.</p>
          </div>
        )}
      </div>

      {/* Popup Modal for Custom Questions */}
      {showPopup && popupResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">AI Response</h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setPopupResponse(null);
                  setCustomQuestion(""); // Clear input only when popup is closed
                }}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {["comprehensiveSummary", "practicalExamples", "keyInsights", "scholarlyPerspectives"].map((section, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  <h4 className="font-semibold text-lg text-gray-800 capitalize mb-3">
                    {section.replace(/([A-Z])/g, " $1")}
                  </h4>
                  
                  <div className="pr-16">
                    {section === "comprehensiveSummary" && (
                      <>
                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                          {splitTextToBullets(popupResponse[section]).map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                        {vaultReferences.length > 0 && (
                          <div className="mt-3">
                            <a
                              href={`${vaultReferences[0].pdfUrl}${vaultReferences[0].page ? `#page=${vaultReferences[0].page}` : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open textbook: {vaultReferences[0].source}{vaultReferences[0].page ? ` (p. ${vaultReferences[0].page})` : ''}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                    {Array.isArray(popupResponse[section]) && (
                      <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        {popupResponse[section].map((item, idx) => (
                          <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    {/* Speaker button (fetches audio) */}
                    <button 
                      onClick={async () => {
                        const textToSpeak = Array.isArray(popupResponse[section]) 
                          ? popupResponse[section].join('. ') 
                          : popupResponse[section];
                        setActiveAudioSection(section);
                        await speak(textToSpeak);
                      }}
                      className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                        activeAudioSection === section && ttsState === 'playing' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                      }`}
                      title="Fetch audio"
                      disabled={ttsAudioLoading}
                    >
                      {ttsAudioLoading && activeAudioSection === section ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <Volume2 className={`w-5 h-5 ${activeAudioSection === section && ttsState === 'playing' ? 'text-blue-800' : 'text-blue-600'}`} />
                      )}
                    </button>
                    {/* Permanent Play button */}
                    <button
                      onClick={playPreparedAudio}
                      disabled={!audioReady || ttsAudioLoading}
                      className={`p-2 rounded-lg transition-colors ${(!audioReady || ttsAudioLoading) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 text-blue-700 hover:bg-blue-100'}`}
                      title="Play audio"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    {/* Pause button */}
                    <button 
                      onClick={pause}
                      className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                        activeAudioSection === section && ttsState === 'paused' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                      }`}
                      title="Pause audio"
                    >
                      <Pause className={`w-5 h-5 ${activeAudioSection === section && ttsState === 'paused' ? 'text-blue-800' : 'text-blue-600'}`} />
                    </button>
                    {/* Stop button */}
                    <button 
                      onClick={() => {
                        stop();
                        setActiveAudioSection(null);
                      }}
                      className={`hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 ${
                        activeAudioSection === section && ttsState === 'idle' ? 'bg-blue-200 ring-2 ring-blue-400' : ''
                      }`}
                      title="Stop audio"
                    >
                      <StopCircle className={`w-5 h-5 ${activeAudioSection === section && ttsState === 'idle' ? 'text-blue-800' : 'text-blue-600'}`} />
                    </button>
                  </div>
                  {ttsAudioError && activeAudioSection === section && (
                    <div className="text-xs text-red-600 mt-2">If you don't hear audio, please click again.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPDFViewer && selectedPDF && (
        <PDFViewer
          pdfUrl={selectedPDF.path}
          pageNumber={selectedPDF.page}
          onClose={() => {
            setShowPDFViewer(false);
            setSelectedPDF(null);
          }}
        />
      )}
    </div>
  );
}

export default StudyContent;