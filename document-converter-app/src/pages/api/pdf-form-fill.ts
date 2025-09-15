import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      maxFiles: 10,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Simple PDF text injection using raw PDF manipulation
const addTextToPDF = (pdfBuffer: Buffer, textFields: any[]): Buffer => {
  try {
    console.log('🔧 Using raw PDF text injection method');
    
    // Convert buffer to string for manipulation
    let pdfContent = pdfBuffer.toString('binary');
    
    // Find the last content stream or create one
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    let lastStreamMatch;
    let match;
    
    while ((match = streamRegex.exec(pdfContent)) !== null) {
      lastStreamMatch = match;
    }
    
    if (!lastStreamMatch) {
      console.warn('⚠️ No content stream found, PDF might be complex');
      return pdfBuffer; // Return original if we can't find streams
    }
    
    // Build text commands
    let textCommands = '\nBT\n'; // Begin text
    textCommands += '/F1 12 Tf\n'; // Set font
    
    for (const field of textFields) {
      if (!field.text || !field.text.trim()) continue;
      
      // Convert percentage to approximate PDF coordinates (assuming A4: 595x842)
      const x = Math.round((field.x / 100) * 595);
      const y = Math.round(842 - (field.y / 100) * 842); // Flip Y coordinate
      const fontSize = Math.max(8, Math.min(24, field.fontSize || 12));
      
      // Escape special characters in text
      const cleanText = String(field.text).replace(/[()\\]/g, '\\$&').substring(0, 50);
      
      textCommands += `/F1 ${fontSize} Tf\n`;
      textCommands += `${x} ${y} Td\n`; // Move to position
      textCommands += `(${cleanText}) Tj\n`; // Show text
      textCommands += `${-x} ${-y} Td\n`; // Reset position
    }
    
    textCommands += 'ET\n'; // End text
    
    // Find insertion point (before the last endstream)
    const lastEndStreamIndex = pdfContent.lastIndexOf('endstream');
    if (lastEndStreamIndex === -1) {
      console.warn('⚠️ Could not find insertion point');
      return pdfBuffer;
    }
    
    // Insert our text commands
    const beforeEndStream = pdfContent.substring(0, lastEndStreamIndex);
    const afterEndStream = pdfContent.substring(lastEndStreamIndex);
    
    const modifiedContent = beforeEndStream + textCommands + afterEndStream;
    
    // Convert back to buffer
    return Buffer.from(modifiedContent, 'binary');
    
  } catch (error) {
    console.error('❌ Raw PDF manipulation failed:', error);
    return pdfBuffer; // Return original on error
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFiles: string[] = [];

  try {
    console.log('🚀 Starting standalone PDF form fill (no dependencies)');
    
    const { fields, files } = await parseForm(req);
    
    // Get PDF files
    let pdfFiles: formidable.File[] = [];
    if (files.files) {
      pdfFiles = Array.isArray(files.files) ? files.files : [files.files];
    } else {
      Object.keys(files).forEach(key => {
        const file = files[key];
        if (file) {
          const fileArray = Array.isArray(file) ? file : [file];
          pdfFiles.push(...fileArray);
        }
      });
    }

    if (pdfFiles.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded' });
    }

    // Parse text fields
    const textFieldsString = Array.isArray(fields.textFields) ? fields.textFields[0] : fields.textFields || '[]';
    let textFields = [];
    try {
      textFields = JSON.parse(textFieldsString);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid text fields data' });
    }

    if (textFields.length === 0) {
      return res.status(400).json({ error: 'No text fields provided' });
    }

    console.log(`📝 Processing ${pdfFiles.length} PDFs with ${textFields.length} text fields`);

    // Process the first PDF file
    const file = pdfFiles[0];
    tempFiles.push(file.filepath);
    
    console.log(`📄 Processing: ${file.originalFilename}`);

    // Read the original PDF
    const originalPdfBuffer = fs.readFileSync(file.filepath);
    console.log(`📖 Original PDF size: ${originalPdfBuffer.length} bytes`);

    // Try raw PDF text injection
    const modifiedPdfBuffer = addTextToPDF(originalPdfBuffer, textFields);
    console.log(`📝 Modified PDF size: ${modifiedPdfBuffer.length} bytes`);

    // Validate the result
    if (modifiedPdfBuffer.length < originalPdfBuffer.length * 0.9) {
      throw new Error('Modified PDF seems corrupted (too small)');
    }

    // Check PDF header is still intact
    const header = modifiedPdfBuffer.slice(0, 8).toString();
    if (!header.startsWith('%PDF-')) {
      throw new Error('PDF header corrupted');
    }

    // Create filename
    const originalName = path.parse(file.originalFilename || 'document').name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = `${originalName}_filled_standalone_${timestamp}.pdf`;
    
    // Send response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', modifiedPdfBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).send(modifiedPdfBuffer);
    console.log(`📤 Sent standalone PDF: ${filename}`);
    
  } catch (error: any) {
    console.error('❌ Standalone PDF processing error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Standalone PDF processing failed', 
        details: error.message
      });
    }
  } finally {
    // Clean up temp files
    for (const tempFile of tempFiles) {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }
  }
}