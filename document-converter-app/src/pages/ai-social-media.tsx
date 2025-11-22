import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok';
type PostType = 'promotional' | 'educational' | 'engaging' | 'announcement' | 'storytelling' | 'inspirational';

export default function AISocialMedia() {
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [postType, setPostType] = useState<PostType>('promotional');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [variations, setVariations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const generate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setVariations([]);

    try {
      const response = await fetch('/api/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, postType, topic, keywords, includeHashtags, includeEmojis }),
      });

      if (!response.ok) throw new Error('Failed to generate posts');

      const data = await response.json();
      setVariations(data.variations || []);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate social media posts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPost = (post: string) => {
    navigator.clipboard.writeText(post);
    alert('Post copied to clipboard!');
  };

  const getCharLimit = (p: Platform) => {
    switch (p) {
      case 'twitter': return 280;
      case 'instagram': return 2200;
      case 'linkedin': return 3000;
      case 'facebook': return 'No limit';
      case 'tiktok': return 2200;
      default: return 'Unknown';
    }
  };

  return (
    <>
      <Head>
        <title>AI Social Media Post Generator - Free Content for All Platforms | GPT-4</title>
        <meta name="description" content="Generate engaging social media posts with AI. Create content for Twitter, Instagram, LinkedIn, Facebook, and TikTok. Free GPT-4 powered social media generator." />
        <meta name="keywords" content="AI social media generator, social media post generator, Twitter post generator, Instagram caption generator, LinkedIn post, TikTok caption, GPT-4 social media" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-social-media" />
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
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📱
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Social Media Generator</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Create engaging posts for Twitter, Instagram, LinkedIn, Facebook & TikTok with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Platform</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {([
                  { value: 'twitter', label: 'Twitter/X', icon: '𝕏', color: 'border-black' },
                  { value: 'instagram', label: 'Instagram', icon: '📷', color: 'border-pink-500' },
                  { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'border-blue-700' },
                  { value: 'facebook', label: 'Facebook', icon: '👍', color: 'border-blue-600' },
                  { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'border-black' },
                ] as const).map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value as Platform)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${platform === p.value ? `${p.color} bg-pink-50` : 'border-gray-300 hover:border-pink-400 hover:shadow-sm'}`}
                  >
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-bold text-base" style={{ color: '#000000' }}>{p.label}</div>
                    <div className="text-sm" style={{ color: '#4a5568', fontWeight: '500' }}>{getCharLimit(p.value as Platform)} chars</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Type */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Post Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {([
                  { value: 'promotional', label: 'Promotional', icon: '🎯' },
                  { value: 'educational', label: 'Educational', icon: '📚' },
                  { value: 'engaging', label: 'Engaging Question', icon: '💬' },
                  { value: 'announcement', label: 'Announcement', icon: '📢' },
                  { value: 'storytelling', label: 'Storytelling', icon: '📖' },
                  { value: 'inspirational', label: 'Inspirational', icon: '✨' },
                ] as const).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPostType(type.value as PostType)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${postType === type.value ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-300 hover:border-pink-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                  >
                    <span className="text-xl mr-2">{type.icon}</span>
                    <span className="font-bold text-base" style={{ color: '#000000' }}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Topic / Message</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Launch of our new AI-powered productivity app, Tips for work-life balance, Celebrating team achievements"
                className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-base leading-relaxed resize-none"
                style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff', fontWeight: '500' }}
              />
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Keywords (Optional)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., productivity, AI, innovation (comma-separated)"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4 mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm font-semibold" style={{ color: '#000000' }}>Include Hashtags</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm font-semibold" style={{ color: '#000000' }}>Include Emojis</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-5 text-lg font-bold rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Posts...
                </span>
              ) : (
                '🤖 Generate 3 Variations with AI'
              )}
            </button>

            {/* Generated Variations */}
            {variations.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#000000' }}>Generated Posts</h3>
                  {tokensUsed > 0 && (
                    <div className="text-xs text-gray-500">
                      {tokensUsed} tokens used
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {variations.map((post, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-pink-600">Variation {index + 1}</span>
                        <span className="text-xs text-gray-500">{post.length} characters</span>
                      </div>
                      <div className="mb-3 whitespace-pre-wrap text-base leading-relaxed" style={{ fontSize: '16px', color: '#000000' }}>
                        {post}
                      </div>
                      <button
                        onClick={() => copyPost(post)}
                        className="w-full px-4 py-2 border-2 border-pink-500 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 text-sm"
                      >
                        📋 Copy This Post
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
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>5 Platforms</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Twitter, Instagram, LinkedIn, Facebook, TikTok</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>6 Post Types</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>From promotional to inspirational</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>3 Variations</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Multiple options to choose from</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">#️⃣</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Hashtags & Emojis</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Optimized for engagement</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
