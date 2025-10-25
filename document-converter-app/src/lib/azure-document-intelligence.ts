import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';

interface OCRResult {
  text: string;
  pages: number;
  language: string;
  confidence: number;
}

export class AzureDocumentIntelligence {
  private client: DocumentAnalysisClient;

  constructor(endpoint?: string, apiKey?: string) {
    const documentEndpoint = endpoint || process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || '';
    const documentKey = apiKey || process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY || '';

    if (!documentEndpoint || !documentKey) {
      throw new Error('Azure Document Intelligence credentials not configured');
    }

    this.client = new DocumentAnalysisClient(
      documentEndpoint,
      new AzureKeyCredential(documentKey)
    );
  }

  async extractText(fileBuffer: Buffer, mimeType: string): Promise<OCRResult> {
    try {
      // Use the prebuilt-read model for general OCR
      const poller = await this.client.beginAnalyzeDocument(
        'prebuilt-read',
        fileBuffer
      );

      const result = await poller.pollUntilDone();

      if (!result.content) {
        throw new Error('No text content extracted from document');
      }

      // Calculate average confidence across all detected text
      let totalConfidence = 0;
      let wordCount = 0;

      result.pages?.forEach((page) => {
        page.words?.forEach((word) => {
          if (word.confidence !== undefined) {
            totalConfidence += word.confidence;
            wordCount++;
          }
        });
      });

      const averageConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;

      // Detect primary language (simplified - you could use Azure Text Analytics for better detection)
      const detectedLanguage = result.languages?.[0]?.locale || 'en-US';

      return {
        text: result.content,
        pages: result.pages?.length || 1,
        language: detectedLanguage,
        confidence: Math.round(averageConfidence * 100) / 100
      };
    } catch (error: any) {
      console.error('Azure Document Intelligence error:', error);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  async extractStructuredData(fileBuffer: Buffer, mimeType: string, modelId: string = 'prebuilt-document') {
    try {
      const poller = await this.client.beginAnalyzeDocument(
        modelId,
        fileBuffer
      );

      const result = await poller.pollUntilDone();
      return result;
    } catch (error: any) {
      console.error('Azure Document Intelligence structured extraction error:', error);
      throw new Error(`Structured data extraction failed: ${error.message}`);
    }
  }

  async analyzeInvoice(fileBuffer: Buffer, mimeType: string) {
    try {
      const poller = await this.client.beginAnalyzeDocument(
        'prebuilt-invoice',
        fileBuffer
      );

      const result = await poller.pollUntilDone();

      // Extract invoice-specific fields
      const invoice = result.documents?.[0];
      if (!invoice) {
        throw new Error('No invoice data detected');
      }

      const itemsField = invoice.fields?.['Items'] as any;

      return {
        invoiceId: invoice.fields?.['InvoiceId']?.content || '',
        invoiceDate: invoice.fields?.['InvoiceDate']?.content || '',
        dueDate: invoice.fields?.['DueDate']?.content || '',
        vendorName: invoice.fields?.['VendorName']?.content || '',
        customerName: invoice.fields?.['CustomerName']?.content || '',
        totalAmount: invoice.fields?.['InvoiceTotal']?.content || '',
        currency: invoice.fields?.['CurrencyCode']?.content || 'USD',
        items: itemsField?.values?.map((item: any) => ({
          description: item.properties?.['Description']?.content || '',
          quantity: item.properties?.['Quantity']?.content || 0,
          unitPrice: item.properties?.['UnitPrice']?.content || 0,
          amount: item.properties?.['Amount']?.content || 0
        })) || []
      };
    } catch (error: any) {
      console.error('Azure Document Intelligence invoice analysis error:', error);
      throw new Error(`Invoice analysis failed: ${error.message}`);
    }
  }
}

export const azureDocumentIntelligence = new AzureDocumentIntelligence();
