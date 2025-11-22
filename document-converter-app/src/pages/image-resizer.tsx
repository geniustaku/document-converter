import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

interface Preset {
  name: string;
  width: number;
  height: number;
  category: string;
}

const presets: Preset[] = [
  // Instagram
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'Instagram Reel', width: 1080, height: 1920, category: 'Instagram' },
  // Facebook
  { name: 'Facebook Post', width: 1200, height: 630, category: 'Facebook' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'Facebook' },
  { name: 'Facebook Story', width: 1080, height: 1920, category: 'Facebook' },
  // Twitter/X
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Twitter' },
  { name: 'Twitter Header', width: 1500, height: 500, category: 'Twitter' },
  // LinkedIn
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, category: 'LinkedIn' },
  // YouTube
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube' },
  { name: 'YouTube Banner', width: 2560, height: 1440, category: 'YouTube' },
  // Other
  { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest' },
  { name: 'TikTok Video', width: 1080, height: 1920, category: 'TikTok' }
];

export default function ImageResizer() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [resizedImage, setResizedImage] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(800);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setCustomWidth(img.width);
          setCustomHeight(img.height);
        };
        img.src = event.target?.result as string;
        setOriginalImage(event.target?.result as string);
        setResizedImage('');
        setSelectedPreset('');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setSelectedPreset(preset.name);
    setMaintainAspect(false);
  };

  const handleWidthChange = (width: number) => {
    setCustomWidth(width);
    if (maintainAspect && originalDimensions.width > 0) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      setCustomHeight(Math.round(width * aspectRatio));
    }
    setSelectedPreset('');
  };

  const handleHeightChange = (height: number) => {
    setCustomHeight(height);
    if (maintainAspect && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setCustomWidth(Math.round(height * aspectRatio));
    }
    setSelectedPreset('');
  };

  const resizeImage = () => {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = customWidth;
      canvas.height = customHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw resized image
      ctx.drawImage(img, 0, 0, customWidth, customHeight);

      // Convert to data URL
      const resizedDataUrl = canvas.toDataURL('image/png', 1.0);
      setResizedImage(resizedDataUrl);
    };

    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!resizedImage) return;

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = fileName.replace(/\.[^/.]+$/, '') + `_${customWidth}x${customHeight}.png`;
    link.click();
  };

  return (
    <>
      <Head>
        <title>Free Image Resizer - Resize Photos Online | Document Converter Pro</title>
        <meta name="description" content="Resize images online for free. Batch resize photos for Instagram, Facebook, Twitter, LinkedIn. Social media presets. Download resized images instantly." />
        <meta name="keywords" content="image resizer, resize photo, photo resizer, image dimension changer, resize image for instagram, resize photo online, image size converter" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/image-resizer" />
        <meta property="og:title" content="Free Image Resizer - Resize Photos Online" />
        <meta property="og:description" content="Resize images for social media with our free online tool. Instagram, Facebook, Twitter presets available." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
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

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📐
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Image Resizer</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Resize images for social media, web, and print. Choose from presets or set custom dimensions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Settings Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {!originalImage ? (
                <div className="text-center">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 hover:border-cyan-500 transition-colors">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-700">Upload Image</p>
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
                <>
                  <div>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Original Size</p>
                      <p className="font-semibold text-sm">{originalDimensions.width} × {originalDimensions.height} px</p>
                    </div>

                    <h3 className="font-bold text-lg mb-3">Custom Size</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                          style={{ color: '#000000', backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maintainAspect}
                          onChange={(e) => setMaintainAspect(e.target.checked)}
                          className="w-4 h-4 text-cyan-600"
                        />
                        <span className="text-sm text-gray-700">Maintain aspect ratio</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3">Social Media Presets</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'Pinterest', 'TikTok'].map((category) => {
                        const categoryPresets = presets.filter(p => p.category === category);
                        return (
                          <div key={category}>
                            <p className="text-xs font-bold text-gray-500 mb-1 mt-3">{category}</p>
                            {categoryPresets.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => handlePresetSelect(preset)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedPreset === preset.name ? 'bg-cyan-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                              >
                                <div className="font-semibold" style={selectedPreset === preset.name ? {} : { color: '#000000' }}>{preset.name}</div>
                                <div className="text-xs font-semibold" style={selectedPreset === preset.name ? {} : { color: '#000000' }}>{preset.width} × {preset.height}</div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={resizeImage}
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-700"
                    >
                      Resize Image
                    </button>

                    {resizedImage && (
                      <button
                        onClick={downloadImage}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700"
                      >
                        Download Resized Image
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setOriginalImage('');
                        setResizedImage('');
                        setFileName('');
                      }}
                      className="w-full text-center text-gray-600 hover:text-gray-800 font-medium text-sm"
                    >
                      Upload New Image
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Preview</h2>

              {originalImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Original Image</label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
                      <img src={originalImage} alt="Original" className="max-w-full h-auto" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </p>
                  </div>

                  {/* Resized */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Resized Image</label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center" style={{ minHeight: '300px' }}>
                      {resizedImage ? (
                        <img src={resizedImage} alt="Resized" className="max-w-full h-auto" />
                      ) : (
                        <p className="text-gray-400 text-sm">Click "Resize Image" to see preview</p>
                      )}
                    </div>
                    {resizedImage && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {customWidth} × {customHeight} px
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  Upload an image to get started
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Social Media Presets</h3>
              <p className="text-gray-600 text-sm">Perfect sizes for Instagram, Facebook, Twitter, and more</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">Maintain image quality with our advanced resizing algorithm</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="font-bold text-lg mb-2">Custom Dimensions</h3>
              <p className="text-gray-600 text-sm">Set exact width and height or maintain aspect ratio</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
