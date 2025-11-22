import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import sizeOf from 'image-size';
import path from 'path';

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
    maxFileSize: 20 * 1024 * 1024, // 20MB per file
    maxFiles: 20,
    keepExtensions: true,
  });

  try {
    const [, files] = await form.parse(req);
    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ autoFirstPage: false });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Process each image
    for (const file of uploadedFiles) {
      if (!file) continue;
      try {
        const imagePath = file.filepath;
        const imageBuffer = fs.readFileSync(imagePath);
        const dimensions = sizeOf(imageBuffer);

        if (!dimensions.width || !dimensions.height) {
          console.error('Could not determine image dimensions for:', file.originalFilename);
          continue;
        }

        // Add a page with the image dimensions
        doc.addPage({
          size: [dimensions.width, dimensions.height],
          margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        // Add the image to fill the entire page
        doc.image(imagePath, 0, 0, {
          width: dimensions.width,
          height: dimensions.height,
        });

        // Clean up the temporary file
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Error processing image:', file.originalFilename, error);
      }
    }

    // Finalize the PDF
    doc.end();

    const pdfBuffer = await pdfPromise;

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    res.status(500).json({ error: 'Failed to convert images to PDF' });
  }
}
