import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productName, features, targetAudience, platform, tone, keywords } = req.body;

  if (!productName || !productName.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const systemPrompt = getSystemPrompt(platform, tone);
    const userPrompt = buildUserPrompt(productName, features, targetAudience, keywords);

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
        n: 2, // Generate 2 variations
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const variations = data.choices.map((choice: any) => choice.message?.content || '');

    return res.status(200).json({
      variations,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error generating product description:', error);
    return res.status(500).json({ error: 'Failed to generate product description' });
  }
}

function getSystemPrompt(platform: string, tone: string): string {
  let platformRules = '';

  switch (platform) {
    case 'amazon':
      platformRules = `Amazon product description format:
- Start with a compelling opening sentence
- Include 5-7 bullet points highlighting key features and benefits
- Use keywords naturally for SEO
- Focus on customer benefits, not just features
- Include relevant search terms
- Keep it scannable and easy to read`;
      break;
    case 'shopify':
      platformRules = `Shopify product description format:
- Write 2-4 paragraphs of engaging copy
- Tell a story about the product
- Highlight unique selling points
- Address customer pain points
- Include a subtle call-to-action
- Optimize for SEO with natural keyword placement`;
      break;
    case 'ebay':
      platformRules = `eBay product description format:
- Clear, concise, factual information
- Bullet points for specifications
- Condition details if applicable
- Shipping and return information hints
- Focus on value proposition
- Include key search terms`;
      break;
    case 'etsy':
      platformRules = `Etsy product description format:
- Personal, authentic voice
- Tell the story behind the product
- Highlight handmade/unique aspects
- Mention materials and craftsmanship
- Include size, color, and care details
- Connect with the buyer emotionally`;
      break;
    case 'general':
      platformRules = `General product description format:
- Engaging opening paragraph
- Key features and benefits in bullet points or paragraphs
- Address customer needs
- Include technical specifications
- Clear value proposition`;
      break;
  }

  let toneInstructions = '';
  switch (tone) {
    case 'persuasive':
      toneInstructions = 'Use persuasive, compelling language. Emphasize benefits and value. Create urgency and desire.';
      break;
    case 'informative':
      toneInstructions = 'Use clear, informative language. Focus on facts and specifications. Be objective and thorough.';
      break;
    case 'luxury':
      toneInstructions = 'Use sophisticated, premium language. Emphasize quality, craftsmanship, and exclusivity. Create aspirational appeal.';
      break;
    case 'budget':
      toneInstructions = 'Use friendly, value-focused language. Emphasize affordability and great value. Highlight cost savings.';
      break;
    case 'casual':
      toneInstructions = 'Use conversational, friendly language. Be approachable and relatable. Keep it light and engaging.';
      break;
    default:
      toneInstructions = 'Use professional, balanced language.';
  }

  return `You are an expert e-commerce copywriter specializing in product descriptions that convert browsers into buyers.

Platform: ${platformRules}

Tone: ${toneInstructions}

Key Principles:
1. Focus on benefits, not just features (answer "what's in it for me?")
2. Use sensory language and vivid descriptions
3. Address customer pain points and how the product solves them
4. Create an emotional connection
5. Use power words and action verbs
6. Be specific with details
7. Build trust with authentic language
8. Optimize for SEO naturally
9. Make it scannable with formatting
10. Include social proof hints when relevant

IMPORTANT: Output only the product description. No meta-commentary, explanations, or labels like "Description:" or "Variation 1:". Just the pure, ready-to-use description.`;
}

function buildUserPrompt(
  productName: string,
  features: string,
  targetAudience: string,
  keywords: string
): string {
  let prompt = `Product Name: ${productName}\n`;

  if (features && features.trim()) {
    prompt += `\nKey Features/Details:\n${features}\n`;
  }

  if (targetAudience && targetAudience.trim()) {
    prompt += `\nTarget Audience: ${targetAudience}\n`;
  }

  if (keywords && keywords.trim()) {
    prompt += `\nSEO Keywords to include naturally: ${keywords}\n`;
  }

  prompt += `\nCreate a compelling product description that will drive sales.`;

  return prompt;
}
