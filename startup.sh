#!/bin/bash

# Azure App Service startup script for LibreOffice conversion service
echo "Starting LibreOffice conversion service initialization..."

# Update package lists
echo "Updating package lists..."
apt-get update -y

# Install LibreOffice and dependencies
echo "Installing LibreOffice and system dependencies..."
apt-get install -y libreoffice libreoffice-writer libreoffice-calc libreoffice-impress
apt-get install -y fonts-liberation fonts-dejavu-core fonts-dejavu-extra
apt-get install -y python3 python3-pip python3-venv

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Verify LibreOffice installation
echo "Verifying LibreOffice installation..."
soffice --version

# Set environment variables for headless operation
export DISPLAY=:99
export DEBIAN_FRONTEND=noninteractive

# Create necessary directories
mkdir -p /tmp/libreoffice
chmod 777 /tmp

# Test LibreOffice headless mode
echo "Testing LibreOffice headless mode..."
soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --version

echo "LibreOffice initialization completed successfully!"

# Start the Node.js application
echo "Starting Node.js application..."
exec node index.js