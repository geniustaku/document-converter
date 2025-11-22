import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type Length = 'brief' | 'medium' | 'detailed';
type Format = 'paragraph' | 'bullets' | 'keypoints';

export default function AISummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [length, setLength] = useState<Length>('medium');
  const [format, setFormat] = useState<Format>('paragraph');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const summarize = async () => {
    if (!inputText.trim()) {
      alert('Please enter text to summarize');
      return;
    }

    setIsProcessing(true);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, length, format }),
      });

      if (!response.ok) throw new Error('Failed to summarize');

      const data = await response.json();
      setSummary(data.summary);
      setIsAIPowered(data.isAIPowered);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to summarize text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert('Summary copied to clipboard!');
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w).length;
  const readingTime = (words: number) => Math.ceil(words / 200);

  const originalWords = wordCount(inputText);
  const summaryWords = wordCount(summary);
  const reductionPercent = originalWords > 0 ? Math.round(((originalWords - summaryWords) / originalWords) * 100) : 0;

  return (
    <>
      <Head>
        <title>AI Summarizer - Text Summary Generator Free | GPT-4 Powered</title>
        <meta name="description" content="Summarize long text instantly with AI. Extract key points, create bullet summaries, TLDR generator. Free GPT-4 powered summarization tool for articles, essays, and documents." />
        <meta name="keywords" content="AI summarizer, text summarizer, article summarizer, TLDR generator, summary generator, extract key points, GPT-4 summarizer, free summarization tool" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-summarizer" />
        <meta property="og:title" content="AI Summarizer - Free Text Summary Generator" />
        <meta property="og:description" content="Summarize any text with GPT-4 AI. Get brief, medium, or detailed summaries in seconds." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 2z" />
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📝
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Text Summarizer</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              AI-powered text summarization. Extract key points and create concise summaries instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Summary Length</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'brief', label: 'Brief', desc: '2-3 sentences', icon: '⚡' },
                    { value: 'medium', label: 'Medium', desc: '1 paragraph', icon: '📄' },
                    { value: 'detailed', label: 'Detailed', desc: '2-3 paragraphs', icon: '📚' },
                  ] as const).map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value as Length)}
                      className={`p-4 rounded-xl border-3 text-left transition-all ${length === l.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                    >
                      <div className="text-2xl mb-2">{l.icon}</div>
                      <div className="font-bold text-base" style={{ color: '#000000' }}>{l.label}</div>
                      <div className="text-sm" style={{ color: '#4a5568', fontWeight: '500' }}>{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Output Format</label>
                <div className="space-y-2">
                  {([
                    { value: 'paragraph', label: 'Paragraph', icon: '📝' },
                    { value: 'bullets', label: 'Bullet Points', icon: '•' },
                    { value: 'keypoints', label: 'Key Points', icon: '🔑' },
                  ] as const).map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value as Format)}
                      className={`w-full p-4 rounded-xl border-3 text-left flex items-center gap-3 transition-all ${format === f.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                    >
                      <span className="text-2xl">{f.icon}</span>
                      <span className="font-bold text-base" style={{ color: '#000000' }}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Text Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold" style={{ color: '#000000' }}>Original Text</label>
                  <div className="text-xs text-gray-500">
                    {originalWords} words • {readingTime(originalWords)} min read
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your article, essay, or any long text here..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold" style={{ color: '#000000' }}>
                    Summary {isAIPowered && <span className="text-green-600">✓ AI</span>}
                  </label>
                  <div className="text-xs text-gray-500">
                    {summaryWords} words • {reductionPercent}% reduction
                  </div>
                </div>
                <textarea
                  value={summary}
                  readOnly
                  placeholder="Summary will appear here..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}
                />
                {tokensUsed > 0 && (
                  <div className="mt-2 text-xs text-blue-600">
                    Tokens used: {tokensUsed}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={summarize}
                disabled={isProcessing || !inputText.trim()}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Summarizing...
                  </span>
                ) : (
                  '🤖 Summarize with AI'
                )}
              </button>

              {summary && (
                <button
                  onClick={copyToClipboard}
                  className="px-8 py-4 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                >
                  📋 Copy Summary
                </button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Instant Results</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Get summaries in seconds with AI</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Smart Extraction</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>AI identifies key points automatically</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Multiple Formats</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Paragraphs, bullets, or key points</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🆓</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Free to Use</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>No signup or payment required</p>
            </div>
          </div>

          {/* SEO Content */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">AI-Powered Text Summarization</h2>
            <p className="leading-relaxed mb-6" style={{ color: '#000000' }}>
              Our AI summarizer uses advanced AI to analyze and condense long texts while preserving the most important information.
              Perfect for students, researchers, professionals, and anyone who needs to quickly understand lengthy documents.
            </p>

            <h3 className="text-xl font-bold mb-3">Use Cases</h3>
            <ul className="space-y-2 mb-6" style={{ color: '#000000' }}>
              <li><strong>Students:</strong> Summarize research papers, textbooks, and academic articles</li>
              <li><strong>Professionals:</strong> Extract key points from reports, emails, and documents</li>
              <li><strong>Researchers:</strong> Quickly review literature and identify main findings</li>
              <li><strong>Content Creators:</strong> Generate TLDRs for long-form content</li>
              <li><strong>News Readers:</strong> Get the gist of lengthy articles</li>
            </ul>

            <h3 className="text-xl font-bold mb-3">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2" style={{ color: '#000000' }}>
              <li>Paste your text into the input field</li>
              <li>Choose summary length (brief, medium, or detailed)</li>
              <li>Select output format (paragraph, bullets, or key points)</li>
              <li>Click "Summarize with AI" and get instant results</li>
              <li>Copy and use your summary anywhere</li>
            </ol>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
