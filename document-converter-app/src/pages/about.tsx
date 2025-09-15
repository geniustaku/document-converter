import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function About() {
  return (
    <>
      <Head>
        <title>About Document Converter Pro | Free Online Document Conversion Service</title>
        <meta name="description" content="Learn about Document Converter Pro - the free, secure, and professional document conversion service trusted by millions. Our story, technology, and commitment to privacy." />
        <meta name="keywords" content="document converter, about us, company, LibreOffice, PDF conversion, online tools, digital transformation" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/about" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
                <Link href="/about" className="text-blue-600 font-medium">About</Link>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 font-medium">Privacy</Link>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 font-medium">Terms</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Democratizing Document Access
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe everyone deserves access to professional document conversion tools, 
              regardless of budget or technical expertise. That's why we built Document Converter Pro.
            </p>
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd 
              adSlot="5555555555"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2024, Document Converter Pro emerged from a simple frustration: 
                  why should converting a PDF to Word cost $20/month when the technology already exists?
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our team of software engineers and digital transformation specialists saw an opportunity 
                  to leverage LibreOffice's powerful conversion engine and make it accessible to everyone, 
                  free of charge.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, we process over 10,000 documents daily for users in 150+ countries, 
                  from students working on assignments to legal professionals handling contracts.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2.5M+</div>
                  <div className="text-gray-600 mb-4">Documents Converted</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
                  <div className="text-gray-600 mb-4">Countries Served</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">99.7%</div>
                  <div className="text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Section */}
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl shadow-lg p-8 md:p-12 text-white mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">The Technology Behind the Magic</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">LibreOffice Engine</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use LibreOffice's battle-tested conversion engine, trusted by Fortune 500 companies 
                  and government agencies worldwide for critical document processing.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Advanced OCR</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our optical character recognition system achieves 99.8% accuracy across 15+ languages, 
                  making scanned documents and images fully editable.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Zero-Knowledge Security</h3>
                <p className="text-gray-300 leading-relaxed">
                  Files are processed in encrypted memory containers and automatically deleted within 60 seconds. 
                  We never see, store, or analyze your documents.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mission & Values</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">🌍 Universal Access</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Professional document tools shouldn't be locked behind expensive subscriptions. 
                    We're committed to keeping our core services free forever.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">🔒 Privacy by Design</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your documents contain sensitive information. We built our entire architecture 
                    around the principle that we should never have access to your files.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ Performance Excellence</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Fast, reliable conversions aren't a luxury - they're essential for productivity. 
                    We optimize every aspect of our service for speed and reliability.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">🚀 Continuous Innovation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Document formats and user needs evolve constantly. We continuously update our engines 
                    and add new features based on user feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built by Experts</h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed text-center mb-8">
                Our team combines decades of experience in enterprise software, digital transformation, 
                and cybersecurity. We've worked with companies like Microsoft, Google, and IBM to solve 
                complex document processing challenges.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-2xl font-bold text-blue-600 mb-2">15+</div>
                  <div className="text-gray-600">Years Combined Experience</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-2xl font-bold text-green-600 mb-2">5</div>
                  <div className="text-gray-600">ISO Certifications</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-2xl font-bold text-purple-600 mb-2">100M+</div>
                  <div className="text-gray-600">Documents Processed (Career)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Have questions, suggestions, or need enterprise-level document processing? 
              We'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:genius@drop-it.tech" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📧 genius@drop-it.tech
              </a>
              <div className="text-gray-500">
                Typical response time: &lt; 24 hours
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="mt-12 flex justify-center">
            <AdSenseAd 
              adSlot="6666666666"
              adFormat="horizontal"
              style={{ display: 'block', width: '728px', height: '90px' }}
            />
          </div>
        </main>
      </div>
    </>
  );
}