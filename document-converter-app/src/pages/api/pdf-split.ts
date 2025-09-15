import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
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
    const { fields, files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const splitType = Array.isArray(fields.splitType) ? fields.splitType[0] : fields.splitType;
    const pageRanges = Array.isArray(fields.pageRanges) ? fields.pageRanges[0] : fields.pageRanges;

    if (!file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Read the uploaded PDF
    const pdfBuffer = await fs.readFile(file.filepath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();

    let pagesToSplit: number[][] = [];

    // Determine how to split based on splitType
    if (splitType === 'all') {
      // Split into individual pages
      pagesToSplit = Array.from({ length: totalPages }, (_, i) => [i]);
    } else if (splitType === 'range' && pageRanges) {
      // Parse page ranges like "1-3,5,7-9"
      const ranges = pageRanges.split(',').map((range: string) => range.trim());
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(num => parseInt(num.trim()) - 1);
          if (start >= 0 && end < totalPages && start <= end) {
            const pageGroup = [];
            for (let i = start; i <= end; i++) {
              pageGroup.push(i);
            }
            pagesToSplit.push(pageGroup);
          }
        } else {
          const pageNum = parseInt(range) - 1;
          if (pageNum >= 0 && pageNum < totalPages) {
            pagesToSplit.push([pageNum]);
          }
        }
      }
    } else if (splitType === 'half') {
      // Split into two halves
      const midPoint = Math.ceil(totalPages / 2);
      pagesToSplit = [
        Array.from({ length: midPoint }, (_, i) => i),
        Array.from({ length: totalPages - midPoint }, (_, i) => i + midPoint)
      ];
    }

    if (pagesToSplit.length === 0) {
      return res.status(400).json({ error: 'No valid pages to split' });
    }

    // Create split PDFs
    const splitPdfs: { buffer: Uint8Array; filename: string }[] = [];

    for (let i = 0; i < pagesToSplit.length; i++) {
      const newPdf = await PDFDocument.create();
      const pageGroup = pagesToSplit[i];
      
      // Copy pages to new PDF
      const copiedPages = await newPdf.copyPages(pdfDoc, pageGroup);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const originalName = path.parse(file.originalFilename || 'document').name;
      
      let filename: string;
      if (splitType === 'all') {
        filename = `${originalName}_page_${pageGroup[0] + 1}.pdf`;
      } else if (pageGroup.length === 1) {
        filename = `${originalName}_page_${pageGroup[0] + 1}.pdf`;
      } else {
        filename = `${originalName}_pages_${pageGroup[0] + 1}-${pageGroup[pageGroup.length - 1] + 1}.pdf`;
      }
      
      splitPdfs.push({
        buffer: pdfBytes,
        filename: filename
      });
    }

    // If only one PDF, return it directly
    if (splitPdfs.length === 1) {
      const pdf = splitPdfs[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdf.filename}"`);
      res.setHeader('Content-Length', pdf.buffer.length);
      return res.status(200).send(Buffer.from(pdf.buffer));
    }

    // If multiple PDFs, create a ZIP file
    const zip = new JSZip();
    splitPdfs.forEach(pdf => {
      zip.file(pdf.filename, pdf.buffer);
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const originalName = path.parse(file.originalFilename || 'document').name;
    const zipFilename = `${originalName}_split.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // Clean up temp file
    try {
      await fs.unlink(file.filepath);
    } catch (error) {
      console.warn('Could not delete temp file:', error);
    }

    return res.status(200).send(zipBuffer);

  } catch (error) {
    console.error('PDF split error:', error);
    return res.status(500).json({ 
      error: 'PDF split failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}