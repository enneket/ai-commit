import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const COHERE_BASE_URL = 'https://api.cohere.ai/v1';

export class CohereService extends BaseAIService {
  readonly provider: AIProvider = 'cohere';
  readonly defaultModel = 'command-r-plus';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'command-r-plus');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Cohere API key is required');
    }

    const url = `${COHERE_BASE_URL}/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        message: userPrompt,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new APIError(`Cohere API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as any;

    return {
      content: data.text || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.promptTokens,
            completionTokens: data.usage.completionTokens,
            totalTokens: data.usage.totalTokens,
          }
        : undefined,
    };
  }
}