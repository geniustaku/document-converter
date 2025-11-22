import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [signatureImage, setSignatureImage] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl('');
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSign = async () => {
    if (!file) return;

    let signatureData = '';

    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL('image/png');
    } else if (signatureMode === 'type') {
      if (!signatureText.trim()) {
        alert('Please enter your signature text');
        return;
      }
      // Create a canvas with the text
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.font = '36px "Brush Script MT", cursive';
      ctx.textBaseline = 'middle';
      ctx.fillText(signatureText, 20, 50);
      signatureData = canvas.toDataURL('image/png');
    } else if (signatureMode === 'upload') {
      if (!signatureImage) {
        alert('Please upload a signature image');
        return;
      }
      signatureData = signatureImage;
    }

    setIsSigning(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signatureData);

    try {
      const response = await fetch('/api/sign-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Signing failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error signing PDF:', error);
      alert('Failed to sign PDF. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign PDF Online Free - Add Electronic Signature to PDF | Document Converter Pro</title>
        <meta name="description" content="Sign PDF documents online for free. Add your electronic signature, draw signature, or upload signature image. Secure, legally binding e-signatures." />
        <meta name="keywords" content="sign pdf, e-signature, electronic signature, pdf signature, sign document online, esign pdf, digital signature" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/sign-pdf" />

        <meta property="og:title" content="Sign PDF Online Free - Electronic Signature Tool" />
        <meta property="og:description" content="Sign PDF documents online for free. Draw, type, or upload your signature. Secure and legally binding." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://document-converter-pro.vercel.app/sign-pdf" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign PDF Online Free - E-Signature Tool" />
        <meta name="twitter:description" content="Add electronic signatures to PDF documents. Free and secure." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 font-medium">Privacy</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✍️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sign PDF Documents
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Add your electronic signature to PDF files. Draw, type, or upload your signature.
            </p>
          </div>

          {/* Signing Tool */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-pink-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to select PDF file</p>
                    <p className="text-sm text-gray-500">or drag and drop your PDF here</p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">Ready to sign</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setDownloadUrl('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Signature Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSignatureMode('draw')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        signatureMode === 'draw'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Draw</p>
                      <p className="text-xs text-gray-500">✍️ Draw signature</p>
                    </button>
                    <button
                      onClick={() => setSignatureMode('type')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        signatureMode === 'type'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Type</p>
                      <p className="text-xs text-gray-500">⌨️ Type your name</p>
                    </button>
                    <button
                      onClick={() => setSignatureMode('upload')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        signatureMode === 'upload'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Upload</p>
                      <p className="text-xs text-gray-500">📤 Upload image</p>
                    </button>
                  </div>
                </div>

                {signatureMode === 'draw' && (
                  <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Draw Your Signature</label>
                      <button
                        onClick={clearCanvas}
                        className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full"
                      style={{ touchAction: 'none' }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Draw your signature using your mouse or touchpad</p>
                  </div>
                )}

                {signatureMode === 'type' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Type Your Name</label>
                    <input
                      type="text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-3xl font-serif focus:border-pink-500 focus:outline-none"
                      style={{ fontFamily: '"Brush Script MT", cursive' }}
                    />
                    <p className="text-xs text-gray-500 mt-2">Your name will be converted to a signature style</p>
                  </div>
                )}

                {signatureMode === 'upload' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Signature Image</label>
                    <div className="flex flex-col items-center">
                      {signatureImage ? (
                        <div className="mb-4">
                          <img src={signatureImage} alt="Signature" className="max-h-40 border-2 border-gray-300 rounded-lg" />
                          <button
                            onClick={() => setSignatureImage('')}
                            className="mt-2 text-sm text-pink-600 hover:text-pink-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-pink-500 transition-colors">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-600">Click to upload signature image</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!downloadUrl ? (
                    <button
                      onClick={handleSign}
                      disabled={isSigning}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigning ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing PDF...
                        </span>
                      ) : (
                        'Sign PDF'
                      )}
                    </button>
                  ) : (
                    <a
                      href={downloadUrl}
                      download={file.name.replace('.pdf', '_signed.pdf')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all text-center"
                    >
                      Download Signed PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd
              adSlot="1010101010"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* How to Sign PDF */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Sign PDF Online</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your PDF</h3>
                  <p className="text-gray-600">Select the PDF document you need to sign. Your file is processed securely and deleted after download.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Signature</h3>
                  <p className="text-gray-600">Draw your signature with your mouse, type your name in signature font, or upload an existing signature image.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign and Download</h3>
                  <p className="text-gray-600">Click "Sign PDF" to add your signature to the document. Download your signed PDF immediately.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Are electronic signatures legally binding?</h3>
                <p className="text-gray-600">Yes. Electronic signatures are legally binding in most countries under laws like the US ESIGN Act and EU eIDAS regulation, equivalent to handwritten signatures.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my document secure when signing online?</h3>
                <p className="text-gray-600">Absolutely. Files are encrypted during processing and automatically deleted within 60 seconds. We never store or access your documents.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I add my signature to multiple pages?</h3>
                <p className="text-gray-600">Currently, the signature is added to the last page of your PDF. For multi-page signing, you can sign the document multiple times at different positions.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's the difference between drawn and typed signatures?</h3>
                <p className="text-gray-600">Drawn signatures look more personal and handwritten. Typed signatures use cursive fonts for a professional appearance. Both are equally valid legally.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this for contracts and legal documents?</h3>
                <p className="text-gray-600">Yes. Our e-signatures are suitable for contracts, agreements, forms, and other legal documents. The signed PDF includes your signature as a permanent part of the document.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
