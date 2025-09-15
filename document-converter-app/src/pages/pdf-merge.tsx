import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import { trackConversion, trackFileUpload } from '@/utils/gtag';

interface ConversionState {
  isConverting: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export default function PdfMerge() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionState, setConversionState] = useState<ConversionState>({
    isConverting: false,
    progress: 0,
    status: '',
    error: null
  });

  const handleFilesSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length !== fileArray.length) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Only PDF files are allowed for merging' 
      }));
      return;
    }
    
    if (pdfFiles.length > 10) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Maximum 10 PDF files allowed' 
      }));
      return;
    }
    
    setSelectedFiles(prev => {
      const combined = [...prev, ...pdfFiles];
      if (combined.length > 10) {
        return combined.slice(0, 10);
      }
      return combined;
    });
    
    setConversionState(prev => ({ ...prev, error: null }));
    
    // Track file uploads
    pdfFiles.forEach(file => {
      trackFileUpload(file.type || 'application/pdf', file.size);
    });
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedFiles.length) return;
    
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return newFiles;
    });
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 500);
    return interval;
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'At least 2 PDF files are required for merging' 
      }));
      return;
    }

    setConversionState({
      isConverting: true,
      progress: 0,
      status: 'Uploading PDF files...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });

      setConversionState(prev => ({ ...prev, status: 'Merging PDF files...' }));

      const response = await fetch('/api/pdf-merge', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'PDF merge failed' }));
        throw new Error(errorData.error || errorData.details || 'PDF merge failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful conversion
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      trackConversion('pdf_merge', totalSize);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'merged_pdf.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.download = filename;
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
        setSelectedFiles([]);
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
    setSelectedFiles([]);
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
        <title>Merge PDF Online Free | Combine PDF Files into One</title>
        <meta name="description" content="Merge PDF files online for free. Combine multiple PDFs into one document, rearrange pages, and download instantly. Fast and secure PDF merger." />
        <meta name="keywords" content="merge PDF, combine PDF, PDF merger, join PDF files, merge PDF online free, combine PDF documents, PDF joiner" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/pdf-merge" />
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
                <Link href="/pdf-split" className="text-red-600 hover:text-red-700 font-medium">Split PDF</Link>
                <Link href="/pdf-to-word" className="text-red-600 hover:text-red-700 font-medium">PDF to Word</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-full border border-red-200 mb-6">
              <span className="text-red-600 font-medium text-sm">🔗📄 PDF Merger Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
              Merge PDF Files Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Combine multiple PDF documents into one file easily. Upload your PDFs, 
              arrange them in the order you want, and download the merged document.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Combine Multiple PDFs
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Rearrange Order
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Instant Download
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="1515151515"
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
                    <h3 className="text-sm font-semibold text-red-800">Merge Failed</h3>
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
                fileName={`${selectedFiles.length} PDF files`}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          )}

          {/* Merger Section */}
          {!conversionState.isConverting && (
            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-12 mb-16">
              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-red-300 rounded-2xl p-8 text-center hover:border-red-400 transition-colors duration-200 mb-6"
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleFilesSelect(files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Drop multiple PDF files here
                    </h3>
                    <p className="text-sm text-gray-500">
                      or click to browse files (2-10 PDFs)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesSelect(e.target.files);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    Choose PDF Files
                  </label>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Selected Files ({selectedFiles.length}/10)
                    </h3>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-red-600 font-bold text-xs">PDF</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveFile(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFile(index, index + 1)}
                            disabled={index === selectedFiles.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFiles.length >= 2 && (
                <div className="text-center">
                  <button
                    onClick={handleMerge}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Merge {selectedFiles.length} PDFs
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Merging</h3>
              <p className="text-gray-600">Intelligently combines PDFs while preserving quality and formatting</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Drag & Reorder</h3>
              <p className="text-gray-600">Easily rearrange files in the order you want them merged</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Processing</h3>
              <p className="text-gray-600">Quick merging of multiple PDFs with instant download</p>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="1616161616"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* How to Use */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How to Merge PDFs Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Select PDFs</h3>
                <p className="text-gray-600">Upload 2-10 PDF files you want to combine</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Arrange Order</h3>
                <p className="text-gray-600">Use up/down arrows to arrange files in your preferred order</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Download Merged PDF</h3>
                <p className="text-gray-600">Click merge and download your combined PDF file</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}