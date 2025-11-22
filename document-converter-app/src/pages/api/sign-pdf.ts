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
    maxFileSize: 50 * 1024 * 1024, // 50MB
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const signatureData = Array.isArray(fields.signature) ? fields.signature[0] : fields.signature;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!signatureData) {
      return res.status(400).json({ error: 'No signature provided' });
    }

    // Load the PDF
    const pdfBytes = fs.readFileSync(file.filepath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Convert base64 signature to image
    const signatureImageBytes = Buffer.from(
      signatureData.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    // Embed the signature image
    let signatureImage;
    if (signatureData.startsWith('data:image/png')) {
      signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    } else if (signatureData.startsWith('data:image/jpeg') || signatureData.startsWith('data:image/jpg')) {
      signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
    } else {
      // Default to PNG
      signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    }

    // Get the last page
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    // Calculate signature dimensions and position
    const signatureWidth = 150;
    const signatureHeight = (signatureImage.height / signatureImage.width) * signatureWidth;
    const x = width - signatureWidth - 50; // 50 pixels from right edge
    const y = 50; // 50 pixels from bottom

    // Add signature to the last page
    lastPage.drawImage(signatureImage, {
      x,
      y,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Save the signed PDF
    const signedPdfBytes = await pdfDoc.save();

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Send the signed PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="signed.pdf"');
    res.status(200).send(Buffer.from(signedPdfBytes));
  } catch (error) {
    console.error('Error signing PDF:', error);
    res.status(500).json({ error: 'Failed to sign PDF' });
  }
}
