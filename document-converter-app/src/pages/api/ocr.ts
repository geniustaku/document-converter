import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { azureDocumentIntelligence } from '@/lib/azure-document-intelligence';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/bmp',
  'image/heif'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate MIME type
    const mimeType = file.mimetype || '';
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: 'Unsupported file type',
        details: 'Please upload PDF, JPG, PNG, TIFF, BMP, or HEIF files'
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Extract text using Azure Document Intelligence
    const result = await azureDocumentIntelligence.extractText(fileBuffer, mimeType);

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      data: {
        text: result.text,
        pages: result.pages,
        language: result.language,
        confidence: result.confidence,
        fileName: file.originalFilename || 'unknown',
        fileSize: file.size,
        wordCount: result.text.split(/\s+/).filter(word => word.length > 0).length
      }
    });

  } catch (error: any) {
    console.error('OCR error:', error);

    return res.status(500).json({
      success: false,
      error: 'OCR processing failed',
      details: error.message || 'An unexpected error occurred'
    });
  }
}
