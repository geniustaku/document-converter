import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, mode, tone, length } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    // Fallback to basic paraphrasing
    return res.status(200).json({
      paraphrasedText: await fallbackParaphrase(text, mode),
      isAIPowered: false
    });
  }

  try {
    // Construct the prompt based on mode and settings
    const systemPrompt = getSystemPrompt(mode, tone, length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4o (optimized)
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
        temperature: mode === 'creative' ? 0.9 : mode === 'formal' ? 0.3 : 0.7,
        max_tokens: Math.ceil(text.split(/\s+/).length * 2.5), // Allow up to 2.5x original length
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);

      // Fallback to basic paraphrasing
      return res.status(200).json({
        paraphrasedText: await fallbackParaphrase(text, mode),
        isAIPowered: false
      });
    }

    const data = await response.json();
    const paraphrasedText = data.choices[0]?.message?.content || text;

    return res.status(200).json({
      paraphrasedText,
      isAIPowered: true,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error paraphrasing text:', error);

    // Fallback to basic paraphrasing
    return res.status(200).json({
      paraphrasedText: await fallbackParaphrase(text, mode),
      isAIPowered: false
    });
  }
}

function getSystemPrompt(mode: string, tone: string, length: string): string {
  const basePrompt = 'You are an expert paraphrasing assistant. Your task is to rephrase the given text while preserving its original meaning and key information.';

  let modeInstructions = '';

  switch (mode) {
    case 'standard':
      modeInstructions = 'Provide a balanced paraphrase that maintains clarity while using varied vocabulary and sentence structures.';
      break;
    case 'formal':
      modeInstructions = 'Use formal, academic language. Avoid contractions, colloquialisms, and casual expressions. Use sophisticated vocabulary and complex sentence structures appropriate for academic or professional contexts.';
      break;
    case 'creative':
      modeInstructions = 'Be creative and expressive. Use vivid language, varied sentence structures, and engaging phrasing. Make the text more interesting and compelling while maintaining accuracy.';
      break;
    case 'simple':
      modeInstructions = 'Simplify the language. Use clear, straightforward vocabulary and shorter sentences. Make the text easier to understand while preserving all key information.';
      break;
    case 'fluency':
      modeInstructions = 'Focus on improving the flow and readability. Enhance sentence transitions, vary sentence length, and ensure smooth, natural-sounding prose.';
      break;
  }

  let toneInstructions = '';
  if (tone && tone !== 'neutral') {
    toneInstructions = `\n\nTone: Adjust the tone to be ${tone}.`;
  }

  let lengthInstructions = '';
  switch (length) {
    case 'shorter':
      lengthInstructions = '\n\nLength: Make the paraphrased version more concise (about 70-80% of original length) by removing redundancy while keeping all essential information.';
      break;
    case 'longer':
      lengthInstructions = '\n\nLength: Expand the paraphrased version (about 120-150% of original length) by adding relevant details, examples, or elaborations.';
      break;
    case 'same':
      lengthInstructions = '\n\nLength: Keep the paraphrased version approximately the same length as the original.';
      break;
  }

  return `${basePrompt}\n\n${modeInstructions}${toneInstructions}${lengthInstructions}\n\nIMPORTANT: Only output the paraphrased text. Do not include any explanations, notes, or meta-commentary.`;
}

// Fallback paraphrasing (basic synonym replacement)
async function fallbackParaphrase(text: string, mode: string): Promise<string> {
  const synonymMap: { [key: string]: string[] } = {
    important: ['crucial', 'significant', 'vital', 'essential', 'key'],
    good: ['excellent', 'great', 'positive', 'favorable', 'beneficial'],
    bad: ['poor', 'negative', 'unfavorable', 'adverse', 'detrimental'],
    big: ['large', 'substantial', 'significant', 'considerable', 'sizeable'],
    small: ['tiny', 'minor', 'little', 'modest', 'limited'],
    help: ['assist', 'aid', 'support', 'facilitate', 'enable'],
    show: ['demonstrate', 'illustrate', 'display', 'reveal', 'indicate'],
    make: ['create', 'produce', 'generate', 'establish', 'develop'],
    use: ['utilize', 'employ', 'apply', 'implement', 'harness'],
    think: ['believe', 'consider', 'suppose', 'assume', 'contemplate'],
    get: ['obtain', 'acquire', 'receive', 'gain', 'secure'],
    many: ['numerous', 'multiple', 'various', 'several', 'abundant'],
    very: ['extremely', 'highly', 'remarkably', 'exceptionally', 'significantly'],
    find: ['discover', 'locate', 'identify', 'determine', 'uncover'],
    know: ['understand', 'recognize', 'comprehend', 'realize', 'acknowledge'],
  };

  let result = text;

  // Replace words with synonyms
  Object.keys(synonymMap).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      const synonyms = synonymMap[word.toLowerCase()];
      const randomSynonym = synonyms[Math.floor(Math.random() * synonyms.length)];
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return randomSynonym.charAt(0).toUpperCase() + randomSynonym.slice(1);
      }
      return randomSynonym;
    });
  });

  // Mode-specific transformations
  if (mode === 'formal') {
    result = result.replace(/\bcan't\b/gi, 'cannot');
    result = result.replace(/\bwon't\b/gi, 'will not');
    result = result.replace(/\bdon't\b/gi, 'do not');
    result = result.replace(/\bisn't\b/gi, 'is not');
  }

  return result;
}
