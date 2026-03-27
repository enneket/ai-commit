import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export class DeepseekService extends BaseAIService {
  readonly provider: AIProvider = 'deepseek';
  readonly defaultModel = 'deepseek-chat';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'deepseek-chat');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('DeepSeek API key is required');
    }

    const url = `${DEEPSEEK_BASE_URL}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new APIError(`DeepSeek API error: ${response.statusText}`, response.status);
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