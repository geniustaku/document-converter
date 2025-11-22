import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl('');
      // Create preview URL for the original PDF
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleRotate = async () => {
    if (!file) return;

    setIsRotating(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rotation', rotation.toString());

    try {
      const response = await fetch('/api/rotate-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Rotation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Failed to rotate PDF. Please try again.');
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Rotate PDF Pages Online Free - Adjust PDF Orientation | Document Converter Pro</title>
        <meta name="description" content="Rotate PDF pages online for free. Adjust PDF orientation 90, 180, or 270 degrees. Fix landscape and portrait page orientation." />
        <meta name="keywords" content="rotate pdf, pdf rotation, rotate pdf pages, change pdf orientation, fix pdf rotation" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/rotate-pdf" />
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

        <main className="max-w-4xl mx-auto px-4 py-12">
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
              🔄
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Rotate PDF Pages</h1>
            <p className="text-xl text-gray-600">Fix PDF page orientation in seconds</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-purple-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Select PDF File</p>
                  </div>
                </label>
                <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <p className="font-semibold">{file.name}</p>
                  <button onClick={() => { setFile(null); setDownloadUrl(''); setPreviewUrl(''); }}>✕</button>
                </div>

                {/* PDF Preview */}
                {previewUrl && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3">Preview</label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                      <iframe
                        src={downloadUrl || previewUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {downloadUrl ? 'Rotated PDF Preview' : 'Original PDF Preview'}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Rotation Angle</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg as 90 | 180 | 270)}
                        className={`p-4 rounded-lg border-2 ${rotation === deg ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                      >
                        <div style={{
                          transform: `rotate(${deg}deg)`,
                          display: 'inline-block',
                          fontSize: '24px',
                          marginBottom: '8px'
                        }}>
                          📄
                        </div>
                        <p className="font-semibold">{deg}°</p>
                        <p className="text-xs text-gray-500">{deg === 90 ? 'Clockwise' : deg === 180 ? 'Upside down' : 'Counter-clockwise'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {!downloadUrl ? (
                  <button onClick={handleRotate} disabled={isRotating} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50">
                    {isRotating ? 'Rotating...' : 'Rotate PDF'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <a href={downloadUrl} download={file.name.replace('.pdf', '_rotated.pdf')} className="block text-center bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700">
                      Download Rotated PDF
                    </a>
                    <button
                      onClick={() => setDownloadUrl('')}
                      className="w-full text-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Rotate Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
