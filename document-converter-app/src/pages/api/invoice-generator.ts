import { NextApiRequest, NextApiResponse } from 'next';
import { PDFDocument, rgb, RotationTypes, StandardFonts } from 'pdf-lib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      // Business info
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessLogo,
      
      // Client info
      clientName,
      clientAddress,
      clientEmail,
      
      // Invoice details
      invoiceNumber,
      invoiceDate,
      dueDate,
      
      // Items
      items,
      
      // Totals
      subtotal,
      taxRate,
      taxAmount,
      total,
      
      // Additional
      notes,
      paymentTerms
    } = req.body;

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    
    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const primaryColor = rgb(0.8, 0.1, 0.1); // Red theme
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.9, 0.9, 0.9);
    const watermarkGray = rgb(0.95, 0.95, 0.95); // Very light gray for watermark
    const black = rgb(0, 0, 0);

    // Add watermark before content - Simplified approach
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate font size based on business name length
    const maxWatermarkWidth = width * 0.7; // 70% of page width
    let watermarkFontSize = 60;
    let watermarkWidth = helveticaBoldFont.widthOfTextAtSize(businessName.toUpperCase(), watermarkFontSize);
    
    // Adjust font size if text is too wide
    while (watermarkWidth > maxWatermarkWidth && watermarkFontSize > 15) {
      watermarkFontSize -= 3;
      watermarkWidth = helveticaBoldFont.widthOfTextAtSize(businessName.toUpperCase(), watermarkFontSize);
    }
    
    // Draw watermark text - using simple positioning without complex transformations
    page.drawText(businessName.toUpperCase(), {
      x: centerX - (watermarkWidth / 2),
      y: centerY - 50, // Slightly below center
      size: watermarkFontSize,
      font: helveticaBoldFont,
      color: rgb(0.92, 0.92, 0.92), // Very light gray
      rotate: {
        type: RotationTypes.Degrees,
        angle: -30, // Diagonal watermark
      },
    });

    let yPosition = height - 50;

    // Header - INVOICE title
    page.drawText('INVOICE', {
      x: 50,
      y: yPosition,
      size: 32,
      font: helveticaBoldFont,
      color: primaryColor,
    });

    // Invoice number and date (right aligned)
    page.drawText(`Invoice #: ${invoiceNumber}`, {
      x: width - 200,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: darkGray,
    });

    page.drawText(`Date: ${invoiceDate}`, {
      x: width - 200,
      y: yPosition - 20,
      size: 12,
      font: helveticaFont,
      color: darkGray,
    });

    page.drawText(`Due Date: ${dueDate}`, {
      x: width - 200,
      y: yPosition - 40,
      size: 12,
      font: helveticaFont,
      color: primaryColor,
    });

    yPosition -= 80;

    // Business info section
    page.drawText('FROM:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: helveticaBoldFont,
      color: darkGray,
    });

    yPosition -= 20;

    page.drawText(businessName, {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: black,
    });

    yPosition -= 20;

    // Business address (split lines)
    const businessAddressLines = businessAddress.split('\n');
    for (const line of businessAddressLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      });
      yPosition -= 15;
    }

    page.drawText(`Phone: ${businessPhone}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    yPosition -= 15;

    page.drawText(`Email: ${businessEmail}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });

    // Client info section (right side)
    let clientYPosition = height - 130;

    page.drawText('BILL TO:', {
      x: width - 250,
      y: clientYPosition,
      size: 12,
      font: helveticaBoldFont,
      color: darkGray,
    });

    clientYPosition -= 20;

    page.drawText(clientName, {
      x: width - 250,
      y: clientYPosition,
      size: 14,
      font: helveticaBoldFont,
      color: black,
    });

    clientYPosition -= 20;

    // Client address
    const clientAddressLines = clientAddress.split('\n');
    for (const line of clientAddressLines) {
      page.drawText(line, {
        x: width - 250,
        y: clientYPosition,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      });
      clientYPosition -= 15;
    }

    if (clientEmail) {
      page.drawText(`Email: ${clientEmail}`, {
        x: width - 250,
        y: clientYPosition,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      });
    }

    yPosition -= 60;

    // Items table header
    const tableStartY = yPosition;
    const tableStartX = 50;
    const tableWidth = width - 100;

    // Table header background
    page.drawRectangle({
      x: tableStartX,
      y: tableStartY - 30,
      width: tableWidth,
      height: 30,
      color: lightGray,
    });

    // Table headers
    page.drawText('Description', {
      x: tableStartX + 10,
      y: tableStartY - 20,
      size: 12,
      font: helveticaBoldFont,
      color: black,
    });

    page.drawText('Qty', {
      x: tableStartX + 300,
      y: tableStartY - 20,
      size: 12,
      font: helveticaBoldFont,
      color: black,
    });

    page.drawText('Rate', {
      x: tableStartX + 350,
      y: tableStartY - 20,
      size: 12,
      font: helveticaBoldFont,
      color: black,
    });

    page.drawText('Amount', {
      x: tableStartX + 430,
      y: tableStartY - 20,
      size: 12,
      font: helveticaBoldFont,
      color: black,
    });

    yPosition = tableStartY - 50;

    // Items
    for (const item of items) {
      page.drawText(item.description, {
        x: tableStartX + 10,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });

      page.drawText(item.quantity.toString(), {
        x: tableStartX + 310,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });

      page.drawText(`R${parseFloat(item.rate).toFixed(2)}`, {
        x: tableStartX + 350,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });

      page.drawText(`R${parseFloat(item.amount).toFixed(2)}`, {
        x: tableStartX + 430,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });

      yPosition -= 25;
    }

    // Table border
    page.drawRectangle({
      x: tableStartX,
      y: yPosition - 10,
      width: tableWidth,
      height: tableStartY - yPosition + 40,
      borderColor: lightGray,
      borderWidth: 1,
    });

    // Totals section - Added more margin here
    yPosition -= 50; // Increased from 40 to 50 for more space
    
    // Define consistent positioning for totals
    const totalsLabelX = width - 200;
    const totalsAmountX = width - 50; // Right edge for amounts

    // Subtotal
    page.drawText('Subtotal:', {
      x: totalsLabelX,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: black,
    });

    const subtotalAmount = `R${parseFloat(subtotal).toFixed(2)}`;
    const subtotalWidth = helveticaFont.widthOfTextAtSize(subtotalAmount, 12);
    page.drawText(subtotalAmount, {
      x: totalsAmountX - subtotalWidth,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: black,
    });

    yPosition -= 20;

    // Tax
    page.drawText(`Tax (${taxRate}%):`, {
      x: totalsLabelX,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: black,
    });

    const taxAmountText = `R${parseFloat(taxAmount).toFixed(2)}`;
    const taxAmountWidth = helveticaFont.widthOfTextAtSize(taxAmountText, 12);
    page.drawText(taxAmountText, {
      x: totalsAmountX - taxAmountWidth,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: black,
    });

    // Add extra margin top for TOTAL section
    yPosition -= 35; // Increased from 20 to 35 for more margin above TOTAL

    // Total with background
    page.drawRectangle({
      x: totalsLabelX - 10,
      y: yPosition - 5,
      width: totalsAmountX - totalsLabelX + 20,
      height: 25,
      color: primaryColor,
    });

    // Total label
    page.drawText('TOTAL:', {
      x: totalsLabelX,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });

    // Total amount (right aligned)
    const totalAmountText = `R${parseFloat(total).toFixed(2)}`;
    const totalAmountWidth = helveticaBoldFont.widthOfTextAtSize(totalAmountText, 14);
    page.drawText(totalAmountText, {
      x: totalsAmountX - totalAmountWidth,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });

    yPosition -= 80; // Increased spacing after total

    // Payment terms
    if (paymentTerms) {
      page.drawText('Payment Terms:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: darkGray,
      });

      yPosition -= 20;

      page.drawText(paymentTerms, {
        x: 50,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });

      yPosition -= 30;
    }

    // Notes
    if (notes) {
      page.drawText('Notes:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: darkGray,
      });

      yPosition -= 20;

      page.drawText(notes, {
        x: 50,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: black,
      });
    }

    // Footer
    page.drawText('Generated by Document Converter Pro - docs-app.net', {
      x: 50,
      y: 50,
      size: 8,
      font: helveticaFont,
      color: lightGray,
    });

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const filename = `invoice_${invoiceNumber}_${new Date().toISOString().slice(0, 10)}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);

    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ 
      error: 'Invoice generation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}