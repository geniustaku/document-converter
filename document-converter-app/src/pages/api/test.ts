import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } else if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'POST request received',
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}