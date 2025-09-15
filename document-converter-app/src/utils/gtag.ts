// Google Analytics and Conversion Tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-C7WBD545ZS';
export const GA_ADS_ID = 'AW-17042498697';

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track conversion events
export const trackConversion = (conversionType: string, fileSize?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track Analytics event
    window.gtag('event', 'conversion', {
      event_category: 'Document Conversion',
      event_label: conversionType,
      value: 1,
    });

    // Track Google Ads conversion
    window.gtag('event', 'conversion', {
      send_to: GA_ADS_ID,
      event_category: 'Document Conversion',
      event_label: conversionType,
      value: 1,
    });

    // Track specific conversion types
    window.gtag('event', 'file_converted', {
      event_category: 'Conversion',
      event_label: conversionType,
      value: fileSize || 0,
    });

    // Track custom events for different conversion types
    switch (conversionType.toLowerCase()) {
      case 'pdf_to_word':
        window.gtag('event', 'pdf_to_word_conversion', {
          event_category: 'PDF Conversion',
          event_label: 'PDF to Word',
        });
        break;
      case 'word_to_pdf':
        window.gtag('event', 'word_to_pdf_conversion', {
          event_category: 'Word Conversion',
          event_label: 'Word to PDF',
        });
        break;
      case 'pdf_split':
        window.gtag('event', 'pdf_split_conversion', {
          event_category: 'PDF Tools',
          event_label: 'PDF Split',
        });
        break;
      case 'pdf_merge':
        window.gtag('event', 'pdf_merge_conversion', {
          event_category: 'PDF Tools',
          event_label: 'PDF Merge',
        });
        break;
      case 'invoice_generation':
        window.gtag('event', 'invoice_generation', {
          event_category: 'Business Tools',
          event_label: 'Invoice Generator',
          value: fileSize || 0,
        });
        break;
      case 'digital_signature':
        window.gtag('event', 'digital_signature', {
          event_category: 'Business Tools',
          event_label: 'Digital Signature',
          value: fileSize || 0,
        });
        break;
      case 'image_conversion':
        window.gtag('event', 'image_conversion', {
          event_category: 'Image Conversion',
          event_label: 'Image Format Change',
        });
        break;
    }
  }
};

// Track user engagement
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track file uploads
export const trackFileUpload = (fileType: string, fileSize: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'file_upload', {
      event_category: 'User Interaction',
      event_label: fileType,
      value: fileSize,
    });
  }
};