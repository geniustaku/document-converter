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

export default function PdfSplit() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [splitType, setSplitType] = useState<string>('all');
  const [pageRanges, setPageRanges] = useState<string>('');
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
      progress += Math.random() * 10 + 5;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 400);
    return interval;
  };

  const handleSplit = async () => {
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
      formData.append('splitType', splitType);
      if (splitType === 'range' && pageRanges) {
        formData.append('pageRanges', pageRanges);
      }

      setConversionState(prev => ({ ...prev, status: 'Splitting PDF pages...' }));

      const response = await fetch('/api/pdf-split', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'PDF split failed' }));
        throw new Error(errorData.error || errorData.details || 'PDF split failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful conversion
      trackConversion('pdf_split', selectedFile.size);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'split_pdf.pdf';
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
        setSelectedFile(null);
        setPageRanges('');
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
    setPageRanges('');
  };

  return (
    <>
      <Head>
        <title>Split PDF Online Free | PDF Page Splitter Tool</title>
        <meta name="description" content="Split PDF files online for free. Extract pages, split into multiple PDFs, or separate PDF documents. Fast and secure PDF splitter tool." />
        <meta name="keywords" content="split PDF, PDF splitter, extract PDF pages, separate PDF, divide PDF, PDF page splitter, split PDF online free" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/pdf-split" />
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
                <Link href="/pdf-merge" className="text-red-600 hover:text-red-700 font-medium">Merge PDF</Link>
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
              <span className="text-red-600 font-medium text-sm">✂️📄 PDF Splitter Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
              Split PDF Files Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Extract pages from your PDF documents quickly and easily. Split into individual pages, 
              custom ranges, or divide your PDF into multiple files.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Extract Pages
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Custom Ranges
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Bulk Download
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="1313131313"
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
                    <h3 className="text-sm font-semibold text-red-800">Split Failed</h3>
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

          {/* Splitter Section */}
          {!conversionState.isConverting && (
            <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-12 mb-16">
              <FileUpload
                onFileSelect={handleFileSelect}
                isConverting={conversionState.isConverting}
                acceptedTypes=".pdf"
                title="Drop your PDF file here"
                subtitle="Select the PDF you want to split"
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
                          <p className="text-sm text-gray-500">Ready to split</p>
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

                  {/* Split Options */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Options</h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="splitType"
                          value="all"
                          checked={splitType === 'all'}
                          onChange={(e) => setSplitType(e.target.value)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Split into all pages</div>
                          <div className="text-sm text-gray-500">Extract each page as a separate PDF file</div>
                        </div>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="splitType"
                          value="half"
                          checked={splitType === 'half'}
                          onChange={(e) => setSplitType(e.target.value)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Split in half</div>
                          <div className="text-sm text-gray-500">Divide PDF into two equal parts</div>
                        </div>
                      </label>

                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="splitType"
                          value="range"
                          checked={splitType === 'range'}
                          onChange={(e) => setSplitType(e.target.value)}
                          className="mr-3 mt-1 text-red-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Custom page ranges</div>
                          <div className="text-sm text-gray-500 mb-2">Specify which pages to extract</div>
                          {splitType === 'range' && (
                            <input
                              type="text"
                              value={pageRanges}
                              onChange={(e) => setPageRanges(e.target.value)}
                              placeholder="e.g., 1-3,5,7-9"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                            />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleSplit}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Split PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Splitting</h3>
              <p className="text-gray-600">Split by individual pages, ranges, or divide into equal parts</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bulk Download</h3>
              <p className="text-gray-600">Multiple files automatically packaged in a ZIP for easy download</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">High Quality</h3>
              <p className="text-gray-600">Preserves original PDF quality and formatting perfectly</p>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="1414141414"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* How to Use */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How to Split PDF Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Upload PDF</h3>
                <p className="text-gray-600">Select or drag & drop your PDF file to upload</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Choose Split Method</h3>
                <p className="text-gray-600">Select how you want to split: all pages, ranges, or in half</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Download Results</h3>
                <p className="text-gray-600">Download individual PDFs or ZIP file with all split pages</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}