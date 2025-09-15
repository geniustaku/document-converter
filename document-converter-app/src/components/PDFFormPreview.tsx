import React, { useState, useEffect, useRef } from 'react';

interface TextField {
  id: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: string;
  placeholder: string;
  // Add absolute positioning for precise placement
  absoluteX?: number;
  absoluteY?: number;
  previewWidth?: number;
  previewHeight?: number;
}

interface PDFFormPreviewProps {
  file: File;
  textFields: TextField[];
  selectedFieldId: string | null;
  onAddField: (x: number, y: number, page?: number, absoluteCoords?: { absoluteX: number, absoluteY: number, previewWidth: number, previewHeight: number }) => void;
  onMoveField: (id: string, x: number, y: number, page: number, absoluteCoords?: { absoluteX: number, absoluteY: number, previewWidth: number, previewHeight: number }) => void;
  onResizeField: (id: string, width: number, height: number) => void;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<TextField>) => void;
  onDeleteField: (id: string) => void;
}

const PDFFormPreview: React.FC<PDFFormPreviewProps> = ({
  file,
  textFields,
  selectedFieldId,
  onAddField,
  onMoveField,
  onResizeField,
  onSelectField,
  onUpdateField,
  onDeleteField
}) => {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [actualPdfDimensions, setActualPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Use consistent dimensions based on actual PDF or standard A4
  const A4_ASPECT_RATIO = 210 / 297; // A4 width/height ratio
  const PREVIEW_HEIGHT = 700;
  const PREVIEW_WIDTH = PREVIEW_HEIGHT * A4_ASPECT_RATIO;

  useEffect(() => {
    // Create PDF preview using object URL with error handling
    try {
      const objectUrl = URL.createObjectURL(file);
      setPdfDataUrl(objectUrl);
      setPdfError(null);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (error) {
      console.error('Error creating PDF URL:', error);
      setPdfError('Failed to load PDF document. Please try a different PDF file.');
    }
  }, [file]);

  // Get precise container dimensions
  const getContainerDimensions = () => {
    if (!containerRef.current) return { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  };

  // Convert screen coordinates to normalized coordinates (0-100)
  const screenToNormalized = (screenX: number, screenY: number) => {
    const containerDims = getContainerDimensions();
    const x = Math.max(0, Math.min(100, (screenX / containerDims.width) * 100));
    const y = Math.max(0, Math.min(100, (screenY / containerDims.height) * 100));
    return { x, y };
  };

  // Convert normalized coordinates to screen coordinates
  const normalizedToScreen = (normX: number, normY: number) => {
    const containerDims = getContainerDimensions();
    const x = (normX / 100) * containerDims.width;
    const y = (normY / 100) * containerDims.height;
    return { x, y };
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!containerRef.current || isDragging || isResizing) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Get precise click coordinates relative to container
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to percentage coordinates
    const { x, y } = screenToNormalized(clickX, clickY);
    
    // Ensure field stays within bounds with proper margins
    const boundedX = Math.max(2, Math.min(93, x));
    const boundedY = Math.max(2, Math.min(93, y));

    // Store absolute coordinates for precise positioning
    const absoluteCoords = {
      absoluteX: clickX,
      absoluteY: clickY,
      previewWidth: rect.width,
      previewHeight: rect.height
    };

    console.log('Adding field at:', { 
      percentage: { x: boundedX, y: boundedY }, 
      absolute: absoluteCoords,
      containerSize: { width: rect.width, height: rect.height }
    });

    // Add new text field at clicked position
    onAddField(boundedX, boundedY, 1, absoluteCoords);
  };

  const handleFieldDrag = (fieldId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setDraggedFieldId(fieldId);
    onSelectField(fieldId);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const field = textFields.find(f => f.id === fieldId);
    if (!field) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = field.x;
    const startPosY = field.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const newContainerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate movement delta in screen pixels
      const deltaScreenX = moveEvent.clientX - startX;
      const deltaScreenY = moveEvent.clientY - startY;
      
      // Convert delta to percentage based on current container size
      const deltaPercentX = (deltaScreenX / newContainerRect.width) * 100;
      const deltaPercentY = (deltaScreenY / newContainerRect.height) * 100;
      
      // Apply movement with bounds checking
      const newX = Math.max(1, Math.min(95, startPosX + deltaPercentX));
      const newY = Math.max(1, Math.min(95, startPosY + deltaPercentY));
      
      // Calculate absolute coordinates for precise positioning
      const absoluteCoords = {
        absoluteX: (newX / 100) * newContainerRect.width,
        absoluteY: (newY / 100) * newContainerRect.height,
        previewWidth: newContainerRect.width,
        previewHeight: newContainerRect.height
      };
      
      console.log('Moving field:', { 
        fieldId, 
        percentage: { x: newX, y: newY }, 
        absolute: absoluteCoords 
      });
      
      onMoveField(fieldId, newX, newY, 1, absoluteCoords);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedFieldId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTextChange = (fieldId: string, newText: string) => {
    console.log('Text changed for field:', fieldId, 'New text:', newText);
    onUpdateField(fieldId, { text: newText });
  };

  const renderTextField = (field: TextField) => {
    const isSelected = selectedFieldId === field.id;
    const isDraggedField = draggedFieldId === field.id;

    return (
      <div
        key={field.id}
        className={`absolute transition-all duration-200 ${
          isDraggedField 
            ? 'cursor-grabbing scale-110 z-50 shadow-2xl' 
            : isSelected 
              ? 'z-40 shadow-lg' 
              : 'cursor-grab hover:scale-105 hover:shadow-md z-10'
        } ${isSelected ? 'ring-2 ring-green-500 ring-opacity-70' : ''}`}
        style={{
          left: `${field.x}%`,
          top: `${field.y}%`,
          width: `${field.width}px`,
          height: `${field.height}px`,
          userSelect: isSelected ? 'text' : 'none',
          WebkitUserSelect: isSelected ? 'text' : 'none',
          transform: isDraggedField ? 'rotate(-2deg)' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) {
            onSelectField(field.id);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Show context menu or directly delete
          if (window.confirm(`Delete text field "${field.text || 'Field ' + field.id.split('_')[1]}"?`)) {
            onDeleteField(field.id);
          }
        }}
      >
        {/* Text Field Container - Clean appearance for PDF */}
        <div 
          className={`relative w-full h-full transition-all duration-200 ${
            isSelected 
              ? 'bg-blue-50 border-2 border-green-500 shadow-lg rounded' 
              : 'bg-transparent hover:bg-blue-25'
          }`}
          style={{
            backgroundColor: isSelected ? 'rgba(239, 246, 255, 0.3)' : 'transparent',
            border: isSelected ? '2px dashed #10b981' : 'none'
          }}
          onMouseDown={(e) => {
            if (!isSelected) {
              handleFieldDrag(field.id, e);
            }
          }}
        >
          {/* Editable Text Input for Selected Field */}
          {isSelected ? (
            <input
              type="text"
              value={field.text}
              onChange={(e) => handleTextChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-full px-2 bg-transparent border-none outline-none resize-none"
              style={{
                fontSize: `${field.fontSize}px`,
                fontFamily: field.fontFamily,
                fontWeight: field.fontWeight,
                color: field.fontColor,
                textAlign: field.textAlign as any,
                backgroundColor: 'transparent'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            /* Static Text Display - Clean for PDF output */
            <div 
              className="w-full h-full flex items-center px-2 overflow-hidden pointer-events-none"
              style={{
                fontSize: `${field.fontSize}px`,
                fontFamily: field.fontFamily,
                fontWeight: field.fontWeight,
                color: field.fontColor,
                textAlign: field.textAlign as any,
                backgroundColor: 'transparent'
              }}
            >
              {field.text || (
                <span className="text-gray-400 italic opacity-60" style={{ fontSize: '10px' }}>
                  Click to edit
                </span>
              )}
            </div>
          )}
          
          {/* Field Label with coordinates */}
          {isSelected && (
            <div className="absolute -top-8 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none shadow-lg">
              Field {field.id.split('_')[1]} - {field.x.toFixed(1)}%, {field.y.toFixed(1)}% • Right-click to delete
            </div>
          )}
          
          {/* Drag Handle - More visible */}
          {!isSelected && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full opacity-70 hover:opacity-100 pointer-events-none flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
          )}
          
          {/* Resize Handle */}
          {isSelected && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-600 cursor-se-resize"
              style={{
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (!containerRect) return;
                
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = field.width;
                const startHeight = field.height;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (!containerRect) return;
                  
                  const deltaX = moveEvent.clientX - startX;
                  const deltaY = moveEvent.clientY - startY;
                  
                  // Keep resize in pixel units for consistency
                  const newWidth = Math.max(50, Math.min(400, startWidth + deltaX));
                  const newHeight = Math.max(20, Math.min(120, startHeight + deltaY));
                  
                  onResizeField(field.id, newWidth, newHeight);
                };

                const handleMouseUp = () => {
                  setIsResizing(false);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}
          
          {/* Position indicator when dragging */}
          {isDraggedField && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              {field.x.toFixed(1)}%, {field.y.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF Form Preview & Field Editor
        </h3>
        
        <div className="text-xs text-gray-500">
          {textFields.length} field{textFields.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">🎯 Precise Text Field Positioning:</p>
            <ul className="text-xs space-y-1">
              <li>• <strong>Click anywhere</strong> on the PDF to add a text field at that exact position</li>
              <li>• <strong>Click a field</strong> to select it and start typing</li>
              <li>• <strong>Drag fields</strong> to reposition them precisely</li>
              <li>• <strong>Coordinates shown</strong> in the field label for exact placement</li>
              <li>• <strong>Right-click any field</strong> to delete it</li>
            </ul>
          </div>
        </div>
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
          {pdfDataUrl && !pdfError && (
            <div className="absolute inset-0">
              <iframe
                ref={iframeRef}
                src={`${pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                width="100%"
                height="100%"
                className="pointer-events-none border-none"
                style={{ border: 'none', background: 'white' }}
                onError={() => setPdfError('Failed to load PDF document. Please try a different PDF file.')}
                onLoad={() => {
                  console.log('PDF loaded successfully');
                  // Try to get actual PDF dimensions if possible
                  const containerDims = getContainerDimensions();
                  console.log('Container dimensions:', containerDims);
                }}
              />
            </div>
          )}
          
          {/* Error state */}
          {pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-6">
                <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Loading Error</h3>
                <p className="text-sm text-gray-600 mb-4">{pdfError}</p>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">You can still:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Click to add text fields</li>
                    <li>• Position and edit fields</li>
                    <li>• The PDF will be processed correctly</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Precision Grid overlay for positioning reference */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            {/* Horizontal lines every 5% */}
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-gray-400"
                style={{ top: `${i * 5}%` }}
              />
            ))}
            {/* Vertical lines every 5% */}
            {Array.from({ length: 21 }, (_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-px bg-gray-400"
                style={{ left: `${i * 5}%` }}
              />
            ))}
          </div>
          
          {/* Text Fields */}
          {textFields.map(renderTextField)}
          
          {/* Instructions overlay when no fields */}
          {textFields.length === 0 && !isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black bg-opacity-70 text-white text-center p-4 rounded-lg">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-sm font-medium">🎯 Click anywhere for precise text field placement</p>
                <p className="text-xs mt-1 opacity-80">Text will appear exactly where you click</p>
              </div>
            </div>
          )}
          
          {/* Positioning reference */}
          {!isDragging && !isResizing && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
              {textFields.length === 0 
                ? '🎯 Click for precise positioning' 
                : `📍 ${textFields.length} field${textFields.length > 1 ? 's' : ''} positioned`
              }
            </div>
          )}

          {/* Container size indicator */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded pointer-events-none">
            {getContainerDimensions().width.toFixed(0)}×{getContainerDimensions().height.toFixed(0)}px
          </div>
        </div>
      </div>

      {/* Field Summary with positioning info */}
      {textFields.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">📍 Positioned Fields:</span>
            <span className="text-gray-600">{textFields.length} field{textFields.length !== 1 ? 's' : ''} placed</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Filled fields:</span>
              <span className="text-green-600 font-medium">
                {textFields.filter(f => f.text.trim()).length} / {textFields.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empty fields:</span>
              <span className="text-orange-600 font-medium">
                {textFields.filter(f => !f.text.trim()).length}
              </span>
            </div>

            {/* Show positioning summary */}
            <div className="border-t pt-2 mt-2">
              <div className="text-gray-600 font-medium mb-1">Field Positions:</div>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {textFields.map((field) => (
                  <div key={field.id} className="flex justify-between text-xs">
                    <span className="text-gray-600">Field {field.id.split('_')[1]}:</span>
                    <span className="text-gray-800 font-mono">
                      {field.x.toFixed(1)}%, {field.y.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {textFields.some(f => !f.text.trim()) && (
            <div className="mt-2 text-orange-600 text-xs">
              ⚠️ Click empty fields to select and type your content
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        🎯 Text will appear at the exact coordinates shown: percentage positions ensure accuracy across all PDF sizes
      </p>
    </div>
  );
};

export default PDFFormPreview;