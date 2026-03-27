import { BaseAIService, type AIResponse } from './baseAIService.js';
import type { AIProvider } from '../../models/types.js';
import { APIError } from '../../models/errors.js';

const LMSTUDIO_BASE_URL = 'http://localhost:1234';

export class LMStudioService extends BaseAIService {
  readonly provider: AIProvider = 'lmstudio';
  readonly defaultModel = 'local-model';

  constructor(options: { apiKey?: string; baseUrl?: string; model?: string }) {
    super(options, 'local-model');
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    const baseUrl = this.baseUrl || LMSTUDIO_BASE_URL;
    const url = `${baseUrl}/v0/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      throw new APIError(`LM Studio API error: ${response.statusText}`, response.status);
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