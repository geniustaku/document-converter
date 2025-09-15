#!/bin/bash
# deploy-to-azure.sh - Complete Azure deployment script for LibreOffice conversion service
# Run this script from your libreoffice-service directory

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - You can modify these values
RESOURCE_GROUP="docconverter-rg"
LOCATION="eastus"
ACR_NAME="docconverteracr1749807149" # Add timestamp to ensure uniqueness
CONTAINER_NAME="libreoffice-converter"
IMAGE_NAME="libreoffice-conversion-service"
DNS_LABEL="libreoffice-converter-$(date +%s)"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-flight checks
print_status "🔍 Running pre-flight checks..."

# Check if required commands exist
if ! command_exists az; then
    print_error "Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install it first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if required files exist
required_files=("Dockerfile" "server.js" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file '$file' not found in current directory"
        echo "Please ensure you have all required files:"
        echo "- Dockerfile"
        echo "- server.js" 
        echo "- package.json"
        exit 1
    fi
done

print_success "All pre-flight checks passed!"

echo ""
echo "🚀 Starting Azure deployment for LibreOffice conversion service..."
echo "=================================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "ACR Name: $ACR_NAME"
echo "Container Name: $CONTAINER_NAME"
echo "DNS Label: $DNS_LABEL"
echo "=================================================="
echo ""

# Confirm deployment
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user"
    exit 0
fi

# 1. Login to Azure (if not already logged in)
print_status "📝 Checking Azure login status..."
if ! az account show > /dev/null 2>&1; then
    print_warning "Not logged in to Azure. Please login:"
    az login
    if [ $? -ne 0 ]; then
        print_error "Azure login failed"
        exit 1
    fi
fi

SUBSCRIPTION_ID=$(az account show --query id --output tsv)
ACCOUNT_NAME=$(az account show --query user.name --output tsv)
print_success "Logged in as: $ACCOUNT_NAME (Subscription: $SUBSCRIPTION_ID)"

# 2. Create resource group
print_status "📁 Creating resource group '$RESOURCE_GROUP'..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

if [ $? -eq 0 ]; then
    print_success "Resource group created successfully"
else
    print_error "Failed to create resource group"
    exit 1
fi

# 3. Create Azure Container Registry
print_status "🐳 Creating Azure Container Registry '$ACR_NAME'..."
az acr create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --sku Basic \
    --admin-enabled true \
    --output table

if [ $? -eq 0 ]; then
    print_success "Azure Container Registry created successfully"
else
    print_error "Failed to create Azure Container Registry"
    exit 1
fi

# 4. Get ACR login server
print_status "📋 Getting ACR login server..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer --output tsv)
if [ -z "$ACR_LOGIN_SERVER" ]; then
    print_error "Failed to get ACR login server"
    exit 1
fi
print_success "ACR Login Server: $ACR_LOGIN_SERVER"

# 5. Build Docker image
print_status "🔨 Building Docker image..."
docker build -t "$IMAGE_NAME" .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# 6. Tag image for ACR
print_status "🏷️ Tagging image for ACR..."
docker tag "$IMAGE_NAME" "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest"

if [ $? -eq 0 ]; then
    print_success "Image tagged successfully"
else
    print_error "Failed to tag image"
    exit 1
fi

# 7. Login to ACR and push image
print_status "🔐 Logging in to ACR..."
az acr login --name "$ACR_NAME"

if [ $? -eq 0 ]; then
    print_success "Logged in to ACR successfully"
else
    print_error "Failed to login to ACR"
    exit 1
fi

print_status "📤 Pushing image to ACR..."
docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest"

if [ $? -eq 0 ]; then
    print_success "Image pushed to ACR successfully"
else
    print_error "Failed to push image to ACR"
    exit 1
fi

# 8. Get ACR credentials
print_status "🔑 Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value --output tsv)

if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
    print_error "Failed to get ACR credentials"
    exit 1
fi

print_success "ACR credentials retrieved successfully"

# 9. Create container instance
print_status "🚀 Creating Azure Container Instance..."
az container create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" \
    --cpu 2 \
    --memory 4 \
    --registry-login-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" \
    --dns-name-label "$DNS_LABEL" \
    --ports 3001 \
    --environment-variables \
        NODE_ENV=production \
        PORT=3001 \
    --restart-policy Always \
    --output table

if [ $? -eq 0 ]; then
    print_success "Azure Container Instance created successfully"
else
    print_error "Failed to create Azure Container Instance"
    exit 1
fi

# 10. Wait for container to be ready
print_status "⏳ Waiting for container to be ready..."
sleep 30

# 11. Get container URL and test health
CONTAINER_FQDN=$(az container show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --query ipAddress.fqdn \
    --output tsv)

if [ -z "$CONTAINER_FQDN" ]; then
    print_error "Failed to get container FQDN"
    exit 1
fi

CONTAINER_URL="http://$CONTAINER_FQDN:3001"
print_success "Container URL: $CONTAINER_URL"

# 12. Test health endpoint
print_status "🔍 Testing health endpoint..."
for i in {1..5}; do
    print_status "Health check attempt $i/5..."
    if curl -f "$CONTAINER_URL/health" >/dev/null 2>&1; then
        print_success "Health check passed!"
        break
    else
        if [ $i -eq 5 ]; then
            print_warning "Health check failed after 5 attempts. Container might still be starting up."
            print_warning "You can check manually: $CONTAINER_URL/health"
        else
            sleep 10
        fi
    fi
done

# 13. Create environment file for Next.js
print_status "📄 Creating environment configuration..."
cat > .env.local << EOF
# LibreOffice Conversion Service Configuration
# Copy this content to your Next.js project's .env.local file

LIBREOFFICE_SERVER_URL=$CONTAINER_URL

# Azure Resource Information (for management)
AZURE_RESOURCE_GROUP=$RESOURCE_GROUP
AZURE_CONTAINER_NAME=$CONTAINER_NAME
AZURE_ACR_NAME=$ACR_NAME
AZURE_ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER

# Deployment Information
DEPLOYED_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DEPLOYMENT_REGION=$LOCATION
EOF

# 14. Create management scripts
print_status "🔧 Creating management scripts..."

# Container logs script
cat > view-logs.sh << 'EOF'
#!/bin/bash
# View container logs
RESOURCE_GROUP="__RESOURCE_GROUP__"
CONTAINER_NAME="__CONTAINER_NAME__"

echo "📋 Fetching container logs..."
az container logs \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --follow
EOF

# Container restart script
cat > restart-container.sh << 'EOF'
#!/bin/bash
# Restart container
RESOURCE_GROUP="__RESOURCE_GROUP__"
CONTAINER_NAME="__CONTAINER_NAME__"

echo "🔄 Restarting container..."
az container restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME"

echo "✅ Container restart initiated"
EOF

# Container status script
cat > check-status.sh << 'EOF'
#!/bin/bash
# Check container status
RESOURCE_GROUP="__RESOURCE_GROUP__"
CONTAINER_NAME="__CONTAINER_NAME__"

echo "📊 Container Status:"
az container show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_NAME" \
    --query "{Name:name,State:instanceView.state,IP:ipAddress.ip,FQDN:ipAddress.fqdn,CPU:containers[0].resources.requests.cpu,Memory:containers[0].resources.requests.memoryInGb}" \
    --output table

echo ""
echo "🏥 Health Check:"
CONTAINER_URL=$(az container show --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_NAME" --query ipAddress.fqdn --output tsv)
curl -s "http://$CONTAINER_URL:3001/health" | python3 -m json.tool 2>/dev/null || echo "Health endpoint not responding"
EOF

# Replace placeholders in management scripts
sed -i.bak "s/__RESOURCE_GROUP__/$RESOURCE_GROUP/g" view-logs.sh restart-container.sh check-status.sh
sed -i.bak "s/__CONTAINER_NAME__/$CONTAINER_NAME/g" view-logs.sh restart-container.sh check-status.sh
rm -f view-logs.sh.bak restart-container.sh.bak check-status.sh.bak

# Make scripts executable
chmod +x view-logs.sh restart-container.sh check-status.sh

print_success "Management scripts created:"
print_success "  - view-logs.sh: View container logs"
print_success "  - restart-container.sh: Restart the container"
print_success "  - check-status.sh: Check container status and health"

# 15. Display deployment summary
echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
echo "=================================================="
echo ""
echo "📋 Deployment Summary:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Container Name: $CONTAINER_NAME"
echo "  ACR Name: $ACR_NAME"
echo "  Container URL: $CONTAINER_URL"
echo ""
echo "🔗 Service Endpoints:"
echo "  Health Check: $CONTAINER_URL/health"
echo "  PDF to Word: $CONTAINER_URL/convert/pdf-to-word"
echo "  Word to PDF: $CONTAINER_URL/convert/word-to-pdf"
echo "  Office to PDF: $CONTAINER_URL/convert/office-to-pdf"
echo "  Image Convert: $CONTAINER_URL/convert/image"
echo ""
echo "📝 Next Steps:"
echo "  1. Copy the contents of .env.local to your Next.js project"
echo "  2. Update your Next.js API routes to use the proxy versions"
echo "  3. Deploy your Next.js app to Vercel"
echo "  4. Test the conversion functionality"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: ./view-logs.sh"
echo "  Restart: ./restart-container.sh"
echo "  Status: ./check-status.sh"
echo ""
echo "💰 Estimated Monthly Cost: ~\$35-70 USD"
echo "📊 Monitor usage in Azure Portal: https://portal.azure.com"
echo ""

# Optional production scaling
read -p "🚀 Would you like to create a production-scaled version? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "⚡ Creating production-scaled container..."
    
    PROD_CONTAINER_NAME="$CONTAINER_NAME-prod"
    PROD_DNS_LABEL="$DNS_LABEL-prod"
    
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$PROD_CONTAINER_NAME" \
        --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" \
        --cpu 4 \
        --memory 8 \
        --registry-login-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --dns-name-label "$PROD_DNS_LABEL" \
        --ports 3001 \
        --environment-variables \
            NODE_ENV=production \
            PORT=3001 \
        --restart-policy Always \
        --output table
    
    if [ $? -eq 0 ]; then
        PROD_FQDN=$(az container show \
            --resource-group "$RESOURCE_GROUP" \
            --name "$PROD_CONTAINER_NAME" \
            --query ipAddress.fqdn \
            --output tsv)
        
        PROD_URL="http://$PROD_FQDN:3001"
        print_success "Production container created: $PROD_URL"
        print_success "Use this URL for production: LIBREOFFICE_SERVER_URL=$PROD_URL"
        
        # Add production URL to env file
        echo "" >> .env.local
        echo "# Production URL (higher resources)" >> .env.local
        echo "LIBREOFFICE_SERVER_URL_PROD=$PROD_URL" >> .env.local
    else
        print_warning "Production container creation failed, but development container is ready"
    fi
fi

echo ""
print_success "🎉 All done! Your LibreOffice conversion service is ready for production use!"
echo ""

# Final health check
print_status "🔍 Final health check..."
if curl -f "$CONTAINER_URL/health" >/dev/null 2>&1; then
    print_success "✅ Service is healthy and ready to use!"
else
    print_warning "⚠️  Service might still be starting up. Check again in a few minutes."
fi

exit 0