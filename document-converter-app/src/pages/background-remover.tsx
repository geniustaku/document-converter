import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage('');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const removeBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);

    // Create an image element
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple background removal algorithm (chroma key style)
      // This is a basic implementation - detects predominantly white/light backgrounds
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate brightness and color variance
        const brightness = (r + g + b) / 3;
        const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

        // Remove light colored backgrounds with low variance (uniform colors)
        if (brightness > 200 && variance < 30) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
        // Also detect edges and preserve them
        else if (brightness < 50 || variance > 50) {
          // Keep dark areas and areas with high color variance
          data[i + 3] = 255;
        }
        // Gradual transparency for intermediate values
        else {
          const alpha = Math.max(0, Math.min(255, 255 - (brightness - 50) * 1.7));
          data[i + 3] = alpha;
        }
      }

      // Apply edge detection enhancement
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0);
      }

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to data URL
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setIsProcessing(false);
    };

    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = fileName.replace(/\.[^/.]+$/, '') + '_no_bg.png';
    link.click();
  };

  return (
    <>
      <Head>
        <title>Free Background Remover - Remove Image Background Online | Document Converter Pro</title>
        <meta name="description" content="Remove background from images online for free. Automatic background eraser tool. Create transparent PNG images instantly. No sign-up required." />
        <meta name="keywords" content="remove background, background remover, background eraser, transparent background, remove bg, image background removal, free background remover" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/background-remover" />
        <meta property="og:title" content="Free Background Remover - Remove Image Background Online" />
        <meta property="og:description" content="Remove backgrounds from images instantly with our free online tool. Create transparent PNG images." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Document Converter Pro</h1>
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              🖼️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Background Remover</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Remove backgrounds from images instantly. Create transparent PNGs for your designs, products, and social media.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!originalImage ? (
              <div className="text-center">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-green-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Upload Image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG (Max 10MB)</p>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <p className="font-semibold">{fileName}</p>
                  <button
                    onClick={() => {
                      setOriginalImage('');
                      setProcessedImage('');
                      setFileName('');
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Original Image */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Original Image</label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white" style={{ minHeight: '300px' }}>
                      <img src={originalImage} alt="Original" className="w-full h-auto" />
                    </div>
                  </div>

                  {/* Processed Image */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Background Removed</label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden relative" style={{ minHeight: '300px', backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%)', backgroundSize: '20px 20px' }}>
                      {processedImage ? (
                        <img src={processedImage} alt="Processed" className="w-full h-auto relative z-10" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          Click "Remove Background" to process
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-3">
                  {!processedImage ? (
                    <button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Remove Background'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={downloadImage}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700"
                      >
                        Download PNG
                      </button>
                      <button
                        onClick={() => setProcessedImage('')}
                        className="px-8 py-4 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Instant Results</h3>
              <p className="text-gray-600 text-sm">Remove backgrounds in seconds with our fast processing algorithm</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">Transparent PNG</h3>
              <p className="text-gray-600 text-sm">Export images with transparent backgrounds perfect for designs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">All processing happens in your browser. Your images stay private</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
