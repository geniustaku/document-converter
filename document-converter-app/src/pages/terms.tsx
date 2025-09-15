import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service | Document Converter Pro</title>
        <meta name="description" content="Terms of service for Document Converter Pro. Simple terms for our free document conversion service." />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Document Converter Pro</h1>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">📝 Simple Terms</h2>
              <p className="text-blue-700">
                Use our service responsibly. We provide free document conversion with no warranty. 
                Files are deleted immediately after processing.
              </p>
            </div>

            {/* Ad Space */}
            <div className="my-8 flex justify-center">
              <AdSenseAd 
                adSlot="3333333333"
                adFormat="rectangle"
                style={{ display: 'block', width: '336px', height: '280px' }}
              />
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Description</h2>
                <p className="text-gray-700 mb-4">
                  Document Converter Pro provides free online document and image conversion services. 
                  We convert between formats like PDF, Word, and various image types.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">✅ Allowed:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4">
                    <li>Personal document conversion</li>
                    <li>Business document processing</li>
                    <li>Educational materials</li>
                    <li>Legal documents (ensure proper handling)</li>
                  </ul>
                  
                  <h3 className="font-semibold text-gray-900 mb-3">❌ Not Allowed:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Copyrighted material without permission</li>
                    <li>Malicious or harmful content</li>
                    <li>Automated/bulk processing abuse</li>
                    <li>Illegal content of any kind</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">File Handling</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Maximum file size: 50MB per file</li>
                  <li>Files processed temporarily and deleted immediately</li>
                  <li>No backup or recovery of processed files</li>
                  <li>You retain all rights to your original files</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <ul className="space-y-2 text-gray-700">
                    <li>• Service provided "as-is" without warranty</li>
                    <li>• No guarantee of conversion accuracy</li>
                    <li>• Not liable for any data loss or damages</li>
                    <li>• Service availability may vary</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700">
                  We provide this service for free and cannot be held liable for any damages, 
                  data loss, or issues arising from use of our service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-700">
                  We may update these terms occasionally. Continued use constitutes acceptance of new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700">
                  Questions about these terms? Email us at: <a href="mailto:genius@drop-it.tech" className="text-blue-600 hover:text-blue-800">genius@drop-it.tech</a>
                </p>
              </section>
            </div>

            {/* Ad Space */}
            <div className="my-8 flex justify-center">
              <AdSenseAd 
                adSlot="4444444444"
                adFormat="horizontal"
                style={{ display: 'block', width: '728px', height: '90px' }}
              />
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: June 16, 2025
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}