import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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

// Parse text fields from form data
const parseTextFields = (textFieldsString: string) => {
  try {
    const fields = JSON.parse(textFieldsString);
    return Array.isArray(fields) ? fields : [];
  } catch (error) {
    console.error('Error parsing text fields:', error);
    return [];
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFiles: string[] = [];

  try {
    console.log('🚀 Starting LibreOffice-based PDF form fill');
    
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
    const textFields = parseTextFields(textFieldsString);

    if (textFields.length === 0) {
      return res.status(400).json({ error: 'No text fields provided' });
    }

    console.log(`📝 Processing ${pdfFiles.length} PDFs with ${textFields.length} text fields using LibreOffice`);

    // Process the first PDF file
    const file = pdfFiles[0];
    tempFiles.push(file.filepath);
    
    console.log(`📄 Processing: ${file.originalFilename}`);

    // Step 1: Convert PDF to LibreOffice Writer document first
    console.log('🔄 Step 1: Converting PDF to ODT for editing...');
    
    const formDataToODT = new FormData();
    formDataToODT.append('file', fs.createReadStream(file.filepath), {
      filename: file.originalFilename || 'document.pdf',
      contentType: 'application/pdf',
    });
    formDataToODT.append('format', 'odt'); // Convert to OpenDocument Text
    
    const serviceUrl = process.env.LIBREOFFICE_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error('LIBREOFFICE_SERVICE_URL not configured. Please set this environment variable.');
    }

    const odtResponse = await axios.post(`${serviceUrl}/api/convert`, formDataToODT, {
      headers: {
        ...formDataToODT.getHeaders(),
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    });

    console.log(`✅ PDF converted to ODT: ${odtResponse.data.length} bytes`);

    // Step 2: Save the ODT temporarily
    const odtTempPath = `/tmp/temp_${Date.now()}.odt`;
    fs.writeFileSync(odtTempPath, odtResponse.data);
    tempFiles.push(odtTempPath);

    // Step 3: Use pdf-lib to add text fields to the original PDF (as overlay)
    console.log('🔄 Step 2: Adding text fields to original PDF...');
    
    const originalPdfBytes = fs.readFileSync(file.filepath);
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add text fields
    let addedFields = 0;
    for (const field of textFields) {
      try {
        if (!field.text || !field.text.trim()) continue;
        
        const pageIndex = Math.max(0, Math.min((field.page || 1) - 1, pages.length - 1));
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        
        // Convert percentage to coordinates
        const x = Math.max(10, (field.x / 100) * width);
        const y = Math.max(20, height - (field.y / 100) * height);
        const fontSize = Math.min(Math.max(field.fontSize || 12, 8), 24);
        
        // Add text with white background for better visibility
        const text = String(field.text).slice(0, 100);
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        // Add white background rectangle
        page.drawRectangle({
          x: x - 2,
          y: y - 2,
          width: textWidth + 4,
          height: fontSize + 4,
          color: rgb(1, 1, 1), // White background
          opacity: 0.9,
        });
        
        // Add text
        page.drawText(text, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        addedFields++;
        
      } catch (fieldError) {
        console.warn(`⚠️ Skipped field ${field.id}:`, (fieldError as any).message);
      }
    }
    
    console.log(`✅ Added ${addedFields} text fields to PDF`);

    // Step 4: Save the modified PDF temporarily
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = `/tmp/modified_${Date.now()}.pdf`;
    fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);
    tempFiles.push(modifiedPdfPath);

    // Step 5: Use LibreOffice to "flatten" the PDF and ensure compatibility
    console.log('🔄 Step 3: Using LibreOffice to finalize PDF...');
    
    const formDataToPDF = new FormData();
    formDataToPDF.append('file', fs.createReadStream(modifiedPdfPath), {
      filename: 'modified_document.pdf',
      contentType: 'application/pdf',
    });
    formDataToPDF.append('format', 'pdf'); // Convert back to PDF to "flatten" it
    
    const finalResponse = await axios.post(`${serviceUrl}/api/convert`, formDataToPDF, {
      headers: {
        ...formDataToPDF.getHeaders(),
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    });

    console.log(`✅ Final PDF processed by LibreOffice: ${finalResponse.data.length} bytes`);

    // Step 6: Send the final PDF
    const originalName = path.parse(file.originalFilename || 'document').name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = `${originalName}_filled_libreoffice_${timestamp}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', finalResponse.data.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).send(finalResponse.data);
    console.log(`📤 Sent LibreOffice-processed PDF: ${filename}`);
    
  } catch (error: any) {
    console.error('❌ LibreOffice PDF processing error:', error);
    
    if (!res.headersSent) {
      if (error.response) {
        // LibreOffice service error
        res.status(error.response.status || 500).json({
          error: 'LibreOffice processing failed',
          details: error.response.data?.error || error.message,
          serviceStatus: error.response.status
        });
      } else if (error.code === 'ECONNREFUSED') {
        res.status(503).json({
          error: 'LibreOffice service unavailable',
          details: 'Cannot connect to LibreOffice conversion service. Please check if the service is running.'
        });
      } else if (error.code === 'ETIMEDOUT') {
        res.status(408).json({
          error: 'Processing timeout',
          details: 'PDF processing took too long to complete'
        });
      } else {
        res.status(500).json({ 
          error: 'PDF form filling failed', 
          details: error.message
        });
      }
    }
  } finally {
    // Clean up all temp files
    for (const tempFile of tempFiles) {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🗑️ Cleaned up: ${tempFile}`);
        }
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }
  }
}