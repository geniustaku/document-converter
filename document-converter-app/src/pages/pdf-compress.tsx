import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, Zap, Settings, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// Types
interface CompressedFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  status: 'processing' | 'completed' | 'error';
  downloadUrl?: string;
  error?: string;
}

interface CompressionSettings {
  quality: 'high' | 'balanced' | 'small';
  targetSize?: number;
  maintainImages: boolean;
}

const PDFCompressor: React.FC = () => {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 'balanced',
    maintainImages: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    handleFiles(pdfFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  // Simulate PDF compression (in real implementation, this would call your backend API)
  const compressPDF = async (file: File): Promise<CompressedFile> => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    // Simulate compression process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Simulate compression results based on quality setting
    let compressionRatio: number;
    switch (settings.quality) {
      case 'high':
        compressionRatio = 0.15 + Math.random() * 0.25; // 15-40% reduction
        break;
      case 'balanced':
        compressionRatio = 0.35 + Math.random() * 0.25; // 35-60% reduction
        break;
      case 'small':
        compressionRatio = 0.55 + Math.random() * 0.25; // 55-80% reduction
        break;
    }

    const originalSize = file.size;
    const compressedSize = Math.floor(originalSize * (1 - compressionRatio));
    
    // Create a blob URL for download (in real implementation, this would be from your server)
    const blob = new Blob([file], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      id: fileId,
      name: file.name,
      originalSize,
      compressedSize,
      compressionRatio: compressionRatio * 100,
      status: 'completed',
      downloadUrl
    };
  };

  const handleFiles = async (fileList: File[]) => {
    const newFiles: CompressedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      originalSize: file.size,
      compressedSize: 0,
      compressionRatio: 0,
      status: 'processing' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < fileList.length; i++) {
      try {
        const compressedFile = await compressPDF(fileList[i]);
        setFiles(prev => prev.map(f => 
          f.id === newFiles[i].id ? compressedFile : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === newFiles[i].id 
            ? { ...f, status: 'error', error: 'Compression failed' }
            : f
        ));
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file: CompressedFile) => {
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.name.replace('.pdf', '_compressed.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.downloadUrl);
    completedFiles.forEach(file => downloadFile(file));
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
  };

  const getQualityDescription = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'Best quality, moderate compression (15-40% smaller)';
      case 'balanced':
        return 'Good quality, balanced compression (35-60% smaller)';
      case 'small':
        return 'Smaller files, maximum compression (55-80% smaller)';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            PDF Compressor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Reduce PDF file sizes while maintaining quality. Perfect for email attachments and web uploads.
          </p>
        </div>

        {/* Settings Panel */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Compression Settings
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {showSettings ? 'Hide' : 'Show'} Settings
              </button>
            </div>
            
            {showSettings && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compression Quality
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['high', 'balanced', 'small'] as const).map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSettings(prev => ({ ...prev, quality }))}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          settings.quality === quality
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{quality} Quality</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {getQualityDescription(quality)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintainImages"
                    checked={settings.maintainImages}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintainImages: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintainImages" className="ml-2 text-sm text-gray-700">
                    Maintain image quality (recommended for documents with important visuals)
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-4xl mx-auto mb-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-500 mb-6">
              Support for multiple files • Max 50MB per file • PDF format only
            </p>
            
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105">
              Select PDF Files
            </button>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Processing Files ({files.length})
                </h3>
                <div className="space-x-2">
                  {files.some(f => f.status === 'completed') && (
                    <button
                      onClick={downloadAll}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Download All
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {files.map((file) => (
                  <div key={file.id} className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          file.status === 'completed' ? 'bg-green-100' :
                          file.status === 'error' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {file.status === 'processing' && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
                          {file.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-500">
                            {file.status === 'processing' && 'Compressing...'}
                            {file.status === 'completed' && `Reduced by ${file.compressionRatio.toFixed(1)}%`}
                            {file.status === 'error' && (file.error || 'Compression failed')}
                          </p>
                        </div>
                      </div>
                      
                      {file.status === 'completed' && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                    
                    {file.status === 'completed' && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Original Size:</span>
                            <div className="font-medium">{formatFileSize(file.originalSize)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Compressed Size:</span>
                            <div className="font-medium text-green-600">{formatFileSize(file.compressedSize)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Saved:</span>
                            <div className="font-medium text-blue-600">
                              {formatFileSize(file.originalSize - file.compressedSize)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Compression:</span>
                            <div className="font-medium text-purple-600">{file.compressionRatio.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-center mb-8">Why Choose Our PDF Compressor?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-gray-600 text-sm">Advanced compression algorithms process your files in seconds</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Quality Preserved</h4>
              <p className="text-gray-600 text-sm">Maintain document readability while reducing file size significantly</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Flexible Options</h4>
              <p className="text-gray-600 text-sm">Choose from multiple compression levels to meet your specific needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFCompressor;