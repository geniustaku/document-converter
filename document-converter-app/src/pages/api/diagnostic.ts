import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV,
    apis: {
      health: '/api/health',
      convert: '/api/convert',
      'pdf-split': '/api/pdf-split',
      'pdf-merge': '/api/pdf-merge',
      'invoice-generator': '/api/invoice-generator',
      'digital-signature': '/api/digital-signature',
      'image-convert': '/api/image-convert'
    },
    dependencies: {
      next: 'available',
      react: 'available',
      'pdf-lib': 'available',
      formidable: 'available',
      jszip: 'available'
    }
  };

  try {
    res.status(200).json(diagnostics);
  } catch (error: any) {
    res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
      ...diagnostics
    });
  }
}