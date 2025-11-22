import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitMode, setSplitMode] = useState<'pages' | 'range'>('pages');
  const [pageNumbers, setPageNumbers] = useState<string>('');
  const [downloadUrls, setDownloadUrls] = useState<{ url: string; name: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrls([]);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    if (splitMode === 'pages' && !pageNumbers.trim()) {
      alert('Please enter page numbers to split');
      return;
    }

    setIsSplitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', splitMode);
    formData.append('pages', pageNumbers);

    try {
      const response = await fetch('/api/split-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Split failed');
      }

      const data = await response.json();
      setDownloadUrls(data.files);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF. Please try again.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Split PDF Online Free - Separate PDF Pages | Document Converter Pro</title>
        <meta name="description" content="Split PDF files online for free. Extract pages, separate PDF into multiple documents. Fast, secure, no watermarks." />
        <meta name="keywords" content="split pdf, separate pdf, extract pdf pages, divide pdf, pdf splitter, split pdf pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/split-pdf" />
      </Head>

      <div className="min-h-screen bg-gray-50">
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
                <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              ✂️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Split PDF Files</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract pages from PDF or split into multiple documents.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-cyan-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to select PDF file</p>
                    <p className="text-sm text-gray-500">or drag and drop your PDF here</p>
                  </div>
                </label>
                <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                    </div>
                    <button onClick={() => { setFile(null); setDownloadUrls([]); }} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Split Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setSplitMode('pages')} className={`p-4 rounded-lg border-2 ${splitMode === 'pages' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}>
                      <p className="font-semibold">Extract Pages</p>
                      <p className="text-xs text-gray-500">Select specific pages</p>
                    </button>
                    <button onClick={() => setSplitMode('range')} className={`p-4 rounded-lg border-2 ${splitMode === 'range' ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}>
                      <p className="font-semibold">Split All</p>
                      <p className="text-xs text-gray-500">One page per file</p>
                    </button>
                  </div>
                </div>

                {splitMode === 'pages' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Page Numbers</label>
                    <input
                      type="text"
                      value={pageNumbers}
                      onChange={(e) => setPageNumbers(e.target.value)}
                      placeholder="e.g., 1,3,5-7"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter page numbers separated by commas, or ranges like 1-5</p>
                  </div>
                )}

                {downloadUrls.length === 0 ? (
                  <button
                    onClick={handleSplit}
                    disabled={isSplitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                  >
                    {isSplitting ? 'Splitting PDF...' : 'Split PDF'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">{downloadUrls.length} files created</p>
                    {downloadUrls.map((file, idx) => (
                      <a key={idx} href={file.url} download={file.name} className="block bg-green-50 border border-green-200 p-4 rounded-lg hover:bg-green-100">
                        Download {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-12 flex justify-center">
            <AdSenseAd adSlot="1111111111" adFormat="rectangle" style={{ display: 'block', width: '336px', height: '280px' }} />
          </div>
        </main>
      </div>
    </>
  );
}
