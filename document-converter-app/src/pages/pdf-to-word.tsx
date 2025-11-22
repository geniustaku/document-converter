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
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
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

          {/* Educational Content Section - How PDF to Word Conversion Works */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How PDF to Word Conversion Technology Works</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Converting PDF files to editable Word documents is a complex process that involves sophisticated document parsing, content extraction, and format reconstruction. Understanding how this technology works can help you get the best results from your conversions and troubleshoot any formatting issues that may arise.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The PDF to DOCX Conversion Process</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our advanced conversion engine follows a multi-stage process to transform static PDF documents into fully editable Word files:
              </p>

              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">1. Document Structure Analysis</h4>
                  <p className="text-gray-700 leading-relaxed">
                    The converter first analyzes the PDF file structure to identify all content elements including text blocks, images, tables, headers, footers, and metadata. This process maps the exact position and dimensions of every element on each page. Unlike simple text extraction tools, our system understands the semantic relationships between elements - recognizing when text forms paragraphs, lists, headings, or table cells based on positioning, font attributes, and spacing patterns.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-xl border border-green-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">2. Text Extraction and Encoding</h4>
                  <p className="text-gray-700 leading-relaxed">
                    The system extracts all text content while preserving character encoding, font information, text styles (bold, italic, underline), text size, and color attributes. For scanned PDFs or image-based documents, our OCR (Optical Character Recognition) technology analyzes pixel patterns to identify and extract text characters. The OCR engine supports over 100 languages and can handle various fonts, text orientations, and complex layouts including mixed language documents and mathematical notation.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">3. Layout Reconstruction</h4>
                  <p className="text-gray-700 leading-relaxed">
                    This critical stage rebuilds the document layout in Word format. The converter analyzes spacing patterns, indentation, line heights, and column structures to recreate paragraphs, headings, bullet points, and numbered lists. Tables are reconstructed by detecting cell boundaries, merging patterns, and border styles. Multi-column layouts are converted to Word columns or text boxes depending on complexity. Headers and footers are identified and placed in the appropriate Word document sections.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl border border-orange-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">4. Image and Graphics Processing</h4>
                  <p className="text-gray-700 leading-relaxed">
                    All images embedded in the PDF are extracted at their original resolution and re-embedded into the Word document. Vector graphics are converted to high-quality image formats (PNG or JPEG) when necessary. Image positioning is calculated relative to surrounding text to maintain proper text wrapping and alignment. Charts, diagrams, and other complex graphics are preserved with maximum fidelity, though some vector-to-raster conversion may be necessary for compatibility.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">5. Formatting and Style Application</h4>
                  <p className="text-gray-700 leading-relaxed">
                    The final stage applies Word formatting and styles to match the original PDF appearance. Font families are mapped to their Word equivalents or embedded as needed. Paragraph spacing, line spacing, and alignment are configured. Page margins, page size, and orientation are set to match the PDF. Hyperlinks are preserved and made clickable. The system also creates Word styles for headings and other formatted elements, making the document easier to edit and reformat after conversion.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Convert PDF to Word?</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                PDFs are excellent for sharing and distributing finalized documents because they look identical on any device and cannot be easily modified. However, this immutability becomes a limitation when you need to edit content, extract text for reuse, or adapt a document for different purposes. Converting PDF to Word format provides numerous benefits:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">📝 Full Editing Capability</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Word documents allow you to modify text, change formatting, add or remove sections, insert comments, track changes, and collaborate with others. This is essential for contracts that need revisions, forms that require customization, reports that need updates, or any document requiring ongoing editing.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">♻️ Content Reusability</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Extract and reuse text, images, or tables from PDFs for presentations, reports, websites, or other documents. This saves time compared to manual retyping and eliminates transcription errors. Particularly valuable for academic research, content creation, and data analysis.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">🔍 Text Search and Processing</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Word's find and replace functions work seamlessly with converted documents, enabling bulk text updates, terminology changes, and content analysis. You can also use Word's grammar checker, spell checker, and readability statistics tools.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">📋 Template Creation</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Convert PDF forms, contracts, or standard documents to Word format to create reusable templates. Modify layouts, add form fields, insert merge fields for mail merge operations, and customize for different departments or clients.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Common PDF to Word Conversion Challenges</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                While modern conversion technology is highly accurate, certain PDF characteristics can present challenges. Understanding these helps set realistic expectations and troubleshoot issues:
              </p>

              <div className="space-y-4 mb-8">
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-5 rounded-r-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Complex Multi-Column Layouts</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    PDFs with newspaper-style columns, sidebars, and text boxes in specific positions may not convert perfectly to Word's flowing text model. The converter attempts to maintain layout using Word columns and text boxes, but manual adjustment may be needed for complex magazine or newsletter layouts.
                  </p>
                </div>

                <div className="border-l-4 border-blue-400 bg-blue-50 p-5 rounded-r-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Custom or Embedded Fonts</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    PDFs using specialized fonts (particularly decorative or symbol fonts) may not render identically in Word if those fonts aren't installed on your system. The converter substitutes similar fonts, but exact appearance may vary. To preserve custom fonts, ensure they're installed on your computer before opening the converted Word file.
                  </p>
                </div>

                <div className="border-l-4 border-purple-400 bg-purple-50 p-5 rounded-r-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Scanned Documents and Image-Based PDFs</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    PDFs created by scanning paper documents contain images of text rather than actual text data. While OCR technology can extract text with high accuracy (typically 95-99% for clear scans), the original layout structure is difficult to reconstruct perfectly. Handwriting, poor scan quality, or unusual fonts reduce accuracy. For best OCR results, use high-resolution scans (300+ DPI) with good contrast and lighting.
                  </p>
                </div>

                <div className="border-l-4 border-green-400 bg-green-50 p-5 rounded-r-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Interactive PDF Forms</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    PDFs with fillable form fields, JavaScript actions, or digital signatures convert to standard text and text boxes in Word. The interactive functionality doesn't transfer, but the visual layout and any filled-in content are preserved. You can recreate form functionality using Word's form controls or content controls if needed.
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tips for Best Conversion Results</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-indigo-100">
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-indigo-600 font-bold text-xl">•</span>
                    <p className="text-gray-800 leading-relaxed"><strong>Use high-quality source PDFs:</strong> PDFs created directly from Word or other applications convert better than scanned documents. If possible, request the original source file instead of converting from PDF.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-indigo-600 font-bold text-xl">•</span>
                    <p className="text-gray-800 leading-relaxed"><strong>Check file integrity first:</strong> Ensure your PDF opens correctly and displays properly before conversion. Corrupted or damaged PDFs may produce unexpected results.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-indigo-600 font-bold text-xl">•</span>
                    <p className="text-gray-800 leading-relaxed"><strong>Review and adjust after conversion:</strong> While our converter maintains high accuracy, always review the converted Word document and make minor adjustments to formatting, spacing, or layout as needed.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-indigo-600 font-bold text-xl">•</span>
                    <p className="text-gray-800 leading-relaxed"><strong>For scanned PDFs, optimize scan settings:</strong> Use 300 DPI or higher, ensure good lighting and contrast, align pages straight, and use clean white backgrounds for best OCR accuracy.</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-indigo-600 font-bold text-xl">•</span>
                    <p className="text-gray-800 leading-relaxed"><strong>Consider page-by-page conversion for mixed documents:</strong> If your PDF has dramatically different page layouts (like a cover page, text pages, and appendices), converting in sections may yield better control over formatting.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd
              adSlot="7777777777"
              adFormat="rectangle"
              style={{ display: 'block', width: '300px', height: '250px' }}
            />
          </div>
        </main>
      </div>
    </>
  );
}