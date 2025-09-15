// server.js - RTF conversion (LibreOffice native format)
const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/app/uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Convert to RTF (Rich Text Format) - LibreOffice native support
async function convertToRTF(inputPath, outputDir) {
  console.log('Converting PDF to RTF format...');
  
  await fs.mkdir(outputDir, { recursive: true });
  
  const inputBasename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${inputBasename}.rtf`);
  
  const commands = [
    `libreoffice --headless --convert-to rtf --outdir "${outputDir}" "${inputPath}"`,
    `soffice --headless --convert-to rtf --outdir "${outputDir}" "${inputPath}"`,
    `libreoffice --headless --invisible --convert-to rtf --outdir "${outputDir}" "${inputPath}"`
  ];
  
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    console.log(`Trying command ${i + 1}:`, command);
    
    try {
      await new Promise((resolve, reject) => {
        exec(command, {
          timeout: 60000,
          env: {
            ...process.env,
            HOME: '/root',
            SAL_USE_VCLPLUGIN: 'svp'
          }
        }, (error, stdout, stderr) => {
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });
      });
      
      // Check if file was created
      try {
        await fs.access(outputPath);
        const stats = await fs.stat(outputPath);
        console.log(`✅ RTF file created! Size: ${stats.size} bytes`);
        
        if (stats.size > 0) {
          return outputPath;
        }
      } catch (e) {
        console.log('RTF file not found, trying next command...');
      }
      
    } catch (error) {
      console.log(`Command ${i + 1} failed:`, error.message);
    }
  }
  
  throw new Error('All RTF conversion attempts failed');
}

// PDF to RTF conversion
app.post('/convert/pdf-to-word', upload.single('file'), async (req, res) => {
  console.log('\n=== PDF to RTF Conversion ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File:', req.file.originalname, 'Size:', req.file.size);

    const inputPath = req.file.path;
    const outputDir = '/app/converted';
    
    // Convert to RTF
    const outputPath = await convertToRTF(inputPath, outputDir);
    
    // Read the converted file
    const convertedFile = await fs.readFile(outputPath);
    console.log('✅ Conversion successful! RTF size:', convertedFile.length);
    
    // Return RTF file (can be opened by Word)
    const filename = req.file.originalname.replace(/\.pdf$/i, '') + '.rtf';
    
    res.setHeader('Content-Type', 'application/rtf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(convertedFile);
    
    // Cleanup
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);
    
    console.log('=== RTF Conversion Complete ===\n');
    
  } catch (error) {
    console.error('❌ RTF conversion failed:', error.message);
    
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {}
    }
    
    res.status(500).json({ 
      error: 'Conversion failed', 
      details: error.message,
      format: 'RTF (Rich Text Format)',
      note: 'RTF files can be opened by Microsoft Word',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const libreOfficeTest = await new Promise((resolve) => {
      exec('libreoffice --version', (error, stdout, stderr) => {
        if (error) {
          resolve({ available: false, error: error.message });
        } else {
          resolve({ available: true, version: stdout.trim() });
        }
      });
    });

    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      libreoffice: libreOfficeTest,
      output_format: 'RTF (Rich Text Format)',
      compatibility: 'RTF files open in Microsoft Word',
      note: 'Using RTF instead of DOCX for better LibreOffice compatibility'
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LibreOffice RTF conversion server running on port ${PORT}`);
  console.log('Format: PDF → RTF (Rich Text Format)');
  console.log('RTF files can be opened by Microsoft Word');
});
