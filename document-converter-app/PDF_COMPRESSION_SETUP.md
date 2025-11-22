# PDF Compression Setup

The PDF compression feature uses **PDF.co API** for high-quality compression on Vercel.

## How It Works

1. **With API Key**: Uses PDF.co API for professional compression
2. **Without API Key**: Falls back to basic pdf-lib compression (minimal results)

## Setup Instructions

### 1. Get a Free PDF.co API Key

1. Go to [https://app.pdf.co/](https://app.pdf.co/)
2. Sign up for a free account
3. Navigate to **API** section
4. Copy your API key

**Free Tier**: 300 credits/month (1 credit per compression)

### 2. Add API Key to Environment Variables

#### For Local Development

Add to `.env.local`:
```
PDFCO_API_KEY=your_api_key_here
```

#### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - Name: `PDFCO_API_KEY`
   - Value: Your PDF.co API key
   - Environment: Production, Preview, Development
4. Redeploy your application

### 3. Verify Setup

1. Upload a PDF to the compress tool
2. Check the browser console for any errors
3. Successful compression will reduce file size significantly

## Compression Levels

- **Low**: Light compression (high quality) - uses PDF.co "medium" profile
- **Medium**: Balanced compression - uses PDF.co "balanced" profile
- **High**: Maximum compression - uses PDF.co "strong" profile

## Troubleshooting

### API Key Not Working
- Verify the key is correctly copied (no extra spaces)
- Check your PDF.co account has remaining credits
- Restart the development server after adding the key

### Compression Not Effective
- Without API key, only basic pdf-lib compression runs (minimal results)
- With API key, compression is significantly better (30-80% reduction typical)

### Error Messages
- "Failed to compress PDF" - Check API key and credit balance
- Falls back to pdf-lib automatically if API fails

## Alternative APIs

If you prefer a different service, you can modify `/src/pages/api/compress-pdf.ts` to use:

- **CloudConvert API**: https://cloudconvert.com/api/v2
- **iLovePDF API**: https://developer.ilovepdf.com/
- **Adobe PDF Services**: https://developer.adobe.com/document-services/

## Cost Considerations

- **PDF.co Free**: 300 compressions/month
- **PDF.co Paid**: $9.99/month for 5,000 credits
- **Alternative**: Consider implementing client-side compression for unlimited free usage (lower quality results)
