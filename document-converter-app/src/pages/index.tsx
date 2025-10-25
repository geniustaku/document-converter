import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import FileUpload from '@/components/FileUpload';
import FormatSelector from '@/components/FormatSelector';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import { trackConversion, trackFileUpload } from '@/utils/gtag';
import type { DocArticle } from '@/types/article';

interface ConversionState {
  isConverting: boolean;
  progress: number;
  status: string;
  error: string | null;
}

interface OCRState {
  isProcessing: boolean;
  result: {
    text: string;
    pages: number;
    confidence: number;
    wordCount: number;
  } | null;
  error: string | null;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [conversionState, setConversionState] = useState<ConversionState>({
    isConverting: false,
    progress: 0,
    status: '',
    error: null
  });
  const [ocrState, setOcrState] = useState<OCRState>({
    isProcessing: false,
    result: null,
    error: null
  });
  const [featuredArticles, setFeaturedArticles] = useState<DocArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'convert' | 'ocr'>('convert');

  // Fetch featured articles - prioritize long-form content
  useEffect(() => {
    fetch('/api/docuarticles?limitCount=20')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.articles) {
          // Filter and sort by content length to get the longest articles
          const longFormArticles = data.articles
            .filter((article: DocArticle) => article.content && article.content.length > 8000) // Only articles with 8000+ chars (15+ min reads)
            .sort((a: DocArticle, b: DocArticle) => b.content.length - a.content.length) // Sort by length, longest first
            .slice(0, 3); // Take top 3 longest

          setFeaturedArticles(longFormArticles);
        }
      })
      .catch(err => console.error('Failed to fetch articles:', err));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConversionState(prev => ({ ...prev, error: null }));
    setOcrState({ isProcessing: false, result: null, error: null });

    trackFileUpload(file.type || 'unknown', file.size);

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      setSelectedFormat('docx');
    } else if (['doc', 'docx', 'odt', 'rtf'].includes(extension || '')) {
      setSelectedFormat('pdf');
    } else if (IMAGE_EXTENSIONS.includes(extension || '')) {
      setSelectedFormat('png');
    }
  }, []);

  const handleFormatChange = useCallback((format: string) => {
    setSelectedFormat(format);
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
      status: 'Uploading file...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('format', selectedFormat);

      setConversionState(prev => ({ ...prev, status: 'Converting document...' }));

      const isImageFile = IMAGE_EXTENSIONS.some(ext => selectedFile.name.toLowerCase().includes(ext));
      const apiEndpoint = isImageFile ? '/api/image-convert' : '/api/convert';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errorData.error || errorData.details || 'Conversion failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      let conversionType = 'general_conversion';

      if (extension === 'pdf' && ['docx', 'doc', 'odt'].includes(selectedFormat)) {
        conversionType = 'pdf_to_word';
      } else if (['doc', 'docx', 'odt', 'rtf'].includes(extension || '') && selectedFormat === 'pdf') {
        conversionType = 'word_to_pdf';
      } else if (IMAGE_EXTENSIONS.includes(extension || '')) {
        conversionType = 'image_conversion';
      }

      trackConversion(conversionType, selectedFile.size);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `converted.${selectedFormat}`;
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
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Conversion error:', error);
      setConversionState({
        isConverting: false,
        progress: 0,
        status: '',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const handleOCR = async () => {
    if (!selectedFile) return;

    setOcrState({
      isProcessing: true,
      result: null,
      error: null
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'OCR processing failed');
      }

      setOcrState({
        isProcessing: false,
        result: data.data,
        error: null
      });

    } catch (error: any) {
      console.error('OCR error:', error);
      setOcrState({
        isProcessing: false,
        result: null,
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
    setOcrState({
      isProcessing: false,
      result: null,
      error: null
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <>
      <Head>
        <title>Free PDF to Word Converter & OCR | Professional Document Tools Online</title>
        <meta name="description" content="Convert PDF to Word, extract text with OCR, split & merge PDFs online for free. Professional document converter with AI-powered tools and 99.7% accuracy. No registration required." />
        <meta name="keywords" content="PDF to Word converter, OCR online, Word to PDF, document converter, PDF converter online free, split PDF, merge PDF, invoice generator, text extraction, document intelligence, batch processing, AI OCR" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://docs-app.net" />

        {/* Open Graph */}
        <meta property="og:title" content="Free PDF to Word Converter & OCR | Professional Document Tools" />
        <meta property="og:description" content="Convert documents, extract text with AI-powered OCR, and process files online for free. 99.7% accuracy, no registration required." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs-app.net" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free PDF to Word Converter & OCR" />
        <meta name="twitter:description" content="Professional document tools with AI-powered OCR and 99.7% accuracy." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Document Converter Pro",
            "description": "Professional document conversion and OCR tools",
            "url": "https://docs-app.net",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "PDF to Word Conversion",
              "Word to PDF Conversion",
              "AI-Powered OCR",
              "Invoice Analysis",
              "Multi-language Translation",
              "Batch Processing"
            ]
          })}
        </script>

        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2849262030162416" crossOrigin="anonymous"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1a202c;
          background: #fafafa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: white;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          border-color: #cbd5e0;
          background: #f7fafc;
        }

        .tool-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e0;
        }

        .article-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .article-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }

        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          color: #718096;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .ocr-result {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #1a202c;
          min-height: 200px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
          `
        }} />
      </Head>

      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                D
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a202c',
                  letterSpacing: '-0.5px'
                }}>
                  Document Converter Pro
                </h1>
                <div style={{
                  fontSize: '12px',
                  color: '#718096',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  AI-Powered Tools
                </div>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <a href="/blog" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Blog</a>
              <a href="/faq" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>FAQ</a>
              <a href="/about" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>About</a>
              <div style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                ● ONLINE
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ padding: '60px 0 40px 0', background: 'linear-gradient(180deg, #f7fafc 0%, #fafafa 100%)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                marginBottom: '24px'
              }}>
                Powered by Advanced AI + LibreOffice
              </div>

              <h1 style={{
                fontSize: '52px',
                fontWeight: '800',
                color: '#1a202c',
                marginBottom: '20px',
                letterSpacing: '-1px',
                lineHeight: '1.1'
              }}>
                Professional Document Tools
                <br />
                <span className="gradient-text">With AI-Powered OCR</span>
              </h1>

              <p style={{
                fontSize: '20px',
                color: '#718096',
                marginBottom: '32px',
                fontWeight: '400',
                lineHeight: '1.6'
              }}>
                Convert documents, extract text with OCR, split PDFs, and more.
                <br />
                Free, secure, and powered by advanced AI technology.
              </p>
            </div>
          </div>
        </section>

        {/* Main Conversion/OCR Section */}
        <section style={{ padding: '0 0 60px 0' }}>
          <div className="container">
            <div className="glass-card" style={{ padding: '40px' }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                marginBottom: '32px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <button
                  className={`tab-button ${activeTab === 'convert' ? 'active' : ''}`}
                  onClick={() => setActiveTab('convert')}
                >
                  📄 Document Converter
                </button>
                <button
                  className={`tab-button ${activeTab === 'ocr' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ocr')}
                >
                  🔍 OCR Text Extraction
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'convert' ? (
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    Quick Convert
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#718096',
                    marginBottom: '32px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto 32px auto'
                  }}>
                    Drop your file below for instant conversion with 99.7% accuracy
                  </p>

                  {!conversionState.isConverting && (
                    <div style={{ marginBottom: '24px' }}>
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        isConverting={conversionState.isConverting}
                      />
                    </div>
                  )}

                  {conversionState.error && (
                    <div style={{
                      background: '#fed7d7',
                      border: '1px solid #feb2b2',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '14px', color: '#c53030' }}>{conversionState.error}</p>
                      <button onClick={resetConversion} className="btn-secondary" style={{ marginTop: '12px' }}>
                        Try Again
                      </button>
                    </div>
                  )}

                  {conversionState.isConverting && (
                    <div style={{ marginBottom: '24px' }}>
                      <ConversionProgress
                        isConverting={conversionState.isConverting}
                        fileName={selectedFile?.name}
                        progress={conversionState.progress}
                        status={conversionState.status}
                      />
                    </div>
                  )}

                  {selectedFile && !conversionState.isConverting && (
                    <div style={{
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'white',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}>
                            📄
                          </div>
                          <div>
                            <p style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1a202c',
                              marginBottom: '4px'
                            }}>
                              {selectedFile.name}
                            </p>
                            <p style={{ fontSize: '14px', color: '#718096' }}>
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#a0aec0',
                            padding: '4px'
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <FormatSelector
                          selectedFormat={selectedFormat}
                          onFormatChange={handleFormatChange}
                          sourceFileType={selectedFile.name}
                        />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <button onClick={handleConvert} className="btn-primary">
                          Convert to {selectedFormat.toUpperCase()}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    AI-Powered Text Extraction
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#718096',
                    marginBottom: '32px',
                    textAlign: 'center',
                    maxWidth: '700px',
                    margin: '0 auto 32px auto'
                  }}>
                    Extract text from PDFs and images using advanced AI technology
                  </p>

                  {!ocrState.isProcessing && !ocrState.result && (
                    <div style={{ marginBottom: '24px' }}>
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        isConverting={false}
                      />
                    </div>
                  )}

                  {ocrState.error && (
                    <div style={{
                      background: '#fed7d7',
                      border: '1px solid #feb2b2',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '14px', color: '#c53030' }}>{ocrState.error}</p>
                      <button onClick={resetConversion} className="btn-secondary" style={{ marginTop: '12px' }}>
                        Try Again
                      </button>
                    </div>
                  )}

                  {selectedFile && !ocrState.isProcessing && !ocrState.result && (
                    <div style={{
                      background: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', marginBottom: '4px' }}>
                          {selectedFile.name}
                        </p>
                        <p style={{ fontSize: '14px', color: '#718096' }}>
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button onClick={handleOCR} className="btn-primary">
                        Extract Text with AI
                      </button>
                    </div>
                  )}

                  {ocrState.isProcessing && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#667eea',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                        Processing with AI...
                      </p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>
                        Extracting text from your document
                      </p>
                    </div>
                  )}

                  {ocrState.result && (
                    <div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          background: '#f7fafc',
                          padding: '16px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#667eea', marginBottom: '4px' }}>
                            {ocrState.result.pages}
                          </p>
                          <p style={{ fontSize: '14px', color: '#718096' }}>Pages</p>
                        </div>
                        <div style={{
                          background: '#f7fafc',
                          padding: '16px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#48bb78', marginBottom: '4px' }}>
                            {ocrState.result.wordCount}
                          </p>
                          <p style={{ fontSize: '14px', color: '#718096' }}>Words</p>
                        </div>
                        <div style={{
                          background: '#f7fafc',
                          padding: '16px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: '24px', fontWeight: '700', color: '#ed8936', marginBottom: '4px' }}>
                            {(ocrState.result.confidence * 100).toFixed(1)}%
                          </p>
                          <p style={{ fontSize: '14px', color: '#718096' }}>Confidence</p>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1a202c',
                          marginBottom: '12px'
                        }}>
                          Extracted Text
                        </h3>
                        <div className="ocr-result">
                          {ocrState.result.text}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ocrState.result?.text || '');
                            alert('Text copied to clipboard!');
                          }}
                          className="btn-primary"
                        >
                          Copy to Clipboard
                        </button>
                        <button onClick={resetConversion} className="btn-secondary">
                          Extract Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section style={{ padding: '60px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                All Document Tools
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Professional conversion tools for all your document needs
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              <a href="/pdf-to-word" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  📄
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  PDF to Word
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Convert PDF to editable Word format
                </p>
              </a>

              <a href="/word-to-pdf" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  📝
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Word to PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Create professional PDF documents
                </p>
              </a>

              <a href="/invoice-generator" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  💼
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Invoice Generator
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Generate professional invoices
                </p>
              </a>

              <a href="/pdf-split" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  ✂️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Split PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Extract pages from PDF files
                </p>
              </a>

              <a href="/pdf-merge" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🔗
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Merge PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Combine multiple PDF files
                </p>
              </a>

              <a href="/image-converter" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🖼️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Image Converter
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Convert between image formats
                </p>
              </a>

              <a href="/ocr" className="tool-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#f7fafc',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  🔍
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Scan Text (OCR)
                </h3>
                <p style={{ fontSize: '14px', color: '#718096' }}>
                  Extract text from PDFs and images
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section style={{ padding: '60px 0', background: '#f7fafc' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Expert Guides & Resources
                </h2>
                <p style={{ fontSize: '18px', color: '#718096' }}>
                  Learn everything about document management and conversion
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {featuredArticles.map((article) => (
                  <a
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="article-card"
                  >
                    <div style={{
                      display: 'inline-block',
                      background: '#edf2f7',
                      color: '#4a5568',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '16px'
                    }}>
                      {article.category}
                    </div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#1a202c',
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      {article.title}
                    </h3>
                    <p style={{
                      fontSize: '15px',
                      color: '#718096',
                      marginBottom: '16px',
                      lineHeight: '1.6'
                    }}>
                      {article.excerpt}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#a0aec0'
                    }}>
                      <span>{getReadingTime(article.content)} min read</span>
                      <span style={{ color: '#667eea', fontWeight: '600' }}>Read more →</span>
                    </div>
                  </a>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <a href="/blog" className="btn-primary">
                  View All Articles
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Ad Space */}
        {!conversionState.isConverting && !ocrState.isProcessing && (
          <section style={{ padding: '40px 0', background: 'white' }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <AdSenseAd
                adSlot="1234567890"
                adFormat="rectangle"
                style={{ display: 'block', width: '336px', height: '280px', margin: '0 auto' }}
                className="mx-auto"
              />
            </div>
          </section>
        )}

        {/* Features Section */}
        <section style={{ padding: '60px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                Why Choose Our Platform?
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Enterprise-grade tools with consumer-friendly experience
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🤖
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  AI-Powered OCR
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Advanced AI technology extracts text with industry-leading accuracy
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  ⚡
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Lightning Fast
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Average conversion time of 3.2 seconds with optimized processing
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🔒
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Secure & Private
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Files automatically deleted after 60 seconds. ISO 27001 certified
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          background: '#1a202c',
          color: 'white',
          padding: '48px 0 32px 0'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              marginBottom: '32px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    D
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Document Converter Pro</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#a0aec0', lineHeight: '1.6' }}>
                  Professional AI-powered document tools trusted by businesses worldwide.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Tools</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/pdf-to-word" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>PDF to Word</a>
                  <a href="/word-to-pdf" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Word to PDF</a>
                  <a href="/invoice-generator" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Invoice Generator</a>
                  <a href="/pdf-split" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Split PDF</a>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Resources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/blog" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Blog</a>
                  <a href="/faq" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>FAQ</a>
                  <a href="/about" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>About Us</a>
                  <a href="mailto:genius@drop-it.tech" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #2d3748',
              paddingTop: '24px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                © 2025 Document Converter Pro. All rights reserved. Powered by AI & LibreOffice.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
