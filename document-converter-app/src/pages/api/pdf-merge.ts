import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB per file
      maxFiles: 10, // Allow up to 10 files
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    
    // Handle both single and multiple file uploads
    let pdfFiles: formidable.File[] = [];
    if (files.files) {
      pdfFiles = Array.isArray(files.files) ? files.files : [files.files];
    } else {
      // Fallback: check for individual file fields
      Object.keys(files).forEach(key => {
        const file = files[key];
        if (file) {
          const fileArray = Array.isArray(file) ? file : [file];
          pdfFiles.push(...fileArray);
        }
      });
    }

    if (pdfFiles.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required for merging' });
    }

    if (pdfFiles.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 PDF files allowed' });
    }

    // Validate all files are PDFs
    for (const file of pdfFiles) {
      const ext = path.extname(file.originalFilename || '').toLowerCase();
      if (ext !== '.pdf') {
        return res.status(400).json({ error: 'All files must be PDF format' });
      }
    }

    // Create new merged PDF
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file in order
    for (const file of pdfFiles) {
      try {
        const pdfBuffer = await fs.readFile(file.filepath);
        const pdf = await PDFDocument.load(pdfBuffer);
        const pageCount = pdf.getPageCount();
        
        // Copy all pages from this PDF
        const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        
        // Add all copied pages to merged PDF
        copiedPages.forEach(page => mergedPdf.addPage(page));
        
        // Clean up temp file
        try {
          await fs.unlink(file.filepath);
        } catch (error) {
          console.warn('Could not delete temp file:', error);
        }
      } catch (error) {
        console.error(`Error processing PDF file ${file.originalFilename}:`, error);
        return res.status(400).json({ 
          error: `Failed to process PDF file: ${file.originalFilename}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Generate merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const mergedFilename = `merged_pdf_${timestamp}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${mergedFilename}"`);
    res.setHeader('Content-Length', mergedPdfBytes.length);

    return res.status(200).send(Buffer.from(mergedPdfBytes));

  } catch (error) {
    console.error('PDF merge error:', error);
    return res.status(500).json({ 
      error: 'PDF merge failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}