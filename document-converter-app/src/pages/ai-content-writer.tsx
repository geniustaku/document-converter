import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type ContentType = 'blog' | 'essay' | 'article' | 'story' | 'social';
type Tone = 'professional' | 'casual' | 'academic' | 'creative' | 'persuasive';
type Length = 'short' | 'medium' | 'long';

export default function AIContentWriter() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [tone, setTone] = useState<Tone>('professional');
  const [length, setLength] = useState<Length>('medium');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const generate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setContent('');

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType, tone, length, keywords }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      setContent(data.content);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w).length;

  return (
    <>
      <Head>
        <title>AI Content Writer - Essay & Blog Generator Free | GPT-4 Powered</title>
        <meta name="description" content="Generate high-quality content with AI. Create blog posts, essays, articles, and stories instantly. Free GPT-4 powered content writer with SEO optimization." />
        <meta name="keywords" content="AI content writer, AI essay writer, blog post generator, article writer, content generator, GPT-4 writer, AI writing assistant, essay generator" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-content-writer" />
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✍️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Content Writer</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Generate high-quality blog posts, essays, articles, and more with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Topic or Title</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Future of Artificial Intelligence, Benefits of Exercise, etc."
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff', fontWeight: '500' }}
              />
            </div>

            {/* Content Type */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Content Type</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {([
                  { value: 'blog', label: 'Blog Post', icon: '📝', desc: 'Engaging blog content' },
                  { value: 'essay', label: 'Essay', icon: '🎓', desc: 'Academic writing' },
                  { value: 'article', label: 'Article', icon: '📰', desc: 'Informative article' },
                  { value: 'story', label: 'Story', icon: '📖', desc: 'Creative narrative' },
                  { value: 'social', label: 'Social Post', icon: '📱', desc: 'Social media' },
                ] as const).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setContentType(type.value as ContentType)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${contentType === type.value ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-300 hover:border-purple-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-bold text-base" style={{ color: '#000000' }}>{type.label}</div>
                    <div className="text-sm" style={{ color: '#4a5568', fontWeight: '500' }}>{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Tone</label>
                <div className="flex flex-wrap gap-2">
                  {(['professional', 'casual', 'academic', 'creative', 'persuasive'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t as Tone)}
                      className={`px-4 py-2 rounded-lg border-2 capitalize text-base font-bold ${tone === t ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-300 hover:border-purple-400 hover:shadow-sm'}`}
                      style={{ color: '#000000' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Length</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'short', label: 'Short (200-400 words)' },
                    { value: 'medium', label: 'Medium (500-800 words)' },
                    { value: 'long', label: 'Long (1000-1500 words)' },
                  ] as const).map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value as Length)}
                      className={`px-4 py-2 rounded-lg border-2 text-base font-bold ${length === l.value ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-300 hover:border-purple-400 hover:shadow-sm'}`}
                      style={{ color: '#000000' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Keywords (Optional - for SEO)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI, machine learning, technology (comma-separated)"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-5 text-lg font-bold rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                '🤖 Generate Content with AI'
              )}
            </button>

            {/* Output */}
            {content && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold" style={{ color: '#000000' }}>Generated Content</label>
                  <div className="text-xs text-gray-500">
                    {wordCount} words {tokensUsed > 0 && `• ${tokensUsed} tokens`}
                  </div>
                </div>
                <textarea
                  value={content}
                  readOnly
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.8', color: '#000000' }}
                />
                <button
                  onClick={copyToClipboard}
                  className="mt-3 px-8 py-3 border-2 border-purple-500 text-purple-600 rounded-lg font-semibold hover:bg-purple-50"
                >
                  📋 Copy Content
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>5 Content Types</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Blogs, essays, articles, stories, social posts</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>5 Tones</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Match any writing style</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">📏</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>3 Lengths</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Short, medium, or long-form</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🔑</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>SEO Keywords</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Optimize for search engines</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
