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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFiles: string[] = [];

  try {
    console.log('🚀 Starting Simple LibreOffice PDF form fill');
    
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

    // Step 1: Use pdf-lib to add text fields to PDF
    console.log('🔄 Step 1: Adding text fields with pdf-lib...');
    
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
        
        // Add text
        const text = String(field.text).slice(0, 100);
        
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
    
    console.log(`✅ Added ${addedFields} text fields`);

    // Step 2: Save the modified PDF temporarily
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = `/tmp/modified_${Date.now()}.pdf`;
    fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);
    tempFiles.push(modifiedPdfPath);

    // Step 3: Use LibreOffice to process and "fix" the PDF
    console.log('🔄 Step 2: Processing with LibreOffice for compatibility...');
    
    const serviceUrl = process.env.LIBREOFFICE_SERVICE_URL;
    if (!serviceUrl) {
      console.error('❌ LIBREOFFICE_SERVICE_URL not configured');
      return res.status(500).json({ 
        error: 'LibreOffice service not configured',
        details: 'LIBREOFFICE_SERVICE_URL environment variable is not set. Please configure the LibreOffice service URL.'
      });
    }

    console.log(`🔗 Using LibreOffice service at: ${serviceUrl}`);

    // Try converting PDF → ODT → PDF to "normalize" it
    let finalPdfBytes;
    
    try {
      // Step 1: Convert PDF to ODT
      console.log('🔄 Converting PDF → ODT...');
      const formDataToODT = new FormData();
      formDataToODT.append('file', fs.createReadStream(modifiedPdfPath), {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });
      formDataToODT.append('format', 'odt');
      
      const odtResponse = await axios.post(`${serviceUrl}/api/convert`, formDataToODT, {
        headers: {
          ...formDataToODT.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 120000,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (odtResponse.status >= 400) {
        throw new Error(`ODT conversion failed: ${odtResponse.status}`);
      }

      console.log(`✅ PDF → ODT successful: ${odtResponse.data.length} bytes`);

      // Step 2: Save ODT temporarily
      const odtTempPath = `/tmp/temp_${Date.now()}.odt`;
      fs.writeFileSync(odtTempPath, odtResponse.data);
      tempFiles.push(odtTempPath);

      // Step 3: Convert ODT back to PDF
      console.log('🔄 Converting ODT → PDF...');
      const formDataToPDF = new FormData();
      formDataToPDF.append('file', fs.createReadStream(odtTempPath), {
        filename: 'document.odt',
        contentType: 'application/vnd.oasis.opendocument.text',
      });
      formDataToPDF.append('format', 'pdf');
      
      const finalResponse = await axios.post(`${serviceUrl}/api/convert`, formDataToPDF, {
        headers: {
          ...formDataToPDF.getHeaders(),
        },
        responseType: 'arraybuffer',
        timeout: 120000,
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (finalResponse.status >= 400) {
        throw new Error(`PDF conversion failed: ${finalResponse.status}`);
      }

      finalPdfBytes = finalResponse.data;
      console.log(`✅ ODT → PDF successful: ${finalPdfBytes.length} bytes`);

    } catch (libreOfficeError) {
      console.warn('⚠️ LibreOffice PDF→ODT→PDF failed, trying direct PDF→PDF...', (libreOfficeError as any).message);
      
      // Fallback: Try direct PDF to PDF conversion
      try {
        const formDataDirectPDF = new FormData();
        formDataDirectPDF.append('file', fs.createReadStream(modifiedPdfPath), {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        });
        formDataDirectPDF.append('format', 'pdf');
        
        const directResponse = await axios.post(`${serviceUrl}/api/convert`, formDataDirectPDF, {
          headers: {
            ...formDataDirectPDF.getHeaders(),
          },
          responseType: 'arraybuffer',
          timeout: 60000, // Shorter timeout for fallback
          validateStatus: function (status) {
            return status < 500;
          }
        });

        if (directResponse.status >= 400) {
          throw new Error(`Direct PDF conversion failed: ${directResponse.status}`);
        }

        finalPdfBytes = directResponse.data;
        console.log(`✅ Direct PDF conversion successful: ${finalPdfBytes.length} bytes`);

      } catch (directError) {
        console.warn('⚠️ Direct PDF conversion also failed, using pdf-lib output...', (directError as any).message);
        // Use the pdf-lib modified version as final fallback
        finalPdfBytes = modifiedPdfBytes;
      }
    }

    // Step 4: Send the processed PDF
    const originalName = path.parse(file.originalFilename || 'document').name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = `${originalName}_filled_${timestamp}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', finalPdfBytes.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).send(finalPdfBytes);
    console.log(`📤 Sent LibreOffice-processed PDF: ${filename}`);
    
  } catch (error: any) {
    console.error('❌ Simple LibreOffice processing error:', error);
    
    if (!res.headersSent) {
      if (error.response) {
        res.status(error.response.status || 500).json({
          error: 'LibreOffice processing failed',
          details: error.response.data?.error || error.message
        });
      } else if (error.code === 'ECONNREFUSED') {
        res.status(503).json({
          error: 'LibreOffice service unavailable',
          details: 'Cannot connect to conversion service'
        });
      } else {
        res.status(500).json({ 
          error: 'PDF processing failed', 
          details: error.message
        });
      }
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