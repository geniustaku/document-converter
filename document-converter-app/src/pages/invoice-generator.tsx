import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ConversionProgress from '@/components/ConversionProgress';
import AdSenseAd from '@/components/AdSenseAd';
import { trackConversion, trackEvent } from '@/utils/gtag';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ConversionState {
  isGenerating: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export default function InvoiceGenerator() {
  // Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  // Client Information
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Tax and totals
  const [taxRate, setTaxRate] = useState(15); // Default VAT for South Africa
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days');

  const [conversionState, setConversionState] = useState<ConversionState>({
    isGenerating: false,
    progress: 0,
    status: '',
    error: null
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount if quantity or rate changed
    if (field === 'quantity' || field === 'rate') {
      const quantity = updatedItems[index].quantity || 0;
      const rate = updatedItems[index].rate || 0;
      updatedItems[index].amount = quantity * rate;
    }
    
    setItems(updatedItems);
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 10;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setConversionState(prev => ({ ...prev, progress }));
    }, 300);
    return interval;
  };

  const handleGenerateInvoice = async () => {
    // Validation
    if (!businessName || !clientName || items.some(item => !item.description)) {
      setConversionState(prev => ({ 
        ...prev, 
        error: 'Please fill in all required fields' 
      }));
      return;
    }

    setConversionState({
      isGenerating: true,
      progress: 0,
      status: 'Preparing invoice data...',
      error: null
    });

    const progressInterval = simulateProgress();

    try {
      // Track event
      trackEvent('invoice_generation_started', 'Business Tools', 'Invoice Generator');

      const invoiceData = {
        businessName,
        businessAddress,
        businessPhone,
        businessEmail,
        clientName,
        clientAddress,
        clientEmail,
        invoiceNumber,
        invoiceDate,
        dueDate,
        items: items.filter(item => item.description.trim()),
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        paymentTerms
      };

      setConversionState(prev => ({ ...prev, status: 'Generating professional invoice...' }));

      const response = await fetch('/api/invoice-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invoice generation failed' }));
        throw new Error(errorData.error || 'Invoice generation failed');
      }

      setConversionState(prev => ({ ...prev, progress: 100, status: 'Download starting...' }));

      // Track successful generation
      trackConversion('invoice_generation', total);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `invoice_${invoiceNumber}.pdf`;
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
          isGenerating: false,
          progress: 0,
          status: '',
          error: null
        });
      }, 2000);

    } catch (error: any) {
      clearInterval(progressInterval);
      setConversionState({
        isGenerating: false,
        progress: 0,
        status: '',
        error: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetForm = () => {
    setConversionState({
      isGenerating: false,
      progress: 0,
      status: '',
      error: null
    });
  };

  return (
    <>
      <Head>
        <title>Free Invoice Generator Online | Professional PDF Invoices - South Africa</title>
        <meta name="description" content="Generate professional PDF invoices online for free. Perfect for South African businesses. Create invoices with VAT, send to clients instantly. No registration required." />
        <meta name="keywords" content="invoice generator, free invoice maker, PDF invoice, business invoice, VAT invoice, South Africa invoice, professional invoice, invoice template, online invoice generator, accounting software" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Free Invoice Generator Online | Professional PDF Invoices" />
        <meta property="og:description" content="Generate professional PDF invoices online for free. Perfect for South African businesses with VAT calculation." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://docs-app.net/invoice-generator" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/pdf-split" className="text-green-600 hover:text-green-700 font-medium">Split PDF</Link>
                <Link href="/pdf-merge" className="text-green-600 hover:text-green-700 font-medium">Merge PDF</Link>
                <Link href="/pdf-to-word" className="text-green-600 hover:text-green-700 font-medium">PDF to Word</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full border border-green-200 mb-6">
              <span className="text-green-600 font-medium text-sm">💼📄 Professional Invoice Generator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-6">
              Free Invoice Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Create professional PDF invoices instantly. Perfect for South African businesses with automatic VAT calculation. 
              No registration required - start invoicing your clients today!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                VAT Calculation
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Professional PDF
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Instant Download
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                100% Free
              </div>
            </div>
          </div>

          {/* Premium Ad Space - Top */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="2121212121"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* Error Display */}
          {conversionState.error && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Generation Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{conversionState.error}</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {conversionState.isGenerating && (
            <div className="mb-8">
              <ConversionProgress
                isConverting={conversionState.isGenerating}
                fileName={`Invoice ${invoiceNumber}`}
                progress={conversionState.progress}
                status={conversionState.status}
              />
            </div>
          )}

          {/* Invoice Form */}
          {!conversionState.isGenerating && (
            <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-xl border border-green-100 p-8 md:p-12 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column - Business & Client Info */}
                <div className="space-y-8">
                  {/* Business Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Your Business Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Your Company Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                        <textarea
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="123 Business Street&#10;City, Province&#10;Postal Code"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            placeholder="+27 11 123 4567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            placeholder="info@yourcompany.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Client Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Client Company Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                        <textarea
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          placeholder="456 Client Street&#10;City, Province&#10;Postal Code"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@company.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Invoice Details */}
                <div className="space-y-8">
                  {/* Invoice Details */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Invoice Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                        <input
                          type="text"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                          <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Rate */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      VAT & Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                        <input
                          type="number"
                          value={taxRate || ''}
                          onChange={(e) => setTaxRate(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Standard VAT rate in South Africa is 15%</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        <input
                          type="text"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="Payment due within 30 days"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v6h-3a2 2 0 00-2 2v3H6a2 2 0 01-2-2V5zm14 6a1 1 0 01-1 1v3a2 2 0 01-2 2h-3a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 011-1v-1z" clipRule="evenodd" />
                    </svg>
                    Invoice Items
                  </h3>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (R)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (R)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Item description"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              placeholder="0"
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.rate || ''}
                              onChange={(e) => updateItem(index, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-28 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-gray-900"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">R{item.amount.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                              className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                  <div className="w-80 space-y-4">
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600">VAT ({taxRate}%):</span>
                      <span className="font-medium">R{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-600"></span>
                      <span className="font-medium"></span>
                    </div>
                    <div className="flex justify-between py-4 mt-6 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                      <span className="text-lg font-bold text-gray-900">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business! Please remit payment by the due date."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>

              {/* Generate Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateInvoice}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Professional Invoice
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">VAT Compliant</h3>
              <p className="text-gray-600">Automatic VAT calculation for South African businesses. SARS compliant invoicing.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional PDF</h3>
              <p className="text-gray-600">Generate beautiful, professional PDF invoices that impress your clients.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Download</h3>
              <p className="text-gray-600">Download your invoice immediately. No waiting, no email required.</p>
            </div>
          </div>

          {/* Sticky Side Ad */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
            <AdSenseAd 
              adSlot="3131313131"
              adFormat="vertical"
              style={{ display: 'block', width: '160px', height: '600px' }}
            />
          </div>

          {/* Bottom Ad Space */}
          <div className="mb-16 flex justify-center">
            <AdSenseAd 
              adSlot="4141414141"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>

          {/* How to Use */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How to Create Professional Invoices</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Enter Business Info</h3>
                <p className="text-gray-600">Add your company details and branding</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Add Client Details</h3>
                <p className="text-gray-600">Enter who you're invoicing</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">List Items & Services</h3>
                <p className="text-gray-600">Add your products or services with prices</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Generate & Download</h3>
                <p className="text-gray-600">Get your professional PDF invoice instantly</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}