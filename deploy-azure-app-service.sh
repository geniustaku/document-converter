#!/bin/bash

# Azure App Service Deployment Script for LibreOffice API Service
echo "🚀 Starting Azure App Service deployment..."

# Configuration variables - UPDATE THESE
RESOURCE_GROUP="libreoffice-api-rg"
APP_SERVICE_PLAN="libreoffice-plan"
APP_NAME="libreoffice-api-service"
LOCATION="eastus"
SKU="B1"  # Basic tier for cost-effective hosting

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Resource Group: ${YELLOW}$RESOURCE_GROUP${NC}"
echo -e "   App Service Plan: ${YELLOW}$APP_SERVICE_PLAN${NC}"
echo -e "   App Name: ${YELLOW}$APP_NAME${NC}"
echo -e "   Location: ${YELLOW}$LOCATION${NC}"
echo -e "   SKU: ${YELLOW}$SKU${NC}"
echo

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "   Installation: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
echo -e "${BLUE}🔐 Checking Azure authentication...${NC}"
if ! az account show &>/dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please login:${NC}"
    az login
fi

# Get current subscription
SUBSCRIPTION=$(az account show --query "name" -o tsv)
echo -e "${GREEN}✅ Logged in to subscription: $SUBSCRIPTION${NC}"

# Create resource group
echo -e "${BLUE}📦 Creating resource group...${NC}"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Create App Service plan
echo -e "${BLUE}🏗️  Creating App Service plan...${NC}"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --is-linux \
    --sku $SKU \
    --output table

# Create App Service
echo -e "${BLUE}🌐 Creating App Service...${NC}"
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $APP_NAME \
    --runtime "NODE:20-lts" \
    --output table

# Configure App Service settings
echo -e "${BLUE}⚙️  Configuring App Service settings...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
        WEBSITES_PORT=3000 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
        PYTHON_ENABLE_GUNICORN_MULTIPROCESSING=false \
    --output table

# Configure startup command
echo -e "${BLUE}🔧 Setting startup command...${NC}"
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --startup-file "startup.sh" \
    --output table

# Deploy code from local Git
echo -e "${BLUE}📤 Setting up local Git deployment...${NC}"
az webapp deployment source config-local-git \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --output table

# Get deployment URL
DEPLOY_URL=$(az webapp deployment list-publishing-credentials \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "scmUri" -o tsv)

# Get app URL
APP_URL="https://$APP_NAME.azurewebsites.net"

echo
echo -e "${GREEN}🎉 Deployment setup completed successfully!${NC}"
echo
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Add the Git remote:${NC}"
echo "   git remote add azure $DEPLOY_URL"
echo
echo -e "${YELLOW}2. Deploy your code:${NC}"
echo "   git add ."
echo "   git commit -m \"Deploy to Azure App Service\""
echo "   git push azure main"
echo
echo -e "${YELLOW}3. Monitor deployment:${NC}"
echo "   az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo
echo -e "${GREEN}🌍 Your API will be available at:${NC}"
echo "   $APP_URL"
echo
echo -e "${GREEN}📊 API Endpoints:${NC}"
echo "   POST $APP_URL/api/convert           - Document conversion"
echo "   POST $APP_URL/api/convert-base64    - Base64 conversion"
echo "   GET  $APP_URL/api/health            - Health check"
echo "   GET  $APP_URL/test                  - Test endpoint"
echo
echo -e "${BLUE}💰 Cost Estimate:${NC}"
echo "   B1 SKU: ~$13-18/month (Basic tier)"
echo "   Consider scaling up to S1 for production workloads"
echo
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "   - First deployment may take 10-15 minutes"
echo "   - LibreOffice installation happens during startup"
echo "   - Monitor logs for any installation issues"
echo "   - No authentication is configured as requested"