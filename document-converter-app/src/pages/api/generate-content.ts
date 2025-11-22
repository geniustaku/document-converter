import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, contentType, tone, length, keywords } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const systemPrompt = getSystemPrompt(contentType, tone, length, keywords);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: topic }
        ],
        temperature: contentType === 'creative' ? 0.8 : 0.7,
        max_tokens: getMaxTokens(length),
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return res.status(200).json({
      content,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}

function getSystemPrompt(contentType: string, tone: string, length: string, keywords?: string): string {
  let typeInstruction = '';

  switch (contentType) {
    case 'blog':
      typeInstruction = 'Write a well-structured blog post with an engaging introduction, informative body paragraphs, and a strong conclusion.';
      break;
    case 'essay':
      typeInstruction = 'Write an academic essay with a clear thesis, supporting arguments, evidence, and a logical conclusion.';
      break;
    case 'article':
      typeInstruction = 'Write an informative article with a compelling headline, clear sections, and valuable insights.';
      break;
    case 'story':
      typeInstruction = 'Write a creative story with characters, plot, conflict, and resolution.';
      break;
    case 'social':
      typeInstruction = 'Write engaging social media content that is concise, attention-grabbing, and shareable.';
      break;
  }

  let toneInstruction = `Write in a ${tone} tone.`;

  let lengthInstruction = '';
  switch (length) {
    case 'short': lengthInstruction = 'Keep it concise (200-400 words).'; break;
    case 'medium': lengthInstruction = 'Write a moderate length piece (500-800 words).'; break;
    case 'long': lengthInstruction = 'Create a comprehensive piece (1000-1500 words).'; break;
  }

  const keywordInstruction = keywords ? `Naturally incorporate these keywords: ${keywords}` : '';

  return `You are an expert content writer. ${typeInstruction}

${toneInstruction}
${lengthInstruction}
${keywordInstruction}

Write high-quality, original content that is:
- Well-structured and easy to read
- Engaging and valuable
- Grammatically correct
- SEO-friendly (if applicable)

IMPORTANT: Only output the content. Do not include meta-commentary.`;
}

function getMaxTokens(length: string): number {
  switch (length) {
    case 'short': return 600;
    case 'medium': return 1200;
    case 'long': return 2000;
    default: return 1200;
  }
}
