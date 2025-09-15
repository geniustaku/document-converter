# LibreOffice API Service - Azure Deployment Guide

## Quick Deploy Commands

```bash
# Make deployment script executable
chmod +x deploy-azure-app-service.sh

# Run deployment script
./deploy-azure-app-service.sh

# Deploy your code
git add .
git commit -m "Deploy LibreOffice API to Azure"
git push azure main
```

## Manual Deployment Steps

### 1. Prerequisites
- Azure CLI installed and logged in
- Git repository initialized

### 2. Create Azure Resources

```bash
# Variables
RESOURCE_GROUP="libreoffice-api-rg"
APP_NAME="libreoffice-api-service"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
az appservice plan create \
  --name libreoffice-plan \
  --resource-group $RESOURCE_GROUP \
  --is-linux \
  --sku B1

# Create App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan libreoffice-plan \
  --name $APP_NAME \
  --runtime "NODE:20-lts"
```

### 3. Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    NODE_ENV=production \
    WEBSITES_PORT=3000 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### 4. Deploy Code

```bash
# Configure Git deployment
az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Add Azure remote
git remote add azure <deployment-url>

# Deploy
git push azure main
```

## API Endpoints

Once deployed, your API will be available at: `https://your-app-name.azurewebsites.net`

### Document Conversion
- **POST** `/api/convert` - Convert documents (multipart/form-data)
- **POST** `/api/convert-base64` - Convert base64 encoded documents

### Health & Testing
- **GET** `/api/health` - Service health check
- **GET** `/test` - Simple test endpoint

## Example Usage

### Convert Word to PDF
```bash
curl -X POST https://your-app-name.azurewebsites.net/api/convert \
  -F "file=@document.docx" \
  -F "format=pdf" \
  --output converted.pdf
```

### Convert PDF to Word
```bash
curl -X POST https://your-app-name.azurewebsites.net/api/convert \
  -F "file=@document.pdf" \
  -F "format=docx" \
  --output converted.docx
```

### Health Check
```bash
curl https://your-app-name.azurewebsites.net/api/health
```

## Supported Conversions

| From | To | Status |
|------|----|----|
| Word (DOC/DOCX) | PDF | ✅ Supported |
| Excel (XLSX) | PDF | ✅ Supported |
| PowerPoint (PPTX) | PDF | ✅ Supported |
| PDF | Word (DOCX) | ✅ Supported (via pdf2docx) |
| Office formats | Office formats | ✅ Supported |

## Monitoring

```bash
# View logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP

# Check deployment status
az webapp deployment list --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Cost Optimization

- **B1 SKU**: ~$13-18/month (Basic tier) - Good for testing
- **S1 SKU**: ~$55/month (Standard tier) - Recommended for production
- **P1V2 SKU**: ~$85/month (Premium tier) - High performance

## Troubleshooting

### Common Issues

1. **LibreOffice installation fails**
   - Check deployment logs
   - Verify startup.sh script permissions

2. **Python dependencies fail**
   - Ensure requirements.txt is correct
   - Check Python version compatibility

3. **Timeout issues**
   - Increase request timeout in Azure configuration
   - Consider upgrading to higher SKU

### Debug Commands

```bash
# SSH into container (if enabled)
az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP

# Check application logs
az webapp log download --name $APP_NAME --resource-group $RESOURCE_GROUP
```