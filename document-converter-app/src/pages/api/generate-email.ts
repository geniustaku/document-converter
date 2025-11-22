import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emailType, tone, recipient, subject, context, senderName } = req.body;

  if (!emailType || !recipient || !context) {
    return res.status(400).json({ error: 'Email type, recipient, and context are required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const systemPrompt = getSystemPrompt(emailType, tone);
    const userPrompt = buildUserPrompt(emailType, recipient, subject, context, senderName);

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
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const emailContent = data.choices[0]?.message?.content || '';

    // Extract subject line if not provided
    let generatedSubject = subject;
    let emailBody = emailContent;

    if (!subject && emailContent.includes('Subject:')) {
      const lines = emailContent.split('\n');
      const subjectLine = lines.find((line: string) => line.startsWith('Subject:'));
      if (subjectLine) {
        generatedSubject = subjectLine.replace('Subject:', '').trim();
        emailBody = lines.filter((line: string) => !line.startsWith('Subject:')).join('\n').trim();
      }
    }

    return res.status(200).json({
      subject: generatedSubject,
      body: emailBody,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('Error generating email:', error);
    return res.status(500).json({ error: 'Failed to generate email' });
  }
}

function getSystemPrompt(emailType: string, tone: string): string {
  let typeInstruction = '';

  switch (emailType) {
    case 'job-application':
      typeInstruction = 'Write a professional job application email that highlights relevant qualifications, expresses genuine interest, and includes a clear call-to-action. Keep it concise and compelling.';
      break;
    case 'follow-up':
      typeInstruction = 'Write a polite follow-up email that references the previous conversation, provides value, and encourages a response without being pushy.';
      break;
    case 'cold-outreach':
      typeInstruction = 'Write a cold outreach email that grabs attention quickly, clearly states the value proposition, and includes a soft call-to-action. Keep it brief and personalized.';
      break;
    case 'complaint':
      typeInstruction = 'Write a professional complaint email that clearly states the issue, provides necessary details, expresses desired resolution, and maintains a respectful tone.';
      break;
    case 'thank-you':
      typeInstruction = 'Write a genuine thank you email that expresses sincere appreciation, mentions specific details, and strengthens the relationship.';
      break;
    case 'meeting-request':
      typeInstruction = 'Write a meeting request email that clearly states the purpose, suggests specific times, explains the value, and makes it easy to accept.';
      break;
    case 'introduction':
      typeInstruction = 'Write a professional introduction email that clearly introduces yourself, explains the connection or reason for reaching out, and suggests next steps.';
      break;
    case 'proposal':
      typeInstruction = 'Write a business proposal email that outlines the opportunity, highlights benefits, addresses potential concerns, and includes clear next steps.';
      break;
    default:
      typeInstruction = 'Write a professional, well-structured email.';
  }

  let toneInstruction = '';
  switch (tone) {
    case 'formal':
      toneInstruction = 'Use formal, professional language. Avoid contractions and casual phrases. Maintain business etiquette throughout.';
      break;
    case 'friendly':
      toneInstruction = 'Use warm, friendly language while maintaining professionalism. Be personable and approachable.';
      break;
    case 'persuasive':
      toneInstruction = 'Use persuasive language that emphasizes benefits and value. Be compelling but not aggressive.';
      break;
    case 'apologetic':
      toneInstruction = 'Use apologetic and empathetic language. Take responsibility and show understanding of the situation.';
      break;
    default:
      toneInstruction = 'Use a professional and balanced tone.';
  }

  return `You are an expert email writing assistant specializing in professional business communication.

${typeInstruction}

${toneInstruction}

Email Structure:
1. If no subject line is provided, generate an effective subject line and include it at the top as "Subject: ..."
2. Start with an appropriate greeting
3. Opening paragraph that establishes context
4. Body paragraphs with key information
5. Clear closing with call-to-action if appropriate
6. Professional sign-off

Guidelines:
- Be concise and respectful of the recipient's time
- Use proper grammar and punctuation
- Maintain appropriate professional boundaries
- Include specific details when relevant
- Make the email scannable with clear paragraphs
- End with a clear next step or call-to-action when appropriate

IMPORTANT: Output the complete email ready to send. Do not include meta-commentary or explanations.`;
}

function buildUserPrompt(
  emailType: string,
  recipient: string,
  subject: string | undefined,
  context: string,
  senderName: string | undefined
): string {
  let prompt = `Write ${emailType === 'job-application' ? 'a job application' : emailType === 'follow-up' ? 'a follow-up' : emailType === 'cold-outreach' ? 'a cold outreach' : emailType === 'complaint' ? 'a complaint' : emailType === 'thank-you' ? 'a thank you' : emailType === 'meeting-request' ? 'a meeting request' : emailType === 'introduction' ? 'an introduction' : emailType === 'proposal' ? 'a proposal' : 'a professional'} email.

Recipient: ${recipient}`;

  if (subject) {
    prompt += `\nSubject: ${subject}`;
  } else {
    prompt += `\nGenerate an appropriate subject line.`;
  }

  prompt += `\n\nContext/Details:\n${context}`;

  if (senderName) {
    prompt += `\n\nSign the email as: ${senderName}`;
  }

  return prompt;
}
