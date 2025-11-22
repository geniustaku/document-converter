import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function JPGtoPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== selectedFiles.length) {
      alert('Please select only image files');
    }

    setFiles((prevFiles) => [...prevFiles, ...imageFiles]);
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

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/jpg-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('Failed to convert images to PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <Head>
        <title>JPG to PDF Converter - Convert Images to PDF Online Free | Document Converter Pro</title>
        <meta name="description" content="Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into one PDF document. Fast, secure, no watermarks." />
        <meta name="keywords" content="jpg to pdf, png to pdf, image to pdf, convert jpg to pdf, photo to pdf, pictures to pdf, free image converter" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/jpg-to-pdf" />

        <meta property="og:title" content="JPG to PDF Converter - Convert Images to PDF Online Free" />
        <meta property="og:description" content="Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into one PDF." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://document-converter-pro.vercel.app/jpg-to-pdf" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JPG to PDF Converter - Free Online Tool" />
        <meta name="twitter:description" content="Convert images to PDF online. Free, fast, and secure." />
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
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              🖼️
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Convert JPG to PDF
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your images into PDF documents. Combine multiple photos into a single file.
            </p>
          </div>

          {/* Conversion Tool */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {files.length === 0 ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-green-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Click to select images</p>
                    <p className="text-sm text-gray-500">or drag and drop JPG, PNG, GIF, or other image files here</p>
                    <p className="text-xs text-gray-400 mt-2">You can select multiple files</p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
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
                      {files.length} {files.length === 1 ? 'image' : 'images'} selected
                    </h3>
                    <label htmlFor="add-more" className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer">
                      + Add more images
                    </label>
                    <input
                      id="add-more"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === files.length - 1}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-400 hover:text-red-600"
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

                <div className="flex gap-3">
                  {!downloadUrl ? (
                    <button
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConverting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Converting to PDF...
                        </span>
                      ) : (
                        'Convert to PDF'
                      )}
                    </button>
                  ) : (
                    <a
                      href={downloadUrl}
                      download="converted.pdf"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-center"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ad Space */}
          <div className="mb-12 flex justify-center">
            <AdSenseAd
              adSlot="8888888888"
              adFormat="rectangle"
              style={{ display: 'block', width: '336px', height: '280px' }}
            />
          </div>

          {/* How to Convert */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Convert Images to PDF</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Images</h3>
                  <p className="text-gray-600">Click to select one or multiple images. Supports JPG, PNG, GIF, BMP, and other common formats. Drag and drop works too!</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Arrange Images</h3>
                  <p className="text-gray-600">Use the up/down arrows to reorder images. The order determines how they appear in your PDF. Remove unwanted images with the X button.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Convert and Download</h3>
                  <p className="text-gray-600">Click "Convert to PDF" and wait a few seconds. Download your PDF file with all images combined into one document.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What image formats can I convert?</h3>
                <p className="text-gray-600">We support all common image formats including JPG, JPEG, PNG, GIF, BMP, TIFF, and WebP. The converter automatically handles different formats.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I combine multiple images into one PDF?</h3>
                <p className="text-gray-600">Yes! Select multiple images at once or add them one by one. They will be combined into a single PDF file in the order you choose.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Will the image quality be reduced?</h3>
                <p className="text-gray-600">No. We preserve the original image quality when converting to PDF. Your images will look exactly as they did before conversion.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a limit on file size or number of images?</h3>
                <p className="text-gray-600">You can convert up to 20 images at once, with each image up to 10MB. For larger batches, simply convert in multiple sessions.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Why convert images to PDF?</h3>
                <p className="text-gray-600">PDFs are ideal for sharing multiple images as one file, creating photo albums, archiving scanned documents, or submitting image-based assignments and reports.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
