import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const VERCEL_BASE_URL = 'https://api.vercel.com/v1';

export class VercelService extends BaseAIService {
  readonly provider: AIProvider = 'vercel';
  readonly defaultModel = 'gpt-4';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'gpt-4');
    this.baseUrl = options.baseUrl || VERCEL_BASE_URL;
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Vercel API key is required');
    }

    const url = `${this.baseUrl}/ai/providers/deployments/${this.model}/Inference`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new APIError(`Vercel AI API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as { text?: string };

    return {
      content: data.text || '',
    };
  }
}
