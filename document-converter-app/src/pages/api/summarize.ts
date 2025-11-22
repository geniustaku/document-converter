import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, length, format } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(200).json({
      summary: fallbackSummarize(text, length),
      isAIPowered: false
    });
  }

  try {
    const systemPrompt = getSystemPrompt(length, format);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: getMaxTokens(length),
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content || text;

    return res.status(200).json({
      summary,
      isAIPowered: true,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error summarizing text:', error);
    return res.status(200).json({
      summary: fallbackSummarize(text, length),
      isAIPowered: false
    });
  }
}

function getSystemPrompt(length: string, format: string): string {
  let lengthInstruction = '';

  switch (length) {
    case 'brief':
      lengthInstruction = 'Create a very brief summary in 2-3 sentences.';
      break;
    case 'medium':
      lengthInstruction = 'Create a moderate summary in 1 paragraph (4-6 sentences).';
      break;
    case 'detailed':
      lengthInstruction = 'Create a detailed summary in 2-3 paragraphs.';
      break;
  }

  let formatInstruction = '';

  switch (format) {
    case 'paragraph':
      formatInstruction = 'Write the summary as flowing paragraphs.';
      break;
    case 'bullets':
      formatInstruction = 'Write the summary as bullet points, each starting with "•".';
      break;
    case 'keypoints':
      formatInstruction = 'Extract and list the key points, each starting with a number (1., 2., etc.).';
      break;
  }

  return `You are an expert summarization assistant. Your task is to create clear, accurate summaries of text while preserving the most important information.

${lengthInstruction}
${formatInstruction}

Focus on:
- Main ideas and key arguments
- Important facts and data
- Critical conclusions or outcomes
- Essential context

Avoid:
- Minor details or examples
- Redundant information
- Your own opinions or interpretations

IMPORTANT: Only output the summary. Do not include any introductory phrases like "Here is a summary" or meta-commentary.`;
}

function getMaxTokens(length: string): number {
  switch (length) {
    case 'brief': return 150;
    case 'medium': return 300;
    case 'detailed': return 600;
    default: return 300;
  }
}

function fallbackSummarize(text: string, length: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let numSentences = 3;
  switch (length) {
    case 'brief': numSentences = 2; break;
    case 'medium': numSentences = 4; break;
    case 'detailed': numSentences = 7; break;
  }

  return sentences.slice(0, numSentences).join(' ');
}
