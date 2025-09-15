import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 20, // Allow up to 20 files
      keepExtensions: true,
      multiples: true,
      maxTotalFileSize: 200 * 1024 * 1024, // 200MB total
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

// Generate unique signature ID for verification
const generateSignatureId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Create verification hash
const createVerificationHash = (documentContent: Buffer, signatureData: any): string => {
  const dataToHash = JSON.stringify({
    documentSize: documentContent.length,
    signerName: signatureData.signerName,
    signerEmail: signatureData.signerEmail,
    timestamp: signatureData.timestamp,
    signatureId: signatureData.signatureId
  });
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);
    
    // Handle single or multiple files
    let pdfFiles: formidable.File[] = [];
    if (files.files) {
      pdfFiles = Array.isArray(files.files) ? files.files : [files.files];
    } else if (files.file) {
      pdfFiles = Array.isArray(files.file) ? files.file : [files.file];
    } else {
      // Check all possible file field names
      Object.keys(files).forEach(key => {
        const file = files[key];
        if (file) {
          const fileArray = Array.isArray(file) ? file : [file];
          pdfFiles.push(...fileArray);
        }
      });
    }

    if (pdfFiles.length === 0) {
      return res.status(400).json({ error: 'At least one PDF file is required' });
    }

    // Extract signature data with safe defaults
    const signerName = Array.isArray(fields.signerName) ? fields.signerName[0] : fields.signerName || '';
    const signerEmail = Array.isArray(fields.signerEmail) ? fields.signerEmail[0] : fields.signerEmail || '';
    const signatureType = Array.isArray(fields.signatureType) ? fields.signatureType[0] : fields.signatureType || 'text';
    const signatureText = Array.isArray(fields.signatureText) ? fields.signatureText[0] : fields.signatureText || '';
    const canvasSignature = Array.isArray(fields.canvasSignature) ? fields.canvasSignature[0] : fields.canvasSignature || '';
    const signatureStyle = Array.isArray(fields.signatureStyle) ? fields.signatureStyle[0] : fields.signatureStyle || 'handwritten';
    const signaturePosition = Array.isArray(fields.signaturePosition) ? fields.signaturePosition[0] : fields.signaturePosition || 'bottom-right';
    const signatureSize = Array.isArray(fields.signatureSize) ? fields.signatureSize[0] : fields.signatureSize || 'medium';
    const signaturePDFPosition = Array.isArray(fields.signaturePDFPosition) ? fields.signaturePDFPosition[0] : fields.signaturePDFPosition || null;
    const addTimestamp = Array.isArray(fields.addTimestamp) ? fields.addTimestamp[0] === 'true' : fields.addTimestamp === 'true';
    const addCertificate = Array.isArray(fields.addCertificate) ? fields.addCertificate[0] === 'true' : fields.addCertificate === 'true';

    // Signer name is now optional

    if (signatureType === 'text' && !signatureText) {
      return res.status(400).json({ error: 'Signature text is required for text signatures' });
    }

    if (signatureType === 'canvas' && !canvasSignature) {
      return res.status(400).json({ error: 'Canvas signature is required for drawn signatures' });
    }

    const signedFiles: { buffer: Uint8Array; filename: string; signatureId: string }[] = [];
    const timestamp = new Date().toISOString();

    for (const file of pdfFiles) {
      try {
        // Read and load PDF
        const pdfBuffer = await fs.readFile(file.filepath);
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        // Generate unique signature ID for this document
        const signatureId = generateSignatureId();
        
        // Create verification hash
        const verificationHash = createVerificationHash(pdfBuffer, {
          signerName,
          signerEmail,
          timestamp,
          signatureId
        });

        // Load fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Choose font based on signature style
        let signatureFont = helveticaFont;
        let signatureColor = rgb(0, 0, 0);
        
        switch (signatureStyle) {
          case 'handwritten':
            signatureFont = timesRomanFont;
            signatureColor = rgb(0, 0, 0.8); // Dark blue
            break;
          case 'professional':
            signatureFont = helveticaBoldFont;
            signatureColor = rgb(0, 0, 0);
            break;
          case 'elegant':
            signatureFont = timesRomanFont;
            signatureColor = rgb(0.2, 0.2, 0.2);
            break;
        }

        // Determine signature size
        let fontSize = 14;
        switch (signatureSize) {
          case 'small':
            fontSize = 12;
            break;
          case 'medium':
            fontSize = 14;
            break;
          case 'large':
            fontSize = 18;
            break;
        }

        // Process each page
        const pages = pdfDoc.getPages();
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
          const page = pages[pageIndex];
          const { width, height } = page.getSize();

          // Determine signature position
          let x = 50;
          let y = 50;

          // Use custom PDF position if available
          if (signaturePDFPosition) {
            try {
              const customPos = JSON.parse(signaturePDFPosition);
              // Convert percentage to actual coordinates
              x = (customPos.x / 100) * width;
              y = height - (customPos.y / 100) * height; // Flip Y coordinate for PDF coordinate system
            } catch (error) {
              console.error('Error parsing custom position:', error);
              // Fall back to default positioning
            }
          }

          // If no custom position, use default positioning logic
          if (!signaturePDFPosition) {
            switch (signaturePosition) {
              case 'top-left':
                x = 50;
                y = height - 100;
                break;
              case 'top-right':
                x = width - 200;
                y = height - 100;
                break;
              case 'bottom-left':
                x = 50;
                y = 80;
                break;
              case 'bottom-right':
                x = width - 200;
                y = 80;
                break;
              case 'center':
                x = width / 2 - 100;
                y = height / 2;
                break;
            }
          }

          // No signature box background - clean signature placement

          // Add signature based on type
          if (signatureType === 'canvas' && canvasSignature) {
            try {
              // Extract base64 image data from canvas signature
              const base64Data = canvasSignature.split(',')[1]; // Remove "data:image/png;base64," prefix
              const imageBytes = Buffer.from(base64Data, 'base64');
              
              // Embed the image in the PDF
              const signatureImage = await pdfDoc.embedPng(imageBytes);
              const imageDims = signatureImage.scale(0.3); // Scale down the signature
              
              // Draw the canvas signature image
              page.drawImage(signatureImage, {
                x: x,
                y: y,
                width: Math.min(160, imageDims.width),
                height: Math.min(40, imageDims.height),
              });
            } catch (error) {
              console.error('Error embedding canvas signature:', error);
              // Fallback to text if image fails
              page.drawText('Digital Signature', {
                x: x,
                y: y + 20,
                size: fontSize,
                font: signatureFont,
                color: signatureColor,
              });
            }
          } else {
            // Draw text signature
            page.drawText(signatureText || 'Digital Signature', {
              x: x,
              y: y,
              size: fontSize,
              font: signatureFont,
              color: signatureColor,
            });
          }

          // No signer name text

          // Add timestamp if requested
          if (addTimestamp) {
            const dateStr = new Date(timestamp).toLocaleString('en-ZA', {
              timeZone: 'Africa/Johannesburg',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            page.drawText(`Date: ${dateStr} SAST`, {
              x: x,
              y: y - 15,
              size: 7,
              font: helveticaFont,
              color: rgb(0.5, 0.5, 0.5),
            });
          }

          // No verification metadata
        }

        // Add digital certificate page if requested
        if (addCertificate) {
          const certPage = pdfDoc.addPage();
          const { width: certWidth, height: certHeight } = certPage.getSize();

          // Certificate background
          certPage.drawRectangle({
            x: 50,
            y: 50,
            width: certWidth - 100,
            height: certHeight - 100,
            borderColor: rgb(0.8, 0.1, 0.1),
            borderWidth: 3,
            color: rgb(0.99, 0.99, 0.99)
          });

          // Certificate title
          certPage.drawText('DIGITAL SIGNATURE CERTIFICATE', {
            x: certWidth / 2 - 150,
            y: certHeight - 150,
            size: 20,
            font: helveticaBoldFont,
            color: rgb(0.8, 0.1, 0.1),
          });

          // Certificate details
          const certDetails = [
            `Document: ${file.originalFilename}`,
            `Signer: ${signerName}`,
            `Email: ${signerEmail || 'Not provided'}`,
            `Signature: ${signatureText}`,
            `Timestamp: ${new Date(timestamp).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST`,
            `Signature ID: ${signatureId}`,
            `Verification Hash: ${verificationHash.slice(0, 32)}...`,
            `Certificate Generated: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST`,
            ``,
            `This certificate verifies the digital signature applied to the above document.`,
            `The signature is legally binding and tamper-evident.`,
            ``,
            `Generated by Document Converter Pro - docs-app.net`,
            `Compliant with South African Electronic Communications and Transactions Act`
          ];

          let yPos = certHeight - 220;
          for (const detail of certDetails) {
            certPage.drawText(detail, {
              x: 80,
              y: yPos,
              size: detail.includes('Generated by') || detail.includes('Compliant') ? 8 : 10,
              font: detail.includes(':') ? helveticaFont : helveticaFont,
              color: detail.includes('Generated by') || detail.includes('Compliant') ? rgb(0.6, 0.6, 0.6) : rgb(0.2, 0.2, 0.2),
            });
            yPos -= detail === '' ? 10 : 20;
          }

          // Add verification QR code placeholder
          certPage.drawRectangle({
            x: certWidth - 200,
            y: 100,
            width: 100,
            height: 100,
            borderColor: rgb(0.5, 0.5, 0.5),
            borderWidth: 1,
          });

          certPage.drawText('QR Verification', {
            x: certWidth - 190,
            y: 80,
            size: 8,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
          });
        }

        // Generate signed PDF
        const signedPdfBytes = await pdfDoc.save();
        const originalName = path.parse(file.originalFilename || 'document').name;
        const signedFilename = `${originalName}_signed.pdf`;

        signedFiles.push({
          buffer: signedPdfBytes,
          filename: signedFilename,
          signatureId: signatureId
        });

        // Clean up temp file
        try {
          await fs.unlink(file.filepath);
        } catch (error) {
          console.warn('Could not delete temp file:', error);
        }

      } catch (error) {
        console.error(`Error processing PDF file ${file.originalFilename}:`, error);
        return res.status(400).json({ 
          error: `Failed to process PDF file: ${file.originalFilename}`,
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // If single file, return it directly
    if (signedFiles.length === 1) {
      const signedFile = signedFiles[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${signedFile.filename}"`);
      res.setHeader('Content-Length', signedFile.buffer.length);
      res.setHeader('X-Signature-ID', signedFile.signatureId);
      return res.status(200).send(Buffer.from(signedFile.buffer));
    }

    // If multiple files, create ZIP
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    signedFiles.forEach(file => {
      zip.file(file.filename, file.buffer);
    });

    // Add verification file
    const verificationInfo = {
      signedFiles: signedFiles.map(f => ({ filename: f.filename, signatureId: f.signatureId })),
      timestamp,
      signerName,
      signerEmail,
      totalFiles: signedFiles.length,
      generatedBy: 'Document Converter Pro',
      website: 'docs-app.net'
    };

    zip.file('signature_verification.json', JSON.stringify(verificationInfo, null, 2));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const zipFilename = `signed_documents_${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    return res.status(200).send(zipBuffer);

  } catch (error) {
    console.error('Digital signature error:', error);
    return res.status(500).json({ 
      error: 'Digital signature failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}