import React, { useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';
import ancientPhilosophyConceptMap from '../data/ancientPhilosophyConceptMap';
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

function ConceptMapView({ conceptMapData }) {
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'node' or 'edge'

  const data = conceptMapData || ancientPhilosophyConceptMap;

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 relative">
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
                  <div className="mb-2 text-sm text-gray-600">{selected.data?.rationale || 'No rationale provided.'}</div>
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