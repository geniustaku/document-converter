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

    // Use LibreOffice to convert PDF to Excel
    const command = `soffice --headless --convert-to xlsx --outdir "${outputDir}" "${inputPath}"`;

    try {
      await execPromise(command);

      // LibreOffice creates the file with .xlsx extension
      const xlsxPath = inputPath.replace(/\.pdf$/i, '.xlsx');

      if (fs.existsSync(xlsxPath)) {
        const xlsxBuffer = fs.readFileSync(xlsxPath);

        // Clean up
        fs.unlinkSync(inputPath);
        fs.unlinkSync(xlsxPath);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="converted.xlsx"');
        return res.status(200).send(xlsxBuffer);
      }
    } catch (error) {
      console.error('LibreOffice conversion error:', error);
    }

    // Fallback
    fs.unlinkSync(inputPath);
    return res.status(500).json({ error: 'PDF to Excel conversion requires LibreOffice to be installed on the server' });

  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    res.status(500).json({ error: 'Failed to convert PDF to Excel' });
  }
}
