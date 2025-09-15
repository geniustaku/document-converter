import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import { trackConversion, trackFileUpload } from '@/utils/gtag';

interface ConversionState {
  isConverting: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export default function PdfToWord() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionState, setConversionState] = useState<ConversionState>({
    isConverting: false,
    progress: 0,
    status: '',
    error: null
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConversionState(prev => ({ ...prev, error: null }));
    
    // Track file upload
    trackFileUpload(file.type || 'application/pdf', file.size);
  }, []);

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 500);
    return interval;
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setConversionState({
      isConverting: true,
      progress: 0,
      status: 'Uploading PDF file...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('format', 'docx');

      setConversionState(prev => ({ ...prev, status: 'Converting PDF to Word...' }));

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errorData.error || errorData.details || 'PDF to Word conversion failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful PDF to Word conversion
      trackConversion('pdf_to_word', selectedFile.size);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = selectedFile.name.replace(/\\.pdf$/i, '');
      link.download = `${originalName}.docx`;
      
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
        <title>PDF to Word Converter Free Online | Convert PDF to DOCX</title>
        <meta name="description" content="Convert PDF to Word (DOCX) online for free. Best PDF to Word converter - extract text and images, preserve formatting. Professional quality results." />
        <meta name="keywords" content="PDF to Word converter, PDF to DOCX, convert PDF to Word online free, PDF converter, iLovePDF alternative, Adobe alternative" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/pdf-to-word" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/word-to-pdf" className="text-red-600 hover:text-red-700 font-medium">Word to PDF</Link>
                <Link href="/image-converter" className="text-red-600 hover:text-red-700 font-medium">Image Converter</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-full border border-red-200 mb-6">
              <span className="text-red-600 font-medium text-sm">📄➡️📝 PDF to Word Converter</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
              Convert PDF to Word Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Transform your PDF documents into editable Word files in seconds. Our advanced converter preserves 
              formatting, images, and text layout perfectly.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Free & Unlimited
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                No Registration
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Secure & Private
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="5555555555"
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
            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-12 mb-16">
              <FileUpload
                onFileSelect={handleFileSelect}
                isConverting={conversionState.isConverting}
                acceptedTypes=".pdf"
                title="Drop your PDF file here"
                subtitle="or click to browse files"
              />
              
              {selectedFile && (
                <div className="mt-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold">PDF</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">Converting to: Microsoft Word (DOCX)</p>
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
                  
                  <div className="text-center">
                    <button
                      onClick={handleConvert}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Convert PDF to Word
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect Accuracy</h3>
              <p className="text-gray-600">Preserves original formatting, images, tables, and text layout</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Convert PDF to Word in seconds with our optimized engine</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Secure</h3>
              <p className="text-gray-600">Files deleted immediately after conversion for your privacy</p>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="6666666666"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* Why Choose Us */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our PDF to Word Converter?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Professional Quality</h3>
                    <p className="text-gray-600">No file size limits, unlimited conversions, no watermarks</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cheaper than Adobe Acrobat</h3>
                    <p className="text-gray-600">100% free alternative to expensive Adobe subscriptions</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Advanced Text Extraction</h3>
                    <p className="text-gray-600">OCR technology extracts text from scanned PDFs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cross-Platform</h3>
                    <p className="text-gray-600">Works on Windows, Mac, Linux, iOS, and Android</p>
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