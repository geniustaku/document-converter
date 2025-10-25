import axios from 'axios';

interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  targetLanguage: string;
}

interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export class AzureTranslator {
  private endpoint: string;
  private key: string;
  private region: string = 'eastus'; // Default region

  constructor(endpoint?: string, key?: string) {
    this.endpoint = endpoint || process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com/';
    this.key = key || process.env.AZURE_TRANSLATOR_KEY || '';

    if (!this.endpoint || !this.key) {
      throw new Error('Azure Translator credentials not configured');
    }
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult> {
    try {
      const params = new URLSearchParams({
        'api-version': '3.0',
        'to': targetLanguage,
      });

      if (sourceLanguage) {
        params.append('from', sourceLanguage);
      }

      const response = await axios.post(
        `${this.endpoint}/translate?${params.toString()}`,
        [{ text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.key,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data[0];
      const translation = result.translations[0];

      return {
        translatedText: translation.text,
        detectedLanguage: result.detectedLanguage?.language,
        targetLanguage: translation.to,
      };
    } catch (error: any) {
      console.error('Azure Translator error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.endpoint}/detect?api-version=3.0`,
        [{ text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.key,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0].language;
    } catch (error: any) {
      console.error('Azure Translator language detection error:', error);
      throw new Error(`Language detection failed: ${error.message}`);
    }
  }

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const response = await axios.get(
        `${this.endpoint}/languages?api-version=3.0&scope=translation`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.key,
          },
        }
      );

      const languages = response.data.translation;
      return Object.entries(languages).map(([code, info]: [string, any]) => ({
        code,
        name: info.name,
        nativeName: info.nativeName,
      }));
    } catch (error: any) {
      console.error('Azure Translator get languages error:', error);
      throw new Error(`Failed to get supported languages: ${error.message}`);
    }
  }
}

export const azureTranslator = new AzureTranslator();
