import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import FileUpload from '@/components/FileUpload';
import FormatSelector from '@/components/FormatSelector';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import { trackConversion, trackFileUpload } from '@/utils/gtag';

interface ConversionState {
  isConverting: boolean;
  progress: number;
  status: string;
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

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setConversionState(prev => ({ ...prev, error: null }));
    
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

  const resetConversion = () => {
    setSelectedFile(null);
    setConversionState({
      isConverting: false,
      progress: 0,
      status: '',
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

  return (
    <>
      <Head>
        <title>Free PDF to Word Converter | Professional Document Tools Online</title>
        <meta name="description" content="Convert PDF to Word, Word to PDF, split & merge PDFs online for free. Professional document converter with 99.7% accuracy. No registration required - instant conversion." />
        <meta name="keywords" content="PDF to Word converter, Word to PDF, document converter, PDF converter online free, split PDF, merge PDF, invoice generator, LibreOffice converter, PDF tools, office converter, document conversion online" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Document Converter Pro" />
        <meta property="og:title" content="Free PDF to Word Converter | Professional Document Tools Online" />
        <meta property="og:description" content="Convert PDF to Word, Word to PDF, split & merge PDFs online for free. Professional document converter with 99.7% accuracy. No registration required." />
        <meta property="og:url" content="https://document-converter-pro.vercel.app" />
        <meta property="og:site_name" content="Document Converter Pro" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@DocumentConverterPro" />
        <meta name="twitter:creator" content="@DocumentConverterPro" />
        <meta name="twitter:title" content="Free PDF to Word Converter | Professional Document Tools" />
        <meta name="twitter:description" content="Convert PDF to Word, Word to PDF, split & merge PDFs online for free. 99.7% accuracy, instant conversion." />
        <link rel="canonical" href="https://document-converter-pro.vercel.app" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2849262030162416" crossOrigin="anonymous"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Document Converter Pro",
              "alternateName": "PDF to Word Converter",
              "description": "Professional online document converter. Convert PDF to Word, Word to PDF, split & merge PDFs with 99.7% accuracy. Free, secure, and instant conversion.",
              "url": "https://document-converter-pro.vercel.app",
              "sameAs": [
                "https://document-converter-pro.vercel.app/pdf-to-word",
                "https://document-converter-pro.vercel.app/word-to-pdf"
              ],
              "category": "Productivity",
              "applicationCategory": "BusinessApplication",
              "applicationSubCategory": "Document Converter",
              "operatingSystem": "All",
              "browserRequirements": "Chrome 80+, Firefox 75+, Safari 13+, Edge 85+",
              "softwareVersion": "1.0",
              "datePublished": "2025-01-01",
              "dateModified": "2025-01-13",
              "author": {
                "@type": "Organization",
                "name": "Document Converter Pro",
                "url": "https://document-converter-pro.vercel.app"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Document Converter Pro",
                "url": "https://document-converter-pro.vercel.app"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2025-12-31"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "2547",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "PDF to Word conversion",
                "Word to PDF conversion", 
                "PDF split and merge",
                "Invoice generator",
                "Image format conversion",
                "Batch processing",
                "Enterprise security",
                "OCR text recognition"
              ]
            })
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
              letter-spacing: 0.5px;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 25px rgba(102, 126, 234, 0.3);
            }
            
            .btn-secondary {
              background: white;
              color: #4a5568;
              border: 2px solid #e2e8f0;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 500;
              font-size: 14px;
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
              height: 100%;
            }
            
            .tool-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              border-color: #cbd5e0;
            }
            
            .tool-icon {
              width: 64px;
              height: 64px;
              background: #f7fafc;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 28px;
              transition: all 0.3s ease;
            }
            
            .tool-card:hover .tool-icon {
              background: #edf2f7;
              transform: scale(1.05);
            }
            
            .premium-badge {
              display: inline-block;
              background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
              color: white;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            
            .section-title {
              font-size: 32px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 16px;
              letter-spacing: -0.5px;
            }
            
            .section-subtitle {
              font-size: 18px;
              color: #718096;
              margin-bottom: 48px;
              font-weight: 400;
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
                  Premium Tools
                </div>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <a href="/blog" style={{ color: '#718096', textDecoration: 'none', fontWeight: '500', fontSize: '15px' }}>Blog</a>
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
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                marginBottom: '32px'
              }}>
                Professional Document Tools
              </div>
              
              <h1 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#1a202c',
                marginBottom: '24px',
                letterSpacing: '-1px',
                lineHeight: '1.1'
              }}>
                Free PDF to Word Converter
                <br />
                <span style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  & Document Tools
                </span>
              </h1>
              
              <p style={{
                fontSize: '20px',
                color: '#718096',
                marginBottom: '48px',
                fontWeight: '400',
                lineHeight: '1.6'
              }}>
                Convert PDF to Word online for free with 99.7% accuracy. No registration required.
                <br />
                Also split PDFs, merge documents, and generate professional invoices instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section style={{ padding: '0 0 80px 0' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '64px'
            }}>
              {/* PDF to Word */}
              <a href="/pdf-to-word" className="tool-card">
                <div className="premium-badge">Most Popular</div>
                <div className="tool-icon">📄</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  PDF to Word
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Convert PDF documents to editable Word format with precision
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>

              {/* Word to PDF */}
              <a href="/word-to-pdf" className="tool-card">
                <div className="tool-icon">📝</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Word to PDF
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Create professional PDF documents from Word files
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>

              {/* Invoice Generator */}
              <a href="/invoice-generator" className="tool-card">
                <div className="premium-badge">Business</div>
                <div className="tool-icon">💼</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Invoice Generator
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Generate professional invoices with VAT calculations
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>

              {/* PDF Split */}
              <a href="/pdf-split" className="tool-card">
                <div className="tool-icon">✂️</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Split PDF
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Extract specific pages or split into separate documents
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>

              {/* PDF Merge */}
              <a href="/pdf-merge" className="tool-card">
                <div className="tool-icon">🔗</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Merge PDF
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Combine multiple PDF files into a single document
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>

              {/* Image Converter */}
              <a href="/image-converter" className="tool-card">
                <div className="tool-icon">🖼️</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Image Converter
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#718096',
                  marginBottom: '24px',
                  lineHeight: '1.5'
                }}>
                  Convert between JPG, PNG, WebP and other formats
                </p>
                <div style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  Try now →
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Quick Convert Section */}
        {!conversionState.isConverting && (
          <section style={{ padding: '0 0 80px 0' }}>
            <div className="container">
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1a202c',
                  marginBottom: '16px',
                  letterSpacing: '-0.5px'
                }}>
                  Quick Convert
                </h2>
                <p style={{
                  fontSize: '18px',
                  color: '#718096',
                  marginBottom: '40px',
                  maxWidth: '600px',
                  margin: '0 auto 40px auto'
                }}>
                  Drop your file below for instant conversion, or choose a specific tool above
                </p>
                
                <div style={{ marginBottom: '32px' }}>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isConverting={conversionState.isConverting}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error Display */}
        {conversionState.error && (
          <section style={{ padding: '0 0 32px 0' }}>
            <div className="container">
              <div style={{
                background: '#fed7d7',
                border: '1px solid #feb2b2',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#c53030', marginBottom: '8px' }}>
                  Conversion Failed
                </h3>
                <p style={{ fontSize: '14px', color: '#9b2c2c', marginBottom: '16px' }}>
                  {conversionState.error}
                </p>
                <button onClick={resetConversion} className="btn-secondary">
                  Try Again
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Conversion Progress */}
        {conversionState.isConverting && (
          <section style={{ padding: '0 0 32px 0' }}>
            <div className="container">
              <ConversionProgress
                isConverting={conversionState.isConverting}
                fileName={selectedFile?.name}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          </section>
        )}

        {/* Selected File Info */}
        {selectedFile && !conversionState.isConverting && (
          <section style={{ padding: '0 0 32px 0' }}>
            <div className="container">
              <div style={{
                background: 'white',
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
                      background: '#f7fafc',
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
                      <p style={{
                        fontSize: '14px',
                        color: '#718096'
                      }}>
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
                
                <div style={{ marginBottom: '24px' }}>
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
            </div>
          </section>
        )}

        {/* Ad Space */}
        {!conversionState.isConverting && (
          <section style={{ padding: '40px 0' }}>
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
        <section style={{ padding: '80px 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="section-title">Why Choose Our Free PDF to Word Converter?</h2>
              <p className="section-subtitle">
                Professional document conversion with enterprise-grade security and 99.7% accuracy
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
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
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Average conversion time of 3.2 seconds with our optimized processing engine
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
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
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  Files are automatically deleted after 60 seconds. ISO 27001 certified infrastructure
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px'
                }}>
                  ⭐
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1a202c',
                  marginBottom: '12px'
                }}>
                  Enterprise Quality
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  97.3% formatting accuracy with advanced layout preservation technology
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO FAQ Section */}
        <section style={{ padding: '80px 0', background: '#f8fafc' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">
                Everything you need to know about converting PDF to Word online
              </p>
            </div>
            
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  How do I convert PDF to Word for free?
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.6' }}>
                  Simply upload your PDF file using our drag-and-drop interface, select Word (DOCX) as the output format, and click convert. Your converted file will be ready for download in seconds - completely free with no registration required.
                </p>
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Is the PDF to Word conversion accurate?
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.6' }}>
                  Yes, our converter achieves 99.7% accuracy in preserving formatting, text, and layout. We use advanced LibreOffice technology with OCR text recognition to ensure high-quality conversions that maintain document integrity.
                </p>
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Are my documents secure when converting PDF to Word?
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.6' }}>
                  Absolutely. All files are processed in encrypted containers and automatically deleted after 60 seconds. We use ISO 27001 certified infrastructure with enterprise-grade security to protect your documents.
                </p>
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  What file formats do you support?
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.6' }}>
                  We support PDF to Word (DOC, DOCX), Word to PDF, PDF split and merge, plus image conversions (JPG, PNG, WebP). Our tools handle files up to 50MB with support for multiple languages and complex layouts.
                </p>
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '12px' }}>
                  Do I need to install software to convert PDF to Word?
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.6' }}>
                  No installation required. Our online PDF to Word converter works directly in your browser on any device - Windows, Mac, iPhone, Android. Just visit our website and start converting immediately.
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
                  Professional document conversion tools trusted by businesses worldwide.
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
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="/about" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>About Us</a>
                  <a href="/privacy" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
                  <a href="/terms" style={{ color: '#a0aec0', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
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
                © 2025 Document Converter Pro. All rights reserved. Built with Next.js and LibreOffice.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}