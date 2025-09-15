// index.js - LibreOffice Conversion Service for Node 20
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { promisify } = require('util');
const libre = require('libreoffice-convert');
const cors = require('cors');
const { exec } = require('child_process');

// Promisify the libre convert function and exec
const libreConvertAsync = promisify(libre.convert);
const execAsync = promisify(exec);

// Create Express app
const app = express();
app.use(cors());

// Enable request body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up multer for file uploads with larger size limit
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => {
      // Add timestamp to prevent file name collisions
      cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Verify LibreOffice is properly installed on startup
async function verifyLibreOffice() {
  try {
    const { stdout } = await execAsync('soffice --version');
    console.log(`[INFO] LibreOffice version detected: ${stdout.trim()}`);
    return true;
  } catch (error) {
    console.error('[ERROR] LibreOffice not properly installed or not in PATH:');
    console.error(error.message);
    return false;
  }
}

// Endpoint for document conversion
app.post('/api/convert', upload.single('file'), async (req, res) => {
  console.log('[INFO] Received request for document conversion');
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.error('[ERROR] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const sourceFilePath = req.file.path;
    const targetFormat = req.body.format || 'pdf'; // Default to PDF if no format specified
    const targetExtension = '.' + targetFormat;
    const sourceExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Handle PDF to Word conversion using Python pdf2docx
    if (sourceExtension === '.pdf' && ['docx', 'doc', 'odt'].includes(targetFormat.toLowerCase())) {
      console.log('[INFO] Using Python pdf2docx for PDF to Word conversion');
      
      try {
        const outputFilePath = path.join('/tmp', `${Date.now()}-converted.docx`);
        const pythonCommand = `python3 pdf2word.py "${sourceFilePath}" "${outputFilePath}"`;
        
        console.log(`[INFO] Running Python conversion: ${pythonCommand}`);
        const { stdout, stderr } = await execAsync(pythonCommand, { 
          timeout: 120000, // 2 minutes timeout
          cwd: __dirname 
        });
        
        console.log('[INFO] Python conversion output:', stdout);
        if (stderr) console.log('[INFO] Python conversion stderr:', stderr);
        
        // Parse the JSON result
        const result = JSON.parse(stdout);
        
        if (!result.success) {
          console.error('[ERROR] Python conversion failed:', result.error);
          return res.status(500).json({
            error: 'PDF to Word conversion failed',
            details: result.error
          });
        }
        
        // Read the converted file
        const outputBuffer = await fs.readFile(outputFilePath);
        
        if (outputBuffer.length === 0) {
          throw new Error('PDF conversion produced empty output');
        }
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const originalName = path.basename(req.file.originalname, path.extname(req.file.originalname));
        res.setHeader('Content-Disposition', `attachment; filename="${originalName}.docx"`);
        res.setHeader('Content-Length', outputBuffer.length.toString());
        
        // Send the converted file
        console.log('[INFO] Sending PDF to Word converted file to client');
        res.send(outputBuffer);
        
        // Clean up files
        try {
          await fs.unlink(sourceFilePath);
          await fs.unlink(outputFilePath);
          console.log('[INFO] Temporary files cleaned up');
        } catch (cleanupErr) {
          console.error('[ERROR] Error cleaning up temp files:', cleanupErr.message);
        }
        
        return;
        
      } catch (pythonError) {
        console.error('[ERROR] Python PDF conversion failed:', pythonError);
        return res.status(500).json({
          error: 'PDF to Word conversion failed',
          details: pythonError.message,
          suggestion: 'Ensure Python and pdf2docx are properly installed'
        });
      }
    }
    
    const outputFilePath = path.join('/tmp', `${Date.now()}-output${targetExtension}`);
    
    console.log(`[INFO] Converting ${sourceFilePath} to ${targetFormat} format`);
    console.log(`[INFO] File size: ${req.file.size} bytes`);
    console.log(`[INFO] Original filename: ${req.file.originalname}`);
    
    // Verify LibreOffice is available
    const libreOfficeAvailable = await verifyLibreOffice();
    if (!libreOfficeAvailable) {
      return res.status(500).json({ 
        error: 'LibreOffice binary not found', 
        details: 'The LibreOffice binary (soffice) is not accessible. Please check installation.' 
      });
    }
    
    // Read file using promises
    console.log('[INFO] Reading input file');
    const inputBuffer = await fs.readFile(sourceFilePath);
    
    if (inputBuffer.length === 0) {
      console.error('[ERROR] Input file is empty');
      return res.status(400).json({ error: 'Input file is empty' });
    }
    
    // Convert file using LibreOffice CLI (more reliable for PDF input)
    console.log('[INFO] Starting conversion...');
    try {
      // Write input buffer to temporary file
      const tempInputPath = path.join('/tmp', `input-${Date.now()}${path.extname(req.file.originalname)}`);
      await fs.writeFile(tempInputPath, inputBuffer);
      
      // Use LibreOffice CLI for conversion
      const tempOutputDir = '/tmp';
      const command = `soffice --headless --convert-to ${targetFormat} "${tempInputPath}" --outdir "${tempOutputDir}"`;
      
      console.log(`[INFO] Running command: ${command}`);
      const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
      
      console.log('[INFO] LibreOffice output:', stdout);
      if (stderr) console.log('[INFO] LibreOffice stderr:', stderr);
      
      // Find the output file
      const inputBasename = path.basename(tempInputPath, path.extname(tempInputPath));
      const outputPath = path.join(tempOutputDir, `${inputBasename}.${targetFormat}`);
      
      console.log(`[INFO] Looking for output file at: ${outputPath}`);
      console.log(`[INFO] Input basename: ${inputBasename}, target format: ${targetFormat}`);
      
      // List temp directory contents for debugging
      try {
        const tempFiles = await fs.readdir(tempOutputDir);
        console.log(`[INFO] Temp directory contents:`, tempFiles.filter(f => f.includes(inputBasename)));
      } catch (e) {
        console.log(`[INFO] Could not list temp directory: ${e.message}`);
      }
      
      // Check if output file exists and read it
      let outputBuffer;
      try {
        await fs.access(outputPath);
        outputBuffer = await fs.readFile(outputPath);
        console.log('[INFO] Conversion completed successfully');
        console.log(`[INFO] Output size: ${outputBuffer.length} bytes`);
        
        if (outputBuffer.length === 0) {
          throw new Error('Conversion produced empty output');
        }
        
        // Clean up temp files
        await fs.unlink(tempInputPath);
        await fs.unlink(outputPath);
        
      } catch (accessError) {
        console.log(`[ERROR] Could not access output file: ${accessError.message}`);
        
        // Try to find any files created by LibreOffice
        try {
          const allTempFiles = await fs.readdir(tempOutputDir);
          const possibleOutputs = allTempFiles.filter(f => f.startsWith(inputBasename));
          console.log(`[INFO] Possible output files:`, possibleOutputs);
          
          if (possibleOutputs.length > 0) {
            // Try the first match
            const alternativeOutput = path.join(tempOutputDir, possibleOutputs[0]);
            console.log(`[INFO] Trying alternative output: ${alternativeOutput}`);
            outputBuffer = await fs.readFile(alternativeOutput);
            
            // Clean up temp files
            await fs.unlink(tempInputPath);
            await fs.unlink(alternativeOutput);
          } else {
            throw new Error(`No output file created. LibreOffice may have failed to convert the file.`);
          }
        } catch (listError) {
          // Clean up temp input file
          try {
            await fs.unlink(tempInputPath);
          } catch (e) {}
          throw new Error(`Output file not created: ${accessError.message}. Directory listing failed: ${listError.message}`);
        }
      }
      
      // Set appropriate content type based on format
      let contentType;
      switch (targetFormat.toLowerCase()) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'doc':
          contentType = 'application/msword';
          break;
        case 'rtf':
          contentType = 'application/rtf';
          break;
        case 'odt':
          contentType = 'application/vnd.oasis.opendocument.text';
          break;
        default:
          contentType = 'application/octet-stream';
      }
      
      // Generate appropriate filename
      const originalName = path.basename(req.file.originalname, path.extname(req.file.originalname));
      const outputFilename = `${originalName}.${targetFormat}`;
      
      // Send the converted file
      console.log('[INFO] Sending converted file to client');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
      res.setHeader('Content-Length', outputBuffer.length.toString());
      
      // Send the buffer directly
      res.send(outputBuffer);
      
      // Clean up files
      try {
        await fs.unlink(sourceFilePath);
        console.log('[INFO] Temporary input file cleaned up');
      } catch (cleanupErr) {
        console.error('[ERROR] Error cleaning up temp file:', cleanupErr.message);
      }
      
    } catch (conversionError) {
      console.error('[ERROR] Conversion process failed:', conversionError);
      
      // Try to get more diagnostic information
      try {
        const { stdout, stderr } = await execAsync('which soffice');
        console.log('[INFO] soffice binary location:', stdout.trim());
        
        const { stdout: versionOutput } = await execAsync('soffice --version');
        console.log('[INFO] LibreOffice version:', versionOutput.trim());
        
        // Check if the input file is valid
        const stats = await fs.stat(sourceFilePath);
        console.log('[INFO] Input file stats:', { size: stats.size, isFile: stats.isFile() });
        
      } catch (diagError) {
        console.error('[ERROR] Failed to get diagnostic information:', diagError.message);
      }
      
      // Return detailed error to client
      return res.status(500).json({ 
        error: 'File conversion failed', 
        details: conversionError.message,
        format: targetFormat,
        inputSize: req.file.size
      });
    }
  } catch (error) {
    console.error('[ERROR] Request processing failed:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupErr) {
        console.error('[ERROR] Failed to cleanup uploaded file:', cleanupErr.message);
      }
    }
    
    res.status(500).json({ 
      error: 'Request processing failed', 
      details: error.message
    });
  }
});

// Add a direct conversion endpoint for base64 encoded data
app.post('/api/convert-base64', async (req, res) => {
  console.log('[INFO] Received base64 conversion request');
  
  try {
    const { fileData, fileName, format = 'pdf' } = req.body;
    
    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'Missing required parameters: fileData and fileName' });
    }
    
    // Decode base64 data
    console.log('[INFO] Decoding base64 to Buffer');
    const buffer = Buffer.from(fileData, 'base64');
    console.log(`[INFO] Decoded buffer size: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty file data provided' });
    }
    
    // Verify LibreOffice is available
    const libreOfficeAvailable = await verifyLibreOffice();
    if (!libreOfficeAvailable) {
      return res.status(500).json({ 
        error: 'LibreOffice binary not found', 
        details: 'The LibreOffice binary (soffice) is not accessible. Please check installation.' 
      });
    }
    
    // Convert file
    console.log('[INFO] Starting base64 conversion...');
    try {
      const outputBuffer = await libreConvertAsync(buffer, format, undefined);
      console.log('[INFO] Base64 conversion completed successfully');
      
      // Return as base64 or as file based on request
      if (req.body.returnType === 'base64') {
        console.log('[INFO] Returning as base64');
        res.json({
          success: true,
          data: outputBuffer.toString('base64'),
          format,
          originalSize: buffer.length,
          convertedSize: outputBuffer.length
        });
      } else {
        console.log('[INFO] Returning as file download');
        const contentType = format === 'pdf' ? 'application/pdf' : 
                          format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                          'application/octet-stream';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
        res.send(outputBuffer);
      }
      
    } catch (conversionError) {
      console.error('[ERROR] Base64 conversion failed:', conversionError);
      res.status(500).json({ 
        error: 'Conversion failed', 
        details: conversionError.message,
        inputSize: buffer.length
      });
    }
  } catch (error) {
    console.error('[ERROR] Base64 conversion error:', error);
    res.status(500).json({ 
      error: 'Base64 conversion failed', 
      details: error.message 
    });
  }
});

// Health check endpoint with detailed diagnostics
app.get('/api/health', async (req, res) => {
  console.log('[INFO] Health check requested');
  
  try {
    // Check if LibreOffice is installed
    const { stdout: versionOutput } = await execAsync('soffice --version');
    const libreOfficeVersion = versionOutput.trim();
    
    // Check soffice binary location
    const { stdout: binaryPath } = await execAsync('which soffice');
    
    // Check disk space
    const { stdout: diskSpace } = await execAsync('df -h /tmp');
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    res.json({ 
      status: 'healthy', 
      message: 'LibreOffice conversion service is running', 
      version: libreOfficeVersion,
      binaryPath: binaryPath.trim(),
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      diskSpace: diskSpace.split('\n')[1],
      supportedFormats: ['pdf', 'docx', 'doc', 'rtf', 'odt', 'xlsx', 'pptx'],
      note: 'LibreOffice + Python pdf2docx for comprehensive conversion support',
      supportedConversions: {
        'Word to PDF': 'Supported (docx, doc, odt → pdf)',
        'PDF to Word': 'Supported via Python pdf2docx (pdf → docx)',
        'Office formats': 'Fully supported (docx ↔ odt ↔ rtf, xlsx ↔ csv, etc.)'
      },
      timestamp: new Date().toISOString(),
      uptime: `${Math.round(process.uptime())}s`
    });
  } catch (err) {
    console.error('[ERROR] Health check failed:', err);
    res.status(503).json({ 
      status: 'error', 
      message: 'LibreOffice binary not accessible',
      error: err.message,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'LibreOffice conversion service is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/convert - Convert documents (multipart/form-data)',
      'POST /api/convert-base64 - Convert base64 encoded documents',
      'GET /api/health - Health check with diagnostics',
      'GET /test - This test endpoint'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[INFO] LibreOffice conversion service started on port ${PORT}`);
  console.log(`[INFO] Node.js version: ${process.version}`);
  console.log(`[INFO] Available endpoints:`);
  console.log(`[INFO]   POST /api/convert`);
  console.log(`[INFO]   POST /api/convert-base64`);
  console.log(`[INFO]   GET /api/health`);
  console.log(`[INFO]   GET /test`);
  
  // Verify LibreOffice on startup
  verifyLibreOffice().then(available => {
    if (available) {
      console.log('[INFO] ✅ LibreOffice is properly installed and ready for conversions');
    } else {
      console.warn('[WARN] ❌ LibreOffice may not be properly installed! Conversion service may not work correctly.');
    }
  });
});

module.exports = app;