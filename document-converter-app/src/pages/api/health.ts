import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const serviceUrl = process.env.LIBREOFFICE_SERVICE_URL;
    
    if (!serviceUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'Service URL not configured',
        frontend: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Check LibreOffice service health
    const response = await axios.get(`${serviceUrl}/api/health`, {
      timeout: 10000
    });

    res.json({
      status: 'healthy',
      message: 'Document converter frontend is running',
      frontend: {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      },
      backend: response.data,
      serviceUrl: serviceUrl
    });
    
  } catch (error: any) {
    console.error('Health check failed:', error.message);
    
    res.status(503).json({
      status: 'degraded',
      message: 'Backend service unavailable',
      frontend: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      backend: {
        status: 'unhealthy',
        error: error.message
      },
      serviceUrl: process.env.LIBREOFFICE_SERVICE_URL
    });
  }
}