import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedSize(0);
      setDownloadUrl('');
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('compressionLevel', compressionLevel);

    try {
      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      const blob = await response.blob();
      setCompressedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Failed to compress PDF. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getSavingsPercentage = (): number => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  };

  return (
    <>
      <Head>
        <title>Compress PDF Online Free - Reduce PDF File Size | Document Converter Pro</title>
        <meta name="description" content="Compress PDF files online for free. Reduce PDF size while maintaining quality. No file size limits, secure compression, instant download. Works on all devices." />
        <meta name="keywords" content="compress pdf, reduce pdf size, pdf compressor, shrink pdf, optimize pdf, pdf size reducer, free pdf compression" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/compress-pdf" />

        <meta property="og:title" content="Compress PDF Online Free - Reduce PDF File Size" />
        <meta property="og:description" content="Compress PDF files online for free. Reduce PDF size while maintaining quality. No limits, secure, instant download." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://document-converter-pro.vercel.app/compress-pdf" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Compress PDF Online Free - Reduce PDF File Size" />
        <meta name="twitter:description" content="Compress PDF files online for free. Reduce PDF size while maintaining quality." />
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
              background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              🗜️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Compress PDF Online
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reduce PDF file size while maintaining quality. Free, secure, and fast compression.
            </p>
          </div>

          {/* Compression Tool */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-orange-500 transition-colors">
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
                        <p className="text-sm text-gray-500">Original size: {formatFileSize(originalSize)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setOriginalSize(0);
                        setCompressedSize(0);
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Compression Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setCompressionLevel('low')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        compressionLevel === 'low'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Low</p>
                      <p className="text-xs text-gray-500">Best quality</p>
                    </button>
                    <button
                      onClick={() => setCompressionLevel('medium')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        compressionLevel === 'medium'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Medium</p>
                      <p className="text-xs text-gray-500">Balanced</p>
                    </button>
                    <button
                      onClick={() => setCompressionLevel('high')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        compressionLevel === 'high'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">High</p>
                      <p className="text-xs text-gray-500">Smallest size</p>
                    </button>
                  </div>
                </div>

                {compressedSize > 0 && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Compression Result</p>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                        {getSavingsPercentage()}% smaller
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600">Original</p>
                        <p className="text-lg font-bold text-gray-900">{formatFileSize(originalSize)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Compressed</p>
                        <p className="text-lg font-bold text-green-600">{formatFileSize(compressedSize)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!downloadUrl ? (
                    <button
                      onClick={handleCompress}
                      disabled={isCompressing}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompressing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Compressing...
                        </span>
                      ) : (
                        'Compress PDF'
                      )}
                    </button>
                  ) : (
                    <a
                      href={downloadUrl}
                      download={file.name.replace('.pdf', '_compressed.pdf')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all text-center"
                    >
                      Download Compressed PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd
              adSlot="7777777777"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* How to Compress PDF */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Compress PDF Files</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your PDF File</h3>
                  <p className="text-gray-600">Click the upload area or drag and drop your PDF file. Files are processed securely and deleted automatically.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Compression Level</h3>
                  <p className="text-gray-600">Select Low for best quality, Medium for balanced compression, or High for maximum file size reduction.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Compressed PDF</h3>
                  <p className="text-gray-600">Click "Compress PDF" and download your optimized file. Most PDFs compress by 40-70% while maintaining quality.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Why is my PDF file so large?</h3>
                <p className="text-gray-600">PDFs can be large due to high-resolution images, embedded fonts, or uncompressed data. Our compression removes redundant data and optimizes images while preserving readability.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Will compression affect PDF quality?</h3>
                <p className="text-gray-600">Low and Medium compression maintain excellent quality for most use cases. High compression may slightly reduce image quality but text remains perfectly readable.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a file size limit?</h3>
                <p className="text-gray-600">We support PDFs up to 100MB. Most documents compress in seconds, with larger files taking up to a minute.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my PDF secure?</h3>
                <p className="text-gray-600">Yes. Files are processed in encrypted memory and automatically deleted within 60 seconds. We never store or access your documents.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I compress PDFs?</h3>
                <p className="text-gray-600">Compress PDFs before emailing (most email services limit attachments to 25MB), uploading to websites, or sharing via cloud storage to save space and bandwidth.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
