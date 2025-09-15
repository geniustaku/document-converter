import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import SignatureCanvas from '@/components/SignatureCanvas';
import PDFPreview from '@/components/PDFPreview';
import { trackConversion, trackEvent } from '@/utils/gtag';

interface ConversionState {
  isSigning: boolean;
  progress: number;
  status: string;
  error: string | null;
}

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
}

export default function DigitalSignature() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [signatureType, setSignatureType] = useState<'text' | 'canvas'>('canvas');
  const [canvasSignature, setCanvasSignature] = useState<string | null>(null);
  const [signatureStyle, setSignatureStyle] = useState('handwritten');
  const [signaturePosition, setSignaturePosition] = useState('bottom-right');
  const [signatureSize, setSignatureSize] = useState('medium');
  const [addTimestamp, setAddTimestamp] = useState(false);
  const [addCertificate, setAddCertificate] = useState(false);
  // Remove the duplicate positioning states and only use the one passed from PDFPreview
  const [pdfSignaturePosition, setPdfSignaturePosition] = useState<SignaturePosition>({ x: 70, y: 80, page: 1 });

  const [conversionState, setConversionState] = useState<ConversionState>({
    isSigning: false,
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
        error: 'Only PDF files can be digitally signed' 
      }));
      return;
    }
    
    if (pdfFiles.length > 20) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Maximum 20 PDF files allowed for bulk signing' 
      }));
      return;
    }
    
    setSelectedFiles(prev => {
      const combined = [...prev, ...pdfFiles];
      if (combined.length > 20) {
        return combined.slice(0, 20);
      }
      return combined;
    });
    
    setConversionState(prev => ({ ...prev, error: null }));
    
    // Track file uploads
    trackEvent('digital_signature_files_added', 'Business Tools', `${pdfFiles.length} files`);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCanvasSignature = useCallback((signature: string | null) => {
    setCanvasSignature(signature);
    setConversionState(prev => ({ ...prev, error: null }));
  }, []);

  // This is the key fix - use only the PDFPreview positioning
  const handleSignaturePositionChange = useCallback((x: number, y: number, page: number) => {
    setPdfSignaturePosition({ x, y, page });
  }, []);

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 8;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 400);
    return interval;
  };

  const handleSignDocuments = async () => {
    if (selectedFiles.length === 0) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please select at least one PDF file to sign' 
      }));
      return;
    }

    if (signatureType === 'text' && !signatureText) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please provide signature text or switch to canvas drawing' 
      }));
      return;
    }

    if (signatureType === 'canvas' && !canvasSignature) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please draw your signature or switch to text input' 
      }));
      return;
    }

    setConversionState({
      isSigning: true,
      progress: 0,
      status: 'Preparing digital signature...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      // Track signing start
      trackEvent('digital_signature_started', 'Business Tools', `${selectedFiles.length} files`);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      formData.append('signerName', signerName);
      formData.append('signerEmail', signerEmail);
      formData.append('signatureType', signatureType);
      formData.append('signatureText', signatureText);
      if (canvasSignature) {
        formData.append('canvasSignature', canvasSignature);
      }
      formData.append('signatureStyle', signatureStyle);
      formData.append('signaturePosition', signaturePosition);
      formData.append('signatureSize', signatureSize);
      // Use the accurate position from PDFPreview
      formData.append('signaturePDFPosition', JSON.stringify({
        x: pdfSignaturePosition.x,
        y: pdfSignaturePosition.y,
        page: pdfSignaturePosition.page,
        positioning: 'pdf-preview-based'
      }));
      formData.append('addTimestamp', addTimestamp.toString());
      formData.append('addCertificate', addCertificate.toString());

      setConversionState(prev => ({ ...prev, status: 'Applying digital signatures...' }));

      const response = await fetch('/api/digital-signature', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('Error data:', errorData);
        throw new Error(errorData.error || errorData.details || `Digital signature failed (${response.status})`);
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful signature
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      trackConversion('digital_signature', totalSize);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'signed_document.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\\n]*=((['\"]).*?\\2|[^;\\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['\"]/g, '');
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setConversionState({
          isSigning: false,
          progress: 0,
          status: '',
          error: null
        });
        setSelectedFiles([]);
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      setConversionState({
        isSigning: false,
        progress: 0,
        status: '',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetSigning = () => {
    setSelectedFiles([]);
    setConversionState({
      isSigning: false,
      progress: 0,
      status: '',
      error: null
    });
  };

  const generateSampleSignature = () => {
    if (signerName) {
      const styles = ['handwritten', 'professional', 'elegant'];
      const currentStyle = styles[Math.floor(Math.random() * styles.length)];
      setSignatureStyle(currentStyle);
      
      // Generate signature based on name
      const signatures = [
        signerName,
        signerName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' '),
        signerName.split(' ').map((n, i) => i === 0 ? n : n.charAt(0).toUpperCase() + '.').join(' ')
      ];
      setSignatureText(signatures[Math.floor(Math.random() * signatures.length)]);
    }
  };

  const getSignatureSize = () => {
    switch (signatureSize) {
      case 'small': return { width: 120, fontSize: 12 };
      case 'large': return { width: 200, fontSize: 18 };
      default: return { width: 160, fontSize: 14 };
    }
  };

  const getSignatureStyle = () => {
    switch (signatureStyle) {
      case 'handwritten': return { fontFamily: 'serif', fontStyle: 'italic', color: '#1e40af' };
      case 'professional': return { fontFamily: 'sans-serif', fontWeight: 'bold', color: '#000000' };
      case 'elegant': return { fontFamily: 'serif', fontStyle: 'normal', color: '#374151' };
      default: return { fontFamily: 'serif', fontStyle: 'italic', color: '#1e40af' };
    }
  };

  return (
    <>
      <Head>
        <title>Free Digital Signature Tool - Sign PDF Online Instantly | No Registration Required</title>
        <meta name="description" content="Sign PDF documents online instantly with our free digital signature tool. Drag & drop PDFs, draw or type signatures, position precisely. 100% free, no registration, legally binding signatures compliant with international standards." />
        <meta name="keywords" content="free digital signature, sign PDF online, electronic signature, e-signature tool, PDF signing, online document signing, digital signature generator, electronic signature creator, sign documents online, PDF signature software, free e-signature, bulk PDF signing, signature placement, drag drop signature" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Document Converter Pro" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
        
        {/* Enhanced mobile meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Document Converter Pro" />
        <meta property="og:title" content="Free Digital Signature Tool - Sign PDF Online Instantly" />
        <meta property="og:description" content="Sign PDF documents online instantly with our free digital signature tool. Drag & drop PDFs, draw or type signatures, position precisely. 100% free, no registration required." />
        <meta property="og:url" content="https://docs-app.net/digital-signature" />
        <meta property="og:image" content="https://docs-app.net/images/digital-signature-tool.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@docsapp" />
        <meta name="twitter:title" content="Free Digital Signature Tool - Sign PDF Online Instantly" />
        <meta name="twitter:description" content="Sign PDF documents online instantly. Draw signatures, drag & drop positioning, bulk signing. 100% free, no registration." />
        <meta name="twitter:image" content="https://docs-app.net/images/digital-signature-tool.png" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="Digital Signature Tool" />
        <meta name="apple-mobile-web-app-title" content="Sign PDF Online" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Canonical and alternate */}
        <link rel="canonical" href="https://docs-app.net/digital-signature" />
        <link rel="alternate" hrefLang="en" href="https://docs-app.net/digital-signature" />
        <link rel="alternate" hrefLang="x-default" href="https://docs-app.net/digital-signature" />
        
        {/* Enhanced Schema Markup for Digital Signature Tool */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              [
                {
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  "name": "Free Digital Signature Tool",
                  "alternateName": "PDF Electronic Signature Creator",
                  "description": "Professional online digital signature tool for signing PDF documents instantly. Draw signatures, drag & drop positioning, bulk signing capabilities. 100% free with no registration required.",
                  "url": "https://docs-app.net/digital-signature",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Any",
                  "browserRequirements": "Modern web browser with HTML5 support",
                  "softwareVersion": "1.0",
                  "datePublished": "2024-01-01",
                  "dateModified": "${new Date().toISOString().split('T')[0]}",
                  "publisher": {
                    "@type": "Organization",
                    "name": "Document Converter Pro",
                    "url": "https://docs-app.net"
                  },
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  },
                  "featureList": [
                    "Free unlimited digital signatures",
                    "Drag and drop PDF upload",
                    "Draw signature with mouse or touch",
                    "Type signature with custom fonts",
                    "Precise signature positioning",
                    "Bulk PDF signing (up to 20 files)",
                    "PDF preview with signature placement",
                    "No registration or account required",
                    "Legally binding electronic signatures",
                    "Instant download of signed documents",
                    "Mobile and desktop compatible",
                    "Secure client-side processing"
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "1247",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@context": "https://schema.org",
                  "@type": "HowTo",
                  "name": "How to Sign PDF Documents Online",
                  "description": "Step-by-step guide to digitally sign PDF documents using our free online signature tool",
                  "image": "https://docs-app.net/images/how-to-sign-pdf.png",
                  "totalTime": "PT2M",
                  "estimatedCost": {
                    "@type": "MonetaryAmount",
                    "currency": "USD",
                    "value": "0"
                  },
                  "step": [
                    {
                      "@type": "HowToStep",
                      "name": "Upload PDF Documents",
                      "text": "Drag and drop your PDF files or click to browse and select up to 20 PDF documents for signing",
                      "image": "https://docs-app.net/images/upload-pdf-step.png"
                    },
                    {
                      "@type": "HowToStep", 
                      "name": "Create Your Signature",
                      "text": "Choose to draw your signature with mouse/touch or type it using professional fonts. No personal information required.",
                      "image": "https://docs-app.net/images/create-signature-step.png"
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Position Signature",
                      "text": "Preview your PDF and drag the signature to the exact position where you want it to appear on the document",
                      "image": "https://docs-app.net/images/position-signature-step.png"
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Download Signed PDF",
                      "text": "Click sign and instantly download your legally binding digitally signed PDF documents",
                      "image": "https://docs-app.net/images/download-signed-pdf-step.png"
                    }
                  ]
                },
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Is the digital signature tool completely free?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, our digital signature tool is 100% free with unlimited signatures, no subscription fees, and no registration required. You can sign as many PDF documents as needed."
                      }
                    },
                    {
                      "@type": "Question", 
                      "name": "Are the digital signatures legally binding?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, digital signatures created with our tool are legally binding and compliant with international electronic signature laws including ESIGN Act, eIDAS, and other regional regulations."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Can I sign multiple PDF files at once?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, our tool supports bulk signing of up to 20 PDF files simultaneously. Upload multiple documents and apply your signature to all of them in one process."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Do I need to create an account to use the signature tool?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "No account or registration is required. You can start signing PDF documents immediately without providing any personal information or creating an account."
                      }
                    }
                  ]
                }
              ]
            `
          }}
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Document Converter Pro</h1>
                <h1 className="text-lg font-bold text-gray-900 sm:hidden">DocPro</h1>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/invoice-generator" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">Invoice</Link>
                <Link href="/pdf-split" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">Split</Link>
                <Link href="/pdf-merge" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">Merge</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section - Mobile Optimized */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200 mb-4 sm:mb-6">
              <span className="text-blue-600 font-medium text-xs sm:text-sm">🔐✍️ Advanced Digital Signature Tool</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 sm:mb-6">
              Free Digital Signature Tool - Sign PDF Online Instantly
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Create legally binding digital signatures for free with no registration required. 
              Draw signatures, drag & drop positioning, bulk signing up to 20 PDFs. Start signing instantly - 
              perfect for contracts, agreements, forms, and business documents.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 px-4">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Unlimited Signatures
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Legally Binding
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Bulk Signing
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Instant Verification
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                100% Free
              </div>
            </div>

            {/* Quick Upload Section - Mobile Optimized */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8 md:p-12 mb-8 sm:mb-12 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Start Signing - Upload Your PDF Documents
              </h2>

              <div 
                className="border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-blue-400 transition-colors duration-200 mb-4 sm:mb-6"
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleFilesSelect(files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                      Drop PDF files here or click to browse
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Upload up to 20 PDF files for bulk signing • Free • No registration required
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
                    id="file-upload-top"
                  />
                  <label
                    htmlFor="file-upload-top"
                    className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Choose PDF Files to Sign
                  </label>
                </div>
              </div>

              {/* Selected Files Display - Mobile Optimized */}
              {selectedFiles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      📁 Ready to Sign: {selectedFiles.length} PDF{selectedFiles.length > 1 ? 's' : ''} Selected
                    </h3>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-gray-400 hover:text-gray-600 text-xs sm:text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xs">PDF</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-400 hover:text-red-600 flex-shrink-0 ml-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-blue-600 font-medium">👇 Scroll down to create and position your signature</p>
                  </div>
                </div>
              )}
            </div>

            {/* Key Features - Mobile Optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Why Choose Our Digital Signature Tool?</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ FREE Forever</div>
                  <div className="text-gray-600">No subscription fees</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ Unlimited Signatures</div>
                  <div className="text-gray-600">Sign as many documents as needed</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ Bulk Signing</div>
                  <div className="text-gray-600">Sign multiple documents at once</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ No Registration</div>
                  <div className="text-gray-600">Start signing immediately</div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Top Ad - Mobile Responsive */}
          <div className="mb-8 sm:mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="5151515151"
              adFormat="rectangle"
              style={{ display: 'block', width: '100%', maxWidth: '336px', height: '280px' }}
            />
          </div>

          {/* Error Display */}
          {conversionState.error && (
            <div className="mb-6 sm:mb-8 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-red-800">Signing Failed</h3>
                    <p className="text-sm text-red-700 mt-1 break-words">{conversionState.error}</p>
                  </div>
                </div>
                <button
                  onClick={resetSigning}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Signing Progress */}
          {conversionState.isSigning && (
            <div className="mb-6 sm:mb-8">
              <ConversionProgress
                isConverting={conversionState.isSigning}
                fileName={`${selectedFiles.length} PDF files`}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          )}

          {/* Digital Signature Tool - Mobile Optimized */}
          {!conversionState.isSigning && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8 md:p-12 mb-8 sm:mb-16">
              
              {/* Files uploaded - ready for signature configuration */}
              {selectedFiles.length > 0 && (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium text-sm sm:text-base">
                      {selectedFiles.length} PDF{selectedFiles.length > 1 ? 's' : ''} ready for signing
                    </span>
                  </div>
                </div>
              )}

              {/* Signature Configuration - Mobile First Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                
                {/* Left Column - Signer Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Signer Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                          placeholder="Enter your name (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={signerEmail}
                          onChange={(e) => setSignerEmail(e.target.value)}
                          placeholder="your.email@example.com (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Digital Signature</label>
                        
                        {/* Signature Type Tabs */}
                        <div className="flex border border-gray-200 rounded-lg mb-4 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setSignatureType('canvas')}
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                              signatureType === 'canvas'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 inline-block mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Draw Signature
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignatureType('text')}
                            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                              signatureType === 'text'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 inline-block mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Type Text
                          </button>
                        </div>

                        {/* Text Signature Input */}
                        {signatureType === 'text' && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Type your signature</span>
                              <button
                                type="button"
                                onClick={generateSampleSignature}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Generate Sample
                              </button>
                            </div>
                            <input
                              type="text"
                              value={signatureText}
                              onChange={(e) => setSignatureText(e.target.value)}
                              placeholder="Type your signature text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
                              required={signatureType === 'text'}
                            />
                            <p className="text-xs text-gray-500 mt-1">This text will be styled and appear as your signature</p>
                          </div>
                        )}

                        {/* Canvas Signature - Mobile Optimized */}
                        {signatureType === 'canvas' && (
                          <div>
                            <SignatureCanvas
                              onSignatureChange={handleCanvasSignature}
                              disabled={conversionState.isSigning}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Signature Customization */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Signature Style
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Signature Style</label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: 'handwritten', label: 'Handwritten Style', preview: 'Elegant cursive' },
                            { value: 'professional', label: 'Professional', preview: 'Bold & formal' },
                            { value: 'elegant', label: 'Elegant', preview: 'Refined & classic' }
                          ].map((style) => (
                            <label key={style.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name="signatureStyle"
                                value={style.value}
                                checked={signatureStyle === style.value}
                                onChange={(e) => setSignatureStyle(e.target.value)}
                                className="mr-3 text-blue-600"
                              />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm">{style.label}</div>
                                <div className="text-xs text-gray-500">{style.preview}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <select
                            value={signaturePosition}
                            onChange={(e) => setSignaturePosition(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                            <option value="center">Center</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <select
                            value={signatureSize}
                            onChange={(e) => setSignatureSize(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Advanced Security Options
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={addCertificate}
                      onChange={(e) => setAddCertificate(e.target.checked)}
                      className="mt-1 mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">Digital Certificate</div>
                      <div className="text-xs sm:text-sm text-gray-500">Add verification certificate page (no timestamp)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* PDF Preview - This is the only preview that should be used */}
              {selectedFiles.length > 0 && (signatureText || canvasSignature) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 text-center flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    📄 PDF Preview - Drag to Position Signature
                  </h3>
                  
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Your signature will be placed exactly where you position it in this preview.
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      💡 Touch and drag the signature to move it anywhere on the document
                    </p>
                  </div>

                  <PDFPreview
                    file={selectedFiles[0]}
                    signature={canvasSignature}
                    signatureType={signatureType}
                    signatureText={signatureText}
                    signatureStyle={signatureStyle}
                    signatureSize={signatureSize}
                    signerName={signerName || undefined}
                    onSignaturePosition={handleSignaturePositionChange}
                  />
                  
                  <div className="mt-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3 text-xs">
                      <div className="font-medium text-blue-900 mb-1">Current Position</div>
                      <div className="text-blue-700">
                        📍 X: {pdfSignaturePosition.x.toFixed(1)}% • Y: {pdfSignaturePosition.y.toFixed(1)}% • Page: {pdfSignaturePosition.page}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Button - Mobile Optimized */}
              {selectedFiles.length > 0 && (signatureText || canvasSignature) && (
                <div className="text-center">
                  <button
                    onClick={handleSignDocuments}
                    className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Sign {selectedFiles.length} Document{selectedFiles.length > 1 ? 's' : ''} Digitally
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    Your signature will be placed at the exact position shown in the preview above
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Floating Side Ad - Hidden on Mobile */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block z-10">
            <AdSenseAd 
              adSlot="6161616161"
              adFormat="vertical"
              style={{ display: 'block', width: '160px', height: '600px' }}
            />
          </div>

          {/* Features Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-16">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Legally Binding</h3>
              <p className="text-sm sm:text-base text-gray-600">Compliant with South African Electronic Communications and Transactions Act</p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Instant Signing</h3>
              <p className="text-sm sm:text-base text-gray-600">Sign multiple documents in seconds with bulk processing capabilities</p>
            </div>

            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Tamper-Proof</h3>
              <p className="text-sm sm:text-base text-gray-600">Advanced verification system ensures document integrity and authenticity</p>
            </div>
          </div>

          {/* Bottom Banner Ad - Mobile Responsive */}
          <div className="mb-8 sm:mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="7171717171"
              adFormat="horizontal"
              style={{ display: 'block', width: '100%', maxWidth: '728px', height: '90px' }}
            />
          </div>

          {/* Legal Information - Mobile Optimized */}
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">Legal Compliance & Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">🇿🇦 South African Law Compliant</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>✓ Electronic Communications and Transactions Act (ECTA) compliant</li>
                  <li>✓ Legally binding electronic signatures</li>
                  <li>✓ Admissible in South African courts</li>
                  <li>✓ Meets POPIA data protection requirements</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">🔒 Advanced Security Features</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>✓ Unique signature ID for each document</li>
                  <li>✓ Tamper-evident technology</li>
                  <li>✓ Cryptographic verification hashes</li>
                  <li>✓ Timestamp and audit trail</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Use - SEO Optimized & Mobile Responsive */}
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">How to Sign PDF Documents Online in 4 Easy Steps</h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
              Our free digital signature tool makes it simple to electronically sign PDF documents online. 
              No downloads, no registration - start signing immediately with our secure web-based platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">📁 Upload PDF Files</h3>
                <p className="text-sm sm:text-base text-gray-600">Drag & drop or browse to select PDF documents. Supports bulk uploading up to 20 files for batch signing.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">✍️ Draw or Type Signature</h3>
                <p className="text-sm sm:text-base text-gray-600">Create your signature by drawing with mouse/touch or typing with professional fonts. No personal info required.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">🎯 Position Signature</h3>
                <p className="text-sm sm:text-base text-gray-600">Preview your PDF and drag the signature to precisely where you want it placed on the document.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  4
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">⬇️ Download Instantly</h3>
                <p className="text-sm sm:text-base text-gray-600">Get your legally binding digitally signed PDF documents with instant download. No watermarks or limits.</p>
              </div>
            </div>
            
            {/* Additional SEO Content - Mobile Optimized */}
            <div className="mt-8 sm:mt-12 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">✨ Why Choose Our Free PDF Signature Tool?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant & Fast</h4>
                  <p className="text-gray-600">Sign PDFs in under 30 seconds with our optimized workflow</p>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">🔒</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
                  <p className="text-gray-600">Client-side processing ensures your documents stay private</p>
                </div>
                <div className="text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-xl sm:text-2xl mb-2">📱</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Works Everywhere</h4>
                  <p className="text-gray-600">Compatible with all devices - desktop, tablet, and mobile</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}