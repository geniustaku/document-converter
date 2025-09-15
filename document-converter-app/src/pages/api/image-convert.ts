import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import sharp from 'sharp';
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
    const format = Array.isArray(fields.format) ? fields.format[0] : fields.format;

    if (!file || !format) {
      return res.status(400).json({ error: 'File and format are required' });
    }

    const inputPath = file.filepath;
    const outputExtension = format.toLowerCase();
    
    // Supported image formats
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp', 'gif'];
    if (!supportedFormats.includes(outputExtension)) {
      return res.status(400).json({ error: 'Unsupported output format' });
    }

    // Read input file
    const inputBuffer = await fs.readFile(inputPath);
    
    // Convert image using Sharp
    let sharpInstance = sharp(inputBuffer);
    
    // Apply format-specific options
    switch (outputExtension) {
      case 'jpg':
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: 95 });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: 95 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: 95 });
        break;
      case 'tiff':
        sharpInstance = sharpInstance.tiff({ quality: 95 });
        break;
      case 'bmp':
        sharpInstance = sharpInstance.png(); // Convert to PNG first, then to BMP
        break;
      case 'gif':
        sharpInstance = sharpInstance.gif();
        break;
    }

    const outputBuffer = await sharpInstance.toBuffer();

    // Set response headers
    const originalName = file.originalFilename || 'image';
    const nameWithoutExt = path.parse(originalName).name;
    const outputFilename = `${nameWithoutExt}.${outputExtension}`;

    res.setHeader('Content-Type', `image/${outputExtension === 'jpg' ? 'jpeg' : outputExtension}`);
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.setHeader('Content-Length', outputBuffer.length);

    // Clean up temp file
    try {
      await fs.unlink(inputPath);
    } catch (error) {
      console.warn('Could not delete temp file:', error);
    }

    return res.status(200).send(outputBuffer);

  } catch (error) {
    console.error('Image conversion error:', error);
    return res.status(500).json({ 
      error: 'Image conversion failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}