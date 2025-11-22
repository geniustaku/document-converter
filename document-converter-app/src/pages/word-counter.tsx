import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0
  });

  useEffect(() => {
    calculateStats();
  }, [text]);

  const calculateStats = () => {
    if (!text.trim()) {
      setStats({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0
      });
      return;
    }

    // Words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    // Characters
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200);

    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil(words / 150);

    setStats({
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime
    });
  };

  const clearText = () => {
    setText('');
  };

  const copyStats = () => {
    const statsText = `
Word Count: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading Time: ${stats.readingTime} min
Speaking Time: ${stats.speakingTime} min
    `.trim();

    navigator.clipboard.writeText(statsText);
    alert('Stats copied to clipboard!');
  };

  const getTopWords = () => {
    if (!text.trim()) return [];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3); // Ignore short words

    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const topWords = getTopWords();

  return (
    <>
      <Head>
        <title>Free Word Counter - Character Count & Text Analysis Tool | Document Converter Pro</title>
        <meta name="description" content="Count words, characters, sentences, and paragraphs online for free. Get reading time estimates and text statistics instantly. Perfect for writers and students." />
        <meta name="keywords" content="word counter, character counter, word count, character count, text counter, sentence counter, reading time calculator, text statistics" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/word-counter" />
        <meta property="og:title" content="Free Word Counter - Character Count & Text Analysis" />
        <meta property="og:description" content="Count words and characters instantly with our free online tool. Get detailed text statistics." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
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

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📊
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Word Counter</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Count words, characters, sentences, and get detailed text analysis in real-time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Text Input */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-semibold text-gray-700">Enter Your Text</label>
                {text && (
                  <button
                    onClick={clearText}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing or paste your text here..."
                className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base leading-relaxed resize-none"
                style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
              />

              {/* Top Keywords */}
              {topWords.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Used Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {topWords.map(([word, count], idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {word} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">Statistics</h2>
                <button
                  onClick={copyStats}
                  disabled={!text}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy Stats
                </button>
              </div>

              <div className="space-y-4">
                {/* Words */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                  <div className="text-sm text-indigo-700 font-semibold mb-1">Words</div>
                  <div className="text-3xl font-bold text-indigo-900">{stats.words.toLocaleString()}</div>
                </div>

                {/* Characters */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-sm text-purple-700 font-semibold mb-1">Characters</div>
                  <div className="text-3xl font-bold text-purple-900">{stats.characters.toLocaleString()}</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {stats.charactersNoSpaces.toLocaleString()} without spaces
                  </div>
                </div>

                {/* Sentences */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-sm text-blue-700 font-semibold mb-1">Sentences</div>
                  <div className="text-3xl font-bold text-blue-900">{stats.sentences.toLocaleString()}</div>
                </div>

                {/* Paragraphs */}
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                  <div className="text-sm text-cyan-700 font-semibold mb-1">Paragraphs</div>
                  <div className="text-3xl font-bold text-cyan-900">{stats.paragraphs.toLocaleString()}</div>
                </div>

                {/* Reading Time */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-sm text-green-700 font-semibold mb-1">Reading Time</div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.readingTime} {stats.readingTime === 1 ? 'minute' : 'minutes'}
                  </div>
                  <div className="text-xs text-green-600 mt-1">~200 words/min</div>
                </div>

                {/* Speaking Time */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                  <div className="text-sm text-amber-700 font-semibold mb-1">Speaking Time</div>
                  <div className="text-2xl font-bold text-amber-900">
                    {stats.speakingTime} {stats.speakingTime === 1 ? 'minute' : 'minutes'}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">~150 words/min</div>
                </div>

                {/* Average Word Length */}
                {stats.words > 0 && (
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <div className="text-sm text-pink-700 font-semibold mb-1">Avg Word Length</div>
                    <div className="text-2xl font-bold text-pink-900">
                      {(stats.charactersNoSpaces / stats.words).toFixed(1)} chars
                    </div>
                  </div>
                )}

                {/* Average Sentence Length */}
                {stats.sentences > 0 && (
                  <div className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                    <div className="text-sm text-rose-700 font-semibold mb-1">Avg Sentence Length</div>
                    <div className="text-2xl font-bold text-rose-900">
                      {(stats.words / stats.sentences).toFixed(1)} words
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-bold text-lg mb-2">Writers</h3>
              <p className="text-gray-600 text-sm">Track word count for articles, essays, and books</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-bold text-lg mb-2">Students</h3>
              <p className="text-gray-600 text-sm">Meet assignment word count requirements</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-bold text-lg mb-2">Professionals</h3>
              <p className="text-gray-600 text-sm">Optimize business documents and reports</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Social Media</h3>
              <p className="text-gray-600 text-sm">Stay within character limits for posts</p>
            </div>
          </div>

          {/* SEO Content */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">Why Use a Word Counter?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A word counter is an essential tool for anyone working with text. Whether you're a student meeting assignment requirements,
              a writer tracking manuscript progress, or a professional crafting the perfect message, knowing your word count is crucial.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Real-time counting</strong> - See statistics update as you type</li>
              <li><strong>Comprehensive stats</strong> - Words, characters, sentences, paragraphs, and more</li>
              <li><strong>Reading time</strong> - Estimate how long it takes to read your text</li>
              <li><strong>Speaking time</strong> - Calculate presentation duration</li>
              <li><strong>Top keywords</strong> - Identify most frequently used words</li>
              <li><strong>No signup required</strong> - Free and instant access</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">Common Word Count Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Tweet:</strong> 280 characters max</li>
              <li><strong>Blog post:</strong> 1,500-2,500 words</li>
              <li><strong>Short story:</strong> 1,000-7,500 words</li>
              <li><strong>Novel:</strong> 80,000-100,000 words</li>
              <li><strong>Academic essay:</strong> Varies by requirement (often 1,000-5,000 words)</li>
            </ul>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
