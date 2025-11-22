import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import JsBarcode from 'jsbarcode';

type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14';

export default function BarcodeGenerator() {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const formats: { value: BarcodeFormat; label: string; description: string; example: string }[] = [
    { value: 'CODE128', label: 'CODE128', description: 'Most versatile, supports all ASCII characters', example: 'ABC123' },
    { value: 'EAN13', label: 'EAN-13', description: 'European product barcodes (13 digits)', example: '1234567890128' },
    { value: 'UPC', label: 'UPC-A', description: 'US product barcodes (12 digits)', example: '123456789012' },
    { value: 'CODE39', label: 'CODE39', description: 'Alphanumeric barcode', example: 'CODE39' },
    { value: 'ITF14', label: 'ITF-14', description: 'Shipping container code (14 digits)', example: '12345678901231' }
  ];

  useEffect(() => {
    if (text && barcodeGenerated) {
      generateBarcode();
    }
  }, [format]);

  const validateInput = (value: string, type: BarcodeFormat): boolean => {
    switch (type) {
      case 'EAN13':
        return /^\d{13}$/.test(value) || /^\d{12}$/.test(value);
      case 'UPC':
        return /^\d{12}$/.test(value) || /^\d{11}$/.test(value);
      case 'ITF14':
        return /^\d{14}$/.test(value);
      case 'CODE39':
        return /^[0-9A-Z\-. $/+%]+$/.test(value);
      case 'CODE128':
        return value.length > 0;
      default:
        return true;
    }
  };

  const getValidationMessage = (type: BarcodeFormat): string => {
    switch (type) {
      case 'EAN13':
        return 'EAN-13 requires exactly 12 or 13 digits';
      case 'UPC':
        return 'UPC requires exactly 11 or 12 digits';
      case 'ITF14':
        return 'ITF-14 requires exactly 14 digits';
      case 'CODE39':
        return 'CODE39 supports: 0-9, A-Z, and symbols: - . $ / + % and space';
      case 'CODE128':
        return 'CODE128 supports all ASCII characters';
      default:
        return '';
    }
  };

  const generateBarcode = () => {
    if (!text.trim()) {
      setError('Please enter text for the barcode');
      setBarcodeGenerated(false);
      return;
    }

    if (!validateInput(text, format)) {
      setError(getValidationMessage(format));
      setBarcodeGenerated(false);
      return;
    }

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, text, {
          format: format,
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10
        });
      }

      if (canvasRef.current) {
        JsBarcode(canvasRef.current, text, {
          format: format,
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10
        });
      }

      setBarcodeGenerated(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate barcode. Please check your input.');
      setBarcodeGenerated(false);
    }
  };

  const downloadBarcode = (type: 'png' | 'svg') => {
    if (!barcodeGenerated) return;

    if (type === 'png' && canvasRef.current) {
      const link = document.createElement('a');
      link.download = `barcode_${text}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else if (type === 'svg' && svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `barcode_${text}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Head>
        <title>Free Barcode Generator - Create Barcodes Online | Document Converter Pro</title>
        <meta name="description" content="Generate barcodes online for free. Support for EAN-13, UPC, CODE128, CODE39, ITF-14. Download as PNG or SVG. Perfect for products, inventory, and labels." />
        <meta name="keywords" content="barcode generator, create barcode, barcode maker, EAN-13, UPC barcode, CODE128, barcode creator, free barcode generator" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/barcode-generator" />
        <meta property="og:title" content="Free Barcode Generator - Create Barcodes Online" />
        <meta property="og:description" content="Generate EAN, UPC, and other barcodes instantly. Download as PNG or SVG." />
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

        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📊
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Barcode Generator</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Create professional barcodes for products, inventory, and labels. Support for multiple formats.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Barcode Format</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFormat(f.value);
                      setBarcodeGenerated(false);
                      setError('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left ${format === f.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                  >
                    <div className="font-bold text-lg mb-1">{f.label}</div>
                    <div className="text-xs text-gray-600 mb-2">{f.description}</div>
                    <div className="text-xs text-purple-600 font-mono">{f.example}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode Data</label>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setBarcodeGenerated(false);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && generateBarcode()}
                placeholder={formats.find(f => f.value === format)?.example}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg font-mono"
                style={{ fontSize: '18px', fontWeight: '600', color: '#000000', backgroundColor: '#ffffff' }}
              />
              <p className="text-xs text-gray-500 mt-2">{getValidationMessage(format)}</p>
              {error && (
                <p className="text-sm text-red-600 mt-2 font-semibold">⚠️ {error}</p>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateBarcode}
              disabled={!text.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Generate Barcode
            </button>

            {/* Barcode Display */}
            {barcodeGenerated && (
              <div>
                <div className="mb-6 p-8 bg-gray-50 rounded-lg text-center">
                  <svg ref={svgRef} className="mx-auto"></svg>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadBarcode('png')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadBarcode('svg')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700"
                  >
                    Download SVG
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Barcode Format Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-3">When to Use Each Format</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>CODE128:</strong> General purpose, inventory management</li>
                <li><strong>EAN-13:</strong> European retail products</li>
                <li><strong>UPC-A:</strong> US retail products</li>
                <li><strong>CODE39:</strong> Industrial, military applications</li>
                <li><strong>ITF-14:</strong> Shipping containers, logistics</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-3">Barcode Best Practices</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Test barcodes with multiple scanners</li>
                <li>✓ Maintain adequate white space (quiet zones)</li>
                <li>✓ Print at sufficient resolution (300 DPI minimum)</li>
                <li>✓ Use high-contrast colors (black on white)</li>
                <li>✓ Avoid stretching or distorting barcodes</li>
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-lg mb-2">Multiple Formats</h3>
              <p className="text-gray-600 text-sm">Support for EAN, UPC, CODE128, CODE39, and ITF-14</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="font-bold text-lg mb-2">PNG & SVG Export</h3>
              <p className="text-gray-600 text-sm">Download in raster or vector format</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">Print-ready barcodes for professional use</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
