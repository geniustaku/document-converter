import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isConverting: boolean;
  acceptedFormats?: string[];
  acceptedTypes?: string;
  title?: string;
  subtitle?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isConverting, 
  acceptedFormats = ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.xlsx', '.pptx', '.txt'],
  acceptedTypes,
  title = "Drop your files here",
  subtitle = "or click to browse files"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!isConverting) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          file-drop-zone relative border-3 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragOver 
            ? 'border-primary-500 bg-primary-50 drag-over' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isConverting ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes || acceptedFormats.join(',')}
          onChange={handleFileSelect}
          disabled={isConverting}
        />

        <div className="flex flex-col items-center space-y-4">
          {/* Upload Icon */}
          <div className={`w-16 h-16 mx-auto rounded-full bg-primary-100 flex items-center justify-center transition-transform duration-300 ${isDragOver ? 'scale-110' : ''}`}>
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              {isDragOver ? 'Drop your file here' : title}
            </h3>
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 50MB
            </p>
          </div>

          {/* Browse Button */}
          {!isDragOver && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              disabled={isConverting}
            >
              Browse Files
            </button>
          )}
        </div>

        {/* Supported Formats */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {acceptedFormats.slice(0, 8).map((format) => (
            <span
              key={format}
              className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded"
            >
              {format.replace('.', '').toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;