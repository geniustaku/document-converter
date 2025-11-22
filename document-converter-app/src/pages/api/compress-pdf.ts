import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const compressionLevel = Array.isArray(fields.compressionLevel)
      ? fields.compressionLevel[0]
      : fields.compressionLevel || 'medium';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = file.filepath;
    let compressedBuffer: Buffer;

    // PDF.co API key from environment variables
    const API_KEY = process.env.PDFCO_API_KEY;

    if (API_KEY) {
      // Use PDF.co API for compression
      try {
        const pdfBytes = fs.readFileSync(inputPath);
        const base64PDF = pdfBytes.toString('base64');

        // PDF.co compression profiles
        const compressionProfiles: { [key: string]: string } = {
          low: 'medium', // Light compression (high quality)
          medium: 'balanced', // Balanced compression
          high: 'strong', // Maximum compression
        };

        const profile = compressionProfiles[compressionLevel] || 'balanced';

        // Call PDF.co Compress PDF API
        const response = await fetch('https://api.pdf.co/v1/pdf/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify({
            file: base64PDF,
            compress: true,
            profile: profile,
            async: false,
          }),
        });

        const result = await response.json();

        if (result.error === false && result.url) {
          // Download compressed PDF
          const downloadResponse = await fetch(result.url);
          const arrayBuffer = await downloadResponse.arrayBuffer();
          compressedBuffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error(result.message || 'PDF.co API error');
        }
      } catch (apiError) {
        console.error('PDF.co API error, using pdf-lib fallback:', apiError);
        // Fall back to pdf-lib
        compressedBuffer = await compressWithPdfLib(inputPath);
      }
    } else {
      // No API key - use pdf-lib compression
      console.log('No PDF.co API key found, using pdf-lib compression');
      compressedBuffer = await compressWithPdfLib(inputPath);
    }

    // Clean up temporary files
    fs.unlinkSync(inputPath);

    // Send the compressed PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.status(200).send(compressedBuffer);
  } catch (error) {
    console.error('Error compressing PDF:', error);
    res.status(500).json({ error: 'Failed to compress PDF' });
  }
}

// Helper function for pdf-lib compression fallback
async function compressWithPdfLib(inputPath: string): Promise<Buffer> {
  try {
    const pdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Save with compression options
    const compressed = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    return Buffer.from(compressed);
  } catch (fallbackError) {
    console.error('pdf-lib compression error:', fallbackError);
    // Last resort: return original file
    return fs.readFileSync(inputPath);
  }
}
