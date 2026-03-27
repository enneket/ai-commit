import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

export class AnthropicService extends BaseAIService {
  readonly provider: AIProvider = 'anthropic';
  readonly defaultModel = 'claude-sonnet-4-20250514';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'claude-sonnet-4-20250514');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new APIError('Anthropic API key is required');
    }

    const url = `${ANTHROPIC_BASE_URL}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new APIError(`Anthropic API error: ${response.statusText}`, response.status);
    }

    const data = await response.json() as any;

    return {
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }
}