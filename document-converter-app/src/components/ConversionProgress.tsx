import React from 'react';

interface ConversionProgressProps {
  isConverting: boolean;
  fileName?: string;
  progress?: number;
  status?: string;
}

const ConversionProgress: React.FC<ConversionProgressProps> = ({
  isConverting,
  fileName,
  progress = 0,
  status = 'Processing...'
}) => {
  if (!isConverting) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-4">
        {/* Loading Spinner */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 relative">
            <div className="w-10 h-10 border-4 border-primary-200 rounded-full animate-spin"></div>
            <div className="w-10 h-10 border-4 border-transparent border-t-primary-600 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName ? `Converting ${fileName}` : 'Converting document...'}
          </p>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 ease-out progress-bar relative"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Converting...</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Conversion Steps */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          File uploaded successfully
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full mr-2 ${progress > 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Processing document
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full mr-2 ${progress > 70 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Converting format
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          Preparing download
        </div>
      </div>

      {/* Cancel Button */}
      <div className="mt-4 flex justify-center">
        <p className="text-xs text-gray-500">
          Please wait while we convert your document...
        </p>
      </div>
    </div>
  );
};

export default ConversionProgress;