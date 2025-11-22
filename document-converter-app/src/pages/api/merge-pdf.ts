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
    maxFileSize: 50 * 1024 * 1024, // 50MB per file
    maxFiles: 20,
    keepExtensions: true,
  });

  try {
    const [, files] = await form.parse(req);
    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);

    if (!uploadedFiles || uploadedFiles.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of uploadedFiles) {
      if (!file) continue;
      try {
        const pdfBytes = fs.readFileSync(file.filepath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });

        // Clean up temporary file
        fs.unlinkSync(file.filepath);
      } catch (error) {
        console.error('Error processing PDF:', file.originalFilename, error);
        // Continue with other files
      }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Send the merged PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.status(200).send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
}
