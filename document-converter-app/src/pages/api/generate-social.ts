import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform, postType, topic, keywords, includeHashtags, includeEmojis } = req.body;

  if (!platform || !topic || !topic.trim()) {
    return res.status(400).json({ error: 'Platform and topic are required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const systemPrompt = getSystemPrompt(platform, postType, includeHashtags, includeEmojis);
    const userPrompt = buildUserPrompt(topic, keywords);

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
        max_tokens: 500,
        n: 3, // Generate 3 variations
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
    console.error('Error generating social media post:', error);
    return res.status(500).json({ error: 'Failed to generate social media post' });
  }
}

function getSystemPrompt(
  platform: string,
  postType: string,
  includeHashtags: boolean,
  includeEmojis: boolean
): string {
  let platformRules = '';

  switch (platform) {
    case 'twitter':
      platformRules = 'Twitter/X post with 280 character limit. Be concise and impactful. Use line breaks for readability.';
      break;
    case 'instagram':
      platformRules = 'Instagram caption (up to 2200 characters). Write engaging first line to hook viewers. Use line breaks and spacing for readability.';
      break;
    case 'linkedin':
      platformRules = 'LinkedIn post (up to 3000 characters). Professional tone. Start with a hook. Use paragraphs and line breaks. Include a call-to-action.';
      break;
    case 'facebook':
      platformRules = 'Facebook post. Conversational and engaging. Aim for 40-80 words for best engagement, but can be longer for storytelling.';
      break;
    case 'tiktok':
      platformRules = 'TikTok caption (up to 2200 characters). Short, catchy, and trendy. Appeal to younger audience.';
      break;
    default:
      platformRules = 'Social media post. Be engaging and concise.';
  }

  let typeInstructions = '';
  switch (postType) {
    case 'promotional':
      typeInstructions = 'Create a promotional post that highlights benefits, creates urgency, and includes a clear call-to-action.';
      break;
    case 'educational':
      typeInstructions = 'Create an educational post that teaches something valuable. Share insights, tips, or knowledge.';
      break;
    case 'engaging':
      typeInstructions = 'Create an engaging post that asks questions, encourages comments, or sparks conversation.';
      break;
    case 'announcement':
      typeInstructions = 'Create an announcement post that clearly communicates news or updates with excitement.';
      break;
    case 'storytelling':
      typeInstructions = 'Create a storytelling post that connects emotionally through a narrative or personal experience.';
      break;
    case 'inspirational':
      typeInstructions = 'Create an inspirational post that motivates and uplifts the audience.';
      break;
    default:
      typeInstructions = 'Create an engaging social media post.';
  }

  const hashtagInstruction = includeHashtags
    ? `Include 5-10 relevant hashtags at the end. For Twitter, use 2-3 hashtags max. Make hashtags specific and trending when possible.`
    : `Do not include hashtags.`;

  const emojiInstruction = includeEmojis
    ? `Use emojis strategically to add personality and visual interest. Don't overuse - 2-4 emojis is ideal.`
    : `Do not use emojis.`;

  return `You are an expert social media content creator and copywriter.

Platform: ${platformRules}

Post Type: ${typeInstructions}

${emojiInstruction}
${hashtagInstruction}

Best Practices:
- Hook readers in the first line
- Be authentic and conversational
- Create value for the audience
- Use short paragraphs and line breaks
- Include a call-to-action when appropriate
- Make it scannable and easy to read
- Optimize for platform-specific engagement

IMPORTANT: Output only the post content. No meta-commentary or explanations. The post should be ready to copy and paste.`;
}

function buildUserPrompt(topic: string, keywords?: string): string {
  let prompt = `Create a social media post about: ${topic}`;

  if (keywords) {
    prompt += `\n\nIncorporate these keywords naturally: ${keywords}`;
  }

  return prompt;
}
