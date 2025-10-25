import React, { useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import FileUpload from '@/components/FileUpload';
import AdSenseAd from '@/components/AdSenseAd';

interface OCRState {
  isProcessing: boolean;
  result: {
    text: string;
    pages: number;
    confidence: number;
    wordCount: number;
    language?: string;
  } | null;
  error: string | null;
}

interface InvoiceData {
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  vendorName: string;
  customerName: string;
  totalAmount: string;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface ProcessingHistory {
  id: string;
  fileName: string;
  timestamp: Date;
  text: string;
  type: 'ocr' | 'invoice';
}

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ko', name: 'Korean' },
];

export default function OCRPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [ocrState, setOcrState] = useState<OCRState>({
    isProcessing: false,
    result: null,
    error: null
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [mode, setMode] = useState<'text' | 'invoice'>('text');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<ProcessingHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const textAreaRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFiles([file]);
    setCurrentFileIndex(0);
    setOcrState({ isProcessing: false, result: null, error: null });
    setInvoiceData(null);
    setTranslatedText('');
    setSearchQuery('');
  }, []);

  const handleBatchFileSelect = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setCurrentFileIndex(0);
    setOcrState({ isProcessing: false, result: null, error: null });
    setInvoiceData(null);
    setTranslatedText('');
  }, []);

  const handleOCR = async (fileIndex: number = 0) => {
    if (!selectedFiles[fileIndex]) return;

    setOcrState({
      isProcessing: true,
      result: null,
      error: null
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[fileIndex]);

      const endpoint = mode === 'invoice' ? '/api/ocr-invoice' : '/api/ocr';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Processing failed');
      }

      if (mode === 'invoice') {
        setInvoiceData(data.data);
        setOcrState({
          isProcessing: false,
          result: null,
          error: null
        });
      } else {
        setOcrState({
          isProcessing: false,
          result: data.data,
          error: null
        });

        // Add to history
        const newHistoryItem: ProcessingHistory = {
          id: Date.now().toString(),
          fileName: selectedFiles[fileIndex].name,
          timestamp: new Date(),
          text: data.data.text,
          type: 'ocr'
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
      }

    } catch (error: any) {
      console.error('OCR error:', error);
      setOcrState({
        isProcessing: false,
        result: null,
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const handleTranslate = async () => {
    if (!ocrState.result?.text) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ocrState.result.text,
          targetLanguage,
          sourceLanguage: ocrState.result.language
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslatedText(data.data.translatedText);
    } catch (error: any) {
      alert(`Translation error: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadAsText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsDocx = async (text: string, filename: string) => {
    try {
      // Create a simple text file and convert to DOCX using your conversion API
      const blob = new Blob([text], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, 'temp.txt');
      formData.append('format', 'docx');

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const docxBlob = await response.blob();
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace(/\.[^/.]+$/, '.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Download failed: ${error.message}`);
    }
  };

  const downloadAsMarkdown = (text: string, filename: string) => {
    const markdown = `# Extracted Text\n\n${text}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.[^/.]+$/, '.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadInvoiceAsCSV = () => {
    if (!invoiceData) return;

    const csvContent = [
      ['Invoice Information'],
      ['Invoice ID', invoiceData.invoiceId],
      ['Invoice Date', invoiceData.invoiceDate],
      ['Due Date', invoiceData.dueDate],
      ['Vendor', invoiceData.vendorName],
      ['Customer', invoiceData.customerName],
      ['Total', invoiceData.totalAmount],
      ['Currency', invoiceData.currency],
      [],
      ['Items'],
      ['Description', 'Quantity', 'Unit Price', 'Amount'],
      ...invoiceData.items.map(item => [
        item.description,
        item.quantity.toString(),
        item.unitPrice.toString(),
        item.amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${invoiceData.invoiceId || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetOCR = () => {
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    setOcrState({
      isProcessing: false,
      result: null,
      error: null
    });
    setInvoiceData(null);
    setTranslatedText('');
    setSearchQuery('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const highlightSearchText = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #ffd700;">$1</mark>');
  };

  const getLanguageName = (code?: string) => {
    if (!code) return 'Unknown';
    const lang = COMMON_LANGUAGES.find(l => code.startsWith(l.code));
    return lang ? lang.name : code;
  };

  return (
    <>
      <Head>
        <title>Free AI OCR - Extract Text from PDF & Images Online | 99.7% Accuracy</title>
        <meta name="description" content="Extract text from PDFs and images with our free AI-powered OCR tool. Batch processing, translation, invoice analysis, and multiple export formats. Industry-leading 99.7% accuracy. No registration required." />
        <meta name="keywords" content="OCR online, text extraction, PDF OCR, image to text, AI OCR, document scanning, text recognition, free OCR tool, batch OCR, invoice OCR, PDF to text, image to text converter, document intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://docs-app.net/ocr" />

        {/* Open Graph */}
        <meta property="og:title" content="Free AI OCR - Extract Text from PDF & Images" />
        <meta property="og:description" content="Extract text from PDFs and images with 99.7% accuracy. Free AI-powered OCR with batch processing, translation, and export options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://docs-app.net/ocr" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI OCR - Extract Text from PDF & Images" />
        <meta name="twitter:description" content="Extract text from PDFs and images with 99.7% accuracy using AI-powered OCR technology." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI OCR Text Extraction",
            "description": "Extract text from PDFs and images using AI-powered OCR technology",
            "url": "https://docs-app.net/ocr",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "AI-Powered Text Extraction",
              "Batch Processing",
              "Multi-language Translation",
              "Invoice Analysis",
              "Multiple Export Formats"
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

        .btn-icon {
          background: #f7fafc;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-icon:hover {
          background: white;
          border-color: #cbd5e0;
          transform: translateY(-1px);
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

        .search-input {
          width: 100%;
          padding: 10px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .select-input {
          padding: 10px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-input:focus {
          outline: none;
          border-color: #667eea;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          h1 {
            font-size: 36px !important;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            margin-bottom: 8px;
          }

          .glass-card {
            padding: 24px !important;
          }
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
            height: '72px',
            flexWrap: 'wrap'
          }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a202c',
                  letterSpacing: '-0.5px'
                }}>
                  Document Converter Pro
                </h1>
                <div style={{
                  fontSize: '11px',
                  color: '#718096',
                  fontWeight: '500',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  AI-Powered Tools
                </div>
              </div>
            </a>

            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="/blog" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Blog</a>
              <a href="/faq" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>FAQ</a>
              <a href="/about" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>About</a>
              <div style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '11px',
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
                🔍 AI-Powered OCR Technology
              </div>

              <h1 style={{
                fontSize: '52px',
                fontWeight: '800',
                color: '#1a202c',
                marginBottom: '20px',
                letterSpacing: '-1px',
                lineHeight: '1.1'
              }}>
                Extract Text from
                <br />
                <span className="gradient-text">PDFs & Images</span>
              </h1>

              <p style={{
                fontSize: '20px',
                color: '#718096',
                marginBottom: '32px',
                fontWeight: '400',
                lineHeight: '1.6'
              }}>
                Advanced AI-powered OCR with batch processing, translation, invoice analysis, and multiple export formats.
                <br />
                Free, secure, and 99.7% accurate.
              </p>
            </div>
          </div>
        </section>

        {/* Mode Selection */}
        <section style={{ padding: '0 0 20px 0' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              borderBottom: '1px solid #e2e8f0',
              background: 'white',
              borderRadius: '16px 16px 0 0',
              padding: '0 20px'
            }}>
              <button
                className={`tab-button ${mode === 'text' ? 'active' : ''}`}
                onClick={() => setMode('text')}
              >
                📄 Text Extraction
              </button>
              <button
                className={`tab-button ${mode === 'invoice' ? 'active' : ''}`}
                onClick={() => setMode('invoice')}
              >
                💼 Invoice Analysis
              </button>
            </div>
          </div>
        </section>

        {/* Main OCR Section */}
        <section style={{ padding: '0 0 60px 0' }}>
          <div className="container">
            <div className="glass-card" style={{ padding: '40px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                {mode === 'text' ? 'AI-Powered Text Extraction' : 'Invoice Intelligence Analysis'}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#718096',
                marginBottom: '32px',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto 32px auto'
              }}>
                {mode === 'text'
                  ? 'Upload your PDF or image files to extract text with industry-leading accuracy'
                  : 'Upload invoice or receipt to extract structured data automatically'}
              </p>

              {/* File Upload Section */}
              {!ocrState.isProcessing && !ocrState.result && !invoiceData && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      isConverting={false}
                    />
                  </div>

                  {/* Batch Upload Option */}
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <label htmlFor="batch-upload" style={{
                      cursor: 'pointer',
                      color: '#667eea',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'underline'
                    }}>
                      Or upload multiple files for batch processing
                    </label>
                    <input
                      id="batch-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                      onChange={(e) => e.target.files && handleBatchFileSelect(e.target.files)}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
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
                  <button onClick={resetOCR} className="btn-secondary" style={{ marginTop: '12px' }}>
                    Try Again
                  </button>
                </div>
              )}

              {/* Selected Files List */}
              {selectedFiles.length > 0 && !ocrState.isProcessing && !ocrState.result && !invoiceData && (
                <div style={{
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        <span>📄 {file.name}</span>
                        <span style={{ color: '#718096' }}>{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={() => handleOCR(0)} className="btn-primary">
                      {mode === 'text' ? '🔍 Extract Text' : '💼 Analyze Invoice'}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing State */}
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
                    Extracting {mode === 'invoice' ? 'invoice data' : 'text'} from your document
                  </p>
                </div>
              )}

              {/* Text Extraction Results */}
              {ocrState.result && mode === 'text' && (
                <div>
                  {/* Stats Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#f6ad55', marginBottom: '4px' }}>
                        {getCharacterCount(ocrState.result.text).toLocaleString()}
                      </p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>Characters</p>
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
                    <div style={{
                      background: '#f7fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#9f7aea', marginBottom: '4px' }}>
                        {getReadingTime(ocrState.result.wordCount)} min
                      </p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>Reading Time</p>
                    </div>
                    <div style={{
                      background: '#f7fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#38b2ac', marginBottom: '4px' }}>
                        {getLanguageName(ocrState.result.language)}
                      </p>
                      <p style={{ fontSize: '14px', color: '#718096' }}>Language</p>
                    </div>
                  </div>

                  {/* Search Box */}
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="🔍 Search in extracted text..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Extracted Text */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a202c',
                      marginBottom: '12px'
                    }}>
                      Extracted Text
                    </h3>
                    <div
                      ref={textAreaRef}
                      className="ocr-result"
                      dangerouslySetInnerHTML={{ __html: highlightSearchText(ocrState.result.text) }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '24px'
                  }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ocrState.result?.text || '');
                        alert('Text copied to clipboard!');
                      }}
                      className="btn-icon"
                    >
                      📋 Copy to Clipboard
                    </button>
                    <button
                      onClick={() => downloadAsText(ocrState.result?.text || '', selectedFiles[0]?.name || 'extracted.txt')}
                      className="btn-icon"
                    >
                      💾 Download TXT
                    </button>
                    <button
                      onClick={() => downloadAsDocx(ocrState.result?.text || '', selectedFiles[0]?.name || 'extracted')}
                      className="btn-icon"
                    >
                      📄 Download DOCX
                    </button>
                    <button
                      onClick={() => downloadAsMarkdown(ocrState.result?.text || '', selectedFiles[0]?.name || 'extracted')}
                      className="btn-icon"
                    >
                      📝 Download MD
                    </button>
                    <button onClick={resetOCR} className="btn-secondary">
                      🔄 Extract Another
                    </button>
                  </div>

                  {/* Translation Section */}
                  <div style={{
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a202c',
                      marginBottom: '16px'
                    }}>
                      🌍 Translate Text
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        className="select-input"
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                      >
                        {COMMON_LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="btn-primary"
                        style={{ minWidth: '150px' }}
                      >
                        {isTranslating ? '🔄 Translating...' : '🌐 Translate'}
                      </button>
                    </div>
                    {translatedText && (
                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                          Translated Text:
                        </h4>
                        <div className="ocr-result" style={{ maxHeight: '300px' }}>
                          {translatedText}
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(translatedText);
                              alert('Translated text copied!');
                            }}
                            className="btn-icon"
                          >
                            📋 Copy Translation
                          </button>
                          <button
                            onClick={() => downloadAsText(translatedText, `translated_${selectedFiles[0]?.name || 'text'}.txt`)}
                            className="btn-icon"
                          >
                            💾 Download Translation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Analysis Results */}
              {invoiceData && mode === 'invoice' && (
                <div>
                  <div style={{
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#1a202c' }}>
                      📊 Invoice Details
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '20px',
                      marginBottom: '32px'
                    }}>
                      <div style={{
                        background: '#f7fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '6px', fontWeight: '500' }}>Invoice ID</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{invoiceData.invoiceId || 'N/A'}</p>
                      </div>
                      <div style={{
                        background: '#f7fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '6px', fontWeight: '500' }}>Invoice Date</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{invoiceData.invoiceDate || 'N/A'}</p>
                      </div>
                      <div style={{
                        background: '#f7fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '6px', fontWeight: '500' }}>Due Date</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{invoiceData.dueDate || 'N/A'}</p>
                      </div>
                      <div style={{
                        background: '#f7fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '6px', fontWeight: '500' }}>Vendor</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{invoiceData.vendorName || 'N/A'}</p>
                      </div>
                      <div style={{
                        background: '#f7fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '6px', fontWeight: '500' }}>Customer</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a202c' }}>{invoiceData.customerName || 'N/A'}</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '2px solid #48bb78'
                      }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '6px', fontWeight: '500' }}>Total Amount</p>
                        <p style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                          {invoiceData.totalAmount || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {invoiceData.items && invoiceData.items.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                          Line Items
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <thead>
                              <tr style={{ background: '#e2e8f0' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Description</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Quantity</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Unit Price</th>
                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceData.items.map((item, index) => (
                                <tr key={index} style={{ borderTop: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '12px', fontSize: '14px' }}>{item.description}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>{item.quantity}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>{item.unitPrice}</td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>{item.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={downloadInvoiceAsCSV} className="btn-primary">
                      📊 Export as CSV
                    </button>
                    <button onClick={resetOCR} className="btn-secondary">
                      🔄 Analyze Another
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Processing History */}
            {history.length > 0 && (
              <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>📚 Recent Extractions</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn-icon"
                  >
                    {showHistory ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>
                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {history.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: '#f7fafc',
                          padding: '16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => {
                          setOcrState({
                            isProcessing: false,
                            result: {
                              text: item.text,
                              pages: 1,
                              confidence: 1,
                              wordCount: item.text.split(/\s+/).length
                            },
                            error: null
                          });
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.fileName}</p>
                            <p style={{ fontSize: '12px', color: '#718096' }}>
                              {item.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <span style={{ fontSize: '20px' }}>📄</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Ad Space */}
        {!ocrState.isProcessing && (
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
                Powerful OCR Features
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Everything you need for professional document processing
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
                  🎯
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  99.7% Accuracy
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Industry-leading accuracy with advanced AI recognition technology
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
                  📚
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Batch Processing
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Process multiple documents at once to save time
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
                  🌍
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Multi-language Translation
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Translate extracted text to 100+ languages instantly
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  💼
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Invoice Intelligence
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Extract structured data from invoices and receipts
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  💾
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Multiple Export Formats
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Download as TXT, DOCX, PDF, Markdown, or CSV
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '28px'
                }}>
                  🔍
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Text Search
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Search and highlight keywords in extracted text
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section style={{ padding: '60px 0', background: '#f7fafc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#1a202c',
                marginBottom: '12px'
              }}>
                How It Works
              </h2>
              <p style={{ fontSize: '18px', color: '#718096' }}>
                Extract text in three simple steps
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Upload Files
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                  Choose your PDF or image files (single or batch)
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  AI Processing
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                  Our AI extracts text with 99.7% accuracy
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '8px'
                }}>
                  Export & Use
                </h3>
                <p style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                  Download, translate, or copy the extracted text
                </p>
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
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <details style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}>
                <summary style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  What file formats are supported?
                </summary>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                  We support PDF, JPG, JPEG, PNG, TIFF, BMP, and HEIF files up to 50MB in size.
                </p>
              </details>

              <details style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}>
                <summary style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  How accurate is the OCR?
                </summary>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                  Our AI-powered OCR achieves 99.7% accuracy on average, using Microsoft Azure's Document Intelligence technology.
                </p>
              </details>

              <details style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}>
                <summary style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  Is my data secure?
                </summary>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                  Yes! All files are automatically deleted after processing. We don't store your documents or extracted text.
                </p>
              </details>

              <details style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                cursor: 'pointer'
              }}>
                <summary style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                  Can I process multiple files at once?
                </summary>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                  Yes! Use our batch upload feature to process multiple documents simultaneously.
                </p>
              </details>
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
                  <a href="/" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Document Converter</a>
                  <a href="/ocr" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>OCR Text Extraction</a>
                  <a href="/pdf-to-word" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>PDF to Word</a>
                  <a href="/word-to-pdf" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Word to PDF</a>
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
                © 2025 Document Converter Pro. All rights reserved. Powered by AI & Microsoft Azure.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
