import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type Platform = 'amazon' | 'shopify' | 'ebay' | 'etsy' | 'general';
type Tone = 'persuasive' | 'informative' | 'luxury' | 'budget' | 'casual';

export default function AIProductDescription() {
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [tone, setTone] = useState<Tone>('persuasive');
  const [keywords, setKeywords] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const generate = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    setIsGenerating(true);
    setVariations([]);

    try {
      const response = await fetch('/api/generate-product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, features, targetAudience, platform, tone, keywords }),
      });

      if (!response.ok) throw new Error('Failed to generate product descriptions');

      const data = await response.json();
      setVariations(data.variations || []);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate product descriptions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDescription = (description: string) => {
    navigator.clipboard.writeText(description);
    alert('Description copied to clipboard!');
  };

  return (
    <>
      <Head>
        <title>AI Product Description Generator - E-commerce Copy Writer Free | GPT-4</title>
        <meta name="description" content="Generate compelling product descriptions with AI. Create SEO-optimized copy for Amazon, Shopify, eBay, Etsy. Free GPT-4 powered product description writer." />
        <meta name="keywords" content="AI product description generator, product copy writer, Amazon listing, Shopify description, e-commerce copywriting, GPT-4 product descriptions, SEO product copy" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-product-description" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Document Converter Pro</h1>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              🛍️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Product Description Generator</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Create compelling, SEO-optimized product descriptions for any platform with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Product Name */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Product Name *</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Wireless Bluetooth Headphones, Organic Cotton T-Shirt"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff', fontWeight: '500' }}
              />
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Platform</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {([
                  { value: 'amazon', label: 'Amazon', icon: '📦' },
                  { value: 'shopify', label: 'Shopify', icon: '🛒' },
                  { value: 'ebay', label: 'eBay', icon: '🏷️' },
                  { value: 'etsy', label: 'Etsy', icon: '🎨' },
                  { value: 'general', label: 'General', icon: '🌐' },
                ] as const).map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value as Platform)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${platform === p.value ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-300 hover:border-amber-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                  >
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-bold text-base" style={{ color: '#000000' }}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Tone / Style</label>
              <div className="flex flex-wrap gap-2">
                {(['persuasive', 'informative', 'luxury', 'budget', 'casual'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t as Tone)}
                    className={`px-4 py-2 rounded-lg border-2 capitalize text-base font-bold ${tone === t ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-300 hover:border-amber-400 hover:shadow-sm'}`}
                    style={{ color: '#000000' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Features/Details */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Key Features / Details</label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="List key features, specifications, materials, dimensions, colors, etc.&#10;&#10;Example:&#10;- Noise cancellation technology&#10;- 30-hour battery life&#10;- Comfortable over-ear design&#10;- Bluetooth 5.0&#10;- Available in black, white, and blue"
                className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-base leading-relaxed resize-none"
                style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Target Audience */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Target Audience (Optional)</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Music enthusiasts, Commuters, Fitness lovers, Fashion-conscious women"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>SEO Keywords (Optional)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., wireless headphones, noise cancelling, premium audio (comma-separated)"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating || !productName.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-5 text-lg font-bold rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Descriptions...
                </span>
              ) : (
                '🤖 Generate Product Descriptions with AI'
              )}
            </button>

            {/* Generated Descriptions */}
            {variations.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#000000' }}>Generated Descriptions</h3>
                  {tokensUsed > 0 && (
                    <div className="text-xs text-gray-500">
                      {tokensUsed} tokens used
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {variations.map((description, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-5 hover:border-amber-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-bold text-amber-600">Variation {index + 1}</span>
                        <span className="text-xs text-gray-500">{description.length} characters</span>
                      </div>
                      <div className="mb-4 whitespace-pre-wrap text-base leading-relaxed" style={{ fontSize: '16px', color: '#000000', lineHeight: '1.7' }}>
                        {description}
                      </div>
                      <button
                        onClick={() => copyDescription(description)}
                        className="w-full px-5 py-4 border-3 border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50"
                      >
                        📋 Copy This Description
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🛍️</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>5 Platforms</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Amazon, Shopify, eBay, Etsy, General</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>5 Tones</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Match your brand voice</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>2 Variations</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>A/B test for better results</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>SEO Optimized</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Keyword integration included</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
