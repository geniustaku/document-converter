# Deployment Guide

## Quick Deploy to Vercel (Recommended - 5 minutes)

### 1. Install Dependencies
```bash
cd document-converter-app
npm install
```

### 2. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable
vercel env add LIBREOFFICE_SERVICE_URL
# When prompted, enter: http://libreoffice-v2-1750071134.eastus.azurecontainer.io:3000
```

### 4. Access Your App
Vercel will provide a URL like: `https://document-converter-app.vercel.app`

---

## Alternative: Deploy to Azure Static Web Apps

### 1. Build the App
```bash
npm run build
npm run export
```

### 2. Deploy with Azure CLI
```bash
az staticwebapp create \\
  --name document-converter \\
  --resource-group docconverter-rg \\
  --source ./out \\
  --location eastus
```

---

## Environment Variables Required

```bash
LIBREOFFICE_SERVICE_URL=http://libreoffice-v2-1750071134.eastus.azurecontainer.io:3000
```

---

## Testing Your Deployment

1. **Upload a file** (PDF, Word, Excel, etc.)
2. **Select output format** 
3. **Click Convert**
4. **Download** the converted file

### Test Cases:
- ✅ PDF → Word conversion
- ✅ Word → PDF conversion  
- ✅ Excel → PDF conversion
- ✅ Error handling (invalid files)
- ✅ Large file handling (up to 50MB)

---

## Troubleshooting

### Service Health Check
Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "frontend": { "status": "healthy" },
  "backend": { "status": "healthy" }
}
```

### Common Issues:

1. **"Service unavailable"**
   - Check if LibreOffice service URL is correct
   - Verify service is running: `curl http://libreoffice-v2-1750071134.eastus.azurecontainer.io:3000/api/health`

2. **"Conversion timeout"**  
   - Large files may take longer
   - Check Azure service logs

3. **"File upload failed"**
   - Check file size (max 50MB)
   - Verify file format is supported

---

## Production Checklist

- [ ] App deployed successfully
- [ ] Environment variables set
- [ ] Health check passes
- [ ] PDF → Word conversion works
- [ ] Word → PDF conversion works
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] SSL certificate active

---

**🎉 Your document conversion app is ready for production!**