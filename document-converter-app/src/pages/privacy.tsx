import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Document Converter Pro</title>
        <meta name="description" content="Privacy policy for Document Converter Pro. We don't collect personal data and all files are deleted immediately after conversion." />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-green-800 mb-2">📋 Quick Summary</h2>
              <p className="text-green-700">
                We don't collect your personal data. Files are processed securely and deleted immediately after conversion. 
                No account required, no tracking, no data storage.
              </p>
            </div>

            {/* Ad Space */}
            <div className="my-8 flex justify-center">
              <AdSenseAd 
                adSlot="1111111111"
                adFormat="rectangle"
                style={{ display: 'block', width: '336px', height: '280px' }}
              />
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Don't Collect</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Personal information (name, email, address)</li>
                  <li>User accounts or login credentials</li>
                  <li>File content or metadata</li>
                  <li>IP addresses or location data</li>
                  <li>Browsing history or cookies for tracking</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Handle Your Files</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li>✅ Files are processed in secure, temporary storage</li>
                    <li>✅ All files are deleted immediately after conversion</li>
                    <li>✅ No file content is stored, cached, or backed up</li>
                    <li>✅ Processing happens on secure servers with encryption</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-700 mb-4">
                  We use Google AdSense to display advertisements. Google may collect some data for ad personalization. 
                  You can opt out of personalized ads in your Google settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700">
                  Since we don't collect or store your data, there's nothing to delete, modify, or export. 
                  Your privacy is protected by design.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
                <p className="text-gray-700">
                  Questions about privacy? Email us at: <a href="mailto:genius@drop-it.tech" className="text-blue-600 hover:text-blue-800">genius@drop-it.tech</a>
                </p>
              </section>
            </div>

            {/* Ad Space */}
            <div className="my-8 flex justify-center">
              <AdSenseAd 
                adSlot="2222222222"
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