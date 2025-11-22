import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

type EmailType = 'job-application' | 'follow-up' | 'cold-outreach' | 'complaint' | 'thank-you' | 'meeting-request' | 'introduction' | 'proposal';
type Tone = 'formal' | 'friendly' | 'persuasive' | 'apologetic';

export default function AIEmailWriter() {
  const [emailType, setEmailType] = useState<EmailType>('job-application');
  const [tone, setTone] = useState<Tone>('formal');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [senderName, setSenderName] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(0);

  const generate = async () => {
    if (!recipient.trim() || !context.trim()) {
      alert('Please enter recipient and context/details');
      return;
    }

    setIsGenerating(true);
    setGeneratedSubject('');
    setGeneratedBody('');

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailType, tone, recipient, subject, context, senderName }),
      });

      if (!response.ok) throw new Error('Failed to generate email');

      const data = await response.json();
      setGeneratedSubject(data.subject || '');
      setGeneratedBody(data.body);
      setTokensUsed(data.tokensUsed || 0);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate email. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyEmail = () => {
    const fullEmail = `Subject: ${generatedSubject}\n\n${generatedBody}`;
    navigator.clipboard.writeText(fullEmail);
    alert('Email copied to clipboard!');
  };

  const copyBody = () => {
    navigator.clipboard.writeText(generatedBody);
    alert('Email body copied to clipboard!');
  };

  return (
    <>
      <Head>
        <title>AI Email Writer - Professional Email Generator Free | GPT-4 Powered</title>
        <meta name="description" content="Generate professional emails with AI. Job applications, follow-ups, cold outreach, meeting requests, and more. Free GPT-4 powered email writing assistant." />
        <meta name="keywords" content="AI email writer, email generator, job application email, cold email, follow-up email, professional email writer, GPT-4 email assistant" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/ai-email-writer" />
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
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✉️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>AI Email Writer</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#000000' }}>
              Generate professional emails for any purpose with AI
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: '2px solid #e5e7eb' }}>
            {/* Email Type Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Email Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {([
                  { value: 'job-application', label: 'Job Application', icon: '💼' },
                  { value: 'follow-up', label: 'Follow-up', icon: '🔄' },
                  { value: 'cold-outreach', label: 'Cold Outreach', icon: '📧' },
                  { value: 'complaint', label: 'Complaint', icon: '⚠️' },
                  { value: 'thank-you', label: 'Thank You', icon: '🙏' },
                  { value: 'meeting-request', label: 'Meeting Request', icon: '📅' },
                  { value: 'introduction', label: 'Introduction', icon: '👋' },
                  { value: 'proposal', label: 'Business Proposal', icon: '📊' },
                ] as const).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setEmailType(type.value as EmailType)}
                    className={`p-4 rounded-xl border-3 text-left transition-all ${emailType === type.value ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-300 hover:border-indigo-400 hover:shadow-sm'}`}
                      style={{ borderWidth: '3px' }}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-bold text-base" style={{ color: '#000000' }}>{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Tone</label>
              <div className="flex flex-wrap gap-2">
                {(['formal', 'friendly', 'persuasive', 'apologetic'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t as Tone)}
                    className={`px-4 py-2 rounded-lg border-2 capitalize text-base font-bold ${tone === t ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-300 hover:border-indigo-400 hover:shadow-sm'}`}
                    style={{ color: '#000000' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g., Hiring Manager, John Smith, Sales Team"
                  className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base"
                  style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff', fontWeight: '500' }}
                />
              </div>

              <div>
                <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base"
                  style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            {/* Context/Details */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Context / Details</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={`Provide key information for your email:\n\nFor job application: Position, company name, your qualifications\nFor follow-up: Previous conversation, what you're following up on\nFor cold outreach: Your offer/service, value proposition\nFor meeting: Purpose, suggested times, agenda\n\nThe more details you provide, the better the email will be!`}
                className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base leading-relaxed resize-none"
                style={{ fontSize: '16px', lineHeight: '1.6', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Sender Name */}
            <div className="mb-6">
              <label className="block text-base font-bold mb-4" style={{ color: '#1a202c', fontSize: '17px' }}>Your Name (Optional)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g., Sarah Johnson"
                className="w-full px-5 py-4 border-3 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base"
                style={{ fontSize: '16px', color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating || !recipient.trim() || !context.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-5 text-lg font-bold rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Email...
                </span>
              ) : (
                '🤖 Generate Email with AI'
              )}
            </button>

            {/* Generated Email Output */}
            {generatedBody && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold" style={{ color: '#000000' }}>Generated Email</label>
                  {tokensUsed > 0 && (
                    <div className="text-xs text-gray-500">
                      {tokensUsed} tokens used
                    </div>
                  )}
                </div>

                {/* Subject Line */}
                {generatedSubject && (
                  <div className="mb-3">
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#000000' }}>Subject Line</label>
                    <div className="px-4 py-3 border-2 border-indigo-200 rounded-lg bg-indigo-50 font-semibold" style={{ fontSize: '16px', color: '#000000' }}>
                      {generatedSubject}
                    </div>
                  </div>
                )}

                {/* Email Body */}
                <textarea
                  value={generatedBody}
                  readOnly
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-base leading-relaxed resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.8', color: '#000000' }}
                />

                {/* Copy Buttons */}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={copyEmail}
                    className="flex-1 px-6 py-3 border-2 border-indigo-500 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50"
                  >
                    📋 Copy Full Email
                  </button>
                  <button
                    onClick={copyBody}
                    className="flex-1 px-6 py-3 border-2 border-gray-400 rounded-lg font-semibold hover:bg-gray-50"
                    style={{ color: '#000000' }}
                  >
                    📄 Copy Body Only
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>8 Email Types</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Job apps, outreach, meetings & more</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>4 Tone Options</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Match your communication style</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>Instant Generation</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Professional emails in seconds</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: '#1a202c' }}>AI Powered</h3>
              <p className="text-base" style={{ color: '#4a5568', fontWeight: '500', lineHeight: '1.6' }}>Advanced AI writing quality</p>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
