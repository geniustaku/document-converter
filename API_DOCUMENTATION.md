# Document Conversion API Documentation

## Overview

The Document Conversion API provides a simple REST interface for converting documents between various formats using LibreOffice and Python pdf2docx. The API supports popular office document formats including PDF, Word, Excel, and PowerPoint.

### Base URL
```
http://document-converter-pro.eastus.azurecontainer.io:3000
```

### Features
- ✅ Convert Word documents to PDF
- ✅ Convert PDF to Word (using advanced pdf2docx)
- ✅ Convert Excel spreadsheets to PDF
- ✅ Convert PowerPoint presentations to PDF
- ✅ Convert between office formats (DOCX ↔ ODT ↔ RTF)
- ✅ Support for both multipart form data and base64 encoding
- ✅ File size up to 50MB
- ✅ No authentication required

---

## API Endpoints

### 1. Document Conversion (Multipart Form Data)

**Endpoint:** `POST /api/convert`

Convert documents between various formats using multipart form data upload.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | The document file to convert |
| `format` | String | Yes | Target format: `pdf`, `docx`, `doc`, `odt`, `rtf`, `xlsx`, `pptx` |

#### Response
- **Content-Type:** Appropriate MIME type for converted file
- **Content-Disposition:** Attachment with filename
- **Body:** Binary file data

#### Examples

##### cURL
```bash
# Convert Word document to PDF
curl -X POST "http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert" \
  -F "file=@document.docx" \
  -F "format=pdf" \
  --output converted.pdf

# Convert PDF to Word
curl -X POST "http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert" \
  -F "file=@document.pdf" \
  -F "format=docx" \
  --output converted.docx

# Convert Excel to PDF
curl -X POST "http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert" \
  -F "file=@spreadsheet.xlsx" \
  -F "format=pdf" \
  --output converted.pdf

# Convert PowerPoint to PDF
curl -X POST "http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert" \
  -F "file=@presentation.pptx" \
  -F "format=pdf" \
  --output converted.pdf
```

##### JavaScript (Node.js)
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function convertDocument(inputFile, outputFormat) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(inputFile));
  formData.append('format', outputFormat);

  try {
    const response = await axios.post(
      'http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert',
      formData,
      {
        headers: formData.getHeaders(),
        responseType: 'arraybuffer',
        timeout: 120000 // 2 minutes
      }
    );

    // Save the converted file
    const outputFile = `converted.${outputFormat}`;
    fs.writeFileSync(outputFile, response.data);
    
    console.log(`✅ Conversion successful: ${outputFile}`);
    return {
      success: true,
      outputFile,
      fileSize: response.data.length
    };
  } catch (error) {
    console.error('❌ Conversion failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage examples
await convertDocument('document.docx', 'pdf');
await convertDocument('document.pdf', 'docx');
await convertDocument('spreadsheet.xlsx', 'pdf');
```

##### Python
```python
import requests
import os

def convert_document(file_path, output_format, output_path=None):
    """
    Convert a document to the specified format.
    
    Args:
        file_path (str): Path to the input file
        output_format (str): Target format (pdf, docx, doc, odt, rtf, xlsx, pptx)
        output_path (str, optional): Path for output file
    
    Returns:
        dict: Result with success status and file info
    """
    url = "http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert"
    
    if not output_path:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_path = f"{base_name}_converted.{output_format}"
    
    try:
        with open(file_path, 'rb') as file:
            files = {'file': (os.path.basename(file_path), file)}
            data = {'format': output_format}
            
            response = requests.post(url, files=files, data=data, timeout=120)
            
            if response.status_code == 200:
                # Save the converted file
                with open(output_path, 'wb') as output_file:
                    output_file.write(response.content)
                
                print(f"✅ Conversion successful: {output_path}")
                return {
                    'success': True,
                    'output_path': output_path,
                    'file_size': len(response.content)
                }
            else:
                print(f"❌ Conversion failed: {response.text}")
                return {'success': False, 'error': response.text}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {'success': False, 'error': str(e)}

# Usage examples
convert_document('document.docx', 'pdf')
convert_document('document.pdf', 'docx')
convert_document('spreadsheet.xlsx', 'pdf')
convert_document('presentation.pptx', 'pdf')
```

##### PHP
```php
<?php
/**
 * Convert a document to the specified format
 * 
 * @param string $filePath Path to input file
 * @param string $outputFormat Target format
 * @param string $outputPath Optional output path
 * @return array Result array
 */
function convertDocument($filePath, $outputFormat, $outputPath = null) {
    $url = 'http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert';
    
    if (!$outputPath) {
        $baseName = pathinfo($filePath, PATHINFO_FILENAME);
        $outputPath = $baseName . '_converted.' . $outputFormat;
    }
    
    $postData = [
        'file' => new CURLFile($filePath),
        'format' => $outputFormat
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ cURL Error: $error\n";
        return ['success' => false, 'error' => $error];
    }
    
    if ($httpCode === 200) {
        file_put_contents($outputPath, $response);
        echo "✅ Conversion successful: $outputPath\n";
        return [
            'success' => true,
            'output_path' => $outputPath,
            'file_size' => strlen($response)
        ];
    } else {
        echo "❌ Conversion failed (HTTP $httpCode): $response\n";
        return ['success' => false, 'error' => $response];
    }
}

// Usage examples
convertDocument('document.docx', 'pdf');
convertDocument('document.pdf', 'docx');
convertDocument('spreadsheet.xlsx', 'pdf');
convertDocument('presentation.pptx', 'pdf');
?>
```

##### C# (.NET)
```csharp
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

public class DocumentConverter
{
    private static readonly HttpClient client = new HttpClient()
    {
        Timeout = TimeSpan.FromMinutes(2)
    };
    
    private const string API_BASE_URL = "http://document-converter-pro.eastus.azurecontainer.io:3000";

    public static async Task<ConversionResult> ConvertDocumentAsync(
        string inputFilePath, 
        string outputFormat, 
        string outputFilePath = null)
    {
        try
        {
            if (string.IsNullOrEmpty(outputFilePath))
            {
                var baseName = Path.GetFileNameWithoutExtension(inputFilePath);
                outputFilePath = $"{baseName}_converted.{outputFormat}";
            }

            using var form = new MultipartFormDataContent();
            using var fileStream = File.OpenRead(inputFilePath);
            using var fileContent = new StreamContent(fileStream);
            
            form.Add(fileContent, "file", Path.GetFileName(inputFilePath));
            form.Add(new StringContent(outputFormat), "format");

            var response = await client.PostAsync($"{API_BASE_URL}/api/convert", form);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsByteArrayAsync();
                await File.WriteAllBytesAsync(outputFilePath, content);
                
                Console.WriteLine($"✅ Conversion successful: {outputFilePath}");
                return new ConversionResult
                {
                    Success = true,
                    OutputPath = outputFilePath,
                    FileSize = content.Length
                };
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"❌ Conversion failed: {errorContent}");
                return new ConversionResult
                {
                    Success = false,
                    Error = errorContent
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
            return new ConversionResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }
}

public class ConversionResult
{
    public bool Success { get; set; }
    public string OutputPath { get; set; }
    public long FileSize { get; set; }
    public string Error { get; set; }
}

// Usage examples
// await DocumentConverter.ConvertDocumentAsync("document.docx", "pdf");
// await DocumentConverter.ConvertDocumentAsync("document.pdf", "docx");
// await DocumentConverter.ConvertDocumentAsync("spreadsheet.xlsx", "pdf");
```

---

### 2. Base64 Document Conversion

**Endpoint:** `POST /api/convert-base64`

Convert documents using base64 encoded data.

#### Request Body (JSON)
```json
{
  "fileData": "base64-encoded-file-content",
  "fileName": "document.docx",
  "format": "pdf",
  "returnType": "base64"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileData` | String | Yes | Base64 encoded file content |
| `fileName` | String | Yes | Original filename with extension |
| `format` | String | Yes | Target format |
| `returnType` | String | No | Return format: `base64` or omit for file download |

#### Example

```javascript
const fs = require('fs');
const axios = require('axios');

async function convertBase64Document(filePath, outputFormat) {
  // Read and encode file
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  
  const requestBody = {
    fileData: base64Data,
    fileName: path.basename(filePath),
    format: outputFormat,
    returnType: 'base64'
  };

  try {
    const response = await axios.post(
      'http://document-converter-pro.eastus.azurecontainer.io:3000/api/convert-base64',
      requestBody,
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );

    if (response.data.success) {
      // Decode and save the result
      const outputBuffer = Buffer.from(response.data.data, 'base64');
      const outputPath = `converted.${outputFormat}`;
      fs.writeFileSync(outputPath, outputBuffer);
      
      console.log(`✅ Conversion successful: ${outputPath}`);
      return {
        success: true,
        outputPath,
        fileSize: outputBuffer.length
      };
    }
  } catch (error) {
    console.error('❌ Conversion failed:', error.response?.data || error.message);
    throw error;
  }
}
```

---

### 3. Health Check

**Endpoint:** `GET /api/health`

Check if the service is running and get system information.

#### Response Example
```json
{
  "status": "healthy",
  "message": "LibreOffice conversion service is running",
  "version": "LibreOffice 7.4.7.2 40(Build:2)",
  "binaryPath": "/usr/bin/soffice",
  "nodeVersion": "v20.19.5",
  "memoryUsage": {
    "rss": "53MB",
    "heapTotal": "8MB",
    "heapUsed": "7MB",
    "external": "2MB"
  },
  "supportedFormats": ["pdf", "docx", "doc", "rtf", "odt", "xlsx", "pptx"],
  "supportedConversions": {
    "Word to PDF": "Supported (docx, doc, odt → pdf)",
    "PDF to Word": "Supported via Python pdf2docx (pdf → docx)",
    "Office formats": "Fully supported (docx ↔ odt ↔ rtf, xlsx ↔ csv, etc.)"
  },
  "timestamp": "2025-09-15T11:40:34.183Z",
  "uptime": "1104s"
}
```

#### Usage
```bash
curl "http://document-converter-pro.eastus.azurecontainer.io:3000/api/health"
```

---

### 4. Test Endpoint

**Endpoint:** `GET /test`

Simple test endpoint to verify service availability.

#### Response Example
```json
{
  "message": "LibreOffice conversion service is running",
  "timestamp": "2025-09-15T11:40:00.952Z",
  "endpoints": [
    "POST /api/convert - Convert documents (multipart/form-data)",
    "POST /api/convert-base64 - Convert base64 encoded documents",
    "GET /api/health - Health check with diagnostics",
    "GET /test - This test endpoint"
  ]
}
```

#### Usage
```bash
curl "http://document-converter-pro.eastus.azurecontainer.io:3000/test"
```

---

## Supported Conversions

### Conversion Matrix

| From Format | To Format | Method | Status |
|-------------|-----------|--------|---------|
| **Word** (DOC, DOCX) | PDF | LibreOffice | ✅ Supported |
| **Excel** (XLSX, XLS) | PDF | LibreOffice | ✅ Supported |
| **PowerPoint** (PPTX, PPT) | PDF | LibreOffice | ✅ Supported |
| **PDF** | Word (DOCX) | Python pdf2docx | ✅ Supported |
| **Text** (TXT) | PDF | LibreOffice | ✅ Supported |
| **Office Formats** | Office Formats | LibreOffice | ✅ Supported |

### Format Details

#### Input Formats
- **PDF**: `.pdf`
- **Word**: `.doc`, `.docx`
- **Excel**: `.xls`, `.xlsx`
- **PowerPoint**: `.ppt`, `.pptx`
- **OpenDocument**: `.odt`, `.ods`, `.odp`
- **Rich Text**: `.rtf`
- **Text**: `.txt`

#### Output Formats
- **PDF**: `.pdf`
- **Word**: `.docx`, `.doc`
- **OpenDocument Text**: `.odt`
- **Rich Text Format**: `.rtf`

---

## Configuration & Limits

### File Limits
- **Maximum file size**: 50MB
- **Timeout**: 2 minutes per conversion
- **Concurrent requests**: Supported (container scales automatically)

### Response Headers
- `Content-Type`: Appropriate MIME type for the converted file
- `Content-Disposition`: Attachment with suggested filename
- `Content-Length`: Size of the converted file

### MIME Types
| Format | MIME Type |
|--------|-----------|
| PDF | `application/pdf` |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| DOC | `application/msword` |
| RTF | `application/rtf` |
| ODT | `application/vnd.oasis.opendocument.text` |

---

## Error Handling

### HTTP Status Codes

| Code | Description | Meaning |
|------|-------------|---------|
| 200 | OK | Conversion successful |
| 400 | Bad Request | Invalid file or format |
| 408 | Request Timeout | Conversion took too long |
| 500 | Internal Server Error | Conversion failed |
| 503 | Service Unavailable | Service is down |

### Error Response Format
```json
{
  "error": "Conversion failed",
  "details": "Specific error message describing the issue",
  "serviceStatus": 500
}
```

### Common Error Scenarios

#### 1. File Too Large
```json
{
  "error": "File too large",
  "details": "File size exceeds 50MB limit"
}
```

#### 2. Unsupported Format
```json
{
  "error": "Unsupported format",
  "details": "Format 'xyz' is not supported"
}
```

#### 3. Conversion Timeout
```json
{
  "error": "Conversion timeout", 
  "details": "The conversion took too long to complete"
}
```

#### 4. Service Unavailable
```json
{
  "error": "Service unavailable",
  "details": "Cannot connect to conversion service"
}
```

---

## Best Practices

### 1. Health Check First
Always check the service health before making conversion requests:

```javascript
async function ensureServiceHealth() {
  try {
    const response = await axios.get(
      'http://document-converter-pro.eastus.azurecontainer.io:3000/api/health'
    );
    return response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
}
```

### 2. Implement Retry Logic
```javascript
async function convertWithRetry(filePath, format, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await convertDocument(filePath, format);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 3. Validate Files Before Upload
```javascript
function validateFile(filePath, maxSize = 50 * 1024 * 1024) {
  const stats = fs.statSync(filePath);
  
  if (stats.size > maxSize) {
    throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize})`);
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const supportedExts = ['.pdf', '.doc', '.docx', '.xlsx', '.pptx', '.odt', '.rtf', '.txt'];
  
  if (!supportedExts.includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}`);
  }
  
  return true;
}
```

### 4. Handle Large Files
For files approaching the 50MB limit, consider:
- Compressing files before conversion
- Using the base64 endpoint for better error handling
- Implementing progress tracking for user feedback

### 5. Production Integration Example
```javascript
class DocumentConverter {
  constructor(baseUrl = 'http://document-converter-pro.eastus.azurecontainer.io:3000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      timeout: 120000,
      maxContentLength: 100 * 1024 * 1024
    });
  }

  async checkHealth() {
    try {
      const response = await this.client.get(`${this.baseUrl}/api/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  async convert(filePath, outputFormat, options = {}) {
    // Validate service health
    if (!await this.checkHealth()) {
      throw new Error('Service is not available');
    }

    // Validate file
    this.validateFile(filePath);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('format', outputFormat);

    // Convert with retry logic
    return await this.convertWithRetry(formData, options.retries || 3);
  }

  validateFile(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.size > 50 * 1024 * 1024) {
      throw new Error('File too large (max 50MB)');
    }
  }

  async convertWithRetry(formData, maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.post(
          `${this.baseUrl}/api/convert`,
          formData,
          { headers: formData.getHeaders() }
        );
        return response.data;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

// Usage
const converter = new DocumentConverter();
await converter.convert('document.docx', 'pdf');
```

---

## Rate Limiting & Performance

### Current Limits
- No rate limiting currently implemented
- Container auto-scales based on demand
- Average conversion time: 2-10 seconds depending on file size

### Performance Tips
1. **Batch processing**: Process multiple files sequentially rather than simultaneously
2. **File optimization**: Compress large files before conversion when possible
3. **Format selection**: Some conversions are faster than others (Word→PDF is generally faster than PDF→Word)

---

## Support & Monitoring

### Service Monitoring
Monitor service health using the `/api/health` endpoint:
- Check every 30 seconds for production applications
- Monitor memory usage and uptime metrics
- Set up alerts for service unavailability

### Troubleshooting

#### Connection Issues
```bash
# Test basic connectivity
curl -I "http://document-converter-pro.eastus.azurecontainer.io:3000/test"

# Check service health
curl "http://document-converter-pro.eastus.azurecontainer.io:3000/api/health"
```

#### Debug Conversion Issues
1. Test with a small, simple file first
2. Check file format is supported
3. Verify file is not corrupted
4. Check file size is under 50MB limit

---

## Changelog

### Version 1.0 (Current)
- Initial release with LibreOffice 7.4.7.2
- Support for PDF, Word, Excel, PowerPoint conversions
- Python pdf2docx integration for PDF to Word
- Docker containerized deployment
- RESTful API with multipart and base64 support
- Health monitoring and diagnostics

---

## License & Terms

This API is provided as-is for document conversion purposes. Please ensure you have appropriate rights to convert the documents you submit.

### Usage Guidelines
- No authentication required
- No data retention (files are automatically deleted after conversion)
- Suitable for both personal and commercial use
- No SLA guarantees (best effort)

---

## Contact & Support

For technical issues or questions about the API:
- Check the health endpoint for service status
- Verify your request format matches the examples
- Ensure file formats are supported
- Contact your system administrator for deployment issues

---

*API Documentation v1.0 - Generated for Document Converter Pro*