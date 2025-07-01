import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFViewer({ pdfUrl, pageNumber, onClose }) {
  const [currentPage, setCurrentPage] = useState(pageNumber || 1);
  const [zoom, setZoom] = useState(1.0);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (numPages ? Math.min(prev + 1, numPages) : prev + 1));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    // Clamp currentPage to valid range
    setCurrentPage(page => Math.max(1, Math.min(page, numPages)));
  };

  const onDocumentLoadError = (err) => {
    setError('Failed to load PDF.');
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Source Document
            </h3>
            <span className="text-sm text-gray-600">
              Page {currentPage}{numPages ? ` / ${numPages}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
          <div className="flex justify-center">
            <div 
              className="bg-gray-100 rounded-lg shadow-inner"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-center text-gray-500 p-8">Loading PDF...</div>}
                error={<div className="text-center text-red-500 p-8">Failed to load PDF.</div>}
              >
                {error ? (
                  <div className="text-center text-red-500 p-8">{error}</div>
                ) : (
                  <Page
                    pageNumber={currentPage}
                    width={700}
                    loading={<div className="text-center text-gray-500 p-8">Loading page...</div>}
                    error={<div className="text-center text-red-500 p-8">Failed to load page.</div>}
                  />
                )}
              </Document>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 p-4 border-t">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage}{numPages ? ` / ${numPages}` : ''}
          </span>
          <button
            onClick={handleNextPage}
            disabled={numPages ? currentPage >= numPages : false}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFViewer; 