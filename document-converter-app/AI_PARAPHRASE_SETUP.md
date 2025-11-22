# AI Paraphrase Tool - GPT-4 Integration Setup

The AI Paraphrase Tool uses **OpenAI's GPT-4o** for intelligent, context-aware text rewriting.

## Features

### 🎯 5 Paraphrasing Modes
1. **Standard** - Balanced rewriting with varied vocabulary
2. **Formal** - Academic and professional language
3. **Creative** - Expressive and engaging style
4. **Simple** - Easy-to-understand language
5. **Fluency** - Enhanced readability and flow

### 🎨 5 Tone Options
- Neutral
- Professional
- Friendly
- Confident
- Casual

### 📏 Length Control
- **Shorter** (70-80% of original)
- **Same Length** (approximately equal)
- **Longer** (120-150% with elaborations)

### ✨ Advanced Features
- **Similarity Analysis** - Shows how different the paraphrased text is
- **Token Usage Tracking** - Monitor API costs
- **History** - Keeps last 5 paraphrases for reference
- **Sentence Counter** - Detailed text statistics
- **Reuse Output** - Chain multiple paraphrasing passes
- **Intelligent Fallback** - Works without API key (basic mode)

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Click **"Create new secret key"**
4. Copy the API key (starts with `sk-...`)
5. **Important**: Save it securely - you won't see it again!

### 2. Configure Environment Variables

#### For Local Development

Add to `.env.local`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Environment: Production, Preview, Development
4. Redeploy your application

### 3. Verify Setup

1. Go to the paraphrase tool: `/paraphrase-tool`
2. Enter some text and click "Paraphrase with AI"
3. If working correctly, you'll see:
   - "✓ AI-Powered" badge on output
   - Token usage count
   - High-quality, context-aware paraphrasing

## How It Works

### With API Key (Recommended)
```
User Input → GPT-4o API → Intelligent Paraphrasing → Output
```
- Uses OpenAI's GPT-4o model
- Context-aware rewriting
- Preserves meaning perfectly
- Natural-sounding output
- Multiple modes and tones

### Without API Key (Fallback)
```
User Input → Basic Synonym Replacement → Output
```
- Falls back to local processing
- Simple synonym substitution
- No AI intelligence
- Limited quality
- No cost

## Pricing & Cost Management

### OpenAI GPT-4o Pricing
- **Input**: $2.50 per 1M tokens (~$0.0025 per 1K tokens)
- **Output**: $10.00 per 1M tokens (~$0.01 per 1K tokens)
- **Average cost per paraphrase**: $0.01 - $0.05 (depending on text length)

### Example Costs
- 100-word paragraph: ~$0.01 - $0.02
- 500-word article: ~$0.05 - $0.10
- 1000-word document: ~$0.10 - $0.20

### Cost Control Tips
1. **Use fallback mode** for simple tasks (no API key needed)
2. **Monitor token usage** - displayed after each paraphrase
3. **Set usage limits** in OpenAI dashboard
4. **Cache common paraphrases** - use history feature
5. **Use shorter mode** when possible - reduces output tokens

## API Configuration

The API endpoint handles:
- Smart prompt engineering based on mode and tone
- Temperature adjustment (creative=0.9, formal=0.3, standard=0.7)
- Dynamic token limits based on input length
- Automatic fallback on errors
- Error handling and retry logic

### Prompt System

Each mode uses carefully crafted system prompts:

**Standard Mode:**
```
Balanced paraphrase maintaining clarity with varied vocabulary
```

**Formal Mode:**
```
Formal, academic language. Avoid contractions and casual expressions.
Use sophisticated vocabulary and complex sentence structures.
```

**Creative Mode:**
```
Creative and expressive. Use vivid language, varied structures,
and engaging phrasing while maintaining accuracy.
```

**Simple Mode:**
```
Simplify the language. Use clear vocabulary and shorter sentences.
Make text easier to understand.
```

**Fluency Mode:**
```
Focus on flow and readability. Enhance transitions,
vary sentence length, ensure smooth prose.
```

## Troubleshooting

### "Failed to paraphrase" Error
- **Check API key**: Verify it's correctly set in environment variables
- **Check quota**: Ensure you have OpenAI credits remaining
- **Check key permissions**: API key must have access to GPT-4
- **Fallback**: Tool automatically uses basic mode if API fails

### No "AI-Powered" Badge
- API key not configured (using fallback mode)
- Check environment variables are loaded
- Restart development server after adding key

### High Token Usage
- Long input texts use more tokens
- Creative mode generates longer outputs
- "Longer" length option increases tokens
- Solution: Use "shorter" or "same" length options

### Rate Limiting
- OpenAI has rate limits (e.g., 3 requests/min for free tier)
- Upgrade to paid tier for higher limits
- Implement request queuing if needed

## Best Practices

### For Users
1. **Review output** - AI is smart but always verify accuracy
2. **Use appropriate mode** - Formal for academic, Creative for marketing
3. **Chain paraphrases** - Use "Reuse Output" for multiple variations
4. **Check uniqueness** - Monitor similarity percentage
5. **Adjust settings** - Try different tones and lengths

### For Developers
1. **Monitor costs** - Track token usage in OpenAI dashboard
2. **Set up alerts** - Configure usage alerts in OpenAI settings
3. **Cache results** - Store common paraphrases to reduce API calls
4. **Rate limiting** - Implement client-side throttling if needed
5. **Error logging** - Monitor API errors for issues

## Alternative Models

The system currently uses **GPT-4o** (optimized), but you can modify the API to use:

- **GPT-4 Turbo**: More powerful, higher cost
- **GPT-3.5 Turbo**: Faster, cheaper, less intelligent
- **GPT-4o-mini**: Smallest, cheapest, good for simple tasks

Edit `/src/pages/api/paraphrase.ts` line 30:
```typescript
model: 'gpt-4o', // Change to: gpt-4-turbo, gpt-3.5-turbo, gpt-4o-mini
```

## Security Notes

⚠️ **Never commit API keys to git**
- API keys should only be in `.env.local` (gitignored)
- Use environment variables in production
- Rotate keys if accidentally exposed
- Set usage limits to prevent abuse

## Support

For issues or questions:
1. Check OpenAI API status: https://status.openai.com/
2. View API docs: https://platform.openai.com/docs
3. Check usage: https://platform.openai.com/usage
4. Billing: https://platform.openai.com/account/billing
