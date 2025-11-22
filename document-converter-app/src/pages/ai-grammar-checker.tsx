import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function AIGrammarChecker() {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [toneAnalysis, setToneAnalysis] = useState('');
  const [readabilityScore, setReadabilityScore] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const checkGrammar = async () => {
    if (!inputText.trim()) {
      alert('Please enter text to check');
      return;
    }

    setIsChecking(true);
    setCorrectedText('');
    setIssues([]);
    setToneAnalysis('');
    setReadabilityScore('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/check-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error('Failed to check grammar');

      const data = await response.json();
      setCorrectedText(data.correctedText);
      setIssues(data.issues || []);
      setToneAnalysis(data.toneAnalysis || '');
      setReadabilityScore(data.readabilityScore || '');
      setSuggestions(data.suggestions || []);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to check grammar. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(correctedText);
    alert('Corrected text copied to clipboard!');
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w).length;

  return (
    <>
      <Head>
        <title>AI Grammar Checker - Free Grammar & Spelling Check | GPT-4 Powered</title>
        <meta name="description" content="Check grammar, spelling, and style with AI. Get instant corrections, tone analysis, and readability scores. Free GPT-4 powered grammar checker and proofreader." />
        <meta name="keywords" content="AI grammar checker, grammar check, spelling checker, style checker, proofreader, GPT-4 grammar, free grammar check, writing assistant" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-grammar-checker" />
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✓
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Grammar Checker</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Check grammar, spelling, style, and readability with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Text Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-base font-bold mb-2" style={{ color: '#1a202c', fontSize: '17px' }}>Your Text</label>
                  <div className="text-xs text-gray-500">
                    {wordCount(inputText)} words
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type your text here to check for grammar, spelling, and style issues..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-base font-bold mb-2" style={{ color: '#1a202c', fontSize: '17px' }}>
                    Corrected Text {correctedText && <span className="text-green-600">✓</span>}
                  </label>
                  <div className="text-xs text-gray-500">
                    {wordCount(correctedText)} words
                  </div>
                </div>
                <textarea
                  value={correctedText}
                  readOnly
                  placeholder="Corrected text will appear here..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}
                />
              </div>
            </div>

            {/* Check Button */}
            <button
              onClick={checkGrammar}
              disabled={isChecking || !inputText.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-5 text-lg font-bold rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isChecking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking Grammar...
                </span>
              ) : (
                '🤖 Check Grammar with AI'
              )}
            </button>

            {/* Results */}
            {correctedText && (
              <div className="space-y-6">
                {/* Copy Button */}
                <button
                  onClick={copyText}
                  className="w-full px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50"
                >
                  📋 Copy Corrected Text
                </button>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Issues Found */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold style={{ color: '#000000' }} mb-3 flex items-center">
                      <span className="text-red-500 mr-2">⚠️</span>
                      Issues Found
                    </h3>
                    {issues.length > 0 ? (
                      <ul className="space-y-2">
                        {issues.map((issue, index) => (
                          <li key={index} className="text-sm style={{ color: '#000000' }} leading-relaxed" style={{ fontSize: '14px' }}>
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-600 font-semibold">✓ No significant issues found!</p>
                    )}
                  </div>

                  {/* Tone & Readability */}
                  <div className="space-y-4">
                    {/* Tone Analysis */}
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-bold style={{ color: '#000000' }} mb-2 flex items-center">
                        <span className="text-blue-500 mr-2">🎭</span>
                        Tone Analysis
                      </h3>
                      <p className="text-sm style={{ color: '#000000' }} leading-relaxed" style={{ fontSize: '14px' }}>
                        {toneAnalysis}
                      </p>
                    </div>

                    {/* Readability Score */}
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-bold style={{ color: '#000000' }} mb-2 flex items-center">
                        <span className="text-purple-500 mr-2">📊</span>
                        Readability
                      </h3>
                      <p className="text-sm style={{ color: '#000000' }} leading-relaxed" style={{ fontSize: '14px' }}>
                        {readabilityScore}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold style={{ color: '#000000' }} mb-3 flex items-center">
                      <span className="text-yellow-500 mr-2">💡</span>
                      Suggestions for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm style={{ color: '#000000' }} leading-relaxed" style={{ fontSize: '14px' }}>
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Token Usage */}
                {tokensUsed > 0 && (
                  <div className="text-center text-xs text-gray-500">
                    Analysis used {tokensUsed} tokens
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Grammar & Spelling</h3>
              <p className="style={{ color: '#000000' }} text-sm">Catch all errors automatically</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Style Enhancement</h3>
              <p className="style={{ color: '#000000' }} text-sm">Improve clarity and flow</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎭</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Tone Analysis</h3>
              <p className="style={{ color: '#000000' }} text-sm">Understand your writing style</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Readability Score</h3>
              <p className="style={{ color: '#000000' }} text-sm">Measure text clarity</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
