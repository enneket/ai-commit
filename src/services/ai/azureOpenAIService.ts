import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

export class AzureOpenAIService extends BaseAIService {
  readonly provider: AIProvider = 'azure-openai';
  readonly defaultModel = 'gpt-4o';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'gpt-4o');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Azure OpenAI API key is required');
    }

    if (!this.baseUrl) {
      throw new APIError('Azure OpenAI endpoint is required');
    }

    const url = `${this.baseUrl}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new APIError(`Azure OpenAI API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as any;

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}