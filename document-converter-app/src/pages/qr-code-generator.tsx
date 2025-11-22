import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import QRCode from 'qrcode';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState<number>(300);

  // Auto-generate QR code as user types
  useEffect(() => {
    const generateQRCode = async () => {
      if (!text.trim()) {
        setQrCodeUrl('');
        return;
      }

      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    const timeoutId = setTimeout(generateQRCode, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [text, size]);

  return (
    <>
      <Head>
        <title>QR Code Generator Free - Create QR Codes Online | Document Converter Pro</title>
        <meta name="description" content="Generate QR codes online for free. Create QR codes for URLs, text, contact info, WiFi passwords. Download high-quality QR code images." />
        <meta name="keywords" content="qr code generator, create qr code, qr code maker, free qr code, generate qr code" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/qr-code-generator" />
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

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📲
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">QR Code Generator</h1>
            <p className="text-xl text-gray-600">Create custom QR codes for any text or URL</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Text or URL</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com or any text"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-lg"
                style={{ fontSize: '18px', lineHeight: '1.5', color: '#000000', fontWeight: '500' }}
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size (pixels)</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value) || 300)}
                min="100"
                max="1000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {qrCodeUrl && (
              <div className="text-center">
                <div className="mb-4 p-6 bg-gray-50 rounded-lg inline-block">
                  <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                </div>
                <a
                  href={qrCodeUrl}
                  download="qrcode.png"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Download QR Code
                </a>
              </div>
            )}
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '336px', height: '280px' }} />
        </main>
      </div>
    </>
  );
}
