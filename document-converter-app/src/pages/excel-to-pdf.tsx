import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';

export default function ExcelToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setDownloadUrl('');
    } else {
      alert('Please select a valid Excel file (.xlsx, .xls, or .csv)');
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/excel-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error converting Excel to PDF:', error);
      alert('Failed to convert Excel to PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Excel to PDF Converter Free - Convert XLSX to PDF Online | Document Converter Pro</title>
        <meta name="description" content="Convert Excel to PDF online for free. Transform XLSX, XLS, and CSV files to PDF. Preserve formatting, charts, and formulas." />
        <meta name="keywords" content="excel to pdf, xlsx to pdf, spreadsheet to pdf, convert excel, xls to pdf" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/excel-to-pdf" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">Document Converter Pro</h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📊
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Excel to PDF Converter</h1>
            <p className="text-xl text-gray-600">Convert Excel spreadsheets to PDF format instantly</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            {!file ? (
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 hover:border-green-500 transition-colors">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Select Excel File</p>
                    <p className="text-sm text-gray-500">Supports .xlsx, .xls, and .csv files</p>
                  </div>
                </label>
                <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                      </svg>
                      <p className="font-semibold">{file.name}</p>
                    </div>
                    <button onClick={() => { setFile(null); setDownloadUrl(''); }}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {!downloadUrl ? (
                  <button onClick={handleConvert} disabled={isConverting} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50">
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                  </button>
                ) : (
                  <a href={downloadUrl} download={file.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf')} className="block text-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold">
                    Download PDF
                  </a>
                )}
              </div>
            )}
          </div>

          <AdSenseAd adSlot="1212121212" adFormat="rectangle" style={{ display: 'block', width: '336px', height: '280px' }} />
        </main>
      </div>
    </>
  );
}
