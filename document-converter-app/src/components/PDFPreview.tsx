import React, { useState, useEffect, useRef } from 'react';

interface PDFPreviewProps {
  file: File;
  signature: string | null;
  signatureType: 'text' | 'canvas';
  signatureText?: string;
  signatureStyle?: string;
  signatureSize?: string;
  signerName?: string;
  onSignaturePosition?: (x: number, y: number, page: number) => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  signature,
  signatureType,
  signatureText,
  signatureStyle,
  signatureSize,
  signerName,
  onSignaturePosition
}) => {
  const [signaturePos, setSignaturePos] = useState({ x: 70, y: 80 });
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  // Standard A4 dimensions for consistent positioning
  const A4_ASPECT_RATIO = 210 / 297; // A4 width/height ratio
  const PREVIEW_HEIGHT = 600;
  const PREVIEW_WIDTH = PREVIEW_HEIGHT * A4_ASPECT_RATIO;

  useEffect(() => {
    // Create PDF preview using object URL
    const objectUrl = URL.createObjectURL(file);
    setPdfDataUrl(objectUrl);
    
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Initialize position and call callback
  useEffect(() => {
    onSignaturePosition?.(signaturePos.x, signaturePos.y, 1);
  }, [signaturePos.x, signaturePos.y, onSignaturePosition]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!containerRef.current || isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate position as percentage of the actual preview area
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Ensure signature stays within bounds
    const boundedX = Math.max(5, Math.min(95, x));
    const boundedY = Math.max(5, Math.min(95, y));

    const newPos = { x: boundedX, y: boundedY };
    setSignaturePos(newPos);
    onSignaturePosition?.(boundedX, boundedY, 1);
  };

  const handleSignatureDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    setIsDragging(true);
    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = signaturePos.x;
    const startPosY = signaturePos.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Calculate movement delta as percentage
      const deltaX = ((moveEvent.clientX - startX) / containerRect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / containerRect.height) * 100;
      
      // Apply movement with bounds checking
      const newX = Math.max(5, Math.min(95, startPosX + deltaX));
      const newY = Math.max(5, Math.min(95, startPosY + deltaY));
      
      const newPos = { x: newX, y: newY };
      setSignaturePos(newPos);
      onSignaturePosition?.(newX, newY, 1);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch events for mobile
  const handleSignatureTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || e.touches.length !== 1) return;
    
    setIsDragging(true);
    const containerRect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startPosX = signaturePos.x;
    const startPosY = signaturePos.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!containerRef.current || moveEvent.touches.length !== 1) return;
      
      moveEvent.preventDefault();
      const moveTouch = moveEvent.touches[0];
      
      // Calculate movement delta as percentage
      const deltaX = ((moveTouch.clientX - startX) / containerRect.width) * 100;
      const deltaY = ((moveTouch.clientY - startY) / containerRect.height) * 100;
      
      // Apply movement with bounds checking
      const newX = Math.max(5, Math.min(95, startPosX + deltaX));
      const newY = Math.max(5, Math.min(95, startPosY + deltaY));
      
      const newPos = { x: newX, y: newY };
      setSignaturePos(newPos);
      onSignaturePosition?.(newX, newY, 1);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getSignatureSize = () => {
    switch (signatureSize) {
      case 'small': return { width: 80, fontSize: 10 };
      case 'large': return { width: 140, fontSize: 16 };
      default: return { width: 110, fontSize: 12 };
    }
  };

  const getSignatureStyle = () => {
    switch (signatureStyle) {
      case 'handwritten': return { fontFamily: 'serif', fontStyle: 'italic', color: '#1e40af' };
      case 'professional': return { fontFamily: 'sans-serif', fontWeight: 'bold', color: '#000000' };
      case 'elegant': return { fontFamily: 'serif', fontStyle: 'normal', color: '#374151' };
      default: return { fontFamily: 'serif', fontStyle: 'italic', color: '#1e40af' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF Preview & Signature Placement
        </h3>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center mb-4">
        <div 
          ref={containerRef}
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg"
          onClick={handleContainerClick}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'crosshair',
            width: `${Math.min(PREVIEW_WIDTH, window.innerWidth - 100)}px`,
            height: `${PREVIEW_HEIGHT}px`,
            maxWidth: '100%'
          }}
        >
          {/* PDF Background */}
          {pdfDataUrl && (
            <div className="absolute inset-0">
              <embed
                src={pdfDataUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="pointer-events-none"
                style={{ border: 'none' }}
              />
            </div>
          )}
          
          {/* PDF Content Overlay for better positioning */}
          <div className="absolute inset-0 bg-white bg-opacity-0">
            {/* Grid lines for positioning reference */}
            <div className="absolute inset-0 opacity-10">
              {/* Horizontal lines */}
              <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-400"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-400"></div>
              <div className="absolute top-3/4 left-0 right-0 h-px bg-blue-400"></div>
              {/* Vertical lines */}
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-blue-400"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-400"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-blue-400"></div>
            </div>
          </div>
          
          {/* Draggable Signature Overlay */}
          {(signature || signatureText) && (
            <div
              ref={signatureRef}
              className={`absolute select-none transition-all duration-200 ${
                isDragging 
                  ? 'cursor-grabbing scale-105 z-50' 
                  : 'cursor-grab hover:scale-105 z-10'
              }`}
              style={{
                left: `${signaturePos.x}%`,
                top: `${signaturePos.y}%`,
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              onMouseDown={handleSignatureDrag}
              onTouchStart={handleSignatureTouchStart}
            >
              {/* Signature Container with Border */}
              <div className={`relative bg-white bg-opacity-90 rounded border-2 transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-600 shadow-2xl' 
                  : 'border-blue-400 hover:border-blue-500 shadow-lg'
              }`}>
                {/* Signature Content */}
                <div className="p-2">
                  {signatureType === 'canvas' && signature ? (
                    <img 
                      src={signature} 
                      alt="Signature" 
                      className="block pointer-events-none"
                      style={{
                        width: `${getSignatureSize().width}px`,
                        height: 'auto',
                        maxHeight: '60px',
                        minHeight: '20px'
                      }}
                      draggable={false}
                    />
                  ) : signatureText ? (
                    <div 
                      className="pointer-events-none whitespace-nowrap"
                      style={{ 
                        fontSize: `${getSignatureSize().fontSize}px`,
                        ...getSignatureStyle(),
                        minWidth: `${getSignatureSize().width}px`,
                        textAlign: 'center',
                        lineHeight: '1.3'
                      }}
                    >
                      {signatureText}
                    </div>
                  ) : null}
                </div>
                
                {/* Position indicator when dragging */}
                {isDragging && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {signaturePos.x.toFixed(1)}%, {signaturePos.y.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Instructions overlay */}
          {!isDragging && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              Click to position • Drag to move
            </div>
          )}
        </div>
      </div>

      {/* Position Info */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Current Position:</span>
          <span className="text-blue-600 font-mono">
            X: {signaturePos.x.toFixed(1)}% • Y: {signaturePos.y.toFixed(1)}%
          </span>
        </div>
        
        {/* Quick position buttons */}
        <div className="flex flex-wrap gap-1 justify-center">
          {[
            { label: 'Top Left', x: 15, y: 15 },
            { label: 'Top Right', x: 85, y: 15 },
            { label: 'Center', x: 50, y: 50 },
            { label: 'Bottom Left', x: 15, y: 85 },
            { label: 'Bottom Right', x: 85, y: 85 }
          ].map((pos) => (
            <button
              key={pos.label}
              onClick={(e) => {
                e.stopPropagation();
                const newPos = { x: pos.x, y: pos.y };
                setSignaturePos(newPos);
                onSignaturePosition?.(pos.x, pos.y, 1);
              }}
              className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 The signature will be placed exactly where you position it in this preview
      </p>
    </div>
  );
};

export default PDFPreview;