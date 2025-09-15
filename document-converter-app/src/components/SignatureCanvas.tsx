import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  disabled = false,
  width = 400,
  height = 150
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Drawing settings
  const strokeColor = '#000000';
  const strokeWidth = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (event instanceof MouseEvent) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
  }, []);

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [disabled, getCoordinates]);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
  }, [isDrawing, disabled, getCoordinates]);

  const stopDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    
    event.preventDefault();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to base64 image with transparent background
    const signatureData = canvas.toDataURL('image/png');
    onSignatureChange(signatureData);
  }, [isDrawing, onSignatureChange]);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear and reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    onSignatureChange(null);
  }, [onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = (e: MouseEvent) => stopDrawing(e);
    const handleMouseLeave = (e: MouseEvent) => stopDrawing(e);

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = (e: TouchEvent) => stopDrawing(e);

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      // Clean up event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  return (
    <div className="w-full">
      <div className="rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Draw Your Signature</h4>
          <button
            type="button"
            onClick={clearSignature}
            disabled={!hasSignature || disabled}
            className="text-xs px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`rounded cursor-crosshair w-full ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              touchAction: 'none', // Prevent scroll on touch devices
              maxWidth: '100%',
              height: 'auto'
            }}
          />
          
          {!hasSignature && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-gray-400 text-sm text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Sign here
                </div>
                <div className="text-xs">Use mouse or touch to draw your signature</div>
              </div>
            </div>
          )}
        </div>
        
        {hasSignature && (
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Signature captured
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        💡 Tip: For best results, use a stylus or draw slowly with your finger on mobile devices
      </div>
    </div>
  );
};

export default SignatureCanvas;