import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

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
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = file.filepath;
    const outputDir = path.dirname(inputPath);
    const outputPath = path.join(outputDir, `converted_${Date.now()}.pdf`);

    // Use LibreOffice to convert Excel to PDF
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    try {
      await execPromise(command);

      // LibreOffice creates the file with the same name but .pdf extension
      const libreOfficePath = inputPath.replace(/\.(xlsx|xls|csv)$/i, '.pdf');

      if (fs.existsSync(libreOfficePath)) {
        const pdfBuffer = fs.readFileSync(libreOfficePath);

        // Clean up
        fs.unlinkSync(inputPath);
        fs.unlinkSync(libreOfficePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
        return res.status(200).send(pdfBuffer);
      }
    } catch (error) {
      console.error('LibreOffice conversion error:', error);
    }

    // Fallback: return error if LibreOffice is not available
    fs.unlinkSync(inputPath);
    return res.status(500).json({ error: 'Excel to PDF conversion requires LibreOffice to be installed on the server' });

  } catch (error) {
    console.error('Error converting Excel to PDF:', error);
    res.status(500).json({ error: 'Failed to convert Excel to PDF' });
  }
}
