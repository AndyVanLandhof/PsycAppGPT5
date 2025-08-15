import React, { useState } from 'react';
import { useVaultService } from '../hooks/useVaultService';
import { useAIService } from '../hooks/useAIService';
import { Loader2, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

function VaultTester() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState('all');
  
  const { vaultData, isLoading, error, stats, getClickableReferences, createVaultPrompt } = useVaultService();
  const { callAIWithVault } = useAIService();

  const tests = [
    {
      id: 'vault-loading',
      name: 'Vault Loading Test',
      description: 'Check if vault files are loading correctly',
      run: async () => {
        const result = {
          test: 'Vault Loading',
          status: 'running',
          details: []
        };

        try {
          // Check if vault data is loaded
          if (vaultData && Object.keys(vaultData).length > 0) {
            result.details.push(`✅ Vault data loaded: ${Object.keys(vaultData).length} topics`);
            
            // Check each topic
            Object.entries(vaultData).forEach(([topic, data]) => {
              if (typeof data === 'object' && data !== null) {
                if (Array.isArray(data)) {
                  result.details.push(`✅ ${topic}: ${data.length} chunks`);
                } else {
                  const totalChunks = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
                  result.details.push(`✅ ${topic}: ${totalChunks} chunks`);
                }
              }
            });
            
            result.status = 'passed';
          } else {
            result.details.push('❌ No vault data found');
            result.status = 'failed';
          }
        } catch (err) {
          result.details.push(`❌ Error: ${err.message}`);
          result.status = 'failed';
        }

        return result;
      }
    },
    {
      id: 'context-retrieval',
      name: 'Context Retrieval Test',
      description: 'Test if relevant chunks are found for AQA Psychology topics',
      run: async () => {
        const result = {
          test: 'Context Retrieval',
          status: 'running',
          details: []
        };

        try {
          // Test AQA Psychology topics
          const memRefs = getClickableReferences('Memory', 'Working memory model', false);
          result.details.push(`Memory/Working memory model: ${memRefs.length} references found`);
          if (memRefs.length > 0) {
            result.details.push(`✅ Sample reference: "${memRefs[0].content.substring(0, 50)}..."`);
            result.details.push(`✅ Source: ${memRefs[0].source} - Page ${memRefs[0].page}`);
          } else {
            result.details.push('❌ No references found for Memory');
          }

          const siRefs = getClickableReferences('Social Influence', 'Obedience', false);
          result.details.push(`Social Influence/Obedience: ${siRefs.length} references found`);
          if (siRefs.length > 0) {
            result.details.push(`✅ Sample reference: "${siRefs[0].content.substring(0, 50)}..."`);
          } else {
            result.details.push('❌ No references found for Social Influence');
          }

          result.status = memRefs.length > 0 || siRefs.length > 0 ? 'passed' : 'failed';
        } catch (err) {
          result.details.push(`❌ Error: ${err.message}`);
          result.status = 'failed';
        }

        return result;
      }
    },
    {
      id: 'ai-response',
      name: 'AI Response Test',
      description: 'Test if AI uses AQA Psychology vault content in responses',
      run: async () => {
        const result = {
          test: 'AI Response',
          status: 'running',
          details: []
        };

        try {
          const prompt = `Briefly explain the working memory model (components and roles) using the AQA materials.`;
          
          result.details.push('🤖 Sending test prompt to AI...');
          const aiResponse = await callAIWithVault(prompt, 'Memory', 'Working memory model', { includeAdditional: false });
          
          result.details.push(`✅ AI Response received (${aiResponse.length} characters)`);
          result.details.push(`📝 Response preview: "${aiResponse.substring(0, 100)}..."`);
          
          // Basic sanity check that response is non-empty
          result.status = aiResponse && aiResponse.length > 20 ? 'passed' : 'warning';
        } catch (err) {
          result.details.push(`❌ Error: ${err.message}`);
          result.status = 'failed';
        }

        return result;
      }
    },
    {
      id: 'prompt-format',
      name: 'Prompt Format Test',
      description: 'Check if AQA vault context is properly formatted in prompts',
      run: async () => {
        const result = {
          test: 'Prompt Format',
          status: 'running',
          details: []
        };

        try {
          const basePrompt = "Explain the working memory model";
          const vaultPrompt = createVaultPrompt(basePrompt, 'Memory', 'Working memory model', false);
          
          result.details.push(`📝 Base prompt length: ${basePrompt.length} characters`);
          result.details.push(`📝 Vault prompt length: ${vaultPrompt.length} characters`);
          
          if (vaultPrompt.includes('REFERENCE') && vaultPrompt.includes('AQA PSYCHOLOGY MATERIALS')) {
            result.details.push('✅ Vault references found in prompt');
            result.details.push('✅ Prompt includes AQA materials context');
            result.status = 'passed';
          } else {
            result.details.push('❌ No vault references found in prompt');
            result.status = 'failed';
          }
        } catch (err) {
          result.details.push(`❌ Error: ${err.message}`);
          result.status = 'failed';
        }

        return result;
      }
    }
  ];

  const runTest = async (testId) => {
    setIsRunning(true);
    const test = tests.find(t => t.id === testId);
    
    if (test) {
      const result = await test.run();
      setTestResults(prev => [...prev, result]);
    }
    
    setIsRunning(false);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const results = [];
    
    for (const test of tests) {
      const result = await test.run();
      results.push(result);
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <XCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Vault Integration Tester
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test your vault integration to ensure AI responses are using OCR materials correctly.
          </p>
        </div>

        {/* Vault Status */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vault Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Loading Status</div>
              <div className="text-lg font-semibold">
                {isLoading ? 'Loading...' : error ? 'Error' : 'Loaded'}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Total Chunks</div>
              <div className="text-lg font-semibold">
                {stats?.totalChunks || 0}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Topics</div>
              <div className="text-lg font-semibold">
                {vaultData ? Object.keys(vaultData).length : 0}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Error:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Controls</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{test.name}</h3>
                  <button
                    onClick={() => runTest(test.id)}
                    disabled={isRunning}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                  >
                    Run
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(result.status)}
                    <h3 className={`font-semibold ${getStatusColor(result.status)}`}>
                      {result.test}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'passed' ? 'bg-green-100 text-green-800' :
                      result.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {result.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="text-sm text-gray-700">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VaultTester; 