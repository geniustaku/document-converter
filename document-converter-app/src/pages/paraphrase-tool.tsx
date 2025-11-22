import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type Mode = 'standard' | 'formal' | 'creative' | 'simple' | 'fluency';
type Tone = 'neutral' | 'professional' | 'friendly' | 'confident' | 'casual';
type Length = 'same' | 'shorter' | 'longer';

export default function ParaphraseTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<Mode>('standard');
  const [tone, setTone] = useState<Tone>('neutral');
  const [length, setLength] = useState<Length>('same');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [history, setHistory] = useState<Array<{ input: string; output: string; mode: string }>>([]);

  const paraphraseText = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to paraphrase');
      return;
    }

    setIsProcessing(true);
    setOutputText('');

    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          mode,
          tone,
          length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to paraphrase text');
      }

      const data = await response.json();
      setOutputText(data.paraphrasedText);
      setIsAIPowered(data.isAIPowered);
      setTokensUsed(data.tokensUsed || 0);

      // Add to history
      setHistory(prev => [
        { input: inputText, output: data.paraphrasedText, mode },
        ...prev.slice(0, 4) // Keep last 5
      ]);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to paraphrase text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    alert('Text copied to clipboard!');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const compareTexts = () => {
    if (!inputText || !outputText) return { similarity: 0, changes: 0 };

    const originalWords = inputText.toLowerCase().split(/\s+/);
    const paraphrasedWords = outputText.toLowerCase().split(/\s+/);

    let matchingWords = 0;
    originalWords.forEach(word => {
      if (paraphrasedWords.includes(word)) matchingWords++;
    });

    const similarity = Math.round((matchingWords / originalWords.length) * 100);
    const changes = 100 - similarity;

    return { similarity, changes };
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w).length;
  const charCount = (text: string) => text.length;
  const sentenceCount = (text: string) => text.split(/[.!?]+/).filter(s => s.trim()).length;
  const comparison = compareTexts();

  return (
    <>
      <Head>
        <title>AI Paraphrase Tool - Rephrase Text with GPT-4 | Document Converter Pro</title>
        <meta name="description" content="Advanced AI-powered paraphrasing tool using GPT-4. Rephrase text with multiple modes: Standard, Formal, Creative, Simple, Fluency. Free online text rewriter." />
        <meta name="keywords" content="AI paraphrase tool, GPT-4 paraphraser, text rewriter, rephrase sentences, rewrite text, paraphrasing tool free, article rewriter, sentence rephraser, AI writing assistant" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/paraphrase-tool" />
        <meta property="og:title" content="AI Paraphrase Tool - Rephrase Text with GPT-4" />
        <meta property="og:description" content="Advanced AI-powered paraphrasing with GPT-4. Multiple modes and tones for perfect text rewriting." />
        <meta property="og:type" content="website" />
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
              🤖
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">AI Paraphrase Tool</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isAIPowered ? '⚡ Powered by GPT-4' : 'Advanced AI-powered'} text rewriting with multiple modes and tones
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Paraphrasing Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {([
                  { value: 'standard', label: 'Standard', desc: 'Balanced rewriting', icon: '⚖️' },
                  { value: 'formal', label: 'Formal', desc: 'Academic & professional', icon: '🎓' },
                  { value: 'creative', label: 'Creative', desc: 'Expressive & engaging', icon: '🎨' },
                  { value: 'simple', label: 'Simple', desc: 'Easy to understand', icon: '📖' },
                  { value: 'fluency', label: 'Fluency', desc: 'Improve readability', icon: '✨' },
                ] as const).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value as Mode)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${mode === m.value ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-300 hover:border-amber-400 hover:shadow-sm'}`}
                    style={{ borderWidth: '3px' }}
                  >
                    <div className="text-3xl mb-2">{m.icon}</div>
                    <div className="font-bold text-base" style={{ color: '#000000' }}>{m.label}</div>
                    <div className="text-sm" style={{ color: '#4a5568', fontWeight: '500' }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Tone</label>
                <div className="flex flex-wrap gap-2">
                  {(['neutral', 'professional', 'friendly', 'confident', 'casual'] as const).map((t) => (
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

              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Output Length</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'shorter', label: 'Shorter (70-80%)', icon: '📉' },
                    { value: 'same', label: 'Same Length', icon: '↔️' },
                    { value: 'longer', label: 'Longer (120-150%)', icon: '📈' },
                  ] as const).map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value as Length)}
                      className={`px-4 py-2 rounded-lg border-2 text-base font-bold ${length === l.value ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-300 hover:border-amber-400 hover:shadow-sm'}`}
                      style={{ color: '#000000' }}
                    >
                      {l.icon} {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Input */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Original Text</label>
                  <div className="text-xs text-gray-500">
                    {wordCount(inputText)} words • {charCount(inputText)} chars • {sentenceCount(inputText)} sentences
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type your text here to paraphrase with AI..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>

              {/* Output */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Paraphrased Text {isAIPowered && <span className="text-green-600">✓ AI-Powered</span>}
                  </label>
                  <div className="text-xs text-gray-500">
                    {wordCount(outputText)} words • {charCount(outputText)} chars • {sentenceCount(outputText)} sentences
                  </div>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  placeholder="Paraphrased text will appear here..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000' }}
                />
                {outputText && comparison.changes > 0 && (
                  <div className="mt-2 text-xs text-gray-600 flex gap-4">
                    <span>Similarity: {comparison.similarity}%</span>
                    <span className="text-green-600">Uniqueness: {comparison.changes}%</span>
                    {tokensUsed > 0 && <span className="text-blue-600">Tokens: {tokensUsed}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={paraphraseText}
                disabled={isProcessing || !inputText.trim()}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Paraphrasing with AI...
                  </span>
                ) : (
                  '🤖 Paraphrase with AI'
                )}
              </button>

              {outputText && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="px-8 py-4 border-2 border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50"
                  >
                    📋 Copy Text
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    🗑️ Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-4">Recent Paraphrases</h2>
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-amber-600 uppercase">{item.mode} Mode</span>
                      <button
                        onClick={() => {
                          setInputText(item.output);
                          setOutputText('');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Reuse Output
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{item.output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-bold text-lg mb-2">GPT-4 Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI understands context and meaning</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">5 Modes</h3>
              <p className="text-gray-600 text-sm">Standard, Formal, Creative, Simple, Fluency</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">Custom Tone</h3>
              <p className="text-gray-600 text-sm">Choose from 5 different tones</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">📏</div>
              <h3 className="font-bold text-lg mb-2">Length Control</h3>
              <p className="text-gray-600 text-sm">Make it shorter, longer, or same length</p>
            </div>
          </div>

          {/* SEO Content */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">AI-Powered Paraphrasing with GPT-4</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our advanced paraphrasing tool uses OpenAI's GPT-4 to provide intelligent text rewriting that understands context,
              maintains meaning, and produces natural-sounding results. Unlike basic synonym replacers, our AI comprehends the
              nuances of language and can adapt to different writing styles and purposes.
            </p>

            <h3 className="text-xl font-bold mb-3">How to Use the AI Paraphrase Tool</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
              <li><strong>Paste your text</strong> - Copy and paste the text you want to rephrase into the input box</li>
              <li><strong>Choose mode & settings</strong> - Select paraphrasing mode (Standard, Formal, Creative, Simple, or Fluency), tone, and desired length</li>
              <li><strong>Click Paraphrase</strong> - Our GPT-4 AI will intelligently rewrite your text</li>
              <li><strong>Review & copy</strong> - Check the result, make any adjustments, and copy to use</li>
            </ol>

            <h3 className="text-xl font-bold mb-3">Paraphrasing Modes Explained</h3>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li><strong>🎯 Standard:</strong> Balanced rewriting that maintains clarity while varying vocabulary and structure</li>
              <li><strong>🎓 Formal:</strong> Academic and professional language with sophisticated vocabulary for essays, reports, and business documents</li>
              <li><strong>🎨 Creative:</strong> Expressive and engaging language perfect for marketing, blogs, and creative writing</li>
              <li><strong>📖 Simple:</strong> Simplified language with clear vocabulary for better accessibility and comprehension</li>
              <li><strong>✨ Fluency:</strong> Enhanced flow and readability with improved transitions and natural prose</li>
            </ul>

            <h3 className="text-xl font-bold mb-3">Why Use AI Paraphrasing?</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Avoid plagiarism by creating unique versions of existing content</li>
              <li>Improve clarity and readability of complex text</li>
              <li>Adapt writing style for different audiences and purposes</li>
              <li>Save time on manual rewriting and editing</li>
              <li>Learn alternative ways to express ideas</li>
              <li>Create multiple variations for A/B testing</li>
            </ul>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
