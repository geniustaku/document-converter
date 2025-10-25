# Azure Document Intelligence OCR Setup

## Overview
The landing page now includes AI-powered OCR (Optical Character Recognition) using Azure Document Intelligence. This allows users to extract text from PDFs and images with industry-leading accuracy.

## Features Added

### 1. **Redesigned Landing Page**
- **Two-tab interface**: Document Converter and OCR Text Extraction
- **Featured articles section**: Automatically displays the 3 most recent blog articles
- **Larger, content-rich page**: Improved SEO and user engagement
- **Modern, clean design**: Professional aesthetics with gradient accents

### 2. **AI-Powered OCR**
- Extract text from PDFs, JPG, PNG, TIFF, BMP, and HEIF files
- Powered by Azure Document Intelligence
- Displays:
  - Number of pages processed
  - Word count
  - Confidence score
  - Extracted text with copy-to-clipboard functionality

### 3. **Featured Articles**
- Dynamically fetches and displays 3 latest articles from Firebase
- Shows article category, title, excerpt, and reading time
- Links directly to full blog posts
- "View All Articles" button to navigate to the blog

## Setup Instructions

### Step 1: Create Azure Document Intelligence Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **"Document Intelligence"** (formerly Form Recognizer)
4. Click **Create**
5. Fill in the details:
   - **Subscription**: Choose your subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose closest region (e.g., East US)
   - **Name**: `document-converter-ocr` (or your choice)
   - **Pricing tier**: Free (F0) for development, or Standard (S0) for production
6. Click **Review + Create**, then **Create**
7. Wait for deployment to complete

### Step 2: Get Your Credentials

1. Go to your Document Intelligence resource
2. In the left menu, click **Keys and Endpoint**
3. Copy:
   - **KEY 1** (or KEY 2)
   - **Endpoint** URL

### Step 3: Add to Environment Variables

Edit your `.env.local` file and add:

```bash
# Azure Document Intelligence Configuration
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your_api_key_here
```

Replace:
- `https://your-resource-name.cognitiveservices.azure.com/` with your actual endpoint
- `your_api_key_here` with your KEY 1 value

### Step 4: Restart Development Server

```bash
npm run dev
```

## Usage

### For Users
1. Go to http://localhost:3000
2. Click the **"OCR Text Extraction"** tab
3. Upload a PDF or image file
4. Click **"Extract Text with AI"**
5. View results with confidence score and word count
6. Click **"Copy to Clipboard"** to use the extracted text

### API Endpoint
The OCR functionality is available at `/api/ocr`:

**Request:**
```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text content...",
    "pages": 3,
    "language": "en-US",
    "confidence": 0.98,
    "fileName": "document.pdf",
    "fileSize": 125440,
    "wordCount": 523
  }
}
```

## File Structure

### New Files Created
- `src/lib/azure-document-intelligence.ts` - Azure Document Intelligence service wrapper
- `src/pages/api/ocr.ts` - OCR API endpoint
- `src/pages/index.tsx` - Completely redesigned landing page
- `AZURE_OCR_SETUP.md` - This documentation file

### Modified Files
- `.env.local` - Added Azure credentials placeholders
- `package.json` - Added `@azure/ai-form-recognizer` dependency

## Pricing

### Free Tier (F0)
- **500 pages per month** free
- Perfect for development and low-traffic sites
- No credit card required

### Standard Tier (S0)
- **Pay as you go**: $1.50 per 1,000 pages
- For production use with higher traffic
- First 500 pages still free each month

### Cost Examples
- **1,000 OCR requests/month**: Free (under 500 page limit)
- **10,000 OCR requests/month**: ~$15/month
- **50,000 OCR requests/month**: ~$75/month

## Features of Azure Document Intelligence

### Supported Operations
1. **Text Extraction** (currently implemented)
   - Extract all text from PDFs and images
   - Multi-language support
   - High accuracy (95%+ typical confidence)

2. **Invoice Analysis** (available, not yet implemented)
   - Extract structured invoice data
   - Detect line items, totals, dates
   - See `azureDocumentIntelligence.analyzeInvoice()` method

3. **Structured Data** (available, not yet implemented)
   - Extract tables and forms
   - Key-value pair detection
   - Custom model training support

## Troubleshooting

### Error: "Azure Document Intelligence credentials not configured"
- Make sure you've added the credentials to `.env.local`
- Restart your development server after adding credentials

### Error: "Unauthorized" or "Access Denied"
- Verify your API key is correct
- Check that your endpoint URL is complete (including `https://`)
- Ensure your Azure resource is active and not expired

### Error: "Rate limit exceeded"
- You've exceeded the free tier limit (500 pages/month)
- Upgrade to Standard tier or wait for next month

### Low Confidence Scores
- Image quality may be poor - try higher resolution
- Document may be scanned at an angle - try straightening
- Handwriting is harder to recognize than typed text

## Next Steps

### Potential Enhancements
1. **Invoice Generator Integration**: Use OCR to import invoice data
2. **PDF to Word with OCR**: Enhance conversion accuracy for scanned PDFs
3. **Multi-language Support**: Display detected language and translate
4. **Batch Processing**: Allow multiple file uploads for OCR
5. **Document Comparison**: Compare extracted text from different versions

## Support

For Azure Document Intelligence documentation:
- [Official Docs](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [REST API Reference](https://learn.microsoft.com/en-us/rest/api/aiservices/document-models)
- [Pricing Details](https://azure.microsoft.com/en-us/pricing/details/form-recognizer/)

For issues with this implementation:
- Check the browser console for error messages
- Review server logs in your terminal
- Verify all environment variables are set correctly
