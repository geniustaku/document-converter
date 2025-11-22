import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function PDFtoExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setDownloadUrl('');
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting PDF to Excel:', error);
      alert('Failed to convert PDF to Excel. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <Head>
        <title>PDF to Excel Converter Free - Convert PDF to XLSX Online | Document Converter Pro</title>
        <meta name="description" content="Convert PDF to Excel online for free. Extract tables from PDF to editable Excel spreadsheets. Accurate data extraction." />
        <meta name="keywords" content="pdf to excel, pdf to xlsx, convert pdf to spreadsheet, pdf table extraction" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/pdf-to-excel" />
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📑
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">PDF to Excel Converter</h1>
            <p className="text-xl text-gray-600">Extract tables from PDF to editable Excel files</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Select PDF with Tables</p>
                    <p className="text-sm text-gray-500">Best for PDFs containing data tables</p>
                  </div>
                </label>
                <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <p className="font-semibold">{file.name}</p>
                  <button onClick={() => { setFile(null); setDownloadUrl(''); }}>✕</button>
                </div>

                {!downloadUrl ? (
                  <button onClick={handleConvert} disabled={isConverting} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold disabled:opacity-50">
                    {isConverting ? 'Converting...' : 'Convert to Excel'}
                  </button>
                ) : (
                  <a href={downloadUrl} download={file.name.replace('.pdf', '.xlsx')} className="block text-center bg-green-600 text-white px-8 py-4 rounded-lg font-semibold">
                    Download Excel File
                  </a>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
