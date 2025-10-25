import type { NextApiRequest, NextApiResponse } from 'next';
import { azureTranslator } from '@/lib/azure-translator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Text and target language are required'
      });
    }

    const result = await azureTranslator.translateText(text, targetLanguage, sourceLanguage);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Translation error:', error);

    return res.status(500).json({
      success: false,
      error: 'Translation failed',
      details: error.message || 'An unexpected error occurred'
    });
  }
}
