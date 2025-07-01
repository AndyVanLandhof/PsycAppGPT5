import React, { useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';
import masterPhilosophyConceptMap from '../data/masterPhilosophyConceptMap';
import masterEthicsConceptMap from '../data/masterEthicsConceptMap';
import masterChristianityConceptMap from '../data/masterChristianityConceptMap';
import 'react-flow-renderer/dist/style.css';

function MasterConceptMapView({ onBack, componentType = 'philosophy' }) {
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'node' or 'edge'

  // Get the appropriate concept map data based on component type
  const getConceptMapData = () => {
    switch (componentType.toLowerCase()) {
      case 'philosophy':
        return masterPhilosophyConceptMap;
      case 'ethics':
        return masterEthicsConceptMap;
      case 'christianity':
        return masterChristianityConceptMap;
      default:
        return masterPhilosophyConceptMap;
    }
  };

  const conceptMapData = getConceptMapData();

  const handleElementClick = (event, element) => {
    setSelected(element);
    setSelectedType(element.source ? 'edge' : 'node');
  };

  const handleModalClose = (e) => {
    if (e.target.id === 'concept-modal-bg' || e.type === 'keydown') {
      setSelected(null);
      setSelectedType(null);
    }
  };

  React.useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const getComponentTitle = () => {
    switch (componentType.toLowerCase()) {
      case 'philosophy':
        return 'Philosophy of Religion';
      case 'ethics':
        return 'Ethics of Religion';
      case 'christianity':
        return 'Christian Thought';
      default:
        return 'Philosophy of Religion';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-4">
          <button
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 text-lg font-semibold"
            onClick={onBack}
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow">
            {getComponentTitle()} - Master Concept Map
          </h1>
        </div>
        <ReactFlow
          nodes={conceptMapData.nodes}
          edges={conceptMapData.edges}
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
        {selected && (
          <div
            id="concept-modal-bg"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={handleModalClose}
          >
            <div className="bg-white rounded-xl shadow-2xl p-10 max-w-2xl w-full relative animate-fade-in mx-4">
              <button
                onClick={() => { setSelected(null); setSelectedType(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
              {selectedType === 'node' ? (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">{selected.data.label}</h2>
                  <div className="mb-4 text-lg text-gray-700 leading-relaxed">{selected.data.description}</div>
                  {selected.data.examples && selected.data.examples.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold text-gray-800 mb-2 text-xl">Examples:</div>
                      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                        {selected.data.examples.map((ex, i) => (
                          <li key={i} className="leading-relaxed">{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.data.scholars && selected.data.scholars.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold text-gray-800 mb-2 text-xl">Key Scholars/Writers:</div>
                      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                        {selected.data.scholars.map((s, i) => (
                          <li key={i} className="leading-relaxed"><span className="font-bold">{s.name}:</span> {s.idea}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.data.references && (
                    <div className="mt-4 text-base text-blue-700 font-medium">References: {selected.data.references.join(', ')}</div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">{selected.label}</h2>
                  <div className="mb-4 text-lg text-gray-700 leading-relaxed">{selected.data?.rationale || 'No rationale provided.'}</div>
                  {selected.data?.examples && selected.data.examples.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold text-gray-800 mb-2 text-xl">Examples:</div>
                      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                        {selected.data.examples.map((ex, i) => (
                          <li key={i} className="leading-relaxed">{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.data?.scholars && selected.data.scholars.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold text-gray-800 mb-2 text-xl">Key Scholars/Writers:</div>
                      <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
                        {selected.data.scholars.map((s, i) => (
                          <li key={i} className="leading-relaxed"><span className="font-bold">{s.name}:</span> {s.idea}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MasterConceptMapView; 