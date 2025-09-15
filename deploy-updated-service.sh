#!/bin/bash

echo "🚀 Deploying Updated LibreOffice Service with PDF2Word Support"

# Configuration
RESOURCE_GROUP="docconverter-rg"
ACR_NAME="docconverteracr1749807149"
CONTAINER_NAME="libreoffice-service-v2"
DNS_LABEL="libreoffice-v2-$(date +%s)"

# Get ACR credentials
echo "📋 Getting ACR credentials..."
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)

# Create new container with updated image
echo "🚀 Creating new container with PDF2Word support..."
az container create \
    --resource-group $RESOURCE_GROUP \
    --name $CONTAINER_NAME \
    --image "${ACR_LOGIN_SERVER}/libreoffice-conversion-service:with-pdf2word" \
    --os-type Linux \
    --cpu 2 \
    --memory 4 \
    --registry-login-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password "$ACR_PASSWORD" \
    --dns-name-label $DNS_LABEL \
    --ports 3000 \
    --environment-variables NODE_ENV=production \
    --restart-policy Always

if [ $? -eq 0 ]; then
    # Get the new container URL
    CONTAINER_FQDN=$(az container show \
        --resource-group $RESOURCE_GROUP \
        --name $CONTAINER_NAME \
        --query ipAddress.fqdn \
        --output tsv)
    
    CONTAINER_URL="http://$CONTAINER_FQDN:3000"
    
    echo "✅ Deployment successful!"
    echo "📍 New Service URL: $CONTAINER_URL"
    echo ""
    echo "🔗 Updated API Endpoints:"
    echo "  Health Check: $CONTAINER_URL/api/health"
    echo "  Convert (with PDF→Word): $CONTAINER_URL/api/convert"
    echo "  Convert Base64: $CONTAINER_URL/api/convert-base64"
    echo ""
    echo "📝 Environment Variable for Next.js:"
    echo "  LIBREOFFICE_SERVICE_URL=$CONTAINER_URL"
    echo ""
    echo "🎉 The service now supports:"
    echo "  ✅ Word → PDF"
    echo "  ✅ Excel → PDF" 
    echo "  ✅ PowerPoint → PDF"
    echo "  ✅ PDF → Word (NEW!)"
    echo "  ✅ Office format conversions"
    
    # Test the health endpoint
    echo ""
    echo "🔍 Testing health endpoint..."
    sleep 30
    curl -s "$CONTAINER_URL/api/health" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" || echo "Service starting up..."
    
else
    echo "❌ Deployment failed!"
    exit 1
fi