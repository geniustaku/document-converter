import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter((file) => file.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      alert('Please select only PDF files');
    }

    setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
    setDownloadUrl('');
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= files.length) return;

    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files to merge');
      return;
    }

    setIsMerging(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/merge-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Merge failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Head>
        <title>Merge PDF Files Online Free - Combine PDFs | Document Converter Pro</title>
        <meta name="description" content="Merge multiple PDF files into one document online for free. Combine PDFs in any order, secure processing, instant download. No limits or watermarks." />
        <meta name="keywords" content="merge pdf, combine pdf, join pdf, pdf merger, merge pdf files, combine pdf online, pdf joiner, free pdf merge" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/merge-pdf" />

        <meta property="og:title" content="Merge PDF Files Online Free - Combine Multiple PDFs" />
        <meta property="og:description" content="Merge multiple PDF files into one document online for free. Combine PDFs in any order." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://document-converter-pro.vercel.app/merge-pdf" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Merge PDF Files Online Free" />
        <meta name="twitter:description" content="Combine multiple PDFs into one document. Free and secure." />
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
                <Link href="/about" className="text-gray-600 hover:text-blue-600 font-medium">About</Link>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 font-medium">Privacy</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📑
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Merge PDF Files
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combine multiple PDF documents into a single file. Arrange pages in any order.
            </p>
          </div>

          {/* Merge Tool */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {files.length === 0 ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-purple-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to select PDF files</p>
                    <p className="text-sm text-gray-500">or drag and drop multiple PDFs here</p>
                    <p className="text-xs text-gray-400 mt-2">Select at least 2 files to merge</p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {files.length} {files.length === 1 ? 'PDF' : 'PDFs'} selected
                    </h3>
                    <label htmlFor="add-more" className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                      + Add more PDFs
                    </label>
                    <input
                      id="add-more"
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded text-red-600 font-bold">
                          {index + 1}
                        </div>
                        <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === files.length - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Remove"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {files.length < 2 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please add at least 2 PDF files to merge
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!downloadUrl ? (
                    <button
                      onClick={handleMerge}
                      disabled={isMerging || files.length < 2}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMerging ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Merging PDFs...
                        </span>
                      ) : (
                        'Merge PDFs'
                      )}
                    </button>
                  ) : (
                    <a
                      href={downloadUrl}
                      download="merged.pdf"
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all text-center"
                    >
                      Download Merged PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd
              adSlot="9999999999"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* How to Merge PDFs */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Merge PDF Files</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select PDF Files</h3>
                  <p className="text-gray-600">Click to upload or drag and drop at least 2 PDF files. You can add more files anytime during the process.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Arrange in Order</h3>
                  <p className="text-gray-600">Use the up/down arrows to reorder your PDFs. The first file will appear first in the merged document, and so on.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge and Download</h3>
                  <p className="text-gray-600">Click "Merge PDFs" to combine all files into one document. Download your merged PDF in seconds.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How many PDF files can I merge at once?</h3>
                <p className="text-gray-600">You can merge up to 20 PDF files in a single operation. For larger batches, simply merge in multiple sessions.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Will the quality be affected when merging?</h3>
                <p className="text-gray-600">No. We preserve all content, formatting, images, and quality from your original PDFs. The merged file is an exact combination of your inputs.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I merge password-protected PDFs?</h3>
                <p className="text-gray-600">Currently, password-protected PDFs must be unlocked before merging. Remove the password first, then merge the files.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to my uploaded files?</h3>
                <p className="text-gray-600">All files are processed in secure memory and automatically deleted within 60 seconds. We never store, view, or share your documents.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Why merge PDFs instead of keeping them separate?</h3>
                <p className="text-gray-600">Merged PDFs are easier to email, organize, and share. Combine contracts, invoices, reports, or any documents that belong together into one convenient file.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
