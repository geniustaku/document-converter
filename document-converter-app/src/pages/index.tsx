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
        <title>Free PDF to Word Converter - Convert Documents Online Instantly</title>
        <meta name="description" content="Convert PDF to editable Word documents in seconds. AI-powered tools for content writing, email generation, summarization & more. Extract text from images and scanned PDFs. Split, merge, and transform documents online - completely free with no file size limits or watermarks." />
        <meta name="keywords" content="PDF to Word converter, convert PDF to Word, PDF converter online free, Word to PDF, split PDF, merge PDF, extract text from PDF, OCR scanner, invoice generator, document conversion, edit PDF, PDF tools, AI content writer, AI email writer, AI summarizer, GPT-4 tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://docs-app.net" />

        {/* Open Graph */}
        <meta property="og:title" content="Free PDF to Word Converter - Convert Documents Online Instantly" />
        <meta property="og:description" content="Convert PDF to editable Word documents, extract text from images, split and merge PDFs - all free with no file size limits." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs-app.net" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free PDF to Word Converter" />
        <meta name="twitter:description" content="Convert PDF to editable Word documents and extract text from images - completely free." />

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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #1a202c;
          background: #ffffff;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(99, 102, 241, 0.08);
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
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
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .tool-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 60px rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .tool-card:hover::before {
          opacity: 1;
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
        {/* Header - Premium Design */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '80px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}>
                📄
              </div>
              <div>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  marginBottom: '2px'
                }}>
                  Document Converter Pro
                </h1>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: '600',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase'
                }}>
                  Professional Tools Suite
                </div>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <a href="/blog" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' }}>Blog</a>
              <a href="/faq" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' }}>FAQ</a>
              <a href="/about" style={{ color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' }}>About</a>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '8px' }}>●</span>
                ONLINE
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section - Compact & Modern */}
        <section style={{
          padding: '40px 0 32px 0',
          background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05) 0%, transparent 50%), linear-gradient(180deg, #fafbff 0%, #ffffff 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '50px',
                padding: '6px 18px',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6366f1',
                letterSpacing: '0.5px'
              }}>
                ✨ Professional Tools & Expert Guides
              </div>

              <h1 style={{
                fontSize: '42px',
                fontWeight: '900',
                color: '#0f172a',
                marginBottom: '14px',
                letterSpacing: '-1.5px',
                lineHeight: '1.15'
              }}>
                Your <span className="gradient-text">Complete Hub</span> for Documents & Knowledge
              </h1>

              <p style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '24px',
                fontWeight: '400',
                lineHeight: '1.6',
                maxWidth: '650px',
                margin: '0 auto 24px'
              }}>
                Free AI-powered tools plus comprehensive guides from document experts. Transform files, learn best practices, boost productivity - all in one place.
              </p>

              {/* Search Bar */}
              <div style={{
                maxWidth: '550px',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#94a3b8',
                  pointerEvents: 'none'
                }}>
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Search tools... (PDF to Word, Resume Builder, OCR)"
                  onChange={(e) => {
                    const search = e.target.value.toLowerCase();
                    const cards = document.querySelectorAll('.tool-card');
                    cards.forEach((card) => {
                      const text = card.textContent?.toLowerCase() || '';
                      (card as HTMLElement).style.display = text.includes(search) ? 'block' : 'none';
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 52px',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '14px',
                    outline: 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 4px 24px rgba(102, 126, 234, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                  }}
                />
                <svg
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#94a3b8'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                fontSize: '14px',
                color: '#64748b'
              }}>
                <span>✓ 100% Free</span>
                <span>✓ No Sign-up</span>
                <span>✓ No Watermarks</span>
                <span>✓ Unlimited Use</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section style={{ padding: '20px 0 60px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '8px',
                letterSpacing: '-0.3px'
              }}>
                All Tools
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '400' }}>
                Click any tool to get started
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* PDF to Word */}
              <a href="/pdf-to-word" className="tool-card">
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
                  📄
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  PDF to Word
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Convert PDF to editable DOCX
                </p>
              </a>

              {/* Word to PDF */}
              <a href="/word-to-pdf" className="tool-card">
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
                  📝
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Word to PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create professional PDFs
                </p>
              </a>

              {/* Compress PDF */}
              <a href="/compress-pdf" className="tool-card">
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
                  🗜️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Compress PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Reduce PDF file size
                </p>
              </a>

              {/* JPG to PDF */}
              <a href="/jpg-to-pdf" className="tool-card">
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
                  🖼️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  JPG to PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Convert images to PDF
                </p>
              </a>

              {/* Merge PDF */}
              <a href="/merge-pdf" className="tool-card">
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
                  📑
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Merge PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Combine multiple PDFs
                </p>
              </a>

              {/* Split PDF */}
              <a href="/split-pdf" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  ✂️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Split PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Extract specific pages
                </p>
              </a>

              {/* Excel to PDF */}
              <a href="/excel-to-pdf" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📊
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Excel to PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Convert spreadsheets to PDF
                </p>
              </a>

              {/* Rotate PDF */}
              <a href="/rotate-pdf" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🔄
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Rotate PDF
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Fix page orientation
                </p>
              </a>

              {/* PDF to Excel */}
              <a href="/pdf-to-excel" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📑
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  PDF to Excel
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Extract tables from PDFs
                </p>
              </a>

              {/* OCR */}
              <a href="/ocr" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  👁️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  OCR Scanner
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Extract text from images
                </p>
              </a>

              {/* QR Code Generator */}
              <a href="/qr-code-generator" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📲
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  QR Code Generator
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create custom QR codes
                </p>
              </a>

              {/* Resume Builder */}
              <a href="/resume-builder" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📄
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Resume Builder
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create professional CVs
                </p>
              </a>

              {/* Invoice Generator */}
              <a href="/invoice-generator" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🧾
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Invoice Generator
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create professional invoices
                </p>
              </a>

              {/* Background Remover */}
              <a href="/background-remover" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🖼️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Background Remover
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Remove image backgrounds
                </p>
              </a>

              {/* Paraphrase Tool */}
              <a href="/paraphrase-tool" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  ✍️
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Paraphrase Tool
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Rephrase text instantly
                </p>
              </a>

              {/* Image Resizer */}
              <a href="/image-resizer" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📐
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Image Resizer
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Resize for social media
                </p>
              </a>

              {/* Password Generator */}
              <a href="/password-generator" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🔐
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Password Generator
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create secure passwords
                </p>
              </a>

              {/* Word Counter */}
              <a href="/word-counter" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📊
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Word Counter
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Count words & characters
                </p>
              </a>

              {/* Barcode Generator */}
              <a href="/barcode-generator" className="tool-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  📊
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Barcode Generator
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                  Create EAN, UPC barcodes
                </p>
              </a>
            </div>

            {/* AI-Powered Tools Section */}
            <div style={{ marginTop: '48px' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '8px',
                  letterSpacing: '-0.3px'
                }}>
                  🤖 AI-Powered Tools
                </h2>
                <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '400' }}>
                  Advanced content creation with AI
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px'
              }}>
                {/* AI Summarizer */}
                <a href="/ai-summarizer" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    📝
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Summarizer
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    Extract key points instantly
                  </p>
                </a>

                {/* AI Content Writer */}
                <a href="/ai-content-writer" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    ✍️
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Content Writer
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    Generate blogs, essays & articles
                  </p>
                </a>

                {/* AI Email Writer */}
                <a href="/ai-email-writer" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    ✉️
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Email Writer
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    Professional emails & outreach
                  </p>
                </a>

                {/* AI Social Media Generator */}
                <a href="/ai-social-media" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    📱
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Social Media
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    Posts for all platforms
                  </p>
                </a>

                {/* AI Grammar Checker */}
                <a href="/ai-grammar-checker" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    ✓
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Grammar Checker
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    Fix grammar & style errors
                  </p>
                </a>

                {/* AI Product Description */}
                <a href="/ai-product-description" className="tool-card">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                  }}>
                    🛍️
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '8px'
                  }}>
                    AI Product Description
                  </h3>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.5' }}>
                    E-commerce copywriting
                  </p>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Blog Articles Section */}
        <section style={{ padding: '60px 0', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px',
                letterSpacing: '-0.5px'
              }}>
                📚 Expert Guides & Tutorials
              </h2>
              <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '400', maxWidth: '700px', margin: '0 auto' }}>
                Learn from comprehensive guides covering document management, productivity tips, and professional workflows
              </p>
            </div>

            {featuredArticles.length > 0 ? (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '32px',
                  marginBottom: '40px'
                }}>
                  {featuredArticles.slice(0, 3).map((article) => (
                    <a
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      }}
                    >
                      {article.featured_image && (
                        <div style={{
                          width: '100%',
                          height: '180px',
                          background: `linear-gradient(rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)), url(${article.featured_image}) center/cover`,
                          backgroundColor: '#f7fafc'
                        }}></div>
                      )}
                      <div style={{ padding: '24px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#667eea',
                          marginBottom: '12px'
                        }}>
                          {article.category}
                        </div>
                        <h3 style={{
                          fontSize: '19px',
                          fontWeight: '700',
                          color: '#1a202c',
                          marginBottom: '10px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.title}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#718096',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.excerpt}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          color: '#a0aec0',
                          paddingTop: '14px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <span>📖 {article.reading_time} min read</span>
                          <span style={{ color: '#667eea', fontWeight: '600' }}>Read More →</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <a
                    href="/blog"
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    View All {featuredArticles.length} Articles →
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>📚</div>
                <p style={{ fontSize: '16px', color: '#718096' }}>
                  Loading expert guides and tutorials...
                </p>
              </div>
            )}
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
                  🔍 Extract Text from Images
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
                    Extract Text from Images & Scanned Documents
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#718096',
                    marginBottom: '32px',
                    textAlign: 'center',
                    maxWidth: '700px',
                    margin: '0 auto 32px auto'
                  }}>
                    Turn photos, screenshots, and scanned PDFs into editable text in seconds
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
                        Extract Text Now
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
                        Processing your document...
                      </p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>
                        Extracting text and recognizing characters
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

        {/* Featured Articles */}

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

        {/* How to Convert PDF to Word Section */}
        <section style={{ padding: '60px 0', background: '#f7fafc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                How to Convert PDF to Word Document
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Follow these simple steps to convert any PDF file to an editable Word document
              </p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{
                    minWidth: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                      Upload Your PDF File
                    </h3>
                    <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                      Click the upload area or drag and drop your PDF file. We support files up to 100MB. Your file is encrypted during upload for security.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{
                    minWidth: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                      Choose Output Format
                    </h3>
                    <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                      Select DOCX (Microsoft Word), DOC (older Word format), or ODT (OpenDocument) as your output format. DOCX is recommended for best compatibility.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{
                    minWidth: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    3
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
                      Convert & Download
                    </h3>
                    <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                      Click "Convert to DOCX" and wait a few seconds while we process your file. Your converted Word document will automatically download when ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '60px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Everything you need to know about converting documents online
              </p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Why does my PDF lose formatting when converted to Word?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  PDFs and Word documents work differently. PDFs place content at exact positions on a page, while Word uses flowing text. Complex layouts with multiple columns, text boxes, or custom fonts may shift slightly. For best results, use the DOCX format and check the "Preserve Layout" option if available. Scanned PDFs require text extraction first, which may not preserve the original layout.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Can I convert scanned PDFs or images with text?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Yes! Use the "Extract Text from Images" tab above. Our text recognition technology analyzes scanned documents, photos of paper, screenshots, and image-based PDFs to extract all readable text. This works with printed text, typed documents, and even some clear handwriting. The accuracy depends on image quality - higher resolution images produce better results.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Are there file size limits for conversion?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  We support files up to 100MB per upload. Most documents are well under this limit - a typical 50-page PDF with images is around 5-10MB. If you have a larger file, try splitting it into smaller sections using our PDF Split tool first, then converting each section separately.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Is my data safe? Do you store my files?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Your privacy is our priority. All uploads are encrypted using SSL/TLS. Files are processed in isolated containers and automatically deleted from our servers within 60 seconds after conversion. We never view, store, or share your documents. We don't require registration, so we don't collect personal information unless you contact us.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  What's the difference between DOCX, DOC, and ODT formats?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  DOCX is the modern Microsoft Word format (2007 and later) and is recommended for most users. It offers the best compatibility and smaller file sizes. DOC is the older Word format (97-2003) - use this only if you need to open files in very old versions of Word. ODT is the OpenDocument Text format used by LibreOffice and OpenOffice - choose this if you use open-source office software.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Can I convert multiple files at once?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Currently, files are processed one at a time to ensure the fastest conversion speed for each document. To convert multiple files, simply repeat the process for each file. The conversion typically takes only 3-5 seconds per file, so processing multiple documents is still very quick. We prioritize speed and accuracy over batch processing because individual file handling allows us to optimize each conversion for the specific document type, layout complexity, and content. This approach also maintains maximum security by isolating each conversion in its own secure container.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Why would I convert Word to PDF?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Converting to PDF is ideal when you want to share documents that should look the same on any device. PDFs prevent accidental edits, preserve exact formatting regardless of fonts installed, and are universally readable. Use PDF format for resumes, contracts, forms, ebooks, and any document you want to distribute without allowing changes. PDFs also reduce file size in many cases, making them perfect for email attachments. Additionally, PDF/A format ensures long-term archival compliance for legal and regulatory requirements. Many organizations and job application systems specifically require PDF format for submissions because it guarantees document integrity and prevents viruses that can hide in editable formats.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  What file formats do you support for conversion?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  We support comprehensive format conversion including: PDF to DOCX/DOC/ODT/TXT, Word (DOCX/DOC) to PDF, Excel (XLSX/XLS) to PDF, PowerPoint (PPTX/PPT) to PDF, images (JPG/PNG/BMP/TIFF/GIF) to PDF, PDF to JPG/PNG, RTF to PDF/DOCX, ODT to PDF/DOCX, and HTML to PDF. Our OCR system extracts text from images, scanned PDFs, photos, and screenshots in over 100 languages. For specialized needs, we also offer tools for splitting PDFs (extract specific pages), merging PDFs (combine multiple files), compressing PDFs (reduce file size without quality loss), rotating PDF pages, and adding digital signatures to PDFs.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  How accurate is your PDF to Word conversion?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Our conversion engine achieves 99.7% accuracy in preserving document structure, formatting, and content. This includes maintaining paragraph styles, headings, bullet points, numbered lists, tables with borders and shading, embedded images with original positioning, headers and footers, page numbers, hyperlinks, and text formatting (bold, italic, underline, font families, and sizes). Complex elements like multi-column layouts, text boxes, charts, and diagrams are reconstructed with high fidelity. The accuracy may be slightly lower for PDFs created from scanned documents or those with unusual fonts, but our OCR technology can extract text even from image-based PDFs. For optimal results, start with a high-quality PDF that was originally created digitally rather than scanned from paper.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Do you support password-protected PDFs?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  If you know the password to open a PDF, you can convert it by first opening the file in a PDF reader, removing the password protection in the security settings, saving it as an unprotected PDF, then uploading it to our converter. We cannot bypass PDF passwords as this would violate security principles and potentially enable unauthorized access to protected documents. For password-protected PDFs, you must have the owner password (which allows editing) or user password (which allows opening) to remove restrictions legally and ethically before conversion.
                </p>
              </div>

              <div style={{ background: '#f7fafc', padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Can your OCR read handwritten text?
                </h3>
                <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6' }}>
                  Our OCR technology is optimized for printed and typed text, where it achieves the highest accuracy. It can recognize some clear, legible handwriting - particularly block letters and neat cursive - but accuracy varies significantly based on handwriting style, clarity, and consistency. For best results with handwritten documents, ensure good lighting, high image resolution (at least 300 DPI), clear contrast between text and background, and consistent letter formation. Printed forms with handwritten entries work better than fully handwritten notes. For critical handwritten documents, we recommend reviewing and correcting the extracted text manually after OCR processing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Space */}
        {!conversionState.isConverting && !ocrState.isProcessing && (
          <section style={{ padding: '40px 0', background: '#f7fafc' }}>
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

        {/* Professional Document Conversion Platform Section */}
        <section style={{ padding: '60px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                Professional Document Conversion Made Simple
              </h2>
              <p style={{ fontSize: '18px', color: '#718096', maxWidth: '900px', margin: '0 auto 24px' }}>
                Our advanced document conversion platform combines cutting-edge AI technology with user-friendly tools to handle all your document processing needs. Whether you're converting PDFs to editable formats, extracting text from images, or generating professional business documents, we provide enterprise-grade quality completely free.
              </p>
            </div>

            {/* Detailed Feature Breakdown */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 60px', background: '#f8fafc', borderRadius: '16px', padding: '40px 32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '24px', textAlign: 'center' }}>
                Advanced Features That Set Us Apart
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    🎯 99.7% Conversion Accuracy
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Our conversion engine uses advanced algorithms to preserve formatting, fonts, images, tables, and layout structure. Unlike basic converters that produce garbled results, our technology maintains document integrity through intelligent parsing and reconstruction. This means your converted documents look virtually identical to the originals, saving you hours of manual reformatting.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    🤖 AI-Powered Text Recognition (OCR)
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Extract text from scanned documents, photos, screenshots, and image-based PDFs with industry-leading accuracy. Our multi-language recognition supports over 100 languages including English, Spanish, French, German, Chinese, Japanese, and Arabic. The system automatically detects text orientation, handles mixed fonts and sizes, and even recognizes text in complex layouts like invoices, receipts, and business cards.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    🔒 Enterprise-Grade Security & Privacy
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Your documents are encrypted using AES-256 encryption during upload and processing. All conversions happen in isolated, secure containers that are completely wiped after 60 seconds. We don't require registration or collect personal data, ensuring your privacy is protected. Our infrastructure is GDPR compliant and regularly audited for security vulnerabilities. Perfect for handling confidential business documents, legal contracts, medical records, and financial statements.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    ⚡ Lightning-Fast Processing Speed
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Most conversions complete in under 5 seconds, even for large files up to 100MB. Our distributed cloud infrastructure automatically scales to handle traffic spikes, ensuring consistent performance 24/7. Unlike desktop software that slows down your computer, our web-based platform uses powerful server processing while your device stays responsive.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    🌍 Cross-Platform Compatibility
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Works seamlessly on Windows, macOS, Linux, iOS, Android, and ChromeOS. Access your conversion tools from any modern web browser including Chrome, Firefox, Safari, and Edge. No software installation, no system requirements, no compatibility issues. Perfect for teams working across different operating systems or individuals who switch between devices.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: '600', color: '#1a202c', marginBottom: '10px' }}>
                    💎 Professional-Quality Output
                  </h4>
                  <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: '1.7' }}>
                    Generate documents that meet professional and academic standards. Our DOCX output is fully compatible with Microsoft Word 2007 and later, Google Docs, and LibreOffice. PDF output conforms to PDF/A standards for long-term archiving. Images maintain their original resolution and quality. Tables, charts, and graphics are preserved with pixel-perfect accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* Value Proposition Grid */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                Why Choose Our Platform?
              </h2>
              <p style={{ fontSize: '18px', color: '#718096', maxWidth: '800px', margin: '0 auto' }}>
                Save time and money while getting professional results with our comprehensive document toolkit
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              marginBottom: '60px'
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
                  💰
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Save Money on Software
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  No need to purchase Adobe Acrobat ($239/year) or Microsoft Office ($99/year). Convert unlimited files completely free with no hidden costs or subscription fees.
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
                  Instant Access Anywhere
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Works on any device with a browser - Windows, Mac, Linux, tablets, and phones. No installation, no downloads, no updates. Just upload and convert in seconds.
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
                  Your Privacy Protected
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  All files are encrypted during upload and automatically deleted from our servers after 60 seconds. We never store, view, or share your documents with anyone.
                </p>
              </div>
            </div>

            {/* Common Use Cases */}
            <div style={{ background: '#f7fafc', borderRadius: '16px', padding: '48px 32px' }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                Common Document Conversion Scenarios
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    📄 Edit PDF Contracts & Forms
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Convert PDF contracts, job applications, or legal documents to Word format so you can fill in fields, make edits, and add your information before signing.
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    📸 Digitize Paper Documents
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Take a photo of receipts, invoices, business cards, or handwritten notes and extract the text for easy copying, searching, or archiving in digital format.
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    💼 Create Professional PDFs
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Convert Word resumes, proposals, or reports to PDF format for professional sharing. PDFs maintain formatting across all devices and can't be accidentally edited.
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    📚 Extract Text from Books & Research
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Pull quotes and citations from PDF textbooks, research papers, or ebooks. Convert scanned book pages to searchable text for notes and academic work.
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    ✂️ Split Large PDF Files
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Extract specific pages from multi-page PDFs like manuals, reports, or presentations. Perfect for sharing only relevant sections or reducing file sizes.
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                    🔗 Combine Multiple Documents
                  </h4>
                  <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                    Merge separate PDFs into one complete document. Combine contracts with amendments, compile reports with appendices, or create complete presentation decks.
                  </p>
                </div>
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
                  Free online document conversion tools for PDFs, Word documents, images, and more. No registration required.
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
                © 2025 Document Converter Pro. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
