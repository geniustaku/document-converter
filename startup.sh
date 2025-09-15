#!/bin/bash
echo "Starting Document Converter API..."

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    python3 -m pip install --user -r requirements.txt
fi

# Start the Node.js application
echo "Starting Node.js server on port $PORT..."
node index.js