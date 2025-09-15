import React from 'react';

interface Format {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface FormatSelectorProps {
  selectedFormat: string;
  onFormatChange: (format: string) => void;
  sourceFileType?: string;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  sourceFileType = ''
}) => {
  const allFormats: Format[] = [
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format',
      icon: '📄'
    },
    {
      value: 'docx',
      label: 'Word (DOCX)',
      description: 'Microsoft Word Document',
      icon: '📝'
    },
    {
      value: 'doc',
      label: 'Word (DOC)',
      description: 'Legacy Microsoft Word',
      icon: '📝'
    },
    {
      value: 'odt',
      label: 'OpenDocument',
      description: 'OpenDocument Text',
      icon: '📄'
    },
    {
      value: 'rtf',
      label: 'RTF',
      description: 'Rich Text Format',
      icon: '📝'
    }
  ];

  const imageFormats: Format[] = [
    {
      value: 'jpg',
      label: 'JPEG',
      description: 'High quality photo format',
      icon: '🖼️'
    },
    {
      value: 'png',
      label: 'PNG',
      description: 'Lossless image format',
      icon: '🖼️'
    },
    {
      value: 'webp',
      label: 'WebP',
      description: 'Modern web image format',
      icon: '🌐'
    },
    {
      value: 'tiff',
      label: 'TIFF',
      description: 'Professional image format',
      icon: '📸'
    },
    {
      value: 'bmp',
      label: 'BMP',
      description: 'Bitmap image format',
      icon: '🖼️'
    }
  ];

  // Filter formats based on source file type
  const getAvailableFormats = () => {
    const sourceExt = sourceFileType.toLowerCase();
    
    // Check if it's an image file
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    const isImageFile = imageExtensions.some(ext => sourceExt.includes(ext));
    
    if (isImageFile) {
      // Image files can be converted to other image formats
      return imageFormats;
    } else if (sourceExt.includes('pdf')) {
      // PDF can be converted to Word formats
      return allFormats.filter(f => ['docx', 'doc', 'odt'].includes(f.value));
    } else if (sourceExt.includes('doc') || sourceExt.includes('odt') || sourceExt.includes('rtf')) {
      // Word formats can be converted to PDF and other word formats
      return allFormats;
    } else {
      // Default: show all formats (document formats)
      return allFormats;
    }
  };

  const availableFormats = getAvailableFormats();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Output Format
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableFormats.map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => onFormatChange(format.value)}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${selectedFormat === format.value
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{format.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {format.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format.description}
                  </p>
                </div>
              </div>
              
              {selectedFormat === format.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Format-specific info */}
        {selectedFormat && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">
                {getFormatInfo(selectedFormat, sourceFileType)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getFormatInfo(format: string, sourceType: string): string {
  const sourceExt = sourceType.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
  const isImageFile = imageExtensions.some(ext => sourceExt.includes(ext));
  
  if (isImageFile) {
    switch (format) {
      case 'jpg':
        return 'JPEG format - best for photos, smaller file sizes.';
      case 'png':
        return 'PNG format - lossless quality, supports transparency.';
      case 'webp':
        return 'WebP format - modern format with excellent compression.';
      case 'tiff':
        return 'TIFF format - professional quality for printing.';
      case 'bmp':
        return 'BMP format - uncompressed, compatible with older systems.';
      default:
        return 'High-quality image conversion with preserved quality.';
    }
  } else if (sourceExt.includes('pdf') && ['docx', 'doc', 'odt'].includes(format)) {
    return 'Converting PDF to Word format with text and image extraction.';
  } else if (['doc', 'docx', 'odt', 'rtf'].includes(sourceExt) && format === 'pdf') {
    return 'Converting to PDF format - perfect for sharing and printing.';
  } else if (format === 'pdf') {
    return 'PDF format ensures your document looks the same on any device.';
  } else if (['docx', 'doc'].includes(format)) {
    return 'Microsoft Word format - widely compatible and editable.';
  } else if (format === 'odt') {
    return 'Open Document format - free and open standard.';
  } else if (format === 'rtf') {
    return 'Rich Text Format - compatible with most word processors.';
  }
  
  return 'High-quality conversion with preserved formatting.';
}

export default FormatSelector;