import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
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
    maxFileSize: 50 * 1024 * 1024,
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;
    const pages = Array.isArray(fields.pages) ? fields.pages[0] : fields.pages;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBytes = fs.readFileSync(file.filepath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    const outputFiles: { url: string; name: string }[] = [];

    if (mode === 'range') {
      // Split into individual pages
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        const base64 = Buffer.from(pdfBytes).toString('base64');
        outputFiles.push({
          url: `data:application/pdf;base64,${base64}`,
          name: `page_${i + 1}.pdf`
        });
      }
    } else {
      // Extract specific pages
      const pageNums = parsePageNumbers(pages || '', totalPages);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pageNums);
      copiedPages.forEach((page) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      const base64 = Buffer.from(pdfBytes).toString('base64');
      outputFiles.push({
        url: `data:application/pdf;base64,${base64}`,
        name: 'extracted_pages.pdf'
      });
    }

    fs.unlinkSync(file.filepath);
    res.status(200).json({ files: outputFiles });
  } catch (error) {
    console.error('Error splitting PDF:', error);
    res.status(500).json({ error: 'Failed to split PDF' });
  }
}

function parsePageNumbers(input: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = input.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      for (let i = start; i <= end && i <= totalPages; i++) {
        if (i > 0) pages.push(i - 1);
      }
    } else {
      const num = parseInt(trimmed);
      if (num > 0 && num <= totalPages) {
        pages.push(num - 1);
      }
    }
  }

  return Array.from(new Set(pages));
}
