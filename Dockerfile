# Use Node.js 20 as the base image
FROM node:20

# Install LibreOffice and Python with all necessary dependencies
RUN apt-get update && \
    apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    fonts-dejavu \
    fontconfig \
    curl \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify LibreOffice installation and show version
RUN libreoffice --version || (echo "LibreOffice installation failed" && exit 1)

# Create app directory
WORKDIR /usr/src/app

# Copy package files and requirements
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm ci --omit=dev

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Bundle app source
COPY . .

# Create temp directory with proper permissions
RUN mkdir -p /tmp && chmod 777 /tmp

# Expose port
EXPOSE 3000

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD [ "node", "index.js" ]
