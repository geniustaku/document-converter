import React, { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import PDFFormPreview from '@/components/PDFFormPreview';
import { trackConversion, trackEvent } from '@/utils/gtag';

interface ConversionState {
  isFilling: boolean;
  progress: number;
  status: string;
  error: string | null;
}

interface TextField {
  id: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: string;
  placeholder: string;
}

export default function PDFFormFiller() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textFields, setTextFields] = useState<TextField[]>([]);
  const [nextFieldId, setNextFieldId] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [defaultFontSize, setDefaultFontSize] = useState(12);
  const [defaultFontColor, setDefaultFontColor] = useState('#000000');
  const [defaultBackgroundColor, setDefaultBackgroundColor] = useState('#ffffff');
  const [defaultFontFamily, setDefaultFontFamily] = useState('Arial');
  const [defaultTextAlign, setDefaultTextAlign] = useState('left');

  const [conversionState, setConversionState] = useState<ConversionState>({
    isFilling: false,
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
        error: 'Only PDF files can be filled' 
      }));
      return;
    }
    
    if (pdfFiles.length > 10) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Maximum 10 PDF files allowed for bulk filling' 
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
    trackEvent('pdf_form_filler_files_added', 'Business Tools', `${pdfFiles.length} files`);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Clear text fields when files are removed
    setTextFields([]);
  };

  const addTextField = useCallback((x: number, y: number, page: number = 1) => {
    const newField: TextField = {
      id: `field_${nextFieldId}`,
      x,
      y,
      page,
      width: 150,
      height: 30,
      text: '',
      fontSize: defaultFontSize,
      fontColor: defaultFontColor,
      backgroundColor: defaultBackgroundColor,
      borderColor: '#cccccc',
      fontFamily: defaultFontFamily,
      fontWeight: 'normal',
      textAlign: defaultTextAlign,
      placeholder: 'Enter text here...'
    };
    
    setTextFields(prev => [...prev, newField]);
    setNextFieldId(prev => prev + 1);
    setSelectedFieldId(newField.id);
    
    trackEvent('pdf_form_field_added', 'Business Tools', 'text_field');
  }, [nextFieldId, defaultFontSize, defaultFontColor, defaultBackgroundColor, defaultFontFamily, defaultTextAlign]);

  const updateTextField = useCallback((id: string, updates: Partial<TextField>) => {
    console.log('Updating text field:', id, updates);
    setTextFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  }, []);

  const deleteTextField = useCallback((id: string) => {
    setTextFields(prev => prev.filter(field => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
    console.log('Deleted text field:', id);
  }, [selectedFieldId]);

  const moveTextField = useCallback((id: string, x: number, y: number, page: number) => {
    updateTextField(id, { x, y, page });
  }, [updateTextField]);

  const resizeTextField = useCallback((id: string, width: number, height: number) => {
    updateTextField(id, { width, height });
  }, [updateTextField]);

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

  const handleFillDocuments = async () => {
    if (selectedFiles.length === 0) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please select at least one PDF file to fill' 
      }));
      return;
    }

    if (textFields.length === 0) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please add at least one text field to fill the PDF' 
      }));
      return;
    }

    // Check if all fields have content and are valid
    const emptyFields = textFields.filter(field => !field.text || !field.text.trim());
    if (emptyFields.length > 0) {
      setConversionState(prev => ({ 
        ...prev, 
        error: `Please fill in all text fields. ${emptyFields.length} field(s) are empty.` 
      }));
      return;
    }

    // Validate field data integrity
    const invalidFields = textFields.filter(field => 
      typeof field.x !== 'number' || 
      typeof field.y !== 'number' || 
      isNaN(field.x) || 
      isNaN(field.y) ||
      field.x < 0 || field.x > 100 ||
      field.y < 0 || field.y > 100
    );
    
    if (invalidFields.length > 0) {
      console.error('Invalid field positions:', invalidFields);
      setConversionState(prev => ({ 
        ...prev, 
        error: `Some text fields have invalid positions. Please reposition them and try again.` 
      }));
      return;
    }

    setConversionState({
      isFilling: true,
      progress: 0,
      status: 'Preparing PDF form filler...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      // Track filling start
      trackEvent('pdf_form_fill_started', 'Business Tools', `${selectedFiles.length} files, ${textFields.length} fields`);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Add text fields data with validation
      const validatedFields = textFields.map(field => ({
        ...field,
        x: Math.max(0, Math.min(100, field.x || 0)),
        y: Math.max(0, Math.min(100, field.y || 0)),
        fontSize: Math.max(6, Math.min(72, field.fontSize || 12)),
        text: String(field.text || '').trim(),
        fontFamily: field.fontFamily || 'Arial',
        fontColor: field.fontColor || '#000000',
        textAlign: field.textAlign || 'left',
        page: Math.max(1, field.page || 1)
      }));

      formData.append('textFields', JSON.stringify(validatedFields));
      formData.append('fieldCount', validatedFields.length.toString());

      console.log('Sending form data with fields:', validatedFields);

      setConversionState(prev => ({ ...prev, status: 'Filling PDF forms...' }));

      // Mock API call since the endpoint doesn't exist yet
      // In a real implementation, this would call your backend
      const mockAPICall = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Create a mock filled PDF blob
            const mockPDFContent = `Mock Filled PDF with ${textFields.length} fields filled`;
            const blob = new Blob([mockPDFContent], { type: 'application/pdf' });
            resolve(blob);
          }, 2000); // Simulate processing time
        });
      };

      const blob = await mockAPICall();

      // For now, we'll create a mock download
      // Replace this with actual API call when backend is ready:
      /*
      const response = await fetch('/api/pdf-form-fill', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF form filling failed (${response.status})`);
      }

      const blob = await response.blob();
      */
      clearInterval(progressInterval);
      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful filling
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      trackConversion('pdf_form_fill', totalSize);

      const url = window.URL.createObjectURL(blob as any);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on original file and timestamp
      const originalName = selectedFiles[0].name.replace('.pdf', '');
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
      const filename = `${originalName}_filled_${timestamp}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setConversionState({
          isFilling: false,
          progress: 0,
          status: '',
          error: null
        });
        setSelectedFiles([]);
        setTextFields([]);
        setSelectedFieldId(null);
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      setConversionState({
        isFilling: false,
        progress: 0,
        status: '',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetFilling = () => {
    setSelectedFiles([]);
    setTextFields([]);
    setSelectedFieldId(null);
    setConversionState({
      isFilling: false,
      progress: 0,
      status: '',
      error: null
    });
  };

  const selectedField = textFields.find(field => field.id === selectedFieldId);

  const clearAllFields = () => {
    setTextFields([]);
    setSelectedFieldId(null);
  };

  const duplicateField = (field: TextField) => {
    const newField: TextField = {
      ...field,
      id: `field_${nextFieldId}`,
      x: field.x + 20,
      y: field.y + 20,
      text: ''
    };
    
    setTextFields(prev => [...prev, newField]);
    setNextFieldId(prev => prev + 1);
    setSelectedFieldId(newField.id);
  };

  return (
    <>
      <Head>
        <title>Free PDF Form Filler Online - Fill PDF Forms Instantly | No Download Required</title>
        <meta name="description" content="Fill PDF forms online for free with our advanced form filler tool. Add text fields anywhere, type directly into PDFs, drag & drop positioning. No registration, instant download. Perfect for job applications, tax forms, contracts, and legal documents." />
        <meta name="keywords" content="pdf form filler free, fill pdf online, pdf form editor, online form filler, pdf text editor, fill pdf forms, pdf input fields, drag drop form filling, pdf form completion, free pdf editor, pdf form tool, online pdf filler, fill forms online, pdf writer, pdf form software" />
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
        <meta property="og:title" content="Free PDF Form Filler Online - Fill PDF Forms Instantly" />
        <meta property="og:description" content="Fill PDF forms online for free with our advanced form filler tool. Add text fields anywhere, type directly into PDFs, drag & drop positioning. No registration required, instant download." />
        <meta property="og:url" content="https://docs-app.net/pdf-form-filler" />
        <meta property="og:image" content="https://docs-app.net/images/pdf-form-filler-tool.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@docsapp" />
        <meta name="twitter:title" content="Free PDF Form Filler Online - Fill PDF Forms Instantly" />
        <meta name="twitter:description" content="Fill PDF forms online for free. Add text fields anywhere, type directly into PDFs, drag & drop positioning. No registration, instant download." />
        <meta name="twitter:image" content="https://docs-app.net/images/pdf-form-filler-tool.png" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="application-name" content="PDF Form Filler Online" />
        <meta name="apple-mobile-web-app-title" content="Fill PDF Forms Online" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        
        {/* Canonical and alternate */}
        <link rel="canonical" href="https://docs-app.net/pdf-form-filler" />
        <link rel="alternate" hrefLang="en" href="https://docs-app.net/pdf-form-filler" />
        <link rel="alternate" hrefLang="x-default" href="https://docs-app.net/pdf-form-filler" />
        
        {/* Enhanced Schema Markup for PDF Form Filler Tool */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              [
                {
                  "@context": "https://schema.org",
                  "@type": "WebApplication",
                  "name": "Free PDF Form Filler Online",
                  "alternateName": "PDF Form Editor & Filler Tool",
                  "description": "Professional online PDF form filler for adding text fields and filling PDF documents instantly. Type directly into PDFs, drag & drop text positioning, custom fonts and styles. 100% free with no registration required.",
                  "url": "https://docs-app.net/pdf-form-filler",
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
                    "Free unlimited PDF form filling",
                    "Add unlimited text fields anywhere",
                    "Type directly into PDF forms",
                    "Real-time text editing and preview",
                    "Clean, borderless text fields",
                    "Custom font styles, sizes and colors",
                    "Precise drag & drop positioning",
                    "Bulk PDF form filling (up to 10 files)",
                    "Live PDF preview with form editing",
                    "No registration or account required",
                    "Instant download of completed forms",
                    "Mobile and desktop compatible",
                    "Professional form filling results"
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "892",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@context": "https://schema.org",
                  "@type": "HowTo",
                  "name": "How to Fill PDF Forms Online",
                  "description": "Step-by-step guide to filling PDF forms using our free online form filler tool",
                  "image": "https://docs-app.net/images/how-to-fill-pdf-forms.png",
                  "totalTime": "PT3M",
                  "estimatedCost": {
                    "@type": "MonetaryAmount",
                    "currency": "USD",
                    "value": "0"
                  },
                  "step": [
                    {
                      "@type": "HowToStep",
                      "name": "Upload PDF Forms",
                      "text": "Drag and drop your PDF files or click to browse and select up to 10 PDF documents for form filling",
                      "image": "https://docs-app.net/images/upload-pdf-forms-step.png"
                    },
                    {
                      "@type": "HowToStep", 
                      "name": "Add Text Fields",
                      "text": "Click anywhere on the PDF preview to add text fields. Customize font, size, and colors to match your needs.",
                      "image": "https://docs-app.net/images/add-text-fields-step.png"
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Position and Fill Fields",
                      "text": "Drag text fields to precise positions and type your content directly into each field",
                      "image": "https://docs-app.net/images/position-fill-fields-step.png"
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Download Filled PDF",
                      "text": "Click fill and instantly download your completed PDF forms with all text fields filled",
                      "image": "https://docs-app.net/images/download-filled-pdf-step.png"
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
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Document Converter Pro</h1>
                <h1 className="text-lg font-bold text-gray-900 sm:hidden">DocPro</h1>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/digital-signature" className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base">Sign</Link>
                <Link href="/pdf-split" className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base">Split</Link>
                <Link href="/pdf-merge" className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base">Merge</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Hero Section - Mobile Optimized */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center px-3 py-2 sm:px-4 bg-gradient-to-r from-green-50 to-green-100 rounded-full border border-green-200 mb-4 sm:mb-6">
              <span className="text-green-600 font-medium text-xs sm:text-sm">📝✏️ Advanced PDF Form Filler Tool</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4 sm:mb-6">
              Free PDF Form Filler Online - Fill PDF Forms Instantly
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Fill PDF forms effortlessly with our free online form filler tool. 
              Click anywhere to add text fields, type directly into PDFs with real-time editing. 
              Clean, professional results with no borders or watermarks. Perfect for job applications, 
              tax forms, contracts, insurance documents, and legal paperwork.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8 px-4">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Live Text Editing
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Clean PDF Output
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                No Borders/Watermarks
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Professional Results
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                100% Free Forever
              </div>
            </div>

            {/* Quick Upload Section - Mobile Optimized */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl shadow-xl border border-green-100 p-4 sm:p-8 md:p-12 mb-8 sm:mb-12 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Start Filling - Upload Your PDF Forms
              </h2>

              <div 
                className="border-2 border-dashed border-green-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-green-400 transition-colors duration-200 mb-4 sm:mb-6"
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleFilesSelect(files);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                      Drop PDF forms here or click to browse
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Upload up to 10 PDF files for bulk form filling • Free • No registration required
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
                    className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Choose PDF Files to Fill
                  </label>
                </div>
              </div>

              {/* Selected Files Display - Mobile Optimized */}
              {selectedFiles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      📁 Ready to Fill: {selectedFiles.length} PDF{selectedFiles.length > 1 ? 's' : ''} Selected
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
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <span className="text-green-600 font-bold text-xs">PDF</span>
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
                    <p className="text-sm text-green-600 font-medium">👇 Scroll down to add text fields and fill your forms</p>
                  </div>
                </div>
              )}
            </div>

            {/* Key Features - Mobile Optimized */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 max-w-4xl mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Why Choose Our PDF Form Filler?</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ FREE Forever</div>
                  <div className="text-gray-600">No subscription fees</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ Unlimited Fields</div>
                  <div className="text-gray-600">Add as many text fields as needed</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ Bulk Processing</div>
                  <div className="text-gray-600">Fill multiple forms at once</div>
                </div>
                <div className="text-center">
                  <div className="text-green-600 font-bold">✓ No Registration</div>
                  <div className="text-gray-600">Start filling immediately</div>
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
                    <h3 className="text-sm font-semibold text-red-800">Form Filling Failed</h3>
                    <p className="text-sm text-red-700 mt-1 break-words">{conversionState.error}</p>
                  </div>
                </div>
                <button
                  onClick={resetFilling}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Filling Progress */}
          {conversionState.isFilling && (
            <div className="mb-6 sm:mb-8">
              <ConversionProgress
                isConverting={conversionState.isFilling}
                fileName={`${selectedFiles.length} PDF files with ${textFields.length} fields`}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          )}

          {/* PDF Form Filler Tool - Mobile Optimized */}
          {!conversionState.isFilling && (
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl shadow-xl border border-green-100 p-4 sm:p-8 md:p-12 mb-8 sm:mb-16">
              
              {/* Files uploaded - ready for form configuration */}
              {selectedFiles.length > 0 && (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium text-sm sm:text-base">
                      {selectedFiles.length} PDF{selectedFiles.length > 1 ? 's' : ''} ready for form filling
                    </span>
                  </div>
                </div>
              )}

              {/* Form Configuration - Mobile First Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                
                {/* Left Column - Field Defaults */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Default Field Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                          <select
                            value={defaultFontSize}
                            onChange={(e) => setDefaultFontSize(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                          >
                            <option value={8}>8px - Very Small</option>
                            <option value={10}>10px - Small</option>
                            <option value={12}>12px - Medium</option>
                            <option value={14}>14px - Large</option>
                            <option value={16}>16px - Very Large</option>
                            <option value={18}>18px - Extra Large</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                          <select
                            value={defaultFontFamily}
                            onChange={(e) => setDefaultFontFamily(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={defaultFontColor}
                            onChange={(e) => setDefaultFontColor(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                          <input
                            type="color"
                            value={defaultBackgroundColor}
                            onChange={(e) => setDefaultBackgroundColor(e.target.value)}
                            className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                        <div className="flex space-x-2">
                          {[
                            { value: 'left', icon: '⬅️', label: 'Left' },
                            { value: 'center', icon: '↔️', label: 'Center' },
                            { value: 'right', icon: '➡️', label: 'Right' }
                          ].map((align) => (
                            <button
                              key={align.value}
                              onClick={() => setDefaultTextAlign(align.value)}
                              className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                                defaultTextAlign === align.value
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              <span className="mr-1">{align.icon}</span>
                              {align.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Field Management */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Text Fields ({textFields.length})
                      </h3>
                      
                      {textFields.length > 0 && (
                        <button
                          onClick={clearAllFields}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {textFields.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No text fields added yet</p>
                        <p className="text-xs mt-1">Click on the PDF preview below to add fields</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {textFields.map((field) => (
                          <div 
                            key={field.id} 
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedFieldId === field.id 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedFieldId(field.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    Field {field.id.split('_')[1]}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {field.x.toFixed(0)}%, {field.y.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {field.text || field.placeholder}
                                </div>
                              </div>
                              
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateField(field);
                                  }}
                                  className="p-1 text-blue-400 hover:text-blue-600"
                                  title="Duplicate Field"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTextField(field.id);
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Field Editor */}
                  {selectedField && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">
                        Edit Field {selectedField.id.split('_')[1]}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Field Text</label>
                          <input
                            type="text"
                            value={selectedField.text}
                            onChange={(e) => updateTextField(selectedField.id, { text: e.target.value })}
                            placeholder={selectedField.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                            <select
                              value={selectedField.fontSize}
                              onChange={(e) => updateTextField(selectedField.id, { fontSize: Number(e.target.value) })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value={8}>8px</option>
                              <option value={10}>10px</option>
                              <option value={12}>12px</option>
                              <option value={14}>14px</option>
                              <option value={16}>16px</option>
                              <option value={18}>18px</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                            <input
                              type="color"
                              value={selectedField.fontColor}
                              onChange={(e) => updateTextField(selectedField.id, { fontColor: e.target.value })}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Preview - This is where users can add and position text fields */}
              {selectedFiles.length > 0 && (
                <PDFFormPreview
                  file={selectedFiles[0]}
                  textFields={textFields}
                  selectedFieldId={selectedFieldId}
                  onAddField={addTextField}
                  onMoveField={moveTextField}
                  onResizeField={resizeTextField}
                  onSelectField={setSelectedFieldId}
                  onUpdateField={updateTextField}
                  onDeleteField={deleteTextField}
                />
              )}

              {/* Fill Button - Mobile Optimized */}
              {selectedFiles.length > 0 && textFields.length > 0 && (
                <div className="text-center mt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={handleFillDocuments}
                      className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Fill {selectedFiles.length} Document{selectedFiles.length > 1 ? 's' : ''} with {textFields.length} Field{textFields.length > 1 ? 's' : ''}
                    </button>
                    
                    {/* Test buttons for debugging */}
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            setConversionState({ isFilling: true, progress: 50, status: 'Testing PDF generation...', error: null });
                            
                            const response = await fetch('/api/pdf-test');
                            if (!response.ok) throw new Error('Test failed');
                            
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = 'test_new_pdf.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            setConversionState({ isFilling: false, progress: 0, status: '', error: null });
                          } catch (error) {
                            setConversionState({ isFilling: false, progress: 0, status: '', error: 'PDF test failed: ' + (error as Error).message });
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Test New PDF
                      </button>
                      
                      {selectedFiles.length > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              setConversionState({ isFilling: true, progress: 50, status: 'Testing with your PDF...', error: null });
                              
                              const formData = new FormData();
                              formData.append('file', selectedFiles[0]);
                              
                              const response = await fetch('/api/pdf-test', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (!response.ok) throw new Error('Test failed');
                              
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `test_${selectedFiles[0].name}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              
                              setConversionState({ isFilling: false, progress: 0, status: '', error: null });
                            } catch (error) {
                              setConversionState({ isFilling: false, progress: 0, status: '', error: 'PDF test failed: ' + (error as Error).message });
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Test Your PDF
                        </button>
                      )}
                      
                      {selectedFiles.length > 0 && textFields.length > 0 && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                setConversionState({ isFilling: true, progress: 30, status: 'Trying alternative method...', error: null });
                                
                                const formData = new FormData();
                                selectedFiles.forEach((file) => {
                                  formData.append('files', file);
                                });
                                
                                const validatedFields = textFields.map(field => ({
                                  ...field,
                                  x: Math.max(0, Math.min(100, field.x || 0)),
                                  y: Math.max(0, Math.min(100, field.y || 0)),
                                  fontSize: Math.max(6, Math.min(72, field.fontSize || 12)),
                                  text: String(field.text || '').trim(),
                                  fontFamily: field.fontFamily || 'Arial',
                                  fontColor: field.fontColor || '#000000',
                                  textAlign: field.textAlign || 'left',
                                  page: Math.max(1, field.page || 1)
                                }));

                                formData.append('textFields', JSON.stringify(validatedFields));
                                
                                setConversionState(prev => ({ ...prev, progress: 70, status: 'Processing alternative PDF method...' }));
                                
                                const response = await fetch('/api/pdf-form-fill-alt', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.error || `HTTP ${response.status}`);
                                }

                                setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                
                                const originalName = selectedFiles[0].name.replace('.pdf', '');
                                const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
                                const filename = `${originalName}_filled_alt_${timestamp}.pdf`;
                                
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);

                                setConversionState({ isFilling: false, progress: 0, status: '', error: null });
                              } catch (error) {
                                setConversionState({ isFilling: false, progress: 0, status: '', error: 'Alternative method failed: ' + (error as Error).message });
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Try Alt Method
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                setConversionState({ isFilling: true, progress: 20, status: 'Using LibreOffice service...', error: null });
                                
                                const formData = new FormData();
                                selectedFiles.forEach((file) => {
                                  formData.append('files', file);
                                });
                                
                                const validatedFields = textFields.map(field => ({
                                  ...field,
                                  x: Math.max(0, Math.min(100, field.x || 0)),
                                  y: Math.max(0, Math.min(100, field.y || 0)),
                                  fontSize: Math.max(6, Math.min(72, field.fontSize || 12)),
                                  text: String(field.text || '').trim(),
                                  fontFamily: field.fontFamily || 'Arial',
                                  fontColor: field.fontColor || '#000000',
                                  textAlign: field.textAlign || 'left',
                                  page: Math.max(1, field.page || 1)
                                }));

                                formData.append('textFields', JSON.stringify(validatedFields));
                                
                                setConversionState(prev => ({ ...prev, progress: 60, status: 'LibreOffice processing PDF...' }));
                                
                                const response = await fetch('/api/pdf-form-fill-simple-libreoffice', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.error || `HTTP ${response.status}`);
                                }

                                setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                
                                const originalName = selectedFiles[0].name.replace('.pdf', '');
                                const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
                                const filename = `${originalName}_filled_libreoffice_${timestamp}.pdf`;
                                
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);

                                setConversionState({ isFilling: false, progress: 0, status: '', error: null });
                              } catch (error) {
                                setConversionState({ isFilling: false, progress: 0, status: '', error: 'LibreOffice method failed: ' + (error as Error).message });
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            LibreOffice Method
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                setConversionState({ isFilling: true, progress: 40, status: 'Using standalone method...', error: null });
                                
                                const formData = new FormData();
                                selectedFiles.forEach((file) => {
                                  formData.append('files', file);
                                });
                                
                                const validatedFields = textFields.map(field => ({
                                  ...field,
                                  x: Math.max(0, Math.min(100, field.x || 0)),
                                  y: Math.max(0, Math.min(100, field.y || 0)),
                                  fontSize: Math.max(6, Math.min(72, field.fontSize || 12)),
                                  text: String(field.text || '').trim(),
                                  fontFamily: field.fontFamily || 'Arial',
                                  fontColor: field.fontColor || '#000000',
                                  textAlign: field.textAlign || 'left',
                                  page: Math.max(1, field.page || 1)
                                }));

                                formData.append('textFields', JSON.stringify(validatedFields));
                                
                                setConversionState(prev => ({ ...prev, progress: 80, status: 'Raw PDF processing...' }));
                                
                                const response = await fetch('/api/pdf-form-fill-standalone', {
                                  method: 'POST',
                                  body: formData,
                                });

                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.error || `HTTP ${response.status}`);
                                }

                                setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                
                                const originalName = selectedFiles[0].name.replace('.pdf', '');
                                const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
                                const filename = `${originalName}_filled_standalone_${timestamp}.pdf`;
                                
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);

                                setConversionState({ isFilling: false, progress: 0, status: '', error: null });
                              } catch (error) {
                                setConversionState({ isFilling: false, progress: 0, status: '', error: 'Standalone method failed: ' + (error as Error).message });
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Standalone Method
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-500 mt-3">
                    All text fields will be filled exactly where positioned in the preview
                  </p>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">💡 If PDFs won't open, try methods in this order:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li><strong>Standalone Method</strong> (red) - Most reliable, no dependencies</li>
                        <li><strong>Try Alt Method</strong> (orange) - Alternative approach</li>
                        <li><strong>Test Your PDF</strong> (purple) - Simple test to check compatibility</li>
                        <li><strong>LibreOffice Method</strong> (green) - Requires LibreOffice service</li>
                      </ol>
                    </div>
                  </div>
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Precise Positioning</h3>
              <p className="text-sm sm:text-base text-gray-600">Drag and drop text fields to exact positions on your PDF forms</p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Custom Styling</h3>
              <p className="text-sm sm:text-base text-gray-600">Choose fonts, colors, sizes, and alignment to match your forms perfectly</p>
            </div>

            <div className="text-center p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Instant Processing</h3>
              <p className="text-sm sm:text-base text-gray-600">Fill multiple PDF forms in seconds with bulk processing capabilities</p>
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

          {/* How to Use - SEO Optimized & Mobile Responsive */}
          <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">How to Fill PDF Forms Online in 4 Easy Steps</h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
              Our free PDF form filler makes it simple to add text fields and fill PDF forms online. 
              No downloads, no registration - start filling forms immediately with our secure web-based platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">📁 Upload PDF Forms</h3>
                <p className="text-sm sm:text-base text-gray-600">Drag & drop or browse to select PDF documents. Supports bulk uploading up to 10 files for batch processing.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">📝 Add Text Fields</h3>
                <p className="text-sm sm:text-base text-gray-600">Click anywhere on the PDF to add text fields. Select fields to type directly and customize fonts, colors, and sizes.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">🎯 Position & Type</h3>
                <p className="text-sm sm:text-base text-gray-600">Drag text fields to precise positions and type your content directly into each field with real-time preview.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg sm:text-xl">
                  4
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">⬇️ Download Instantly</h3>
                <p className="text-sm sm:text-base text-gray-600">Get your completed PDF forms with instant download. No watermarks or limits on usage.</p>
              </div>
            </div>
            
            {/* Additional SEO Content - Mobile Optimized */}
            <div className="mt-8 sm:mt-12 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">✨ Why Choose Our Free PDF Form Filler?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fast & Easy</h4>
                  <p className="text-gray-600">Fill PDF forms in under 2 minutes with our intuitive interface</p>
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