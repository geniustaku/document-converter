import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import FormatSelector from '@/components/FormatSelector';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';

interface ConversionState {
  isConverting: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [conversionState, setConversionState] = useState<ConversionState>({
    isConverting: false,
    progress: 0,
    status: '',
    error: null
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConversionState(prev => ({ ...prev, error: null }));
    
    // Auto-suggest format based on file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'jpg' || extension === 'jpeg') {
      setSelectedFormat('png');
    } else if (extension === 'png') {
      setSelectedFormat('jpg');
    } else {
      setSelectedFormat('png');
    }
  }, []);

  const handleFormatChange = useCallback((format: string) => {
    setSelectedFormat(format);
  }, []);

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 300);
    return interval;
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setConversionState({
      isConverting: true,
      progress: 0,
      status: 'Uploading image...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('format', selectedFormat);

      setConversionState(prev => ({ ...prev, status: 'Converting image...' }));

      const response = await fetch('/api/image-convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errorData.error || errorData.details || 'Image conversion failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = selectedFile.name.replace(/\\.[^.]+$/, '');
      link.download = `${originalName}.${selectedFormat}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setConversionState({
          isConverting: false,
          progress: 0,
          status: '',
          error: null
        });
        setSelectedFile(null);
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      setConversionState({
        isConverting: false,
        progress: 0,
        status: '',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetConversion = () => {
    setSelectedFile(null);
    setConversionState({
      isConverting: false,
      progress: 0,
      status: '',
      error: null
    });
  };

  return (
    <>
      <Head>
        <title>Image Converter Free Online | JPG to PNG, WebP Converter</title>
        <meta name="description" content="Convert images between JPG, PNG, WebP, TIFF, BMP formats online for free. Best image converter with high quality results. No watermarks." />
        <meta name="keywords" content="image converter, JPG to PNG, PNG to JPG, WebP converter, TIFF converter, BMP converter, image format converter online free" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/image-converter" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/pdf-to-word" className="text-blue-600 hover:text-blue-700 font-medium">PDF to Word</Link>
                <Link href="/word-to-pdf" className="text-green-600 hover:text-green-700 font-medium">Word to PDF</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-full border border-purple-200 mb-6">
              <span className="text-purple-600 font-medium text-sm">🖼️➡️🌐 Image Format Converter</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
              Convert Image Formats Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform your images between JPG, PNG, WebP, TIFF, and BMP formats with perfect quality. 
              Optimize for web, social media, or professional printing.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                High Quality
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Batch Support
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                All Formats
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="9999999999"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* Error Display */}
          {conversionState.error && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Conversion Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{conversionState.error}</p>
                  </div>
                </div>
                <button
                  onClick={resetConversion}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Conversion Progress */}
          {conversionState.isConverting && (
            <div className="mb-8">
              <ConversionProgress
                isConverting={conversionState.isConverting}
                fileName={selectedFile?.name}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          )}

          {/* Converter Section */}
          {!conversionState.isConverting && (
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-xl border border-purple-100 p-8 md:p-12 mb-16">
              <FileUpload
                onFileSelect={handleFileSelect}
                isConverting={conversionState.isConverting}
                acceptedTypes="image/*"
                title="Drop your image here"
                subtitle="Supports JPG, PNG, GIF, WebP, TIFF, BMP formats"
              />
              
              {selectedFile && (
                <div className="mt-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">Converting to: {selectedFormat.toUpperCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className="mb-6">
                    <FormatSelector
                      selectedFormat={selectedFormat}
                      onFormatChange={handleFormatChange}
                      sourceFileType={selectedFile.name}
                    />
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleConvert}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Convert to {selectedFormat.toUpperCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Popular Conversions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Popular Image Conversions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { from: 'JPG', to: 'PNG', desc: 'Add transparency' },
                { from: 'PNG', to: 'JPG', desc: 'Reduce file size' },
                { from: 'PNG', to: 'WebP', desc: 'Web optimization' },
                { from: 'TIFF', to: 'JPG', desc: 'Universal format' }
              ].map((conversion, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {conversion.from} → {conversion.to}
                  </div>
                  <div className="text-xs text-gray-500">{conversion.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect Quality</h3>
              <p className="text-gray-600">Lossless conversion with optimal compression algorithms</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Super Fast</h3>
              <p className="text-gray-600">Convert images in milliseconds with our optimized engine</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">All Formats</h3>
              <p className="text-gray-600">Support for JPG, PNG, WebP, TIFF, BMP, and more</p>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="1010101010"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* Why Choose Us */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Image Converter?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Advanced Algorithms</h3>
                    <p className="text-gray-600">Uses the latest Sharp.js engine for professional quality results</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Web Optimization</h3>
                    <p className="text-gray-600">Perfect for optimizing images for websites and social media</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Preserve Metadata</h3>
                    <p className="text-gray-600">Maintains EXIF data and color profiles when needed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Instant Results</h3>
                    <p className="text-gray-600">No waiting, no queues - convert images instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}