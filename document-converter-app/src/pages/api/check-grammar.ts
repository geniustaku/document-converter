import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const systemPrompt = getSystemPrompt();

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
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';

    // Parse the structured response
    const parsed = parseGrammarResponse(result);

    return res.status(200).json({
      ...parsed,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error checking grammar:', error);
    return res.status(500).json({ error: 'Failed to check grammar' });
  }
}

function getSystemPrompt(): string {
  return `You are an expert grammar, spelling, and style checker. Analyze the provided text and provide comprehensive feedback.

Your response must follow this EXACT structure:

CORRECTED TEXT:
[The fully corrected version of the text with all grammar, spelling, punctuation, and style improvements applied]

---SEPARATOR---

ISSUES FOUND:
[List each issue found in the format: "Line X: [Issue description] - [Explanation]". If no issues, write "No significant issues found."]

---SEPARATOR---

TONE ANALYSIS:
[Describe the tone in 1-2 sentences (e.g., "Professional and formal", "Casual and friendly", "Academic and technical")]

---SEPARATOR---

READABILITY SCORE:
[Provide a score from 1-10 and brief explanation]

---SEPARATOR---

SUGGESTIONS:
[Provide 2-4 specific suggestions for improvement, each on a new line starting with "- "]

Guidelines for corrections:
- Fix grammar errors (subject-verb agreement, tense consistency, etc.)
- Correct spelling mistakes
- Improve punctuation
- Enhance clarity and conciseness
- Improve word choice where appropriate
- Maintain the original meaning and tone
- Fix sentence structure issues
- Remove redundancy

Be thorough but constructive. Focus on meaningful improvements.`;
}

interface GrammarResult {
  correctedText: string;
  issues: string[];
  toneAnalysis: string;
  readabilityScore: string;
  suggestions: string[];
}

function parseGrammarResponse(response: string): GrammarResult {
  const sections = response.split('---SEPARATOR---').map(s => s.trim());

  let correctedText = '';
  let issues: string[] = [];
  let toneAnalysis = '';
  let readabilityScore = '';
  let suggestions: string[] = [];

  // Parse corrected text
  if (sections[0]) {
    correctedText = sections[0].replace(/^CORRECTED TEXT:\s*/i, '').trim();
  }

  // Parse issues
  if (sections[1]) {
    const issuesText = sections[1].replace(/^ISSUES FOUND:\s*/i, '').trim();
    issues = issuesText.split('\n').filter(line => line.trim() && !line.toLowerCase().includes('no significant issues'));
  }

  // Parse tone analysis
  if (sections[2]) {
    toneAnalysis = sections[2].replace(/^TONE ANALYSIS:\s*/i, '').trim();
  }

  // Parse readability score
  if (sections[3]) {
    readabilityScore = sections[3].replace(/^READABILITY SCORE:\s*/i, '').trim();
  }

  // Parse suggestions
  if (sections[4]) {
    const suggestionsText = sections[4].replace(/^SUGGESTIONS:\s*/i, '').trim();
    suggestions = suggestionsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
  }

  return {
    correctedText,
    issues,
    toneAnalysis,
    readabilityScore,
    suggestions
  };
}
