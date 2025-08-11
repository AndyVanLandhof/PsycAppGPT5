import React, { useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';
import { nodes as ancientPhilosophyNodes, edges as ancientPhilosophyEdges } from '../data/ancientPhilosophyConceptMap';
import { useAIService } from '../hooks/useAIService';
import { Sparkles, Loader2, X, MessageCircle } from 'lucide-react';
import 'react-flow-renderer/dist/style.css';

/**
 * @typedef {Object} Concept
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {'weak'|'learning'|'mastered'} mastery
 * @property {string[]} [references]
 */

/**
 * @typedef {Object} Relationship
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {string} type
 * @property {number} strength
 */

function ConceptMapView({ conceptMapData, onBack, topic, subTopic }) {
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'node' or 'edge'
  const [showAIBox, setShowAIBox] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseSource, setResponseSource] = useState(null); // 'vault' or 'public'

  const { callAIWithVault, callAIWithPublicSources } = useAIService();
  const data = conceptMapData || { nodes: ancientPhilosophyNodes, edges: ancientPhilosophyEdges };

  const handleElementClick = (event, element) => {
    // For nodes: only allow popup if description is meaningful
    if (!element.source) {
      const desc = element.data?.description?.trim();
      if (!desc || desc === '' || desc.toLowerCase().includes('no critique provided') || desc.toLowerCase().includes('no rationale provided')) {
        return;
      }
    }
    // For edges: only allow popup if there's meaningful content
    if (element.source) {
      // Check if edge has rationale data
      const rationale = element.data?.rationale?.trim();
      // If no rationale data, don't show popup (edges in our map don't have rationale)
      if (!rationale) {
        return;
      }
      // If rationale exists but is empty or placeholder, don't show popup
      if (rationale === '' || rationale.toLowerCase().includes('no critique provided') || rationale.toLowerCase().includes('no rationale provided')) {
        return;
      }
    }
    setSelected(element);
    setSelectedType(element.source ? 'edge' : 'node');
  };

  const handleModalClose = (e) => {
    if (e.target.id === 'concept-modal-bg' || e.type === 'keydown') {
      setSelected(null);
      setSelectedType(null);
    }
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setAiResponse('');
    
    try {
      // First, try to get vault context for the specific topic/subtopic
      const enhancedQuestion = `I'm studying the concept map for ${subTopic || 'this topic'}. ${question}`;
      
      // Try vault-first approach
      let response = await callAIWithVault(enhancedQuestion, topic, subTopic);
      
      // Check if the response indicates insufficient vault content
      const insufficientVaultIndicators = [
        'i don\'t have specific information',
        'i don\'t have access to',
        'i don\'t have detailed information',
        'i don\'t have specific context',
        'i don\'t have the exact',
        'i don\'t have comprehensive',
        'based on general knowledge',
        'from general understanding',
        'without specific reference',
        'no mention of',
        'not mentioned in',
        'not found in',
        'not included in',
        'not covered in',
        'not discussed in',
        'not addressed in',
        'not present in',
        'not available in',
        'not provided in',
        'not contained in',
        'not referenced in',
        'not detailed in',
        'not explained in',
        'not described in',
        'not outlined in',
        'not listed in',
        'not cited in',
        'not noted in',
        'not recorded in',
        'not documented in',
        'additional resources outside',
        'additional sources outside',
        'other resources would be necessary',
        'other sources would be necessary',
        'external resources',
        'external sources',
        'outside the provided materials',
        'beyond the provided materials',
        'not in the provided materials',
        'not within the provided materials',
        'do not contain any information',
        'do not contain information',
        'does not contain any information',
        'does not contain information',
        'contain no information',
        'contains no information',
        'no information about',
        'no information on',
        'no information regarding',
        'no information concerning',
        'no information related to',
        'no information available',
        'no information provided',
        'no information found',
        'no information included',
        'no information covered',
        'no information discussed',
        'no information addressed',
        'no information present',
        'no information available',
        'no information contained',
        'no information referenced',
        'no information detailed',
        'no information explained',
        'no information described',
        'no information outlined',
        'no information listed',
        'no information cited',
        'no information noted',
        'no information recorded',
        'no information documented',
        'sorry, but',
        'i\'m sorry, but',
        'i am sorry, but',
        'unfortunately,',
        'regrettably,',
        'sadly,',
        'i apologize, but',
        'i apologise, but'
      ];
      
      const responseLower = response.toLowerCase();
      const foundIndicator = insufficientVaultIndicators.find(indicator => 
        responseLower.includes(indicator)
      );
      
      // Additional check for negative responses
      const negativeResponseIndicators = [
        'sorry',
        'unfortunately',
        'regrettably',
        'i apologize',
        'i apologise',
        'cannot provide',
        'unable to provide',
        'do not have',
        'does not have',
        'no information',
        'not available',
        'not found',
        'not included',
        'not mentioned',
        'not covered',
        'not discussed',
        'not addressed',
        'not present',
        'not contained',
        'not referenced',
        'not detailed',
        'not explained',
        'not described',
        'not outlined',
        'not listed',
        'not cited',
        'not noted',
        'not recorded',
        'not documented'
      ];
      
      const hasNegativeResponse = negativeResponseIndicators.some(indicator => 
        responseLower.includes(indicator)
      );
      
      const hasInsufficientVaultContent = !!foundIndicator || hasNegativeResponse;
      
      console.log('Vault response:', response);
      console.log('Found indicator:', foundIndicator);
      console.log('Has negative response:', hasNegativeResponse);
      console.log('Has insufficient vault content:', hasInsufficientVaultContent);
      
      // If vault content seems insufficient, try with public sources
      if (hasInsufficientVaultContent) {
        console.log('Falling back to public sources...');
        try {
          response = await callAIWithPublicSources(question, topic, subTopic);
          
          // Add a note that this response uses public sources
          response += "\n\n[Note: This response is based on standard OCR Religious Studies curriculum and academic sources, as specific vault materials were not available for this question.]";
        } catch (fallbackError) {
          console.error('Fallback to public sources failed:', fallbackError);
          
          // Direct fallback using basic callAI
          const directPrompt = `You are an expert OCR Religious Studies tutor. A student studying ${subTopic || topic} asks: "${question}"

Please provide a comprehensive answer using standard OCR H573 Religious Studies curriculum knowledge, well-known academic sources, and current understanding in religious studies. Focus on accuracy and educational value for A-Level students. Include relevant scholars, dates, and key concepts.`;
          
          try {
            response = await callAI(directPrompt, "ChatGPT", { useVault: false });
            response += "\n\n[Note: This response is based on standard OCR Religious Studies curriculum and academic sources.]";
          } catch (directError) {
            console.error('Direct fallback also failed:', directError);
            response = `I apologize, but I'm unable to provide a comprehensive answer about ${question} at the moment. This might be because the specific information isn't available in the current materials. Please try rephrasing your question or ask about a different aspect of the topic.`;
          }
        }
      }
      
      setAiResponse(response);
      setResponseSource(hasInsufficientVaultContent ? 'public' : 'vault');
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to generate the AQA Psychology concept map prompt
  const getAqaConceptMapPrompt = (topic, subTopic) => `You are an expert AQA Psychology teacher. Create a concept map for the topic "${topic}"${subTopic ? `, sub-topic "${subTopic}"` : ''}.

Show links between:
- Theories and supporting studies
- Competing/alternative explanations
- Methodological and ethical considerations
- Different approaches (e.g., Behaviourist, Cognitive, Biological)

For each node, include:
- Name (theory, study, approach, or key concept)
- Type (theory, study, approach, ethical issue, etc)

For each edge, include:
- Source and target
- Relationship type ("supports", "criticizes", "alternative", "ethical issue", etc)

If relevant, also provide a comparative table of approaches (rows: approaches, columns: key features, strengths, limitations).

Return in this JSON format:
{
  "nodes": [
    { "id": "milgram", "label": "Milgram (1963)", "type": "study" },
    { "id": "agency-theory", "label": "Agency Theory", "type": "theory" },
    ...
  ],
  "edges": [
    { "source": "milgram", "target": "agency-theory", "type": "supports" },
    { "source": "zimbardo", "target": "milgram", "type": "alternative" },
    { "source": "milgram", "target": "ethics", "type": "ethical issue" },
    ...
  ],
  "comparativeTable": {
    "headers": ["Approach", "Key Features", "Strengths", "Limitations"],
    "rows": [
      ["Behaviourist", "Learning via conditioning", "Scientific, objective", "Ignores cognition"],
      ["Cognitive", "Information processing", "Explains memory", "Reductionist"],
      ...
    ]
  }
}`;

  React.useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 relative">
        {/* Back button */}
        {onBack && (
          <button 
            className="absolute top-4 left-4 z-10 text-blue-600 underline bg-white bg-opacity-80 px-3 py-2 rounded-lg shadow-sm hover:bg-opacity-100 transition-all"
            onClick={onBack}
          >
            ← Back to Study Methods
          </button>
        )}

        {/* AI Question Box */}
        <div className="absolute top-4 right-4 z-10">
          {!showAIBox ? (
            <button
              onClick={() => setShowAIBox(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Ask a Question
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => {
                    setShowAIBox(false);
                    setQuestion('');
                    setAiResponse('');
                    setResponseSource(null);
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded mb-3 text-sm"
                placeholder="Ask about anything on this concept map..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
              />
              
              <button
                onClick={handleAskAI}
                disabled={isLoading || !question.trim()}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  'Ask AI'
                )}
              </button>
              
              {/* Test button for debugging */}
              <button
                onClick={async () => {
                  setIsLoading(true);
                  setAiResponse('');
                  try {
                    const testResponse = await callAIWithPublicSources(question || "Who was Alvin Plantinga?", topic, subTopic);
                    setAiResponse(testResponse + "\n\n[TEST: This response used public sources directly]");
                    setResponseSource('public');
                  } catch (error) {
                    setAiResponse('Test failed: ' + error.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full mt-2 bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Test Public Sources
              </button>
              
              {aiResponse && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      responseSource === 'vault' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {responseSource === 'vault' ? '📚 Vault Sources' : '🌐 Public Sources'}
                    </div>
                  </div>
                  <div className="text-sm text-blue-800 whitespace-pre-line">{aiResponse}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <ReactFlow
          nodes={data.nodes}
          edges={data.edges}
          onNodeClick={handleElementClick}
          onEdgeClick={handleElementClick}
          fitView
          panOnScroll
          zoomOnScroll
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
        {/* Modal popup for node/edge details */}
        {selected && (
          <div
            id="concept-modal-bg"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={handleModalClose}
          >
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
              <button
                onClick={() => { setSelected(null); setSelectedType(null); }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
              {selectedType === 'node' ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">{selected.data.label}</h2>
                  <div className="mb-2 text-sm text-gray-600">{selected.data.description}</div>
                  {selected.data.references && (
                    <div className="mt-2 text-xs text-blue-700">References: {selected.data.references.join(', ')}</div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2">{selected.label}</h2>
                  <div className="mb-2 text-sm text-gray-600">{selected.data?.rationale}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConceptMapView; 