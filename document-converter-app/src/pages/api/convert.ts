import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ConversionRequest {
  format: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const format = Array.isArray(fields.format) ? fields.format[0] : fields.format || 'pdf';
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`📄 Converting: ${file.originalFilename} → ${format}`);
    console.log(`📊 File size: ${file.size} bytes`);

    // Create form data for LibreOffice service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'document',
      contentType: file.mimetype || 'application/octet-stream',
    });
    formData.append('format', format);

    // Forward to external LibreOffice service
    const serviceUrl = process.env.LIBREOFFICE_SERVICE_URL || 'http://document-converter-pro.eastus.azurecontainer.io:3000';

    console.log(`🔄 Forwarding to: ${serviceUrl}/api/convert`);

    const response = await axios.post(`${serviceUrl}/api/convert`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      responseType: 'arraybuffer',
      timeout: 120000, // 2 minutes
      maxContentLength: 100 * 1024 * 1024, // 100MB
    });

    console.log(`✅ Conversion successful: ${response.data.length} bytes`);

    // Set response headers
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const contentDisposition = response.headers['content-disposition'] || `attachment; filename="converted.${format}"`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDisposition);
    res.setHeader('Content-Length', response.data.length);
    
    // Send the converted file
    res.send(response.data);

    // Clean up temp file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }
    
  } catch (error: any) {
    console.error('❌ Conversion error:', error.message);
    
    // Clean up temp file on error
    if (req.body?.filepath) {
      try {
        fs.unlinkSync(req.body.filepath);
      } catch {}
    }

    if (error.response) {
      // LibreOffice service returned an error
      const serviceError = error.response.data;
      return res.status(error.response.status).json({
        error: 'Conversion failed',
        details: serviceError.error || serviceError.message || 'Unknown service error',
        serviceStatus: error.response.status
      });
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Cannot connect to conversion service'
      });
    } else if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        error: 'Conversion timeout',
        details: 'The conversion took too long to complete'
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}