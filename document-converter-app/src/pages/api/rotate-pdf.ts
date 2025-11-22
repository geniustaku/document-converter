import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { PDFDocument, degrees } from 'pdf-lib';

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
    const rotation = Array.isArray(fields.rotation) ? fields.rotation[0] : fields.rotation;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rotationDegrees = parseInt(rotation || '90');

    const pdfBytes = fs.readFileSync(file.filepath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      page.setRotation(degrees(rotationDegrees));
    });

    const rotatedPdfBytes = await pdfDoc.save();

    fs.unlinkSync(file.filepath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.status(200).send(Buffer.from(rotatedPdfBytes));
  } catch (error) {
    console.error('Error rotating PDF:', error);
    res.status(500).json({ error: 'Failed to rotate PDF' });
  }
}
